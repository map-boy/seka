import { onCall } from "firebase-functions/v2/https";
import { readConfig } from "../config";
import { getDb } from "../firebase";
import { getEmbeddingProvider } from "../providers";
import { toPassages } from "../rag/prompt";
import { rankByVector } from "../rag/retrieve";
import { loadIndex, readBlockedCreatorIds } from "../rag/store";
import { RAG_SECRETS } from "../secrets";
import { optionalCategory, optionalLimit, requireString, toHits } from "./shared";

/**
 * Semantic meme search. Memes are publicly readable in this app, so the endpoint
 * does not require auth -- but a signed-in caller gets their blocked creators
 * filtered out server-side.
 */
export const semanticSearch = onCall(
  { secrets: RAG_SECRETS, maxInstances: 10 },
  async (request) => {
    const query = requireString(request.data?.query, "query", 300);
    const config = readConfig();
    const limit = optionalLimit(request.data?.limit, config.retrieval.topK);
    const category = optionalCategory(request.data?.category);
    const uid = request.auth?.uid ?? "";

    const db = getDb();
    const provider = getEmbeddingProvider(config);

    const [index, blockedCreators, queryVector] = await Promise.all([
      loadIndex(db, config),
      readBlockedCreatorIds(db, uid),
      provider.embedQuery(query),
    ]);

    const ranked = rankByVector(index, queryVector, {
      limit,
      minScore: config.retrieval.minScore,
      category,
      excludeCreators: blockedCreators,
    });

    return {
      results: toHits(toPassages(ranked)),
      provider: provider.id,
      indexSize: index.length,
    };
  }
);
