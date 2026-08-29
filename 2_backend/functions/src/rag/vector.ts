/** Dense-vector helpers. Vectors are plain number arrays of equal length. */

export function dot(a: readonly number[], b: readonly number[]): number {
  const n = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += a[i]! * b[i]!;
  return sum;
}

export function magnitude(v: readonly number[]): number {
  return Math.sqrt(dot(v, v));
}

/** Returns a unit-length copy. A zero vector is returned unchanged. */
export function normalize(v: readonly number[]): number[] {
  const m = magnitude(v);
  if (m === 0) return [...v];
  return v.map((x) => x / m);
}

/**
 * Cosine similarity in [-1, 1]. Vectors of different lengths compare over their
 * shared prefix, which keeps a stale index from throwing after a model swap --
 * the scores are meaningless in that case, so re-embed rather than rely on it.
 */
export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  const denom = magnitude(a) * magnitude(b);
  return denom === 0 ? 0 : dot(a, b) / denom;
}

/** Component-wise weighted mean, normalized to unit length. */
export function meanVector(
  vectors: readonly (readonly number[])[],
  weights?: readonly number[]
): number[] {
  if (vectors.length === 0) return [];
  const dim = vectors[0]!.length;
  const acc = new Array<number>(dim).fill(0);
  let totalWeight = 0;

  vectors.forEach((v, i) => {
    const w = weights?.[i] ?? 1;
    if (w === 0) return;
    totalWeight += w;
    for (let d = 0; d < dim; d++) acc[d] = acc[d]! + (v[d] ?? 0) * w;
  });

  if (totalWeight === 0) return new Array<number>(dim).fill(0);
  return normalize(acc.map((x) => x / totalWeight));
}

export interface Scored<T> {
  item: T;
  score: number;
}

/** Highest scores first. Ties keep their original relative order. */
export function topK<T>(scored: readonly Scored<T>[], k: number): Scored<T>[] {
  return [...scored]
    .map((s, index) => ({ ...s, index }))
    .sort((a, b) => (b.score - a.score) || (a.index - b.index))
    .slice(0, Math.max(0, k))
    .map(({ item, score }) => ({ item, score }));
}
