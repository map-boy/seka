import type { EmbeddingRecord, MemeStats } from "./store";
import { cosineSimilarity, type Scored, topK } from "./vector";

export interface RetrievalFilters {
  /** Restrict to one meme category. "All" and "For You" are treated as no filter. */
  category?: string;
  /** Meme ids to leave out (already seen, blocked creators, the caller's own posts). */
  exclude?: ReadonlySet<string>;
  /** Creator ids to leave out. */
  excludeCreators?: ReadonlySet<string>;
}

export interface RankOptions extends RetrievalFilters {
  limit: number;
  minScore: number;
}

function passesFilters(record: EmbeddingRecord, filters: RetrievalFilters): boolean {
  if (filters.exclude?.has(record.memeId)) return false;
  if (filters.excludeCreators?.has(record.creatorId)) return false;
  if (
    filters.category &&
    filters.category !== "All" &&
    filters.category !== "For You" &&
    record.category !== filters.category
  ) {
    return false;
  }
  return true;
}

/** Brute-force cosine scan over the index, highest similarity first. */
export function rankByVector(
  index: readonly EmbeddingRecord[],
  queryVector: readonly number[],
  options: RankOptions
): Scored<EmbeddingRecord>[] {
  if (queryVector.length === 0) return [];

  const scored: Scored<EmbeddingRecord>[] = [];
  for (const record of index) {
    if (!passesFilters(record, options)) continue;
    const score = cosineSimilarity(queryVector, record.vector);
    if (score < options.minScore) continue;
    scored.push({ item: record, score });
  }

  return topK(scored, options.limit);
}

/** 24h half-life. 1 for a meme posted now, 0.5 a day later, approaching 0 after a week. */
export function recencyScore(createdAtMs: number, nowMs: number): number {
  if (!createdAtMs) return 0;
  const ageHours = Math.max(0, (nowMs - createdAtMs) / 3_600_000);
  return Math.pow(0.5, ageHours / 24);
}

/** The app's existing virality formula, log-compressed so one viral meme cannot dominate. */
export function viralityScore(stats: MemeStats | undefined): number {
  if (!stats) return 0;
  const raw = stats.likesCount + stats.sharesCount * 2 + stats.downloadsCount * 3;
  return Math.log1p(Math.max(0, raw));
}

export const RECOMMENDATION_WEIGHTS = {
  taste: 0.7,
  virality: 0.2,
  recency: 0.1,
} as const;

/**
 * Blends "looks like what you liked" with "the rest of the app agrees it is good".
 * Virality is normalized against the strongest candidate in this batch so the
 * weights mean the same thing on a 10-meme app and a 10,000-meme one.
 */
export function blendRecommendations(
  candidates: readonly Scored<EmbeddingRecord>[],
  stats: ReadonlyMap<string, MemeStats>,
  nowMs: number
): Scored<EmbeddingRecord>[] {
  const viralities = candidates.map((c) => viralityScore(stats.get(c.item.memeId)));
  const maxVirality = Math.max(0, ...viralities);

  const blended = candidates.map((candidate, i) => {
    const stat = stats.get(candidate.item.memeId);
    const virality = maxVirality > 0 ? viralities[i]! / maxVirality : 0;
    const createdAtMs = stat?.createdAtMs || candidate.item.createdAtMs;
    return {
      item: candidate.item,
      score:
        RECOMMENDATION_WEIGHTS.taste * candidate.score +
        RECOMMENDATION_WEIGHTS.virality * virality +
        RECOMMENDATION_WEIGHTS.recency * recencyScore(createdAtMs, nowMs),
    };
  });

  return topK(blended, blended.length);
}

/**
 * Fallback ordering when a user has no taste vector yet (new account, or nothing
 * liked or saved). Pure virality plus recency -- the same thing the Discover tab
 * shows, so a cold-start feed is never empty.
 */
export function rankColdStart(
  index: readonly EmbeddingRecord[],
  stats: ReadonlyMap<string, MemeStats>,
  options: RetrievalFilters & { limit: number },
  nowMs: number
): Scored<EmbeddingRecord>[] {
  const eligible = index.filter((record) => passesFilters(record, options));
  const viralities = eligible.map((record) => viralityScore(stats.get(record.memeId)));
  const maxVirality = Math.max(0, ...viralities);

  const scored = eligible.map((record, i) => {
    const stat = stats.get(record.memeId);
    const virality = maxVirality > 0 ? viralities[i]! / maxVirality : 0;
    const createdAtMs = stat?.createdAtMs || record.createdAtMs;
    return { item: record, score: 0.7 * virality + 0.3 * recencyScore(createdAtMs, nowMs) };
  });

  return topK(scored, options.limit);
}
