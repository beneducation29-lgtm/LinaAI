# Lina AI Chinese — Production Readiness

> Review baseline: `3cef733d528fc1a8cd7d9da076c6d4f508c60826`  
> Prompt: 20 — production deployment preparation  
> Status: **NOT PRODUCTION-READY until the blocking checks below are verified in the target Vercel project.**

## Architecture

- React + Vite frontend.
- Express server in `server.ts` owns authentication, Tutor/AI orchestration, subscription checks, usage/quota enforcement, voice endpoints and payment webhooks.
- Gemini credentials are intended to remain server-side.
- Supabase is the persistence/auth backend.
- AI requests should flow through the backend orchestration layer rather than exposing Gemini credentials to the browser.
- The Vercel deployment must be verified to execute the backend API runtime; a successful Vite build alone does not prove API availability.

## Environment variables

### Server-side / secret
- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYMENT_WEBHOOK_SECRET`
- `PAYMENT_PROVIDER_NAME`
- `GEMINI_TUTOR_MODEL`
- `GEMINI_TUTOR_FALLBACK_MODEL`
- `AI_ORCHESTRATOR_RPM`
- `AI_ORCHESTRATOR_TIMEOUT_MS`
- `GEMINI_INPUT_COST_PER_MILLION`
- `GEMINI_OUTPUT_COST_PER_MILLION`
- `LINA_ADMIN_EMAILS`

Do not expose service-role keys, payment webhook secrets, or Gemini API keys through `VITE_*` variables.

## Deployment steps

1. Install with `npm ci`.
2. Run `npm run build`.
3. Verify all Prompt 12–20 tests pass.
4. Verify the deployed backend endpoints from the production origin.
5. Verify authentication/session refresh/logout.
6. Verify Gemini through the server-side Tutor endpoint.
7. Verify voice/STT/TTS and avatar fallback behavior.
8. Verify subscription entitlements and quota enforcement.
9. Verify signed payment webhook handling and idempotency.
10. Verify analytics ingestion and privacy behavior.
11. Inspect browser CSP/security headers in production.
12. Run a smoke test of login → lesson → Tutor → voice → subscription state → logout.
13. Record the deployment commit and keep the previous known-good deployment available for rollback.

## Database migration

Run, in order as applicable to the target Supabase project:

- `supabase/sync.sql`
- `supabase/cms.sql`
- `supabase/analytics.sql`
- `supabase/subscription.sql`

Confirm tables, indexes, RLS policies and service-role permissions after migration. Do not treat checked-in SQL as proof that the production database has been migrated.

## Admin setup

- Configure `LINA_ADMIN_EMAILS` with the intended administrator accounts.
- Verify the admin API rejects non-admin users.
- Verify admin CMS changes remain separate from learner UI.
- Confirm audit/version metadata is persisted where the CMS schema requires it.

## Payment setup

- Configure the payment provider name and webhook secret.
- Register the production webhook URL.
- Verify webhook signatures before changing subscription state.
- Verify duplicate event IDs are idempotent.
- Never accept a client-provided subscription status as authoritative.
- Test FREE/PREMIUM/PRO entitlement boundaries.

## Gemini configuration

- Configure the production Gemini API key only on the server.
- Configure an explicitly supported primary model and, if used, a distinct fallback model.
- Keep task-specific temperature, token limits and timeout controls.
- Verify quota/rate-limit handling and fallback behavior.
- Do not assume a model name is valid solely because it exists in source; verify the configured model against the current provider configuration before launch.

## CSP

The production CSP intentionally does **not** whitelist advertising endpoints.

Resource classification:
- **Essential:** same-origin scripts, styles, images, API connections, audio/video.
- **Analytics:** same-origin analytics API; no third-party analytics host is currently required by the frontend architecture.
- **Advertising:** not required; blocked.
- **Third-party:** Google Fonts CSS/font hosts are explicitly allowed because the current HTML imports them.
- **Optional:** browser speech/media APIs remain governed by browser permissions and are not network origins.

Current policy:
- `default-src 'self'`
- `script-src 'self'`
- `style-src 'self' https://fonts.googleapis.com`
- `img-src 'self' data: blob:`
- `font-src 'self' https://fonts.gstatic.com`
- `connect-src 'self'`
- `media-src 'self' blob:`
- `frame-src 'none'`
- `object-src 'none'`
- `base-uri 'self'`
- `form-action 'self'`
- `frame-ancestors 'none'`
- `upgrade-insecure-requests`

