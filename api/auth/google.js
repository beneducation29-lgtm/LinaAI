import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import { json } from './_utils.js';
import { setAuthCookies } from './_utils.js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const DEFAULT_SITE_URL = 'https://lina-ai-lake.vercel.app';
const SITE_URL = String(process.env.LINA_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');

function makeServerClient(req, res){
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll(){
        return parseCookieHeader(String(req.headers.cookie || ''));
      },
      setAll(cookiesToSet, headersToSet){
        const existing = res.getHeader('Set-Cookie');
        const headers = Array.isArray(existing) ? [...existing] : existing ? [String(existing)] : [];
        for(const { name, value, options } of cookiesToSet){
          headers.push(serializeCookieHeader(name, value, options));
        }
        res.setHeader('Set-Cookie', headers);
        if(headersToSet){
          for(const [name, value] of Object.entries(headersToSet)){
            res.setHeader(name, value);
          }
        }
      }
    }
  });
}

function redirect(res, location){
  res.setHeader('Cache-Control','no-store');
  res.status(302).setHeader('Location', location).end();
}

function cleanDetail(value){
  return String(value || '')
    .replace(/[\r\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0,220);
}

function errorRedirect(res, code, detail){
  const params = new URLSearchParams({
    auth_error: code,
    auth_detail: cleanDetail(detail)
  });
  return redirect(res, '/?' + params.toString());
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
    const oauthErrorCode = query.get('error_code') || query.get('error');

    if(oauthError){
      console.error('[Lina][GOOGLE_CALLBACK]', cleanDetail(oauthError));
      return errorRedirect(res, 'google_provider', oauthErrorCode + ': ' + oauthError);
    }

    const supabase = makeServerClient(req, res);

    if(!code){
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      });

      if(error || !data?.url){
        const detail = error?.message || 'Supabase did not return an OAuth URL.';
        console.error('[Lina][GOOGLE_START]', cleanDetail(detail));
        return errorRedirect(res, 'google_start', detail);
      }

      return redirect(res, data.url);
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if(error){
      console.error('[Lina][GOOGLE_EXCHANGE]', cleanDetail(error.message));
      return errorRedirect(res, 'google_exchange', error.message);
    }

    const session = data?.session;
    if(!session?.access_token || !session?.refresh_token){
      const detail = 'Google callback completed but Supabase returned no session tokens.';
      console.error('[Lina][GOOGLE_SESSION]', detail);
      return errorRedirect(res, 'google_session', detail);
    }

    // The rest of Lina's auth API reads lina_access/lina_refresh.
    // Bridge the successful Supabase SSR session into those HttpOnly cookies.
    setAuthCookies(req, res, session.access_token, session.refresh_token);

    return redirect(res, '/');
  }catch(err){
    console.error('[Lina][GOOGLE_AUTH_ERROR]',cleanDetail(err?.message||err));
    return errorRedirect(res, 'google_runtime', err?.message || err);
  }
}
