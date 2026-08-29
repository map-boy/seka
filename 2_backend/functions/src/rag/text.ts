/** Turning meme documents into the text and tokens the retrieval layer indexes. */

export interface IndexableMeme {
  id: string;
  caption: string;
  hashtags: string[];
  category: string;
  creatorId: string;
  creatorHandle?: string;
  creatorName?: string;
}

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from", "how",
  "i", "if", "in", "is", "it", "its", "me", "my", "of", "on", "or", "so", "that",
  "the", "their", "them", "then", "there", "they", "this", "to", "up", "was", "we",
  "were", "what", "when", "who", "will", "with", "you", "your",
]);

/**
 * The single string that represents a meme in the index. Caption carries the most
 * signal, so it is repeated -- feature-hashed vectors weight by term frequency and
 * this keeps a matching caption ahead of a merely matching category.
 */
export function memeDocumentText(meme: IndexableMeme): string {
  const tags = meme.hashtags.join(" ");
  const creator = [meme.creatorHandle, meme.creatorName].filter(Boolean).join(" ");
  return [meme.caption, meme.caption, tags, meme.category, creator]
    .filter((part) => part && part.trim().length > 0)
    .join("\n")
    .trim();
}

/** Splits a camel-cased compound: "DevLife" -> ["Dev", "Life"]. */
function camelParts(token: string): string[] {
  const spaced = token.replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, "$1 $2");
  return spaced === token ? [] : spaced.split(" ");
}

/**
 * Lowercased word tokens, stopwords and single characters removed.
 *
 * Hashtags lose their leading marker and are emitted both whole and split on
 * their camel-case boundaries, so "#DevLife" reaches the buckets for "devlife",
 * "dev" and "life" -- without that, a hashtag is a single opaque token that a
 * two-word query can never match.
 */
export function tokenize(text: string): string[] {
  const raw = text
    .replace(/[#@]/g, " ")
    .split(/[^\p{L}\p{N}']+/u)
    .map((t) => t.replace(/^'+|'+$/g, ""))
    .filter(Boolean);

  const tokens: string[] = [];
  for (const token of raw) {
    tokens.push(token.toLowerCase());
    for (const part of camelParts(token)) tokens.push(part.toLowerCase());
  }

  return tokens.filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/**
 * Character n-grams, which give the local embedder tolerance for typos and
 * inflection -- trigrams are short enough that "debugging" and "bugs" still
 * share the "bug" bucket.
 */
export function charNgrams(token: string, n = 3): string[] {
  if (token.length <= n) return [token];
  const grams: string[] = [];
  for (let i = 0; i + n <= token.length; i++) grams.push(token.slice(i, i + n));
  return grams;
}

/** 32-bit FNV-1a. Deterministic across processes, which the embedding cache relies on. */
export function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** Stable fingerprint of the indexed text, used to skip re-embedding unchanged memes. */
export function textFingerprint(text: string): string {
  // Two independent FNV passes: enough to make an accidental collision on a
  // per-meme basis vanishingly unlikely without pulling in a crypto hash.
  return `${fnv1a(text).toString(16)}${fnv1a(` ${text}`).toString(16)}`;
}