A browser request to a Google advertising endpoint should remain blocked unless a future feature demonstrates a documented, necessary dependency. Do not fix that warning by adding `img-src *`.

If the frontend later calls a third-party API directly, add only its exact production origin to `connect-src` after documenting why the backend proxy cannot be used.

## Security review

### XSS
- React rendering should escape normal text by default.
- AI output is sanitized before structured rendering.
- Avoid introducing `dangerouslySetInnerHTML` for AI content.

### CSRF
- Auth uses HttpOnly cookies with SameSite=Lax.
- State-changing APIs must not be converted to credentialless cross-site endpoints.
- For cross-site payment webhooks, use provider signature verification rather than browser cookies.

### CORS
- Keep APIs same-origin by default.
- Do not add permissive `Access-Control-Allow-Origin: *` to credentialed APIs.

### Rate limiting / abuse
- AI orchestration has per-user in-memory RPM control and subscription quota controls.
- Production should use a distributed limiter if multiple Vercel instances handle AI traffic.

### Authentication / authorization / IDOR
- Authentication is server-side through Supabase access tokens in HttpOnly cookies.
- Subscription/admin decisions are server-side.
- Production smoke tests must attempt cross-user resource access and non-admin admin endpoints.

### Prompt injection
- Learner input is treated as untrusted input.
- System instructions are kept server-side.
- AI output is validated/sanitized before rendering.

### Secret exposure
- Secrets are server-side only.
- Check Vercel environment variable scope and repository history before launch.
- Never place `SUPABASE_SERVICE_ROLE_KEY`, payment secrets or Gemini keys in frontend variables.

## Monitoring

Current application telemetry includes analytics events and AI usage/cost records. Production launch still requires verification of:
- Vercel deployment/runtime logs
- Supabase logs
- payment webhook failures
- Gemini provider failures/429s
- frontend runtime errors

Add a dedicated error tracking provider only after selecting one and configuring its privacy policy; none is assumed by this prompt.

## Backups

- Enable/verify Supabase backup/restore capability for the production project.
- Keep database migration SQL versioned in Git.
- Test restoration before relying on it for incident recovery.

## Rollback

- Keep the immediately previous verified deployment available.
- Roll back to the last verified commit/deployment if a blocking regression appears.
- Database changes should be backward-compatible where possible; never assume application rollback can undo an irreversible migration.

## Blocking verification still required

- [ ] `npm ci` succeeds in the target Vercel environment.
- [ ] `npm run build` succeeds.
- [ ] Backend runtime is actually reachable on the production deployment.
- [ ] Production environment variables are present and scoped correctly.
- [ ] Supabase migrations are applied and verified.
- [ ] Auth login/refresh/logout works.
- [ ] Gemini Tutor works through the backend.
- [ ] Voice/STT/TTS works.
- [ ] Avatar works or degrades safely.
- [ ] Subscription entitlements work server-side.
- [ ] Payment webhook signature/idempotency is verified.
- [ ] Analytics works without exposing unnecessary PII.
- [ ] CSP/security headers are observed in production.
- [ ] XSS/CSRF/CORS/IDOR/abuse smoke tests pass.
- [ ] Monitoring/error tracking is operational.
- [ ] Backups/restore process is verified.
- [ ] Rollback procedure is documented and tested.

## Known limitations

1. The AI orchestrator rate limiter is process-local, not distributed.
2. The provider abstraction exists but the current orchestrator still uses the configured Gemini client directly.
3. Conversation history is compacted to recent messages rather than persisted as an AI-generated summary.
4. Production API-runtime behavior on Vercel must be verified separately from the Vite build.
5. Error tracking is not bundled with this change.
6. Third-party advertising is intentionally not allowed by CSP.
