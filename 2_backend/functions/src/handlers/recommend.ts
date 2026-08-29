import { HttpsError, onCall } from "firebase-functions/v2/https";
import { readConfig } from "../config";
import { getDb } from "../firebase";
import { toPassages } from "../rag/prompt";
import { blendRecommendations, rankColdStart, rankByVector } from "../rag/retrieve";
import { buildTasteProfile, loadIndex, readBlockedCreatorIds, readMemeStats } from "../rag/store";
import { topK } from "../rag/vector";
import { RAG_SECRETS } from "../secrets";
import { optionalCategory, optionalLimit, toHits } from "./shared";

/** Similarity candidates to shortlist per requested result before blending. */
const CANDIDATE_MULTIPLIER = 3;

/**
 * The "For You" feed. Retrieves memes similar to the centroid of what the caller
 * liked and saved, then blends in virality and recency. A caller with no history
 * falls back to a virality + recency ordering so the feed is never empty.
 */
export const recommendForYou = onCall(
  { secrets: RAG_SECRETS, maxInstances: 10 },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Sign in to get personalised recommendations.");
    }

    const config = readConfig();
    const limit = optionalLimit(request.data?.limit, 20);
    const category = optionalCategory(request.data?.category);

    const db = getDb();
    const index = await loadIndex(db, config);
    const [taste, blockedCreators] = await Promise.all([
      buildTasteProfile(db, uid, index),
      readBlockedCreatorIds(db, uid),
    ]);

    const filters = { category, excludeCreators: blockedCreators };
    const now = Date.now();

    if (taste.vector.length === 0) {
      const statsForAll = await readMemeStats(
        db,
        index.slice(0, config.retrieval.candidateLimit).map((record) => record.memeId)
      );
      const cold = rankColdStart(index, statsForAll, { ...filters, limit }, now);
      return {
        results: toHits(toPassages(cold)),
        strategy: "cold-start" as const,
        likeCount: taste.likeCount,
        saveCount: taste.saveCount,
      };
    }

    const candidates = rankByVector(index, taste.vector, {
      ...filters,
      limit: limit * CANDIDATE_MULTIPLIER,
      minScore: config.retrieval.minScore,
      exclude: taste.seenMemeIds,
    });

    const stats = await readMemeStats(db, candidates.map((c) => c.item.memeId));
    const blended = topK(blendRecommendations(candidates, stats, now), limit);

    return {
      results: toHits(toPassages(blended)),
      strategy: "taste" as const,
      likeCount: taste.likeCount,
      saveCount: taste.saveCount,
    };
  }
);
