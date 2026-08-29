import type { ChatMessage } from "../providers";
import type { EmbeddingRecord } from "./store";
import type { Scored } from "./vector";

export interface Passage {
  memeId: string;
  caption: string;
  hashtags: string[];
  category: string;
  creatorId: string;
  score: number;
}

export function toPassages(scored: readonly Scored<EmbeddingRecord>[]): Passage[] {
  return scored.map(({ item, score }) => ({
    memeId: item.memeId,
    caption: item.caption,
    hashtags: item.hashtags,
    category: item.category,
    creatorId: item.creatorId,
    score,
  }));
}

export const ASSISTANT_SYSTEM_PROMPT = [
  "You are the Seka meme assistant. Seka is a meme-sharing app.",
  "",
  "You answer questions using ONLY the numbered memes supplied in the user message.",
  "Rules:",
  "- Cite every meme you mention as [1], [2], ... matching its number.",
  "- Never invent a meme, caption, creator, or statistic that is not in the list.",
  "- If the list does not answer the question, say so plainly and suggest what to search instead.",
  "- Keep it to three sentences or fewer. Match the app's casual tone; no preamble.",
].join("\n");

/** Renders retrieved memes as the numbered block the system prompt refers to. */
export function renderPassages(passages: readonly Passage[]): string {
  if (passages.length === 0) return "(no memes matched)";
  return passages
    .map((passage, i) => {
      const tags = passage.hashtags.length > 0 ? ` ${passage.hashtags.join(" ")}` : "";
      return `[${i + 1}] (${passage.category}) ${passage.caption}${tags}`;
    })
    .join("\n");
}

export function buildAssistantMessages(
  question: string,
  passages: readonly Passage[],
  history: readonly ChatMessage[] = []
): ChatMessage[] {
  const grounding = [
    "Memes retrieved for this question:",
    renderPassages(passages),
    "",
    `Question: ${question}`,
  ].join("\n");

  return [...history, { role: "user", content: grounding }];
}

/**
 * The citation numbers an answer actually used, as zero-based passage indices.
 * The UI shows only these, so a model that cites two of eight memes does not drag
 * six irrelevant cards along with it.
 */
export function citedIndices(answer: string, passageCount: number): number[] {
  const cited = new Set<number>();
  for (const match of answer.matchAll(/\[(\d+)\]/g)) {
    const index = Number.parseInt(match[1]!, 10) - 1;
    if (index >= 0 && index < passageCount) cited.add(index);
  }
  return [...cited].sort((a, b) => a - b);
}
