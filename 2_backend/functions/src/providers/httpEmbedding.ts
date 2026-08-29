import type { EmbeddingConfig } from "../config";
import { normalize } from "../rag/vector";
import type { EmbeddingProvider } from "./types";

/**
 * Generic embeddings client for any vendor exposing the widely-copied
 * `POST {url} {model, input: string[]}` shape. Both common response envelopes are
 * accepted, so most hosted embedding APIs work by setting env vars alone:
 *
 *   RAG_EMBEDDING_PROVIDER=http
 *   RAG_EMBEDDING_URL=https://api.example.com/v1/embeddings
 *   RAG_EMBEDDING_MODEL=<model id>
 *   RAG_EMBEDDING_API_KEY=<secret>
 *
 * A vendor with a different request shape gets its own file next to this one.
 */
export function createHttpEmbeddingProvider(config: EmbeddingConfig): EmbeddingProvider {
  if (!config.url) {
    throw new Error("RAG_EMBEDDING_URL must be set when RAG_EMBEDDING_PROVIDER=http");
  }

  const batchSize = Math.max(1, config.batchSize);

  const request = async (input: string[]): Promise<number[][]> => {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(config.apiKey ? { authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify({ model: config.model, input }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Embedding request failed (${response.status}): ${detail.slice(0, 300)}`);
    }

    const payload = (await response.json()) as {
      data?: { embedding?: number[] }[];
      embeddings?: number[][];
    };

    const vectors = payload.data
      ? payload.data.map((row) => row.embedding ?? [])
      : payload.embeddings ?? [];

    if (vectors.length !== input.length) {
      throw new Error(
        `Embedding provider returned ${vectors.length} vectors for ${input.length} inputs`
      );
    }

    return vectors.map((v) => normalize(v));
  };

  return {
    id: `http:${config.model || "unknown"}`,
    async embedDocuments(texts) {
      const out: number[][] = [];
      for (let i = 0; i < texts.length; i += batchSize) {
        out.push(...(await request(texts.slice(i, i + batchSize))));
      }
      return out;
    },
    async embedQuery(text) {
      const [vector] = await request([text]);
      return vector ?? [];
    },
  };
}
