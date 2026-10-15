import assert from 'node:assert/strict';

process.env.SUPABASE_URL = 'https://supabase.example.test';
process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key';

const originalFetch = globalThis.fetch;
let fetchCalls = 0;
globalThis.fetch = (async (_input: RequestInfo | URL, _init?: RequestInit) => {
  fetchCalls += 1;
  return new Response(JSON.stringify({ user: { id: 'user-123', email: 'ben.student@example.com', user_metadata: { name: 'Ben' } } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
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

try {
  const { default: handler } = await import('../api/auth/[...path].js');
  const validResponse = responseRecorder();
  await handler({
    method: 'POST',
    url: '/api/auth/signup',
    headers: { host: 'lina.test', origin: 'https://lina.test' },
    socket: { remoteAddress: '127.0.0.1' },
    body: { email: 'ben.student@example.com', password: 'correct-horse-battery', name: 'Ben' },
  } as any, validResponse as any);
  assert.equal(validResponse.statusCode, 200, 'valid email containing the letter s should pass validation');
  assert.equal(fetchCalls, 1, 'valid email should reach the Supabase signup request');

  const invalidResponse = responseRecorder();
  await handler({
    method: 'POST',
    url: '/api/auth/signup',
    headers: { host: 'lina.test', origin: 'https://lina.test' },
    socket: { remoteAddress: '127.0.0.2' },
    body: { email: 'not-an-email', password: 'correct-horse-battery' },
  } as any, invalidResponse as any);
  assert.equal(invalidResponse.statusCode, 400, 'malformed email should be rejected');
  assert.equal(fetchCalls, 1, 'malformed email must not call Supabase');

  console.log('Auth email validation regression checks passed.');
} finally {
  globalThis.fetch = originalFetch;
}
