import { defineSecret } from "firebase-functions/params";

/**
 * Declared so Cloud Functions mounts them as environment variables at runtime;
 * src/config.ts reads them from process.env like any other setting, which keeps
 * the config layer testable outside Firebase.
 *
 *   firebase functions:secrets:set RAG_CHAT_API_KEY
 *   firebase functions:secrets:set RAG_EMBEDDING_API_KEY
 */
export const RAG_CHAT_API_KEY = defineSecret("RAG_CHAT_API_KEY");
export const RAG_EMBEDDING_API_KEY = defineSecret("RAG_EMBEDDING_API_KEY");

export const RAG_SECRETS = [RAG_CHAT_API_KEY, RAG_EMBEDDING_API_KEY];
