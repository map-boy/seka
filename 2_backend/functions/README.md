# Seka RAG backend

Retrieval-augmented meme features, as Firebase Cloud Functions. Three product
surfaces share one index and one provider abstraction.

| Function | Kind | What it does |
|---|---|---|
| `semanticSearch` | callable | Meaning-based meme search for Discover. Public; filters the caller's blocked creators when signed in. |
| `recommendForYou` | callable | The "For You" feed: memes similar to what you liked and saved, blended with virality and recency. Requires auth. |
| `askAssistant` | callable | Grounded question answering. Retrieves memes, answers from them only, returns the cited memes as sources. Requires auth. |
| `indexMeme` | Firestore trigger | Keeps `memeEmbeddings` in step with `memes`. |
| `backfillMemeIndex` | callable | Indexes pre-existing memes, or rebuilds after a provider change. Admin only. |

## It runs with no API keys

The default embedding provider is a built-in feature-hashing embedder and the
default answerer is extractive, so every function works on a bare `firebase
deploy` with nothing configured. That default is **lexical, not semantic**: it
matches shared words and subwords (including camel-cased hashtags, so "dev life"
finds `#DevLife`), but it will not connect "fixing bugs late at night" to
"debugging a production outage at 3am". `src/rag/retrieve.test.ts` has a test
that documents exactly this limit. Wire a real embedding provider when you want
paraphrase matching.

## Wiring a provider

No code changes -- set environment variables (see `.env.example`):

```bash
# Embeddings: any vendor with POST {model, input: string[]}
RAG_EMBEDDING_PROVIDER=http
RAG_EMBEDDING_URL=https://api.example.com/v1/embeddings
RAG_EMBEDDING_MODEL=<model id>
firebase functions:secrets:set RAG_EMBEDDING_API_KEY

# Answers: the official Anthropic SDK
RAG_CHAT_PROVIDER=anthropic
RAG_CHAT_MODEL=claude-opus-5
firebase functions:secrets:set RAG_CHAT_API_KEY

# ...or any vendor with POST {model, messages: [...]}
RAG_CHAT_PROVIDER=http
RAG_CHAT_URL=https://api.example.com/v1/chat/completions
RAG_CHAT_MODEL=<model id>
```

After switching embedding providers the stored vectors are meaningless -- call
`backfillMemeIndex({ force: true })` to rebuild. Vectors record the provider id
that produced them so a half-migrated index is easy to spot.

A vendor whose request shape matches neither generic client gets its own file in
`src/providers/`, implementing `EmbeddingProvider` or `ChatProvider` from
`src/providers/types.ts` and registered in `src/providers/index.ts`. Nothing in
`src/rag/` knows a vendor name.

## Data model

`memeEmbeddings/{memeId}` mirrors one meme:

```
{ memeId, creatorId, category, caption, hashtags, creatorHandle,
  vector: number[], providerId, fingerprint, createdAtMs }
```

Only content-derived fields are stored. Engagement counters change constantly and
would force a re-index on every like, so `indexMeme` exits early when the
fingerprint is unchanged and ranking reads live counters from the shortlist's
meme documents instead.

Clients never read this collection -- `firestore.rules` denies it. Retrieval
happens server-side, which is also what keeps any provider key off the browser.

Retrieval is a brute-force cosine scan over the whole index, held in memory for
`RAG_INDEX_CACHE_TTL_MS` per function instance. That is the right tradeoff at
this scale; moving to a vector index later means replacing `loadIndex` and
`rankByVector` and nothing else.

## Ranking

`recommendForYou` scores `0.7 x taste similarity + 0.2 x virality + 0.1 x
recency`. Virality reuses the app's existing `likes + shares*2 + downloads*3`
formula, log-compressed and normalized within the batch. Recency has a 24-hour
half-life. A user with nothing liked or saved falls back to virality plus
recency, so a new account never sees an empty feed.

## Local development

```bash
npm install
npm test        # unit tests, no network, no emulator
npm run lint    # tsc --noEmit
npm run build
npm run serve   # functions emulator
```
