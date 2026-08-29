import type { Firestore } from "firebase-admin/firestore";
import type { RagConfig } from "../config";
import { meanVector } from "./vector";

export const MEMES_COLLECTION = "memes";
export const EMBEDDINGS_COLLECTION = "memeEmbeddings";
export const LIKES_COLLECTION = "memeLikes";
export const SAVES_COLLECTION = "memeSaves";
export const USERS_COLLECTION = "users";
export const BLOCKS_COLLECTION = "blocks";

/**
 * One indexed meme. Only content-derived fields live here: engagement counters
 * change constantly and would force a re-index on every like, so ranking reads
 * them from the meme docs of the shortlist instead.
 */
export interface EmbeddingRecord {
  memeId: string;
  creatorId: string;
  category: string;
  caption: string;
  hashtags: string[];
  creatorHandle: string;
  vector: number[];
  providerId: string;
  fingerprint: string;
  createdAtMs: number;
}

export interface MemeStats {
  likesCount: number;
  sharesCount: number;
  downloadsCount: number;
  createdAtMs: number;
}

interface CachedIndex {
  records: EmbeddingRecord[];
  loadedAt: number;
}

// Warm within a single function instance only. A cold start or an expired TTL
// re-reads from Firestore, so a newly indexed meme shows up within cacheTtlMs.
let cache: CachedIndex | null = null;

export function clearIndexCache(): void {
  cache = null;
}

function toRecord(id: string, data: FirebaseFirestore.DocumentData): EmbeddingRecord {
  return {
    memeId: id,
    creatorId: String(data.creatorId ?? ""),
    category: String(data.category ?? ""),
    caption: String(data.caption ?? ""),
    hashtags: Array.isArray(data.hashtags) ? data.hashtags.map(String) : [],
    creatorHandle: String(data.creatorHandle ?? ""),
    vector: Array.isArray(data.vector) ? data.vector.map(Number) : [],
    providerId: String(data.providerId ?? ""),
    fingerprint: String(data.fingerprint ?? ""),
    createdAtMs: Number(data.createdAtMs ?? 0),
  };
}

/**
 * Loads every embedding into memory for a brute-force cosine scan. That is the
 * right tradeoff at MVP scale (thousands of memes, a few hundred KB); swapping in
 * a vector index later means replacing this function and nothing else.
 */
export async function loadIndex(
  db: Firestore,
  config: RagConfig,
  now: number = Date.now()
): Promise<EmbeddingRecord[]> {
  if (cache && now - cache.loadedAt < config.retrieval.cacheTtlMs) {
    return cache.records;
  }

  const snapshot = await db
    .collection(EMBEDDINGS_COLLECTION)
    .limit(config.retrieval.candidateLimit)
    .get();

  const records = snapshot.docs
    .map((doc) => toRecord(doc.id, doc.data()))
    .filter((record) => record.vector.length > 0);

  cache = { records, loadedAt: now };
  return records;
}

export async function writeEmbedding(db: Firestore, record: EmbeddingRecord): Promise<void> {
  await db.collection(EMBEDDINGS_COLLECTION).doc(record.memeId).set(record);
  clearIndexCache();
}

export async function deleteEmbedding(db: Firestore, memeId: string): Promise<void> {
  await db.collection(EMBEDDINGS_COLLECTION).doc(memeId).delete();
  clearIndexCache();
}

export async function readEmbedding(
  db: Firestore,
  memeId: string
): Promise<EmbeddingRecord | null> {
  const doc = await db.collection(EMBEDDINGS_COLLECTION).doc(memeId).get();
  const data = doc.data();
  return data ? toRecord(doc.id, data) : null;
}

/** Live engagement counters for a shortlist of memes, keyed by meme id. */
export async function readMemeStats(
  db: Firestore,
  memeIds: readonly string[]
): Promise<Map<string, MemeStats>> {
  const stats = new Map<string, MemeStats>();
  if (memeIds.length === 0) return stats;

  const refs = memeIds.map((id) => db.collection(MEMES_COLLECTION).doc(id));
  const docs = await db.getAll(...refs);

  for (const doc of docs) {
    const data = doc.data();
    if (!data) continue;
    stats.set(doc.id, {
      likesCount: Number(data.likesCount ?? 0),
      sharesCount: Number(data.sharesCount ?? 0),
      downloadsCount: Number(data.downloadsCount ?? 0),
      createdAtMs: data.createdAt?.toMillis?.() ?? 0,
    });
  }

  return stats;
}

/** Creator handle and display name, used to make a meme findable by its author. */
export async function readCreatorIdentity(
  db: Firestore,
  creatorId: string
): Promise<{ handle: string; name: string }> {
  if (!creatorId) return { handle: "", name: "" };
  const doc = await db.collection(USERS_COLLECTION).doc(creatorId).get();
  const data = doc.data();
  return { handle: String(data?.handle ?? ""), name: String(data?.name ?? "") };
}

/** Creators this user has blocked. Their memes are dropped before ranking. */
export async function readBlockedCreatorIds(
  db: Firestore,
  uid: string
): Promise<Set<string>> {
  if (!uid) return new Set();
  const snapshot = await db
    .collection(BLOCKS_COLLECTION)
    .where("blockerId", "==", uid)
    .limit(500)
    .get();
  return new Set(snapshot.docs.map((doc) => String(doc.data().blockedId ?? "")).filter(Boolean));
}

export interface TasteProfile {
  /** Unit-length centroid of what the user liked and saved, empty when unknown. */
  vector: number[];
  /** Memes the user has already engaged with -- excluded from recommendations. */
  seenMemeIds: Set<string>;
  likeCount: number;
  saveCount: number;
}

const TASTE_SAMPLE_LIMIT = 200;
const LIKE_WEIGHT = 1;
const SAVE_WEIGHT = 1.6; // saving is a stronger signal of taste than a like

/**
 * Builds the user's taste vector from the memes they liked and saved. A save
 * outweighs a like; both are capped so a power user does not pull an unbounded
 * number of reads into one request.
 */
export async function buildTasteProfile(
  db: Firestore,
  uid: string,
  index: readonly EmbeddingRecord[]
): Promise<TasteProfile> {
  const [likes, saves] = await Promise.all([
    db.collection(LIKES_COLLECTION).where("uid", "==", uid).limit(TASTE_SAMPLE_LIMIT).get(),
    db.collection(SAVES_COLLECTION).where("uid", "==", uid).limit(TASTE_SAMPLE_LIMIT).get(),
  ]);

  const weights = new Map<string, number>();
  const addWeight = (memeId: string, weight: number) => {
    if (!memeId) return;
    weights.set(memeId, (weights.get(memeId) ?? 0) + weight);
  };

  likes.docs.forEach((doc) => addWeight(String(doc.data().memeId ?? ""), LIKE_WEIGHT));
  saves.docs.forEach((doc) => addWeight(String(doc.data().memeId ?? ""), SAVE_WEIGHT));

  const byId = new Map(index.map((record) => [record.memeId, record]));
  const vectors: number[][] = [];
  const vectorWeights: number[] = [];

  for (const [memeId, weight] of weights) {
    const record = byId.get(memeId);
    if (!record) continue;
    vectors.push(record.vector);
    vectorWeights.push(weight);
  }

  return {
    vector: vectors.length > 0 ? meanVector(vectors, vectorWeights) : [],
    seenMemeIds: new Set(weights.keys()),
    likeCount: likes.size,
    saveCount: saves.size,
  };
}
