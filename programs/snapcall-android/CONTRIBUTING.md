# Contributing to Snapcall Android

Follow the repository [CONTRIBUTING.md](../../CONTRIBUTING.md). This is a standalone
Gradle project, following Goho `dev` at `eacb2535`.

## Setup and run

Use Android Studio with SDK Platform 37 and Build-Tools, plus JDK 17 or newer.
The wrapper pins Gradle 9.8.2 and the build requests a Java 17 toolchain.
Set `ANDROID_HOME` for command-line builds, or let Android Studio create the
ignored `local.properties`. Use an emulator or device running API 24 or newer.

Open `programs/snapcall-android` in Android Studio and select `developmentDebug`,
or run from this directory:

```bash
./gradlew :app:assembleDevelopmentDebug
adb devices
./gradlew :app:installDevelopmentDebug
```

Launch **Snapcall Dev**. The APK is at
`app/build/outputs/apk/development/debug/app-development-debug.apk`.
The welcome screen is static and does not make network requests.

## Variants and server configuration

The `environment` flavor dimension matches Goho. **Snapcall Dev** uses
`com.adamaho.snapcall.dev`; **Snapcall** uses `com.adamaho.snapcall`. They can be
installed together. Both flavors have debug and release build types.

The generated client is ready for future features. Development embeds
`http://127.0.0.1:3001` in `BuildConfig.SNAPCALL_SERVER_URL`. When a feature starts
calling the local server, use `pnpm server:dev` from the repository root and:

```bash
adb reverse tcp:3001 tcp:3001
```

Use `adb -s <device-id>` when several devices are connected. Override development
with `-PsnapcallServerUrl=https://your-server`. Only `developmentDebug` permits
cleartext HTTP, restricted to `127.0.0.1`; other hosts must use HTTPS.

Production builds require an explicit HTTPS URL:

```bash
./gradlew :app:assembleProductionDebug -PsnapcallProductionServerUrl=https://your-server
```

No production URL is assumed. Production has no loopback HTTP exception.
The scaffold does not configure release signing or publish the app.

## Verification

Follow Goho's Android validation policy: do not add automated Android test suites
or test-only dependencies. Validate with builds, lint, formatting, and manual
visual checks.

```bash
./gradlew :app:assembleDevelopmentDebug :app:lintDevelopmentDebug --no-daemon
./gradlew :app:ktfmtCheck --no-daemon
```

From the repository root, `pnpm fmt:android` formats Kotlin and
`pnpm fmt:check:android` checks it. Run `pnpm check` for shared workspace changes.
CI runs the same Android build, lint, formatting, and generated-client drift checks.

Open `HomePreview` from the debug source set for light, dark, and narrow-screen
large-text previews. Manually launch the app and check those configurations.

## Generated API client

The Kotlin Retrofit/Moshi coroutine client is checked in at
`app/src/main/kotlin/com/adamaho/snapcall/api/generated`. Builds use those files
without running the generator. Do not edit generated code.

After changing the shared API, run from the repository root:

```bash
pnpm --filter @snapcall/snapcall-server openapi:generate
pnpm --filter @snapcall/snapcall-server openapi:check
```

Then regenerate from this directory:

```bash
./gradlew :app:updateOpenApiClient --no-daemon
```

Commit the OpenAPI and Kotlin changes together. Android CI regenerates the client
and rejects tracked or untracked differences. ktfmt excludes generated code.

## Source layout

`MainActivity` owns the Android entry point and edge-to-edge Compose setup.
`ui/main/HomeScreen.kt` owns the welcome screen. `theme` owns semantic colors,
typography, and spacing; it follows the system theme. Geist font provenance and
license are bundled under `app/src/main/assets/fonts`.

Name reusable components by their role. Add state holders and data layers when
features need them; keep this first screen simple. Debug-only previews live in
`app/src/debug`.

The starter launcher uses a playing-card mark with adaptive and monochrome
layers. Development overrides the background color and application label;
production uses the main resources. Update the legacy and adaptive variants
together when replacing the starter artwork.
