import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createLocalEmbeddingProvider } from "../providers/localEmbedding";
import {
  blendRecommendations,
  rankByVector,
  rankColdStart,
  recencyScore,
  viralityScore,
} from "./retrieve";
import type { EmbeddingRecord, MemeStats } from "./store";
import { memeDocumentText } from "./text";
import { meanVector } from "./vector";

const provider = createLocalEmbeddingProvider(1024);
const NOW = Date.UTC(2026, 0, 10);
const HOUR = 3_600_000;

interface Fixture {
  id: string;
  caption: string;
  hashtags: string[];
  category: string;
  creatorId: string;
  ageHours: number;
}

const FIXTURES: Fixture[] = [
  {
    id: "debug",
    caption: "me debugging a production outage at 3am",
    hashtags: ["#DevLife", "#TechHumor"],
    category: "Tech",
    creatorId: "dev",
    ageHours: 2,
  },
  {
    id: "deploy",
    caption: "deploying straight to production on a friday afternoon",
    hashtags: ["#DevLife"],
    category: "Tech",
    creatorId: "dev",
    ageHours: 30,
  },
  {
    id: "cat",
    caption: "my cat knocking a glass of water off the table",
    hashtags: ["#CatMeme", "#Wholesome"],
    category: "Wholesome",
    creatorId: "pets",
    ageHours: 5,
  },
  {
    id: "anime",
    caption: "when the anime protagonist powers up in the last episode",
    hashtags: ["#AnimeMemes"],
    category: "Anime",
    creatorId: "otaku",
    ageHours: 100,
  },
];

async function buildIndex(): Promise<EmbeddingRecord[]> {
  const texts = FIXTURES.map((f) =>
    memeDocumentText({
      id: f.id,
      caption: f.caption,
      hashtags: f.hashtags,
      category: f.category,
      creatorId: f.creatorId,
    })
  );
  const vectors = await provider.embedDocuments(texts);

  return FIXTURES.map((f, i) => ({
    memeId: f.id,
    creatorId: f.creatorId,
    category: f.category,
    caption: f.caption,
    hashtags: f.hashtags,
    creatorHandle: "",
    vector: vectors[i]!,
    providerId: provider.id,
    fingerprint: "test",
    createdAtMs: NOW - f.ageHours * HOUR,
  }));
}

const stats = new Map<string, MemeStats>([
  ["debug", { likesCount: 10, sharesCount: 1, downloadsCount: 0, createdAtMs: NOW - 2 * HOUR }],
  ["deploy", { likesCount: 900, sharesCount: 400, downloadsCount: 200, createdAtMs: NOW - 30 * HOUR }],
  ["cat", { likesCount: 40, sharesCount: 5, downloadsCount: 2, createdAtMs: NOW - 5 * HOUR }],
  ["anime", { likesCount: 5, sharesCount: 0, downloadsCount: 0, createdAtMs: NOW - 100 * HOUR }],
]);

describe("rankByVector", () => {
  it("puts the topically closest meme first", async () => {
    const index = await buildIndex();
    const query = await provider.embedQuery("debugging production at 3am");
    const ranked = rankByVector(index, query, { limit: 3, minScore: 0 });
    assert.equal(ranked[0]!.item.memeId, "debug");
    assert.equal(ranked[1]!.item.memeId, "deploy");
  });

  it("matches a multi-word query against a camel-cased hashtag", async () => {
    const index = await buildIndex();
    const query = await provider.embedQuery("dev life memes");
    const ranked = rankByVector(index, query, { limit: 2, minScore: 0 });
    // Both #DevLife memes must outrank the cat and anime ones.
    assert.deepEqual(ranked.map((r) => r.item.category), ["Tech", "Tech"]);
  });

  it("documents the local provider's limit: a pure paraphrase does not clear the threshold", async () => {
    // "fixing bugs late at night" and "debugging a production outage at 3am"
    // mean the same thing but share no words or subwords, so the built-in
    // lexical embedder scores them as noise. Real paraphrase matching is what
    // RAG_EMBEDDING_PROVIDER=http buys you.
    const index = await buildIndex();
    const query = await provider.embedQuery("fixing bugs late at night");
    const ranked = rankByVector(index, query, { limit: 3, minScore: 0.05 });
    assert.equal(ranked.length, 0);
  });

  it("matches on hashtags the caption never spells out", async () => {
    const index = await buildIndex();
    const query = await provider.embedQuery("wholesome cat");
    const ranked = rankByVector(index, query, { limit: 1, minScore: 0 });
    assert.equal(ranked[0]!.item.memeId, "cat");
  });

  it("honours the category filter", async () => {
    const index = await buildIndex();
    const query = await provider.embedQuery("production outage");
    const ranked = rankByVector(index, query, { limit: 10, minScore: 0, category: "Anime" });
    assert.ok(ranked.every((r) => r.item.category === "Anime"));
  });

  it("treats All and For You as no filter at all", async () => {
    const index = await buildIndex();
    const query = await provider.embedQuery("production outage");
    for (const category of ["All", "For You"]) {
      const ranked = rankByVector(index, query, { limit: 10, minScore: 0, category });
      assert.ok(ranked.length > 1, `${category} should not filter anything out`);
    }
  });

  it("drops excluded memes and blocked creators", async () => {
    const index = await buildIndex();
    const query = await provider.embedQuery("production outage");
    const ranked = rankByVector(index, query, {
      limit: 10,
      minScore: 0,
      exclude: new Set(["debug"]),
      excludeCreators: new Set(["pets"]),
    });
    const ids = ranked.map((r) => r.item.memeId);
    assert.ok(!ids.includes("debug"));
    assert.ok(!ids.includes("cat"));
  });

  it("returns nothing for an empty query vector rather than ranking noise", async () => {
    const index = await buildIndex();
    assert.deepEqual(rankByVector(index, [], { limit: 5, minScore: 0 }), []);
  });

  it("filters out weak matches above the minimum score", async () => {
    const index = await buildIndex();
    const query = await provider.embedQuery("quarterly revenue spreadsheet");
    const ranked = rankByVector(index, query, { limit: 10, minScore: 0.5 });
    assert.equal(ranked.length, 0);
  });
});

