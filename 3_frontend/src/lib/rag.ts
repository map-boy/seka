import { getFunctions, httpsCallable, type Functions } from "firebase/functions";
import { app, firebaseConfigured } from "./firebase";
import type { MemePost } from "../types";

/** One retrieved meme, as returned by the RAG callables. */
export interface RagHit {
  memeId: string;
  score: number;
  caption: string;
  category: string;
  hashtags: string[];
  creatorId: string;
}

export interface SearchResponse {
  results: RagHit[];
  provider: string;
  indexSize: number;
}

export interface RecommendResponse {
  results: RagHit[];
  strategy: "taste" | "cold-start";
  likeCount: number;
  saveCount: number;
}

export interface AssistantTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantResponse {
  answer: string;
  sources: RagHit[];
  /** False when the answer came from the extractive fallback rather than a model. */
  generative: boolean;
  provider: string;
}

/** Thrown when the backend is unreachable so callers can fall back locally. */
export class RagUnavailableError extends Error {
  constructor(readonly fn: string, cause: unknown) {
    super(`RAG function "${fn}" is unavailable`);
    this.name = "RagUnavailableError";
    this.cause = cause;
  }
}

let functionsInstance: Functions | null = null;

function getFunctionsInstance(): Functions | null {
  if (!firebaseConfigured) return null;
  if (!functionsInstance) functionsInstance = getFunctions(app);
  return functionsInstance;
}

/** True when the RAG backend can be called at all (Firebase is configured). */
export const ragAvailable = firebaseConfigured;

async function call<TRequest, TResponse>(name: string, payload: TRequest): Promise<TResponse> {
  const functions = getFunctionsInstance();
  if (!functions) throw new RagUnavailableError(name, "Firebase is not configured");

  try {
    const callable = httpsCallable<TRequest, TResponse>(functions, name);
    const result = await callable(payload);
    return result.data;
  } catch (error) {
    throw new RagUnavailableError(name, error);
  }
}

export function semanticSearch(input: {
  query: string;
  limit?: number;
  category?: string;
}): Promise<SearchResponse> {
  return call<typeof input, SearchResponse>("semanticSearch", input);
}

export function recommendForYou(input: {
  limit?: number;
  category?: string;
}): Promise<RecommendResponse> {
  return call<typeof input, RecommendResponse>("recommendForYou", input);
}

export function askAssistant(input: {
  question: string;
  history?: AssistantTurn[];
  limit?: number;
}): Promise<AssistantResponse> {
  return call<typeof input, AssistantResponse>("askAssistant", input);
}

/* ------------------------------------------------------------------------- */
/* Local fallbacks                                                            */
/*                                                                            */
/* Every screen renders through one of these when the backend is unreachable  */
/* or still indexing, so a RAG outage degrades the feature instead of         */
/* breaking the page.                                                         */
/* ------------------------------------------------------------------------- */

/** Substring match over caption, creator and hashtags -- the pre-RAG behaviour. */
export function localSearch(memes: MemePost[], query: string): MemePost[] {
  const q = query.trim().toLowerCase();
  if (!q) return memes;
  return memes.filter(
    (meme) =>
      meme.caption.toLowerCase().includes(q) ||
      meme.creator.name.toLowerCase().includes(q) ||
      meme.creator.handle.toLowerCase().includes(q) ||
      meme.hashtags.some((tag) => tag.toLowerCase().includes(q))
  );
}

/** The app's virality formula, used when personalised recommendations are unavailable. */
export function viralityScore(meme: MemePost): number {
  return meme.likes + meme.shares * 2 + meme.downloads * 3;
}

export function localForYou(memes: MemePost[]): MemePost[] {
  return [...memes].sort((a, b) => viralityScore(b) - viralityScore(a));
}

/** Reorders the loaded memes to match retrieval order, dropping anything not loaded. */
export function orderByHits(memes: MemePost[], hits: RagHit[]): MemePost[] {
  const byId = new Map(memes.map((meme) => [meme.id, meme]));
  const ordered: MemePost[] = [];
  for (const hit of hits) {
    const meme = byId.get(hit.memeId);
    if (meme) ordered.push(meme);
  }
  return ordered;
}
