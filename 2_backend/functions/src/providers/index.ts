import type { RagConfig } from "../config";
import { createAnthropicChatProvider } from "./anthropicChat";
import { createHttpChatProvider } from "./httpChat";
import { createHttpEmbeddingProvider } from "./httpEmbedding";
import { createLocalChatProvider } from "./localChat";
import { createLocalEmbeddingProvider } from "./localEmbedding";
import type { ChatProvider, EmbeddingProvider } from "./types";

export type { ChatMessage, ChatProvider, EmbeddingProvider } from "./types";

export function getEmbeddingProvider(config: RagConfig): EmbeddingProvider {
  switch (config.embedding.provider) {
    case "http":
      return createHttpEmbeddingProvider(config.embedding);
    case "local":
    default:
      return createLocalEmbeddingProvider(config.embedding.dimension);
  }
}

export function getChatProvider(config: RagConfig): ChatProvider {
  switch (config.chat.provider) {
    case "anthropic":
      return createAnthropicChatProvider(config.chat);
    case "http":
      return createHttpChatProvider(config.chat);
    case "local":
    default:
      return createLocalChatProvider();
  }
}
