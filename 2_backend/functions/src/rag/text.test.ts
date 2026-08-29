import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { memeDocumentText, textFingerprint, tokenize } from "./text";

describe("text", () => {
  it("drops stopwords, punctuation and single characters", () => {
    assert.deepEqual(tokenize("The build is on fire, a x!"), ["build", "fire"]);
  });

  it("expands a camel-cased hashtag into its parts as well as the whole", () => {
    assert.deepEqual(tokenize("#DevLife"), ["devlife", "dev", "life"]);
  });

  it("leaves a hashtag without camel-case boundaries as one token", () => {
    assert.deepEqual(tokenize("#dank"), ["dank"]);
  });

  it("weights the caption above the other fields", () => {
    const text = memeDocumentText({
      id: "m1",
      caption: "deploy on friday",
      hashtags: ["#DevLife"],
      category: "Tech",
      creatorId: "u1",
      creatorHandle: "@shipper",
    });
    const captionOccurrences = text.split("deploy on friday").length - 1;
    assert.equal(captionOccurrences, 2);
    assert.ok(text.includes("#DevLife"));
    assert.ok(text.includes("Tech"));
  });

  it("fingerprints identical text identically and different text differently", () => {
    assert.equal(textFingerprint("same"), textFingerprint("same"));
    assert.notEqual(textFingerprint("same"), textFingerprint("same "));
  });
});
