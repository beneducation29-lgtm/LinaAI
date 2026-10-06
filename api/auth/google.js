const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const DEFAULT_SITE_URL = 'https://lina-ai-lake.vercel.app';
const SITE_URL = String(process.env.LINA_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');

export default function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.setHeader('Allow', 'GET');
      return res.end('Method Not Allowed');
    }
    if (!SUPABASE_URL) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('Cloud account chưa được cấu hình.');
    }

    const redirectTo = `${SITE_URL}/auth/callback`;
    const authorizeUrl = new URL(`${SUPABASE_URL}/auth/v1/authorize`);
    authorizeUrl.searchParams.set('provider', 'google');
    authorizeUrl.searchParams.set('redirect_to', redirectTo);
    authorizeUrl.searchParams.set('flow_type', 'implicit');

    res.statusCode = 302;
    res.setHeader('Location', authorizeUrl.toString());
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' data: blob:; frame-ancestors 'none'; base-uri 'none'");
    return res.end();
  } catch (error) {
    console.error('[Lina][GOOGLE_AUTH_ERROR]', error?.message || error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('Không thể khởi tạo đăng nhập Google.');
  }
}
