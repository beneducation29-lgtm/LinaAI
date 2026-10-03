const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export function json(res,status,payload){
  res.status(status).setHeader('Content-Type','application/json; charset=utf-8').setHeader('Cache-Control','no-store').setHeader('X-Content-Type-Options','nosniff').send(JSON.stringify(payload));
}
export function parseCookies(req){
  const raw=String(req.headers.cookie||'');
  const out={};
  for(const part of raw.split(';')){
    const i=part.indexOf('=');
    if(i<0) continue;
    const key=part.slice(0,i).trim();
    try{out[key]=decodeURIComponent(part.slice(i+1));}catch{out[key]=part.slice(i+1);}
  }
  return out;
}
function secureCookie(req){
  return process.env.NODE_ENV==='production' || String(req.headers['x-forwarded-proto']||'').split(',')[0].trim()==='https';
}
export function setAuthCookies(req,res,access,refresh){
  const secure=secureCookie(req)?'; Secure':'';
  res.setHeader('Set-Cookie',[
    `lina_access=${encodeURIComponent(access)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600${secure}`,
    `lina_refresh=${encodeURIComponent(refresh)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${secure}`
  ]);
}
export function clearAuthCookies(res){
  res.setHeader('Set-Cookie',[
    'lina_access=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0',
    'lina_refresh=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'
  ]);
}
async function supabase(path,options={}){
  if(!SUPABASE_URL||!SUPABASE_PUBLISHABLE_KEY) return {ok:false,status:503,data:{msg:'Cloud account chưa được cấu hình.'}};
  const r=await fetch(SUPABASE_URL+path,{
    ...options,
    headers:{apikey:SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json',...(options.headers||{})}
  });
  const text=await r.text();
  let data={};
  try{data=text?JSON.parse(text):{};}catch{data={message:text.slice(0,500)};}
  return {ok:r.ok,status:r.status,data};
}
export function publicUser(u){
  return u?{id:u.id,email:u.email,name:u.user_metadata?.name}:null;
}
export async function getUser(access){
  if(!access) return null;
  const r=await supabase('/auth/v1/user',{headers:{Authorization:`Bearer ${access}`}});
  return r.ok?r.data:null;
}
export async function signUp(email,password,name){
  return supabase('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password,data:{name:typeof name==='string'?name.slice(0,80):undefined}})});
}
export async function signIn(email,password){
  return supabase('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})});
}
export async function refresh(refreshToken){
  return supabase('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:refreshToken})});
}
