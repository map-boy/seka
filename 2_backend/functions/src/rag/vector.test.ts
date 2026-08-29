import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cosineSimilarity, magnitude, meanVector, normalize, topK } from "./vector";

describe("vector", () => {
  it("normalizes to unit length", () => {
    const unit = normalize([3, 4]);
    assert.ok(Math.abs(magnitude(unit) - 1) < 1e-12);
    assert.deepEqual(unit, [0.6, 0.8]);
  });

  it("leaves a zero vector alone instead of dividing by zero", () => {
    assert.deepEqual(normalize([0, 0, 0]), [0, 0, 0]);
  });

  it("scores identical direction as 1 and orthogonal as 0", () => {
    assert.ok(Math.abs(cosineSimilarity([1, 2, 3], [2, 4, 6]) - 1) < 1e-12);
    assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
    assert.ok(cosineSimilarity([1, 0], [-1, 0]) < 0);
  });

  it("treats a zero vector as unrelated rather than throwing", () => {
    assert.equal(cosineSimilarity([0, 0], [1, 1]), 0);
  });

  it("weights the mean toward the heavier vectors", () => {
    const centroid = meanVector([[1, 0], [0, 1]], [3, 1]);
    assert.ok(centroid[0]! > centroid[1]!);
    assert.ok(Math.abs(magnitude(centroid) - 1) < 1e-12);
  });

  it("returns an empty centroid for no vectors", () => {
    assert.deepEqual(meanVector([]), []);
  });

  it("orders topK by score and keeps input order on ties", () => {
    const ranked = topK(
      [
        { item: "a", score: 0.1 },
        { item: "b", score: 0.9 },
        { item: "c", score: 0.9 },
      ],
      2
    );
    assert.deepEqual(ranked.map((r) => r.item), ["b", "c"]);
  });
});
