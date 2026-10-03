import { createServerClient } from '@supabase/ssr';
import { json, parseCookies } from './_utils.js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const DEFAULT_SITE_URL = 'https://lina-ai-lake.vercel.app';
const SITE_URL = String(process.env.LINA_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');

function secure(req){
  return process.env.NODE_ENV === 'production' ||
    String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
}

function cookieHeader(req){
  return String(req.headers.cookie || '');
}

function serializeCookie(name, value, options = {}, req){
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if(options.maxAge !== undefined) parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  parts.push(`Path=${options.path || '/'}`);
  if(options.domain) parts.push(`Domain=${options.domain}`);
  if(options.httpOnly !== false) parts.push('HttpOnly');
  parts.push(`SameSite=${options.sameSite || 'Lax'}`);
  if(options.secure !== false && secure(req)) parts.push('Secure');
  return parts.join('; ');
}

function makeServerClient(req, res){
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll(){
        const parsed = parseCookies(req);
        return Object.entries(parsed).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet){
        const existing = res.getHeader('Set-Cookie');
        const headers = Array.isArray(existing) ? [...existing] : existing ? [String(existing)] : [];
        for(const { name, value, options } of cookiesToSet){
          headers.push(serializeCookie(name, value, options || {}, req));
        }
        res.setHeader('Set-Cookie', headers);
      }
    }
  });
}

function redirect(res, location){
  res.setHeader('Cache-Control','no-store');
  res.status(302).setHeader('Location', location).end();
}

function safeError(message){
  return String(message || 'Google sign-in failed.').slice(0,180);
}

export default async function handler(req,res){
  try{
    if(req.method !== 'GET') return json(res,405,{error:'Method Not Allowed'});
    if(!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY)
      return json(res,503,{error:'Cloud account chưa được cấu hình.'});

    const redirectTo = `${SITE_URL}/api/auth/google`;
    const query = new URL(req.url || '', SITE_URL).searchParams;
    const code = query.get('code');
    const oauthError = query.get('error_description') || query.get('error');

    if(oauthError){
      console.error('[Lina][GOOGLE_CALLBACK]', safeError(oauthError));
      return redirect(res, '/?auth_error=google');
    }

    const supabase = makeServerClient(req, res);

    if(!code){
      // Let Supabase Auth own the OAuth state and PKCE verifier. The previous
      // implementation generated its own verifier/state and sent them to
      // Supabase's external-provider authorize endpoint, but Supabase needs
      // its own flow state so it can exchange Google's code correctly.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      });

      if(error || !data?.url){
        console.error('[Lina][GOOGLE_START]', safeError(error?.message));
        return redirect(res, '/?auth_error=google');
      }

      return redirect(res, data.url);
    }

    // Supabase has already completed the Google-provider exchange and now
    // returns an Auth Code for our server-side PKCE callback. The SSR client
    // reads the verifier from the cookie created during signInWithOAuth and
    // stores the resulting session back into secure cookies.
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if(error){
      console.error('[Lina][GOOGLE_EXCHANGE]', safeError(error.message));
      return redirect(res, '/?auth_error=google_exchange');
    }

    return redirect(res, '/');
  }catch(err){
    console.error('[Lina][GOOGLE_AUTH_ERROR]',err?.message||err);
    return redirect(res, '/?auth_error=google');
  }
}
