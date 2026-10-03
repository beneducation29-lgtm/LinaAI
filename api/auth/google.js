import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import { json } from './_utils.js';

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
