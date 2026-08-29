# Seka Android app

Kotlin + Jetpack Compose.

## Run locally

**Prerequisites:** [Android Studio](https://developer.android.com/studio)

1. Open Android Studio, choose **Open**, and select this directory.
2. Let Android Studio resolve the Gradle sync.
3. Place `google-services.json` from the Firebase console in `app/` (not committed).
4. Run the app on an emulator or a physical device.

From the command line:

```bash
./gradlew assembleDebug
./gradlew testDebugUnitTest
```

## Not yet wired

The RAG features (semantic search, personalised feed, meme assistant) are
implemented in [`2_backend/functions`](../../2_backend/functions/README.md) and
wired into the website only. The callables are client-agnostic, so bringing them
to Android is a client-side task.
