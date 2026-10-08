# Lina AI — Android release smoke test

Use this checklist with the signed AAB from the Android release workflow.

**Execution status: NOT_RUN**  
Change this only after testing the real signed release on physical Android devices. Allowed values: `NOT_RUN`, `PASS`, `PASS WITH NOTES`, `FAIL`.

## Install and launch
- [ ] Install the release build from Google Play Internal testing.
- [ ] App launches without crash.
- [ ] Package is `com.linaai.chinese`.
- [ ] Version name/code match the release manifest.
- [ ] App survives force-close and relaunch.

## Account and core app
- [ ] Login/sign-up flow works.
- [ ] Main dashboard loads.
- [ ] AI chat responds.
- [ ] Conversation state remains correct after relaunch.
- [ ] Memory/sync behavior is correct.
- [ ] Review/learning flows open and save progress.

## Microphone and speaking
- [ ] Android microphone permission prompt appears when needed.
- [ ] Permission denial is handled without crashing.
- [ ] STT works in Android WebView fallback.
- [ ] Speaking/shadowing recording starts and stops correctly.
- [ ] Retry flow works after an unsuccessful attempt.

## Network and resilience
- [ ] App behaves correctly on slow/interrupted network.
- [ ] Offline/PWA-related state does not break the Android shell.
- [ ] App recovers after network restoration.
- [ ] No persistent crash after background/foreground transitions.

## Device coverage
- [ ] Small Android phone.
- [ ] Large Android phone.
- [ ] At least one recent Android device using API 36+.
- [ ] Portrait layout checked.
- [ ] Keyboard/input fields checked.

## Release evidence
Record:
- Version name:
- Version code:
- AAB SHA256:
- Devices tested:
- Test date:
- Blocking issues:
- Result: PASS / PASS WITH NOTES / FAIL

Google Play recommends starting with Internal testing, then expanding testing before production. For personal developer accounts created after Nov 13, 2023, production access requires a closed test with at least 12 testers continuously opted in for 14 days.
