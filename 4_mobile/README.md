# 4_mobile

## android-app/
The full Android (Kotlin + Jetpack Compose) Gradle project, moved here as one
self-contained module. It was **not** split across the `native/`, `state/`,
`views/`, `offline_sync/` folders below, because Gradle/Android expects its
source tree at a fixed path (`app/src/main/java/...`) — splitting it apart
would break the build.

Where the template categories actually live inside `android-app/`:
- **native/** → `app/src/main/java/com/example/` (MainActivity, general bridges)
- **views/** → `app/src/main/java/com/example/ui/screens/` and `ui/components/`
- **state/** → `app/src/main/java/com/example/ui/viewmodel/`
- **offline_sync/** → `app/src/main/java/com/example/data/` (Room database: `MemeDatabase.kt`)

## native/, offline_sync/, state/, views/
Left empty (`.gitkeep`) here at the top level — they're placeholders for
future code that's genuinely separate from the `android-app` Gradle module
(e.g. a future iOS target, or cross-platform native bridges shared by more
than one app).
