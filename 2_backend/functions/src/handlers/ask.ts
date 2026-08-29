import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { readConfig } from "../config";
import { getDb } from "../firebase";
import { getChatProvider, getEmbeddingProvider, type ChatMessage } from "../providers";
import {
  ASSISTANT_SYSTEM_PROMPT,
  buildAssistantMessages,
  citedIndices,
  toPassages,
} from "../rag/prompt";
import { rankByVector } from "../rag/retrieve";
import { loadIndex, readBlockedCreatorIds } from "../rag/store";
import { RAG_SECRETS } from "../secrets";
import { optionalLimit, requireString, toHits } from "./shared";

const MAX_HISTORY_TURNS = 6;

function parseHistory(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (entry): entry is ChatMessage =>
        !!entry &&
        typeof entry === "object" &&
        (entry as ChatMessage).role !== undefined &&
        ["user", "assistant"].includes((entry as ChatMessage).role) &&
        typeof (entry as ChatMessage).content === "string"
    )
    .slice(-MAX_HISTORY_TURNS)
    .map((entry) => ({ role: entry.role, content: entry.content.slice(0, 2000) }));
}

/**
 * Grounded question answering over the meme index: retrieve, then answer from the
 * retrieved passages only. Requires auth because it is the one endpoint that can
 * spend money with a third-party model on each call.
 *
 * With RAG_CHAT_PROVIDER unset the local extractive provider answers instead, so
 * the feature degrades to "here are the closest matches" rather than failing.
 */
export const askAssistant = onCall(
  { secrets: RAG_SECRETS, maxInstances: 5 },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Sign in to ask the meme assistant.");
    }

    const question = requireString(request.data?.question, "question", 500);
    const history = parseHistory(request.data?.history);
    const config = readConfig();
    const limit = optionalLimit(request.data?.limit, config.retrieval.topK);

    const db = getDb();
    const embeddings = getEmbeddingProvider(config);

    const [index, blockedCreators, queryVector] = await Promise.all([
      loadIndex(db, config),
      readBlockedCreatorIds(db, uid),
      embeddings.embedQuery(question),
    ]);

    const ranked = rankByVector(index, queryVector, {
      limit,
      minScore: config.retrieval.minScore,
      excludeCreators: blockedCreators,
    });
    const passages = toPassages(ranked);

    const chat = getChatProvider(config);
    let answer: string;
    let generative = chat.generative;

    try {
      answer = await chat.complete({
        system: ASSISTANT_SYSTEM_PROMPT,
        messages: buildAssistantMessages(question, passages, history),
      });
    } catch (error) {
      // A vendor outage should not take the feature down: fall back to showing
      // what retrieval found, which is the useful half of the answer anyway.
      logger.error("Chat provider failed, returning retrieval-only answer", {
        provider: chat.id,
        error: error instanceof Error ? error.message : String(error),
      });
      answer =
        passages.length > 0
          ? "I could not reach the answer model, but here are the closest matches I found."
          : "I could not reach the answer model and nothing in the index matched that.";
      generative = false;
    }

    if (!answer) {
      answer = "I could not find anything in the meme index that answers that.";
    }

    // Show only the memes the answer actually leaned on; if it cited nothing,
    // the whole shortlist is the honest set of sources.
    const cited = generative ? citedIndices(answer, passages.length) : [];
    const sources = cited.length > 0 ? cited.map((i) => passages[i]!) : passages;

    return {
      answer,
      sources: toHits(sources),
      generative,
      provider: chat.id,
    };
  }
);
