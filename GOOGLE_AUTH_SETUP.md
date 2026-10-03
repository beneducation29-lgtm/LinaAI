# Google Account Sign-In & Per-Account Progress

## Goal

LinaAI keeps the existing email/password account flow and adds Sign in with Google without replacing the current application structure.

Each authenticated Google account maps to a unique Supabase auth.users.id. Existing learning sync records already use user_id as their primary ownership key, so progress remains separated by account.

## OAuth flow

1. User selects Google in Profile → Account & sync.
2. LinaAI creates a random state and PKCE code verifier on the server.
3. Browser is redirected to Supabase Auth → Google.
4. Google returns an authorization code to /api/auth/google/callback.
5. Server verifies state, exchanges the code with Supabase using PKCE, and stores the Supabase access/refresh tokens in HttpOnly cookies.
6. /api/auth/me resolves the authenticated Supabase user.
7. Existing syncEngine loads only that user's records.
8. Progress from another account is never merged into the new account.

Supabase recommends OAuth Authorization Code + PKCE for server-side authentication.

Official documentation:
https://supabase.com/docs/guides/auth/social-login/auth-google
https://supabase.com/docs/guides/auth/sessions/pkce-flow

## Supabase configuration

### 1. Enable Google provider

In Supabase: Authentication → Providers → Google.

Configure the Google OAuth Client ID and Client Secret.

### 2. Google Cloud redirect URI

Google's OAuth client must allow the Supabase Auth callback URI shown by the Supabase dashboard, typically:

https://<project-ref>.supabase.co/auth/v1/callback

Use the exact URI shown by your Supabase project.

### 3. Supabase redirect allow list

Add the LinaAI callback URL:

https://<your-lina-domain>/api/auth/google/callback

For local development:

http://localhost:3000/api/auth/google/callback

Also configure the production Site URL appropriately.

### 4. Vercel environment

Required server-side values:

SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY (server-only, never expose to Vite)

APP_URL should be the canonical LinaAI production URL in production.

No Google client secret is stored in LinaAI. Google OAuth credentials remain in Supabase.

## Account isolation

The sync queue and version metadata are now namespaced by authenticated userId.

When the authenticated account changes, the app resets the in-memory learning state to the clean baseline before pulling that account's cloud snapshot. This prevents anonymous or previous-account progress from being uploaded into a different account.

Logout also resets the visible learning state to the guest baseline.

## Acceptance checks

- Google login creates/uses a unique Supabase Auth user.
- Refresh keeps the same account.
- Two Google accounts see different progress.
- Logging out does not expose the previous account's progress to the guest state.
- Logging into another account does not upload the previous account's local state.
- Existing email/password login still works.
- Existing sync, privacy, analytics, subscription, AI tutor and learning-engine structure remain intact.
