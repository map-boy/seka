/**
 * Every provider-specific detail lives behind an environment variable so a new
 * embedding or chat vendor can be wired in without touching the retrieval code.
 * Nothing here is read at module load time -- callers read config per request so
 * the emulator and the tests can override env vars freely.
 */

export type EmbeddingProviderName = "local" | "http";
export type ChatProviderName = "local" | "anthropic" | "http";

export interface EmbeddingConfig {
  provider: EmbeddingProviderName;
  /** Full URL of an embeddings endpoint, e.g. https://api.example.com/v1/embeddings */
  url: string;
  model: string;
  apiKey: string;
  /**
   * Dimension used by the built-in local embedder. Remote providers set their own.
   * Feature hashing collides, so smaller values trade recall for storage.
   */
  dimension: number;
  /** How many texts to send per remote embedding request. */
  batchSize: number;
}

export interface ChatConfig {
  provider: ChatProviderName;
  /** Full URL of an OpenAI-compatible chat completions endpoint (http provider only). */
  url: string;
  model: string;
  apiKey: string;
  maxTokens: number;
}

export interface RetrievalConfig {
  /** Passages handed to the answer model / returned by search. */
  topK: number;
  /** Cosine similarity below which a passage is treated as irrelevant. */
  minScore: number;
  /** Hard ceiling on embedding docs pulled into memory for a brute-force scan. */
  candidateLimit: number;
  /** How long a loaded index stays warm inside one function instance. */
  cacheTtlMs: number;
}

export interface RagConfig {
  embedding: EmbeddingConfig;
  chat: ChatConfig;
  retrieval: RetrievalConfig;
}

function str(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value === "" ? fallback : value;
}

function int(name: string, fallback: number): number {
  const parsed = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function float(name: string, fallback: number): number {
  const parsed = Number.parseFloat(process.env[name] ?? "");
  return Number.isFinite(parsed) ? parsed : fallback;
}

function oneOf<T extends string>(name: string, allowed: readonly T[], fallback: T): T {
  const value = str(name, fallback) as T;
  return allowed.includes(value) ? value : fallback;
}

export function readConfig(): RagConfig {
  return {
    embedding: {
      provider: oneOf("RAG_EMBEDDING_PROVIDER", ["local", "http"] as const, "local"),
      url: str("RAG_EMBEDDING_URL", ""),
      model: str("RAG_EMBEDDING_MODEL", ""),
      apiKey: str("RAG_EMBEDDING_API_KEY", ""),
      dimension: int("RAG_EMBEDDING_DIMENSION", 1024),
      batchSize: int("RAG_EMBEDDING_BATCH_SIZE", 32),
    },
    chat: {
      provider: oneOf("RAG_CHAT_PROVIDER", ["local", "anthropic", "http"] as const, "local"),
      url: str("RAG_CHAT_URL", ""),
      model: str("RAG_CHAT_MODEL", "claude-opus-5"),
      apiKey: str("RAG_CHAT_API_KEY", ""),
      maxTokens: int("RAG_CHAT_MAX_TOKENS", 1024),
    },
    retrieval: {
      topK: int("RAG_TOP_K", 8),
      minScore: float("RAG_MIN_SCORE", 0.05),
      candidateLimit: int("RAG_CANDIDATE_LIMIT", 5000),
      cacheTtlMs: int("RAG_INDEX_CACHE_TTL_MS", 60_000),
    },
  };
}
