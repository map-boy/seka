import type { ChatProvider } from "./types";

/**
 * The zero-dependency answer path. It does no generation: the caller has already
 * retrieved the relevant memes, so this returns a plain sentence pointing at them
 * and lets the UI render the sources. That keeps the assistant feature usable --
 * and the whole app deployable -- before any chat vendor is configured.
 */
export function createLocalChatProvider(): ChatProvider {
  return {
    id: "local-extractive",
    generative: false,
    async complete({ messages }) {
      const question = messages[messages.length - 1]?.content ?? "";
      return question.trim()
        ? "Here are the closest matches I found in the meme index."
        : "Ask me about a mood, a topic, or a creator and I will pull matching memes.";
    },
  };
}
