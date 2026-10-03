# Lina AI Chinese — Security Audit (Prompt 32)

Audit baseline: Prompt 31 Google account isolation branch, extended by Prompt 32.

## Severity

### CRITICAL
- No new source-level CRITICAL finding was introduced by Prompt 32.
- Production remains blocked until real Supabase migration/runtime/E2E verification is completed.

### HIGH
1. Account authorization — private APIs derive user identity from the authenticated session and scope sync/privacy data by that identity.
2. AI privacy boundary — personalization, memory and conversation-history preferences now gate learner context sent to the AI orchestrator.
3. Session control — current logout is local and "logout other sessions" uses Auth provider scope=others.
4. Data lifecycle — export/delete/account-deletion paths are server-authorized and do not accept a target user ID.
5. Input/prompt boundary — Tutor input is sanitized/bounded and known prompt-injection patterns are rejected before orchestration.

### MEDIUM
- HTTP rate limiting is process-local; multiple Vercel instances require a distributed limiter for strict global enforcement.
- AI orchestration already has a per-user in-memory RPM limiter and subscription quota controls; voice/HTTP buckets remain process-local.
- Security-event retention targets require scheduled deletion/retention jobs.
- The current session API intentionally exposes only the current session because the application does not have a portable device/session inventory endpoint. It does not pretend to list all devices.

### LOW
- Security events are stored as metadata with HMAC-hashed IP values; a centralized SIEM is not bundled.
- Real two-account authorization E2E and live production verification remain pending.

## Account isolation
- requireSyncUser() validates the HttpOnly access cookie through Supabase Auth.
- Sync pull/push always use the authenticated user.id in the server-side query.
- Privacy export/delete/preferences use the authenticated user.id.
- Admin access is a separate server-side email allowlist and does not reuse learner authorization.

## AI memory and conversation privacy
- Learner memory and conversation history are treated as PRIVATE.
- Privacy settings are fetched server-side and applied before orchestration.
- The browser can send untrusted history/memory fields, but they are bounded/sanitized and are omitted from AI context when the corresponding privacy setting is off.
- No raw conversation is written to security logs or analytics.

## Voice privacy
- Raw microphone audio is not persisted by the application.
- Analytics explicitly strips raw audio/transcript-like keys.
- The privacy UI does not claim to store voice data.

## Session security
- Auth tokens remain in HttpOnly cookies.
- Auth/private API responses use Cache-Control: private, no-store.
- Current logout uses Auth scope=local.
- Other sessions can be revoked with Auth scope=others.
- The app never displays raw access/refresh tokens.

## Security events
Recorded events include login success/failure, logout, session revocation, account deletion and the reserved suspicious-access event. IP values are HMAC-hashed; user-agent is bounded; metadata must not contain credentials or private conversation content.

## Headers
Current vercel.json retains CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy and Permissions-Policy. CORS remains same-origin by default; no wildcard credentialed CORS is configured.

## Prompt injection
Learner input is untrusted. Known injection patterns are rejected at the server boundary, and the AI orchestrator keeps system instructions separate from learner input. This is defense-in-depth, not a guarantee against every future adversarial prompt.

## Remaining risks
1. Distributed rate limiting.
2. Live two-account IDOR/access-control E2E.
3. Runtime verification of Vercel + Supabase migrations.
4. Automated retention jobs.
5. Full device/session inventory is not implemented.
