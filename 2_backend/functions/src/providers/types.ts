/**
 * The two seams every provider plugs into. Add a vendor by implementing one of
 * these and registering it in ./index.ts -- nothing in src/rag/ knows a vendor name.
 */

export interface EmbeddingProvider {
  /** Stable identifier stored alongside each vector so stale rows can be spotted. */
  readonly id: string;
  /** Embeds documents for the index. Order of the result matches the input. */
  embedDocuments(texts: string[]): Promise<number[][]>;
  /** Embeds a user query. Defaults to embedDocuments for symmetric models. */
  embedQuery(text: string): Promise<number[]>;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatProvider {
  readonly id: string;
  /** True when answers come from a real model rather than the extractive fallback. */
  readonly generative: boolean;
  complete(input: { system: string; messages: ChatMessage[] }): Promise<string>;
}
