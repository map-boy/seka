import type { ChatConfig } from "../config";
import type { ChatProvider } from "./types";

/**
 * Generic chat client for any vendor exposing the widely-copied
 * `POST {url} {model, messages:[{role, content}]}` completion shape:
 *
 *   RAG_CHAT_PROVIDER=http
 *   RAG_CHAT_URL=https://api.example.com/v1/chat/completions
 *   RAG_CHAT_MODEL=<model id>
 *   RAG_CHAT_API_KEY=<secret>
 */
export function createHttpChatProvider(config: ChatConfig): ChatProvider {
  if (!config.url) {
    throw new Error("RAG_CHAT_URL must be set when RAG_CHAT_PROVIDER=http");
  }

  return {
    id: `http:${config.model || "unknown"}`,
    generative: true,
    async complete({ system, messages }) {
      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(config.apiKey ? { authorization: `Bearer ${config.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: config.maxTokens,
          messages: [{ role: "system", content: system }, ...messages],
        }),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(`Chat request failed (${response.status}): ${detail.slice(0, 300)}`);
      }

      const payload = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };

      return payload.choices?.[0]?.message?.content?.trim() ?? "";
    },
  };
}
