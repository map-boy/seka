import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ASSISTANT_SYSTEM_PROMPT,
  buildAssistantMessages,
  citedIndices,
  renderPassages,
  type Passage,
} from "./prompt";

const passages: Passage[] = [
  {
    memeId: "a",
    caption: "debugging at 3am",
    hashtags: ["#DevLife"],
    category: "Tech",
    creatorId: "dev",
    score: 0.8,
  },
  {
    memeId: "b",
    caption: "cat knocks over glass",
    hashtags: [],
    category: "Wholesome",
    creatorId: "pets",
    score: 0.4,
  },
];

describe("prompt", () => {
  it("numbers passages from 1 so citations line up", () => {
    const rendered = renderPassages(passages);
    assert.ok(rendered.startsWith("[1] (Tech) debugging at 3am #DevLife"));
    assert.ok(rendered.includes("[2] (Wholesome) cat knocks over glass"));
  });

  it("says so explicitly when retrieval found nothing", () => {
    assert.equal(renderPassages([]), "(no memes matched)");
  });

  it("forbids inventing memes in the system prompt", () => {
    assert.ok(/only/i.test(ASSISTANT_SYSTEM_PROMPT));
    assert.ok(/never invent/i.test(ASSISTANT_SYSTEM_PROMPT));
  });

  it("puts the question after the grounding block and keeps prior turns", () => {
    const messages = buildAssistantMessages("any dev memes?", passages, [
      { role: "user", content: "hi" },
      { role: "assistant", content: "hey" },
    ]);
    assert.equal(messages.length, 3);
    assert.equal(messages[0]!.content, "hi");
    const last = messages[2]!.content;
    assert.ok(last.indexOf("[1]") < last.indexOf("Question: any dev memes?"));
  });

  it("extracts cited passage indices and ignores out-of-range ones", () => {
    assert.deepEqual(citedIndices("Try [2] and also [1].", 2), [0, 1]);
    assert.deepEqual(citedIndices("See [9]", 2), []);
    assert.deepEqual(citedIndices("no citations here", 2), []);
  });

  it("does not double-count a passage cited twice", () => {
    assert.deepEqual(citedIndices("[1] then [1] again", 2), [0]);
  });
});
