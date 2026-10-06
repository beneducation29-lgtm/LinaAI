const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';

function json(res, status, payload) {
  res.status(status)
    .setHeader('Content-Type', 'application/json; charset=utf-8')
    .setHeader('Cache-Control', 'no-store')
    .setHeader('X-Content-Type-Options', 'nosniff')
    .send(JSON.stringify(payload));
}

function parseCookies(req) {
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

function publicUser(user) {
  return user ? { id: user.id, email: user.email, name: user.user_metadata?.name } : null;
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

async function supabase(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return { ok: false, status: 503, data: {} };
  }
  try {
    const response = await fetch(SUPABASE_URL + path, {
      ...options,
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('[Lina][ME_SUPABASE_ERROR]', path, error?.message || error);
    return { ok: false, status: 503, data: {} };
  }
}

async function getUser(accessToken) {
  if (!accessToken) return null;
  const result = await supabase('/auth/v1/user', {
    headers: { Authorization: 'Bearer ' + accessToken },
  });
  return result.ok ? result.data : null;
}

async function refreshSession(refreshToken) {
  return supabase('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return json(res, 405, { error: 'Method Not Allowed' });

    const cookies = parseCookies(req);
    let user = await getUser(cookies.lina_access);

    if (!user && cookies.lina_refresh) {
      const refreshed = await refreshSession(cookies.lina_refresh);
      if (refreshed.ok && refreshed.data?.access_token && refreshed.data?.refresh_token) {
        setAuthCookies(req, res, refreshed.data.access_token, refreshed.data.refresh_token);
        user = await getUser(refreshed.data.access_token);
      }
    }

    if (!user) return json(res, 401, { error: 'Unauthorized' });
    return json(res, 200, { user: publicUser(user) });
  } catch (error) {
    console.error('[Lina][ME_ERROR]', error?.message || error);
    return json(res, 500, { error: 'Dịch vụ tài khoản tạm thời không khả dụng.' });
  }
}
