# Lina AI — Android release status

## Current level

**Release Candidate / Play Console preparation**

The repository is technically prepared to generate a signed Android App Bundle (AAB), validate it, package it for Google Play Internal testing, and preserve integrity metadata.

This does **not** mean the app has already been submitted to Google Play. The signed AAB still requires a manual release workflow run with the developer's signing secrets, followed by Play Console setup and testing.

## Completed

### Android app
- Capacitor Android shell configured.
- Package ID: `com.linaai.chinese`.
- Android-only native direction; no iOS native release target.
- Web/PWA remains supported.
- Android microphone permission is prepared automatically.
- Android WebView speech-to-text fallback is implemented.
- Android release versionName/versionCode can be supplied at workflow dispatch time.

### Release engineering
- Debug APK build.
- Release AAB build.
- Release signing configuration from GitHub Actions secrets.
- Mandatory signed-release verification.
- Target SDK validation at API 36+.
- AAB signature verification.
- Bundletool AAB validation.
- Local-testing APK set generation and validation.
- SHA256 checksums.
- Release summary.
- Play release manifest with package/version/target SDK/AAB SHA256.
- Play upload package.
- Play upload package checksum/manifest validation.
- CI artifact retention for release files.
- Signing certificate SHA-256 provenance is captured and preserved in the release package.
- GitHub build provenance attestation is generated for the signed AAB.

### Google Play preparation
- Internal testing upload instructions.
- Play preflight report.
- Google Play release checklist.
- Production blockers are explicitly documented rather than invented in CI.

## Release hardening completed

- Release handoff now records the exact GitHub source commit used for the release workflow.
- CI verifies that the handoff source commit matches `GITHUB_SHA`, preventing artifact provenance drift.
- Google Play target API readiness is explicitly recorded as API 36+.
- The exact signing certificate SHA-256 fingerprint is bound across the release manifest, handoff, and upload package.
- The signed AAB receives a GitHub/Sigstore-backed build provenance attestation during the release workflow.

## Still required before Google Play submission

1. Configure the four Android signing secrets in GitHub:
   - `ANDROID_KEYSTORE_BASE64`
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS`
   - `ANDROID_KEY_PASSWORD`

2. Run **Actions → Android release** with a versionCode higher than any version already uploaded to Play.

3. Confirm the generated `app-release.aab` passes the release workflow and download the release artifact.

4. Create/configure the Lina AI app in Google Play Console using package ID `com.linaai.chinese`.

5. Start **Internal testing** and upload the signed AAB.

6. Complete the Play Console app information, store listing, app content declarations, privacy policy and Data safety information as applicable.

7. Test the real Android release:
   - login/account flow
   - AI/chat
   - memory/sync
   - microphone/STT
   - speaking/shadowing
   - offline/PWA-related behavior
   - crash/restart
   - permissions
   - different Android screen sizes

8. If the developer account is a personal account created after November 13, 2023, complete the required closed test with at least 12 testers continuously opted in for 14 days before applying for production access.

## Release decision

**Current stage: Release Candidate → Play Console / Internal Testing.**

**Production proximity: close on engineering; not yet releaseable.** The remaining gates are now explicitly separated into automated CI checks and developer-owned Play Console/device checks.

**Technical release pipeline: READY.**

**Signed AAB artifact: NOT YET GENERATED/VERIFIED in this project history.**

**Google Play Internal testing: NOT YET SUBMITTED.**

**Google Play Production: NOT READY YET.**

The remaining path is operational rather than a major code migration:
1. Generate and verify the first signed AAB.
2. Upload it to Internal testing.
3. Complete Play Console listing, App content, privacy policy and Data safety declarations as applicable.
4. Complete real-device smoke testing and resolve blockers.
5. If applicable, complete the required closed test before requesting production access.
6. Apply for production access and then publish the production release.

**Proximity to production:** the repository is technically close to release, but production is still blocked by the manual Google Play and real-device gates above.

Do not treat a green Vercel deployment as proof that the Android release artifact has been signed or accepted by Google Play.
## Android smoke-test gate

The repository now includes a device-level release smoke-test checklist at `docs/android-release-smoke-test.md`. The CI pipeline verifies the compiled AAB and packages explicit release-readiness metadata, while the remaining device/Play Console checks must be completed with a real signed release.

The release pipeline also generates and verifies an explicit `release-handoff.json` manifest. It keeps the engineering pipeline marked READY while forcing Internal testing, real-device validation, Play Console policy setup and production access to remain MANUAL_REQUIRED, with production publishing BLOCKED until those gates are completed.

The smoke-test gate now also records whether physical-device testing has actually been executed. A checklist existing in the repository is not treated as proof that a real signed release passed testing.

Release handoff integrity is also enforced: version identity is checked, malformed handoff JSON is rejected, and production remains explicitly blocked even when the engineering pipeline and signed AAB are ready.