describe("scoring", () => {
  it("halves the recency score every 24 hours", () => {
    assert.ok(Math.abs(recencyScore(NOW, NOW) - 1) < 1e-12);
    assert.ok(Math.abs(recencyScore(NOW - 24 * HOUR, NOW) - 0.5) < 1e-12);
    assert.equal(recencyScore(0, NOW), 0);
  });

  it("weights shares and downloads above likes", () => {
    const likes = { likesCount: 6, sharesCount: 0, downloadsCount: 0, createdAtMs: NOW };
    const downloads = { likesCount: 0, sharesCount: 0, downloadsCount: 3, createdAtMs: NOW };
    assert.ok(viralityScore(downloads) > viralityScore(likes));
    assert.equal(viralityScore(undefined), 0);
  });
});

describe("blendRecommendations", () => {
  it("lets a viral, recent meme overtake a slightly closer but dead one", async () => {
    const index = await buildIndex();
    const byId = new Map(index.map((r) => [r.memeId, r]));

    // Similarity is deliberately near-tied; virality and recency break it.
    const candidates = [
      { item: byId.get("anime")!, score: 0.62 },
      { item: byId.get("deploy")!, score: 0.6 },
    ];

    const blended = blendRecommendations(candidates, stats, NOW);
    assert.equal(blended[0]!.item.memeId, "deploy");
  });

  it("keeps similarity dominant when engagement is comparable", async () => {
    const index = await buildIndex();
    const byId = new Map(index.map((r) => [r.memeId, r]));
    const candidates = [
      { item: byId.get("debug")!, score: 0.9 },
      { item: byId.get("cat")!, score: 0.2 },
    ];

    const blended = blendRecommendations(candidates, stats, NOW);
    assert.equal(blended[0]!.item.memeId, "debug");
  });
});

describe("taste profile ranking", () => {
  it("recommends the unseen meme closest to what the user liked", async () => {
    const index = await buildIndex();
    const byId = new Map(index.map((r) => [r.memeId, r]));

    // A user who liked the 3am debugging meme should be offered the other dev meme.
    const taste = meanVector([byId.get("debug")!.vector]);
    const ranked = rankByVector(index, taste, {
      limit: 3,
      minScore: 0,
      exclude: new Set(["debug"]),
    });

    assert.equal(ranked[0]!.item.memeId, "deploy");
  });
});

describe("rankColdStart", () => {
  it("ranks by virality and recency when there is no taste vector", async () => {
    const index = await buildIndex();
    const ranked = rankColdStart(index, stats, { limit: 4 }, NOW);
    assert.equal(ranked[0]!.item.memeId, "deploy");
    assert.equal(ranked.length, 4);
  });

  it("still applies filters", async () => {
    const index = await buildIndex();
    const ranked = rankColdStart(
      index,
      stats,
      { limit: 4, excludeCreators: new Set(["dev"]) },
      NOW
    );
    assert.ok(ranked.every((r) => r.item.creatorId !== "dev"));
  });
});
