# seka

Meme-native social app - React/Vite/Firebase website, Android (Kotlin + Compose),
and iOS (SwiftUI) apps sharing the same product surface (memes, statuses, chat,
discover, profile), plus a retrieval-augmented backend that powers search,
recommendations and an in-app meme assistant.

## Structure

| Folder | Status | What's there |
|---|---|---|
| `2_backend/db/` | populated | Firebase config + security rules: firebase.json, firestore.rules, storage.rules. |
| `2_backend/functions/` | populated | RAG Cloud Functions: semantic search, "For You" recommendations, grounded meme assistant, index trigger. See its README. |
| `2_backend/api,cache,messaging,schemas,services/` | empty (placeholder) | No other standalone backend service exists yet - Firebase is used directly from clients. |
| `3_frontend/` | populated | Vite + React + TypeScript website. This is the app CI builds and Vercel deploys. |
| `4_mobile/android-app/` | populated | Android Gradle project (Kotlin + Compose). |
| `4_ios/Sekaa/` | populated | iOS app (SwiftUI), generated via XcodeGen (project.yml). |
| `.github/workflows/` | populated | ci.yml (build/test on push), ios-build.yml (iOS simulator build), release.yml (tagged releases). |

## RAG features

The backend indexes every meme as a vector and serves three surfaces. The web app
is wired to all three; the Android and iOS apps are not yet.

| Surface | Where it shows up | Callable |
|---|---|---|
| Semantic search | Discover search box, Home search | `semanticSearch` |
| Personalised feed | Home, "For You" tab | `recommendForYou` |
| Meme assistant | Sparkle button on Discover | `askAssistant` |

It runs with **no third-party API keys**: the default embedder is built in and the
default answerer is extractive. That default matches on words and subwords rather
than meaning - point `RAG_EMBEDDING_PROVIDER` at a real embeddings API for
paraphrase matching. Every client call goes through Cloud Functions, so no
provider key ever reaches the browser. Setup and provider wiring:
[`2_backend/functions/README.md`](2_backend/functions/README.md).

## Running locally

Website (3_frontend/):

    cd 3_frontend
    npm install
    npm run dev

RAG backend (2_backend/functions/):

    cd 2_backend/functions
    npm install
    npm test
    npm run serve      # Firebase functions emulator

Android app (4_mobile/android-app/):

    cd 4_mobile/android-app
    ./gradlew assembleDebug

iOS app (4_ios/Sekaa/) - requires macOS + Xcode + XcodeGen:

    cd 4_ios/Sekaa
    brew install xcodegen
    xcodegen generate
    open Sekaa.xcodeproj

Needs GoogleService-Info.plist placed in 4_ios/Sekaa/ (not committed - get it from the Firebase console).

## Distribution status

- Web: deploys to Vercel automatically. Ready to share.
- Android: CI builds a debug-signed APK on every tag. Not yet on Play Store.
- iOS: CI builds an unsigned simulator-only build. Does not install on real
  devices yet - needs an Apple Developer account, a distribution certificate,
  and TestFlight setup before it can go to real testers.
