import Anthropic from "@anthropic-ai/sdk";
import type { ChatConfig } from "../config";
import type { ChatProvider } from "./types";

/**
 * Answer generation through the official Anthropic SDK:
 *
 *   RAG_CHAT_PROVIDER=anthropic
 *   RAG_CHAT_MODEL=claude-opus-5   (default)
 *   RAG_CHAT_API_KEY=<secret>
 *
 * Answers are short and grounded -- the retrieved passages carry the reasoning --
 * so max_tokens is the only spend control here. If you pin a newer SDK that
 * exposes output_config, adding `output_config: { effort: "low" }` trims cost
 * further without changing anything else in this file.
 */
export function createAnthropicChatProvider(config: ChatConfig): ChatProvider {
  const client = new Anthropic(config.apiKey ? { apiKey: config.apiKey } : {});
  const model = config.model || "claude-opus-5";

  return {
    id: `anthropic:${model}`,
    generative: true,
    async complete({ system, messages }) {
      const response = await client.messages.create({
        model,
        max_tokens: config.maxTokens,
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      if (response.stop_reason === "refusal") {
        throw new Error("The answer model declined to respond to this question.");
      }

      return response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("")
        .trim();
    },
  };
}
