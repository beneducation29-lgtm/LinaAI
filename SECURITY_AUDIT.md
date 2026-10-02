# Lina AI Chinese — Security Audit (Prompt 21)

Audit baseline: commit 1750f2aa79aa6146121053627303994ff98f0d0a.

## Severity

### CRITICAL
- No source-code finding is classified CRITICAL after this hardening pass.
- Production still requires real Supabase RLS migration, secret configuration review, and runtime verification before claiming production-ready.

### HIGH
1. Server request abuse surface — bounded JSON body, request/IP rate limiting, stricter auth/AI/admin/upload buckets.
2. Privacy lifecycle gap — authenticated privacy API for preferences, learning-data deletion, account deletion, and export.
3. Cross-origin state-changing requests — same-origin Origin/Host guard for state-changing API requests.
4. Data governance gap — central classification and retention map.

### MEDIUM
- Application rate limiting remains process-local; multi-instance deployments need a shared limiter for strict distributed enforcement.
- Supabase service-role access is server-only; deployment must verify it never enters Vite/public env.
- AI prompt injection defenses are layered validation/orchestration controls and cannot guarantee resistance to every adversarial prompt.
- Existing password reset/email verification remains delegated to Supabase Auth; this pass does not replace the identity provider.

### LOW
- Central SIEM/security-event storage is not bundled; logs remain metadata-only.
- Retention targets require scheduled deletion jobs in the deployment environment.

## Authentication & authorization

Learner endpoints use HttpOnly access/refresh cookies and server-side Supabase user lookup. Privacy endpoints derive identity from the authenticated session and never accept a target user ID. Sync/subscription lookups are scoped by authenticated user ID. Admin routes retain separate server-side role checks.

## AI security boundary

Tutor requests are sanitized and bounded before orchestration. Gemini is server-side. Only selected learner context is sent. Analytics strips transcript/audio-like fields. Prompt-injection patterns are handled before sensitive operations.

## Secrets

Gemini, service-role, payment/webhook and provider keys remain server-side environment secrets and must never use VITE_ prefixes.

## Headers

CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy and frame protection remain in vercel.json.

## Deployment gate

Run npm ci, npm test, npm run lint and npm run build. Do not claim production-ready while CRITICAL findings, unapplied RLS migrations, or unverified runtime paths remain.
