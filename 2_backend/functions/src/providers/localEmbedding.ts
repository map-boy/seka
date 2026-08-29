import { charNgrams, fnv1a, tokenize } from "../rag/text";
import { normalize } from "../rag/vector";
import type { EmbeddingProvider } from "./types";

/**
 * Feature-hashing embedder: no network, no API key, fully deterministic.
 *
 * Each token is hashed into a bucket with a signed weight, so unrelated terms
 * cancel rather than accumulate. Character 4-grams are mixed in at a lower weight
 * so near-misses ("relatable" vs "relatables") still overlap. It captures lexical
 * similarity, not true semantics -- it exists so search, recommendations and the
 * assistant all work before any vendor is wired in, and so tests never hit a network.
 */
export function createLocalEmbeddingProvider(dimension: number): EmbeddingProvider {
  const dim = Math.max(16, dimension);

  const embed = (text: string): number[] => {
    const vector = new Array<number>(dim).fill(0);
    const tokens = tokenize(text);

    const add = (feature: string, weight: number) => {
      const hash = fnv1a(feature);
      const bucket = hash % dim;
      const sign = (hash >>> 31) & 1 ? -1 : 1;
      vector[bucket] = vector[bucket]! + sign * weight;
    };

    for (const token of tokens) {
      add(token, 1);
      for (const gram of charNgrams(token)) add(`_${gram}`, 0.35);
    }

    return normalize(vector);
  };

  return {
    id: `local-hash-${dim}`,
    async embedDocuments(texts) {
      return texts.map(embed);
    },
    async embedQuery(text) {
      return embed(text);
    },
  };
}
