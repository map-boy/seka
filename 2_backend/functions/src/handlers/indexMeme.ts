import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import { readConfig } from "../config";
import { getDb } from "../firebase";
import { getEmbeddingProvider } from "../providers";
import { memeDocumentText, textFingerprint } from "../rag/text";
import {
  deleteEmbedding,
  readCreatorIdentity,
  readEmbedding,
  writeEmbedding,
  type EmbeddingRecord,
} from "../rag/store";
import { RAG_SECRETS } from "../secrets";

/**
 * Keeps memeEmbeddings in step with memes.
 *
 * The trigger also fires on every like and share, so it exits early when the
 * indexed text has not changed -- an engagement update costs one invocation and
 * zero writes, and ranking reads live counters from the meme doc anyway.
 */
export const indexMeme = onDocumentWritten(
  { document: "memes/{memeId}", secrets: RAG_SECRETS, maxInstances: 10 },
  async (event) => {
    const memeId = event.params.memeId;
    const after = event.data?.after;

    if (!after?.exists) {
      await deleteEmbedding(getDb(), memeId);
      logger.info("Removed embedding for deleted meme", { memeId });
      return;
    }

    const db = getDb();
    const config = readConfig();
    const provider = getEmbeddingProvider(config);
    const data = after.data() ?? {};

    const creator = await readCreatorIdentity(db, String(data.creatorId ?? ""));
    const text = memeDocumentText({
      id: memeId,
      caption: String(data.caption ?? ""),
      hashtags: Array.isArray(data.hashtags) ? data.hashtags.map(String) : [],
      category: String(data.category ?? ""),
      creatorId: String(data.creatorId ?? ""),
      creatorHandle: creator.handle,
      creatorName: creator.name,
    });

    if (!text) {
      logger.info("Meme has no indexable text, skipping", { memeId });
      return;
    }

    const fingerprint = textFingerprint(text);
    const existing = await readEmbedding(db, memeId);
    if (existing?.fingerprint === fingerprint && existing.providerId === provider.id) {
      return;
    }

    const [vector] = await provider.embedDocuments([text]);
    if (!vector || vector.length === 0) {
      logger.error("Embedding provider returned no vector", { memeId, provider: provider.id });
      return;
    }

    const record: EmbeddingRecord = {
      memeId,
      creatorId: String(data.creatorId ?? ""),
      category: String(data.category ?? ""),
      caption: String(data.caption ?? ""),
      hashtags: Array.isArray(data.hashtags) ? data.hashtags.map(String) : [],
      creatorHandle: creator.handle,
      vector,
      providerId: provider.id,
      fingerprint,
      createdAtMs: data.createdAt?.toMillis?.() ?? Date.now(),
    };

    await writeEmbedding(db, record);
    logger.info("Indexed meme", { memeId, provider: provider.id, dim: vector.length });
  }
);
