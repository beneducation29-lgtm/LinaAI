import { createHash, randomBytes } from 'node:crypto';
import { json, parseCookies } from './_utils.js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';

// Production is intentionally explicit so an OAuth flow started on a local
// machine can never accidentally send the user back to a dead localhost URL.
// Set LINA_SITE_URL to override this for another deployed environment.
const DEFAULT_SITE_URL = 'https://lina-ai-lake.vercel.app';
const SITE_URL = String(process.env.LINA_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');

function secure(req){
  return process.env.NODE_ENV === 'production' ||
    String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
}

function cookie(name, value, maxAge, req, httpOnly = true){
  const secureFlag = secure(req) ? '; Secure' : '';
  const httpOnlyFlag = httpOnly ? '; HttpOnly' : '';
  return `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Max-Age=${maxAge}${httpOnlyFlag}${secureFlag}`;
}

function clearOAuthCookies(req){
  return [
    cookie('lina_google_verifier','',0,req),
    cookie('lina_google_state','',0,req)
  ];
}

function base64Url(buffer){
  return buffer.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

function randomUrlToken(bytes = 32){
  return base64Url(randomBytes(bytes));
}

function challenge(verifier){
  return base64Url(createHash('sha256').update(verifier).digest());
}

function redirect(res, location, cookies = []){
  if(cookies.length) res.setHeader('Set-Cookie', cookies);
  res.status(302).setHeader('Location', location).setHeader('Cache-Control','no-store').end();
}

function safeError(message){
  return String(message || 'Google sign-in failed.').slice(0,180);
}

export default async function handler(req,res){
  try{
    if(req.method !== 'GET') return json(res,405,{error:'Method Not Allowed'});
    if(!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY)
      return json(res,503,{error:'Cloud account chưa được cấu hình.'});

    // Supabase PKCE callback. This must be the same URL registered in
    // Supabase Authentication -> URL Configuration -> Redirect URLs.
    const redirectTo = `${SITE_URL}/api/auth/google`;
    const query = new URL(req.url || '', SITE_URL).searchParams;
    const code = query.get('code');
    const returnedState = query.get('state');
    const oauthError = query.get('error_description') || query.get('error');

    if(oauthError){
      return redirect(res, '/?auth_error=google', clearOAuthCookies(req));
    }

    // Start OAuth authorization with an application-owned PKCE verifier.
    // The verifier is kept in a short-lived HttpOnly cookie and is required
    // for the one-time authorization-code exchange below.
    if(!code){
      const verifier = randomUrlToken(48);
      const state = randomUrlToken(32);
      const authorize = new URL(`${SUPABASE_URL}/auth/v1/authorize`);
      authorize.searchParams.set('provider','google');
      authorize.searchParams.set('redirect_to',redirectTo);
      authorize.searchParams.set('code_challenge',challenge(verifier));
      authorize.searchParams.set('code_challenge_method','s256');
      authorize.searchParams.set('state',state);

      const check = await fetch(authorize, {
        redirect:'manual',
        headers:{apikey:SUPABASE_PUBLISHABLE_KEY}
      });

      const location = check.headers.get('location');
      if(!location){
        const body = await check.text();
        let message = 'Google sign-in is not enabled in Supabase.';
        try{
          const data = body ? JSON.parse(body) : {};
          message = data.error_description || data.msg || data.message || message;
        }catch{}
        console.error('[Lina][GOOGLE_START]', safeError(message));
        return redirect(res, '/?auth_error=google', clearOAuthCookies(req));
      }

      return redirect(res, location, [
        cookie('lina_google_verifier',verifier,600,req),
        cookie('lina_google_state',state,600,req)
      ]);
    }

    const cookies = parseCookies(req);
    if(!returnedState || !cookies.lina_google_state || returnedState !== cookies.lina_google_state)
      return redirect(res, '/?auth_error=google_state', clearOAuthCookies(req));

    if(!cookies.lina_google_verifier)
      return redirect(res, '/?auth_error=google_session', clearOAuthCookies(req));

    // Supabase's PKCE token endpoint exchanges the one-time auth code only
    // when the original verifier is supplied. This is the server-side
    // equivalent of the documented exchangeCodeForSession() step.
    const tokenResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=pkce`,{
      method:'POST',
      headers:{
        apikey:SUPABASE_PUBLISHABLE_KEY,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        auth_code:code,
        code_verifier:cookies.lina_google_verifier
      })
    });

    const text = await tokenResponse.text();
    let data = {};
    try{ data = text ? JSON.parse(text) : {}; }catch{}

    if(!tokenResponse.ok || !data.access_token || !data.refresh_token){
      console.error('[Lina][GOOGLE_EXCHANGE]', safeError(data.error_description || data.msg || data.message));
      return redirect(res, '/?auth_error=google_exchange', clearOAuthCookies(req));
    }

    const authCookies = [
      `lina_access=${encodeURIComponent(data.access_token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600${secure(req)?'; Secure':''}`,
      `lina_refresh=${encodeURIComponent(data.refresh_token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${secure(req)?'; Secure':''}`,
      ...clearOAuthCookies(req)
    ];

    res.setHeader('Set-Cookie',authCookies);
    res.setHeader('Cache-Control','no-store');
    res.status(302).setHeader('Location','/').end();
  }catch(err){
    console.error('[Lina][GOOGLE_AUTH_ERROR]',err?.message||err);
    return redirect(res, '/?auth_error=google', clearOAuthCookies(req));
  }
}
