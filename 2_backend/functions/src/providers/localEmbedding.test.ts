import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cosineSimilarity, magnitude } from "../rag/vector";
import { createLocalEmbeddingProvider } from "./localEmbedding";

const provider = createLocalEmbeddingProvider(256);

describe("local embedding provider", () => {
  it("produces unit vectors of the configured dimension", async () => {
    const [vector] = await provider.embedDocuments(["deploy on friday"]);
    assert.equal(vector!.length, 256);
    assert.ok(Math.abs(magnitude(vector!) - 1) < 1e-12);
  });

  it("is deterministic across calls", async () => {
    const a = await provider.embedQuery("same text");
    const b = await provider.embedQuery("same text");
    assert.deepEqual(a, b);
  });

  it("scores related text above unrelated text", async () => {
    const query = await provider.embedQuery("debugging production bugs");
    const [related, unrelated] = await provider.embedDocuments([
      "me debugging a production outage",
      "my cat knocked over a glass",
    ]);
    assert.ok(cosineSimilarity(query, related!) > cosineSimilarity(query, unrelated!));
  });

  it("tolerates a suffix change via character n-grams", async () => {
    const query = await provider.embedQuery("relatable");
    const [inflected] = await provider.embedDocuments(["relatables"]);
    assert.ok(cosineSimilarity(query, inflected!) > 0.2);
  });

  it("returns a zero vector for text with no usable tokens", async () => {
    const [vector] = await provider.embedDocuments(["!!! ???"]);
    assert.ok(vector!.every((x) => x === 0));
  });

  it("never divides by zero on an empty string", async () => {
    const vector = await provider.embedQuery("");
    assert.equal(vector.length, 256);
    assert.ok(vector.every((x) => Number.isFinite(x)));
  });
});
