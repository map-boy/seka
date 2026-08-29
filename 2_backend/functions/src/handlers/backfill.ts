import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { readConfig } from "../config";
import { getDb } from "../firebase";
import { getEmbeddingProvider } from "../providers";
import { memeDocumentText, textFingerprint } from "../rag/text";
import {
  MEMES_COLLECTION,
  clearIndexCache,
  readCreatorIdentity,
  readEmbedding,
  writeEmbedding,
} from "../rag/store";
import { RAG_SECRETS } from "../secrets";

/**
 * Indexes memes that predate the trigger, or re-indexes everything after an
 * embedding-provider change. Restricted to the uids in RAG_ADMIN_UIDS (comma
 * separated) -- with that unset, nobody can call it.
 *
 * Returns a cursor so a large collection can be walked in several calls.
 */
export const backfillMemeIndex = onCall(
  { secrets: RAG_SECRETS, maxInstances: 1, timeoutSeconds: 540 },
  async (request) => {
    const uid = request.auth?.uid ?? "";
    const admins = new Set(
      (process.env.RAG_ADMIN_UIDS ?? "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
    );

    if (!uid || !admins.has(uid)) {
      throw new HttpsError("permission-denied", "Only configured admins can rebuild the index.");
    }

    const batchSize = Math.min(Number(request.data?.batchSize ?? 100) || 100, 200);
    const startAfter = typeof request.data?.startAfter === "string" ? request.data.startAfter : "";
    const force = request.data?.force === true;

    const db = getDb();
    const config = readConfig();
    const provider = getEmbeddingProvider(config);

    let query = db.collection(MEMES_COLLECTION).orderBy("__name__").limit(batchSize);
    if (startAfter) query = query.startAfter(startAfter);

    const snapshot = await query.get();
    let indexed = 0;
    let skipped = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const creator = await readCreatorIdentity(db, String(data.creatorId ?? ""));
      const text = memeDocumentText({
        id: doc.id,
        caption: String(data.caption ?? ""),
        hashtags: Array.isArray(data.hashtags) ? data.hashtags.map(String) : [],
        category: String(data.category ?? ""),
        creatorId: String(data.creatorId ?? ""),
        creatorHandle: creator.handle,
        creatorName: creator.name,
      });

      if (!text) {
        skipped++;
        continue;
      }

      const fingerprint = textFingerprint(text);
      if (!force) {
        const existing = await readEmbedding(db, doc.id);
        if (existing?.fingerprint === fingerprint && existing.providerId === provider.id) {
          skipped++;
          continue;
        }
      }

      const [vector] = await provider.embedDocuments([text]);
      if (!vector || vector.length === 0) {
        skipped++;
        continue;
      }

      await writeEmbedding(db, {
        memeId: doc.id,
        creatorId: String(data.creatorId ?? ""),
        category: String(data.category ?? ""),
        caption: String(data.caption ?? ""),
        hashtags: Array.isArray(data.hashtags) ? data.hashtags.map(String) : [],
        creatorHandle: creator.handle,
        vector,
        providerId: provider.id,
        fingerprint,
        createdAtMs: data.createdAt?.toMillis?.() ?? Date.now(),
      });
      indexed++;
    }

    clearIndexCache();
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    logger.info("Backfill batch complete", { indexed, skipped, provider: provider.id });

    return {
      indexed,
      skipped,
      scanned: snapshot.size,
      done: snapshot.size < batchSize,
      cursor: lastDoc?.id ?? null,
      provider: provider.id,
    };
  }
);
