/**
 * Seka retrieval-augmented generation backend.
 *
 * Three product surfaces share one index and one provider abstraction:
 *   semanticSearch    - meaning-based meme search for Discover
 *   recommendForYou   - the personalised "For You" feed
 *   askAssistant      - grounded question answering with cited memes
 *
 * plus indexMeme (keeps the index current) and backfillMemeIndex (admin rebuild).
 *
 * Everything runs with zero third-party keys by default: the local embedder and
 * the extractive answerer are the defaults. See README.md to wire a vendor.
 */

export { indexMeme } from "./handlers/indexMeme";
export { semanticSearch } from "./handlers/search";
export { recommendForYou } from "./handlers/recommend";
export { askAssistant } from "./handlers/ask";
export { backfillMemeIndex } from "./handlers/backfill";
