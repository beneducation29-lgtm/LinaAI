const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export function json(res, status, payload) {
  return res
    .status(status)
    .setHeader('Content-Type', 'application/json; charset=utf-8')
    .setHeader('Cache-Control', 'no-store')
    .setHeader('X-Content-Type-Options', 'nosniff')
    .send(JSON.stringify(payload));
}

export function parseCookies(req) {
  const raw = String(req.headers.cookie || '');
  const out = {};
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const key = part.slice(0, i).trim();
    try {
      out[key] = decodeURIComponent(part.slice(i + 1));
    } catch {
      out[key] = part.slice(i + 1);
    }
  }
  return out;
}

export async function getUser(accessToken) {
  if (!accessToken || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;
  try {
    const response = await fetch(SUPABASE_URL + '/auth/v1/user', {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: 'Bearer ' + accessToken,
      },
    });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

export function clearAuthCookies(res) {
  res.setHeader('Set-Cookie', [
    'lina_access=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0',
    'lina_refresh=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0',
  ]);
}
