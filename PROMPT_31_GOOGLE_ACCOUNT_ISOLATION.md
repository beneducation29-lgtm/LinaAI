# PROMPT 31 — Google Account Sign-In + Per-Account Learning Progress

Implement Google Sign-In for LinaAI as an additional authentication method, while preserving the current build, routing, learning engine, email/password authentication, Supabase sync, privacy controls, analytics, subscription logic, AI tutor, voice and existing UI architecture.

## Core goal

Every learner must have a unique authenticated account identity.

Use the Supabase Auth user ID as the canonical userId.

Learning progress must belong to that account:

- profile
- lessons
- vocabulary
- flashcards
- structured progress
- review schedules
- mistakes
- saved vocabulary
- AI memory
- motivation/streak data
- learner memory
- conversations
- analytics events
- subscription state

## Google authentication

Add a Continue with Google action to the existing Account & Sync area.

Use Supabase Auth Google OAuth with Authorization Code + PKCE.

Do NOT add a second independent authentication database.
Do NOT replace the existing email/password flow.

Recommended flow:

1. GET /api/auth/google/start
2. Generate cryptographically random state.
3. Generate PKCE code_verifier.
4. Store state/verifier in short-lived HttpOnly SameSite=Lax cookies.
5. Redirect to Supabase Auth Google authorization.
6. Supabase/Google returns code + state.
7. GET /api/auth/google/callback
8. Verify state.
9. Exchange the code with Supabase using PKCE.
10. Store access/refresh tokens using the existing LinaAI HttpOnly auth cookies.
11. Resolve the authenticated Supabase user.
12. Reuse the existing sync/subscription/privacy infrastructure.

Never expose Google client secret, Supabase service-role key, refresh token, or access token to frontend JavaScript.

## Account isolation

This is mandatory.

When account A logs out and account B logs in:

- B must never receive A's progress.
- A's pending sync queue must never be uploaded to B.
- A's local learning state must not be silently merged into B.
- Sync metadata/version counters must be account-scoped.
- Remote records must be filtered by authenticated user identity.
- RLS must continue to protect database ownership.

On authenticated account change:

1. reset in-memory learning state to the clean baseline;
2. bind SyncEngine to the new user ID;
3. pull the new user's cloud state;
4. apply that state;
5. only then allow local changes to enter the new account's sync queue.

On logout:

- clear authentication;
- stop sync;
- reset visible account learning state to guest baseline.

Do not delete the remote user's data during logout.

## Existing structure preservation

Do not rewrite:

- AppContext architecture
- SyncEngine architecture
- learningEngine
- Activity Engine
- CMS
- AI tutor
- voice/avatar systems
- subscription system
- analytics architecture
- privacy architecture

Extend them minimally.

Do not introduce a second state-management system.
Do not replace Supabase with Firebase/Auth0/Clerk.
Do not add unnecessary dependencies if the current server-side Supabase REST approach can implement the feature.

## UI

In the existing Profile → Account & Sync card:

- add a compact Google button;
- keep the existing email/password login;
- keep logout and manual sync;
- show the authenticated email;
- do not create a new page unless required by the existing architecture.

## Environment/configuration

Document:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- APP_URL
- Supabase Google provider configuration
- Google Cloud authorized redirect URI
- Supabase redirect allow-list URL

Never commit secrets.

## Security

Require:

- PKCE S256
- cryptographically random state
- state verification
- short-lived OAuth cookies
- HttpOnly auth cookies
- Secure cookies in production
- SameSite=Lax
- no open redirects
- no token values in logs
- no client-side service-role key
- existing rate limits retained

## Testing

Add automated tests for:

- Google start route
- callback route
- PKCE/state presence
- account-scoped sync metadata
- account-scoped queue
- Google UI action
- existing email/password auth remains intact
- no secrets exposed in frontend
- no cross-account state merge path

## Acceptance criteria

The implementation is complete only when:

- Google Sign-In is available from the existing account UI.
- A successful Google login produces a unique Supabase Auth identity.
- Existing email/password login still works.
- Progress is stored and retrieved per authenticated user.
- Switching accounts cannot leak progress.
- Refresh keeps the correct account.
- Logout returns to guest state.
- Existing build structure remains intact.
- Existing tests remain intact.
- Typecheck/build/tests pass.
- Production configuration steps are documented.

Do not claim production-ready until Google provider configuration and a real two-account end-to-end test have been verified in the deployed environment.
