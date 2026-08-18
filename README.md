# seka

Meme-native social app — a React/Vite/Firebase website and a matching native
Android (Kotlin + Compose) app, sharing the same product surface (memes,
statuses, chat, discover, profile).

## Structure

| Folder | Status | What's there |
|---|---|---|
| `1_core/` | empty (placeholder) | No shared cross-platform domain logic exists yet — web is TypeScript, mobile is Kotlin, with no common layer between them. |
| `2_backend/db/` | **populated** | Firebase config + security rules: `firebase.json`, `firestore.rules`, `storage.rules`. |
| `2_backend/api,cache,messaging,schemas,services/` | empty (placeholder) | No standalone backend service exists — Firebase is used directly from the client. |
| `3_frontend/` | **populated** | The full Vite + React + TypeScript website. |
| `4_mobile/android-app/` | **populated** | The full Android Gradle project (see `4_mobile/README.md` for how it maps to the template folders). |
| `5_ml/`, `6_genai/`, `7_hardware_robotics/` | empty (placeholder) | Not part of this project. |
| `8_ops/` | empty (placeholder) | No Docker/K8s/CI scripts existed yet beyond the workflow below. |
| `.github/workflows/ci.yml` | **populated** | Builds both the website and the Android app on every push/PR. Stays at repo root — GitHub Actions only looks for workflows there. |

## Running locally

**Website** (`3_frontend/`):
```
cd 3_frontend
npm install
npm run dev
```

**Android app** (`4_mobile/android-app/`):
```
cd 4_mobile/android-app
./gradlew assembleDebug
```
