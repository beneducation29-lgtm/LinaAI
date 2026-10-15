import assert from 'node:assert/strict';

process.env.SUPABASE_URL = 'https://supabase.example.test';
process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key';
process.env.SUPABASE_SECRET_KEY = 'test-server-key';

const originalFetch = globalThis.fetch;
let databaseCalls = 0;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  if (url.includes('/auth/v1/user')) {
    return new Response(JSON.stringify({ id: 'user-123', email: 'learner@example.com' }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }
  databaseCalls += 1;
  if (init?.method === 'POST') return new Response(null, { status: 201 });
  return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } });
}) as typeof fetch;

function responseRecorder() {
  return {
    statusCode: 200,
    headers: {} as Record<string, string | string[]>,
    body: '',
    status(code: number) { this.statusCode = code; return this; },
    setHeader(name: string, value: string | string[]) { this.headers[name] = value; return this; },
    send(body: string) { this.body = body; return this; },
    end() { return this; },
  };
}

async function run(records: unknown[]) {
  const res = responseRecorder();
  const { default: handler } = await import('../api/sync/push.js');
  await handler({
    method: 'POST',
    headers: { cookie: 'lina_access=test-token' },
    socket: { remoteAddress: '127.0.0.1' },
    body: { records },
  } as any, res as any);
  return { status: res.statusCode, body: JSON.parse(res.body || '{}') };
}

try {
  const beforeInvalid = databaseCalls;
  const invalid = await run([
    { key: 'profile', updatedAt: 'not-a-date', version: 1, data: { name: 'Learner' } },
    { key: 'preferences', updatedAt: new Date().toISOString(), version: 0, data: {} },
  ]);
  assert.equal(invalid.status, 200);
  assert.deepEqual(invalid.body.accepted, []);
  assert.equal(databaseCalls, beforeInvalid, 'invalid metadata must not query or write sync storage');

  const valid = await run([
    { key: 'profile', updatedAt: new Date().toISOString(), version: 1, data: { name: 'Learner' } },
  ]);
  assert.equal(valid.status, 200);
  assert.deepEqual(valid.body.accepted, ['profile']);

  const beforeOversized = databaseCalls;
  const oversized = await run([
    { key: 'conversation', updatedAt: new Date().toISOString(), version: 1, data: { text: 'x'.repeat(1024 * 1024 + 1) } },
  ]);
  assert.equal(oversized.status, 413, 'oversized record should be rejected with HTTP 413');
  assert.equal(databaseCalls, beforeOversized, 'oversized payload must be rejected before database access');

  console.log('Sync push payload validation checks passed.');
} finally {
  globalThis.fetch = originalFetch;
}
