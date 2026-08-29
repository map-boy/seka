import { HttpsError } from "firebase-functions/v2/https";
import type { Passage } from "../rag/prompt";

export const MAX_LIMIT = 50;

export function requireString(value: unknown, field: string, maxLength = 500): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpsError("invalid-argument", `"${field}" must be a non-empty string.`);
  }
  if (value.length > maxLength) {
    throw new HttpsError("invalid-argument", `"${field}" must be at most ${maxLength} characters.`);
  }
  return value.trim();
}

export function optionalLimit(value: unknown, fallback: number): number {
  if (value === undefined || value === null) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new HttpsError("invalid-argument", '"limit" must be a positive number.');
  }
  return Math.min(Math.floor(parsed), MAX_LIMIT);
}

export function optionalCategory(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") {
    throw new HttpsError("invalid-argument", '"category" must be a string.');
  }
  return value;
}

/** The client only ever needs ids and scores -- it already has the meme documents. */
export interface SearchHit {
  memeId: string;
  score: number;
  caption: string;
  category: string;
  hashtags: string[];
  creatorId: string;
}

export function toHits(passages: readonly Passage[]): SearchHit[] {
  return passages.map((passage) => ({
    memeId: passage.memeId,
    score: Number(passage.score.toFixed(4)),
    caption: passage.caption,
    category: passage.category,
    hashtags: passage.hashtags,
    creatorId: passage.creatorId,
  }));
}
