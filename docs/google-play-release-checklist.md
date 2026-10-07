# Lina AI — Google Play release checklist

## Automated by CI

- Android application ID is `com.linaai.chinese`.
- Target SDK is API 36 or higher.
- Release version name and version code are validated.
- Release AAB is signed when the release workflow runs.
- AAB signature is verified.
- Bundletool validates the AAB.
- A local-testing APK set is generated and validated.
- SHA256 checksums are generated for release artifacts.
- A Play upload package is produced.

## Manual Play Console steps

1. Create/select the Lina AI app in Google Play Console.
2. Confirm the package name is `com.linaai.chinese`.
3. Open **Testing > Internal testing**.
4. Create the internal testing track and add tester email addresses.
5. Upload the signed `app-release.aab` from the `play-upload` artifact.
6. Add a feedback email or URL and publish the internal test.
7. Share the tester opt-in link and install the release on Android devices.
8. Record functional, microphone/STT, login, sync, crash, and offline test results.
9. Before closed/production release, complete the store listing and required App content declarations.
10. Provide an accurate privacy policy URL in Play Console and within the app, and complete Data safety declarations when required.

## Production-readiness blockers

Do not claim production readiness until the developer has verified:

- Privacy policy content and public URL.
- Data Safety declarations match actual app and SDK data handling.
- Store listing, screenshots, app category, contact details, and content declarations.
- Reviewer access instructions if sign-in or restricted features are required.
- Closed-testing requirements for the developer account, if applicable.

The release workflow intentionally does not invent or upload these developer-owned declarations.
