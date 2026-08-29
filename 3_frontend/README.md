# Seka website

Vite + React + TypeScript. This is the app CI builds and Vercel deploys.

## Run locally

**Prerequisites:** Node.js 20+

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # tsc --noEmit
npm run build
```

## Configuration

Copy the Firebase web config from the Firebase console into `.env.local`:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Without these the app still runs against mock data - `src/lib/firebase.ts`
exports `firebaseConfigured`, and every Firebase-backed feature checks it.

## RAG features

Semantic search, the personalised "For You" feed, and the meme assistant call
Cloud Functions in [`2_backend/functions`](../2_backend/functions/README.md).
There is no AI provider key in this app: retrieval and answer generation run
server-side.

- `src/lib/rag.ts` - callable wrappers plus the local fallbacks
- `src/hooks/useRag.ts` - `useSemanticSearch`, `useForYouFeed`
- `src/components/MemeAssistant.tsx` - the assistant sheet

Each feature degrades rather than breaks: if the functions are unreachable or the
index is empty, search falls back to the substring filter and the feed falls back
to virality ordering.
