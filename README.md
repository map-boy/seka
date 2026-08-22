<<<<<<< HEAD
# seka

Meme-native social app - React/Vite/Firebase website, Android (Kotlin + Compose),
and iOS (SwiftUI) apps sharing the same product surface (memes, statuses, chat,
discover, profile).

## Structure

| Folder | Status | What's there |
|---|---|---|
| `2_backend/db/` | populated | Firebase config + security rules: firebase.json, firestore.rules, storage.rules. |
| `2_backend/api,cache,messaging,schemas,services/` | empty (placeholder) | No standalone backend service exists yet - Firebase used directly from clients. |
| `3_frontend/` | populated | Vite + React + TypeScript website. |
| `4_mobile/android-app/` | populated | Android Gradle project (Kotlin + Compose). |
| `4_ios/Sekaa/` | populated | iOS app (SwiftUI), generated via XcodeGen (project.yml). |
| `.github/workflows/` | populated | ci.yml (build/test on push), ios-build.yml (iOS simulator build), release.yml (tagged releases). |

## Running locally

Website (3_frontend/):

    cd 3_frontend
    npm install
    npm run dev

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
=======
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f214001c-da6f-4c61-b7d5-4202a56f7303

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
>>>>>>> bd2ff0b80e595fcc8e8c5f445dcd0aed55a39ac5
