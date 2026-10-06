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

async function supabaseUser(accessToken) {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return { ok: false, status: 503, user: null };
  }
  try {
    const response = await fetch(SUPABASE_URL + '/auth/v1/user', {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: 'Bearer ' + accessToken,
      },
    });
    if (!response.ok) return { ok: false, status: response.status, user: null };
    return { ok: true, status: 200, user: await response.json() };
  } catch (error) {
    console.error('[Lina][OAUTH_SESSION_SUPABASE_ERROR]', error?.message || error);
    return { ok: false, status: 503, user: null };
  }
}

function publicUser(user) {
  return user
    ? { id: user.id, email: user.email, name: user.user_metadata?.name }
    : null;
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

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return json(res, 405, { error: 'Method Not Allowed' });

    const { accessToken, refreshToken } = req.body || {};
    if (typeof accessToken !== 'string' || accessToken.length < 20) {
      return json(res, 400, { error: 'Phiên Google không hợp lệ.' });
    }

    const result = await supabaseUser(accessToken);
    if (!result.ok) {
      return json(
        res,
        result.status === 401 || result.status === 403 ? 401 : result.status,
        { error: result.status === 503 ? 'Cloud account chưa sẵn sàng.' : 'Phiên Google đã hết hạn.' }
      );
    }

    setAuthCookies(req, res, accessToken, typeof refreshToken === 'string' ? refreshToken : '');
    return json(res, 200, { user: publicUser(result.user) });
  } catch (error) {
    console.error('[Lina][OAUTH_SESSION_ERROR]', error?.message || error);
    return json(res, 500, { error: 'Không thể hoàn tất đăng nhập Google.' });
  }
}
