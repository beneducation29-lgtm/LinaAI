const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\\/$/, '');
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

function setAuthCookies(req, res, access, refresh) {
  const secure =
    process.env.NODE_ENV === 'production' ||
    String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
  res.setHeader('Set-Cookie', [
    `lina_access=${encodeURIComponent(access)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600${secure ? '; Secure' : ''}`,
    `lina_refresh=${encodeURIComponent(refresh)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${secure ? '; Secure' : ''}`,
  ]);
}

/**
 * Resolve the current user and transparently rotate an expired access token.
 * Reading endpoints must behave like /api/auth/me so an active refresh cookie
 * does not get mistaken for a logged-out user after the 1-hour access token expires.
 */
export async function getAuthenticatedUser(req, res) {
  const cookies = parseCookies(req);
  let user = await getUser(cookies.lina_access);
  if (user || !cookies.lina_refresh || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return user;

  try {
    const response = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: cookies.lina_refresh }),
    });
    if (!response.ok) return null;
    const session = await response.json();
    if (!session?.access_token || !session?.refresh_token) return null;
    setAuthCookies(req, res, session.access_token, session.refresh_token);
    user = await getUser(session.access_token);
    return user;
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
