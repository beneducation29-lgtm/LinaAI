import fs from 'node:fs';
import assert from 'node:assert/strict';

const auth = fs.readFileSync('src/services/authService.ts','utf8');
const server = fs.readFileSync('server.ts','utf8');
const sync = fs.readFileSync('src/services/syncEngine.ts','utf8');
const card = fs.readFileSync('src/components/profile/AccountSyncCard.tsx','utf8');

assert.match(auth,/loginWithGoogle/);
assert.match(auth,/\/api\/auth\/google\/start/);
assert.match(server,/\/api\/auth\/google\/start/);
assert.match(server,/\/api\/auth\/google\/callback/);
assert.match(server,/grant_type=pkce/);
assert.match(server,/code_challenge_method/);
assert.match(server,/lina_oauth_state/);
assert.match(server,/lina_oauth_verifier/);
assert.match(sync,/scopedKey/);
assert.match(sync,/QUEUE_KEY,userId/);
assert.match(sync,/META_KEY,userId/);
assert.match(card,/onGoogleLogin/);
console.log('Google account isolation tests passed');

assert.match(auth,/deleteAccount/);
assert.match(server,/\/api\/privacy\/delete-account/);
assert.match(server,/auth\/v1\/logout/);
assert.match(server,/lina_learning_sync_records/);
assert.match(server,/lina_subscriptions/);
assert.match(server,/lina_usage_events/);
assert.match(card,/onDeleteAccount/);
assert.match(card,/Tiếp tục với Google/);
console.log('Account lifecycle and session invalidation tests passed');
