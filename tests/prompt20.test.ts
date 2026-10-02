import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const headers = vercel.headers[0].headers as Array<{key:string;value:string}>;
const csp = headers.find(h => h.key === 'Content-Security-Policy')?.value || '';

assert.match(csp, /default-src 'self'/);
assert.match(csp, /script-src 'self'/);
assert.match(csp, /style-src 'self' https:\/\/fonts\.googleapis\.com/);
assert.match(csp, /img-src 'self' data: blob:/);
assert.match(csp, /font-src 'self' https:\/\/fonts\.gstatic\.com/);
assert.match(csp, /connect-src 'self'/);
assert.match(csp, /media-src 'self' blob:/);
assert.match(csp, /frame-src 'none'/);
assert.doesNotMatch(csp, /(?:^|;)\s*(?:img-src|script-src)\s+[^;]*\*/);

for (const key of ['Strict-Transport-Security','X-Content-Type-Options','X-Frame-Options','Referrer-Policy','Permissions-Policy']) {
  assert.ok(headers.some(h => h.key === key), key + ' header is missing');
}

const env = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
for (const required of ['GEMINI_API_KEY','SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY']) {
  assert.match(env, new RegExp(required));
}
assert.doesNotMatch(env, /VITE_GEMINI_API_KEY/i);
assert.doesNotMatch(env, /VITE_SUPABASE_SERVICE_ROLE_KEY/i);

console.log('Prompt 20 production security tests passed');
