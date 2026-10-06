const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const DEFAULT_SITE_URL = 'https://lina-ai-lake.vercel.app';
const SITE_URL = String(process.env.LINA_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
const buckets = new Map();

function json(res,status,payload){
  res.status(status).setHeader('Content-Type','application/json; charset=utf-8').setHeader('Cache-Control','no-store').setHeader('X-Content-Type-Options','nosniff').send(JSON.stringify(payload));
}
function parseCookies(req){
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
function setAuthCookies(req,res,access,refresh){
  const secure=secureCookie(req)?'; Secure':'';
  res.setHeader('Set-Cookie',[
    `lina_access=${encodeURIComponent(access)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600${secure}`,
    `lina_refresh=${encodeURIComponent(refresh)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${secure}`
  ]);
}
function clearAuthCookies(res){
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
function publicUser(u){ return u?{id:u.id,email:u.email,name:u.user_metadata?.name}:null; }
async function getUser(access){
  if(!access) return null;
  const r=await supabase('/auth/v1/user',{headers:{Authorization:`Bearer ${access}`}});
  return r.ok?r.data:null;
}
async function signUp(email,password,name){
  return supabase('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password,data:{name:typeof name==='string'?name.slice(0,80):undefined}})});
}
async function signIn(email,password){
  return supabase('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})});
}
async function refreshSession(refreshToken){
  return supabase('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:refreshToken})});
}
async function sendPasswordRecovery(email,redirectTo){
  return supabase('/auth/v1/recover',{method:'POST',body:JSON.stringify({email,redirect_to:redirectTo})});
}
async function updatePassword(accessToken,password){
  return supabase('/auth/v1/user',{method:'PUT',headers:{Authorization:`Bearer ${accessToken}`},body:JSON.stringify({password})});
}
function message(data,fallback){ return data?.error_description||data?.msg||data?.message||fallback; }
function validEmail(value){ return typeof value==='string' && value.trim().length<=254 && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value.trim()); }
function sameOrigin(req){
  const origin=req.headers.origin;
  if(!origin) return true;
  try{return new URL(origin).host===req.headers.host;}catch{return false;}
}
function rateLimited(req){
  const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
  const now=Date.now();
  const current=buckets.get(ip)||{at:now,count:0};
  if(now-current.at>=60000){current.at=now;current.count=0;}
  current.count++;
  buckets.set(ip,current);
  return current.count>10;
}
function redirect(res,location){
  res.setHeader('Cache-Control','no-store');
  res.status(302).setHeader('Location',location).end();
}
function cleanDetail(value){
  return String(value||'').replace(/[\\r\\n]/g,' ').replace(/\\s+/g,' ').slice(0,220);
}
function errorRedirect(res,code,detail){
  const params=new URLSearchParams({auth_error:code,auth_detail:cleanDetail(detail)});
  return redirect(res,'/?'+params.toString());
}

async function handleLogin(req,res){
  if(req.method!=='POST') return json(res,405,{error:'Method Not Allowed'});
  if(!sameOrigin(req)) return json(res,403,{error:'Cross-origin request blocked.'});
  if(rateLimited(req)){res.setHeader('Retry-After','60');return json(res,429,{error:'Quá nhiều yêu cầu. Vui lòng thử lại sau.'});}
  const {email,password}=req.body||{};
  if(!validEmail(email)||typeof password!=='string'||password.length<8||password.length>128)
    return json(res,400,{error:'Email hợp lệ và mật khẩu từ 8 đến 128 ký tự là bắt buộc.'});
  const r=await signIn(email.trim(),password);
  if(!r.ok) return json(res,r.status===400?401:r.status,{error:message(r.data,'Email hoặc mật khẩu không đúng.')});
  if(!r.data?.access_token||!r.data?.refresh_token||!r.data?.user)
    return json(res,502,{error:'Máy chủ xác thực trả về phiên đăng nhập không hợp lệ.'});
  setAuthCookies(req,res,r.data.access_token,r.data.refresh_token);
  return json(res,200,{user:publicUser(r.data.user)});
}
async function handleSignup(req,res){
  if(req.method!=='POST') return json(res,405,{error:'Method Not Allowed'});
  if(!sameOrigin(req)) return json(res,403,{error:'Cross-origin request blocked.'});
  if(rateLimited(req)){res.setHeader('Retry-After','60');return json(res,429,{error:'Quá nhiều yêu cầu. Vui lòng thử lại sau.'});}
  const {email,password,name}=req.body||{};
  if(!validEmail(email)||typeof password!=='string'||password.length<8||password.length>128)
    return json(res,400,{error:'Email hợp lệ và mật khẩu từ 8 đến 128 ký tự là bắt buộc.'});
  if(name!==undefined&&(typeof name!=='string'||name.trim().length>80))
    return json(res,400,{error:'Tên hiển thị không hợp lệ.'});
  const r=await signUp(email.trim(),password,name);
  if(!r.ok) return json(res,r.status,{error:message(r.data,'Đăng ký thất bại.')});
  if(r.data?.access_token&&r.data?.refresh_token) setAuthCookies(req,res,r.data.access_token,r.data.refresh_token);
  return json(res,200,{user:publicUser(r.data?.user),requiresEmailConfirmation:!r.data?.access_token});
}
async function handleGoogle(req,res){
  if(req.method!=='GET') return json(res,405,{error:'Method Not Allowed'});
  if(!SUPABASE_URL||!SUPABASE_PUBLISHABLE_KEY) return json(res,503,{error:'Cloud account chưa được cấu hình.'});
  const redirectTo=`${SITE_URL}/auth/callback`;
  const authorizeUrl=new URL(SUPABASE_URL+'/auth/v1/authorize');
  authorizeUrl.searchParams.set('provider','google');
  authorizeUrl.searchParams.set('redirect_to',redirectTo);
  authorizeUrl.searchParams.set('flow_type','implicit');
  return redirect(res,authorizeUrl.toString());
}
async function handleMe(req,res){
  if(req.method!=='GET') return json(res,405,{error:'Method Not Allowed'});
  const cookies=parseCookies(req);
  let user=await getUser(cookies.lina_access);
  if(!user&&cookies.lina_refresh){
    const r=await refreshSession(cookies.lina_refresh);
    if(r.ok&&r.data?.access_token&&r.data?.refresh_token){
      setAuthCookies(req,res,r.data.access_token,r.data.refresh_token);
      user=await getUser(r.data.access_token);
    }
  }
  if(!user) return json(res,401,{error:'Unauthorized'});
  return json(res,200,{user:publicUser(user)});
}
async function handleRefresh(req,res){
  if(req.method!=='POST') return json(res,405,{error:'Method Not Allowed'});
  const cookies=parseCookies(req);
  if(!cookies.lina_refresh) return json(res,401,{error:'Phiên đăng nhập đã hết hạn.'});
  const r=await refreshSession(cookies.lina_refresh);
  if(!r.ok||!r.data?.access_token||!r.data?.refresh_token){clearAuthCookies(res);return json(res,401,{error:'Phiên đăng nhập đã hết hạn.'});}
  setAuthCookies(req,res,r.data.access_token,r.data.refresh_token);
  return json(res,200,{user:publicUser(r.data.user)});
}
async function handleLogout(req,res){
  if(req.method!=='POST') return json(res,405,{error:'Method Not Allowed'});
  const cookies=parseCookies(req);
  const key=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY;
  if(cookies.lina_access&&SUPABASE_URL&&key){
    try{await fetch(SUPABASE_URL+'/auth/v1/logout',{method:'POST',headers:{apikey:key,Authorization:`Bearer ${cookies.lina_access}`}});}catch{}
  }
  clearAuthCookies(res);
  return json(res,200,{ok:true});
}
async function handleForgot(req,res){
  if(req.method!=='POST') return json(res,405,{error:'Method Not Allowed'});
  const {email}=req.body||{};
  if(!validEmail(email)) return json(res,400,{error:'Vui lòng nhập email hợp lệ.'});
  const origin=`${req.headers['x-forwarded-proto']||'https'}://${req.headers.host}`;
  const r=await sendPasswordRecovery(email.trim(),`${origin}/auth/reset-password`);
  if(!r.ok) return json(res,502,{error:r.data?.msg||r.data?.message||'Không thể gửi email đặt lại mật khẩu.'});
  return json(res,200,{ok:true});
}
async function handleReset(req,res){
  if(req.method!=='POST') return json(res,405,{error:'Method Not Allowed'});
  const {accessToken,password}=req.body||{};
  if(typeof accessToken!=='string'||accessToken.length<20) return json(res,400,{error:'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'});
  if(typeof password!=='string'||password.length<8||password.length>128) return json(res,400,{error:'Mật khẩu mới phải từ 8 đến 128 ký tự.'});
  const user=await getUser(accessToken);
  if(!user) return json(res,401,{error:'Liên kết đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu email mới.'});
  const r=await updatePassword(accessToken,password);
  if(!r.ok) return json(res,r.status||502,{error:r.data?.msg||r.data?.message||'Không thể cập nhật mật khẩu.'});
  setAuthCookies(req,res,accessToken,'');
  return json(res,200,{user:publicUser(user)});
}
async function handleOAuthSession(req,res){
  if(req.method!=='POST') return json(res,405,{error:'Method Not Allowed'});
  const {accessToken,refreshToken}=req.body||{};
  if(typeof accessToken!=='string'||accessToken.length<20) return json(res,400,{error:'Phiên Google không hợp lệ.'});
  const user=await getUser(accessToken);
  if(!user) return json(res,401,{error:'Phiên Google đã hết hạn.'});
  setAuthCookies(req,res,accessToken,typeof refreshToken==='string'?refreshToken:'');
  return json(res,200,{user:publicUser(user)});
}

export default async function handler(req,res){
  try{
    const pathname=new URL(req.url||'/','http://localhost').pathname.replace(/\\/+$/,'');
    const action=pathname.split('/').filter(Boolean).slice(2).join('/');
    if(action==='login') return await handleLogin(req,res);
    if(action==='signup') return await handleSignup(req,res);
    if(action==='google') return await handleGoogle(req,res);
    if(action==='me') return await handleMe(req,res);
    if(action==='refresh') return await handleRefresh(req,res);
    if(action==='logout') return await handleLogout(req,res);
    if(action==='forgot-password') return await handleForgot(req,res);
    if(action==='reset-password') return await handleReset(req,res);
    if(action==='oauth/session') return await handleOAuthSession(req,res);
    return json(res,404,{error:'Auth route not found.'});
  }catch(err){
    console.error('[Lina][AUTH_ERROR]',err?.message||err);
    return json(res,500,{error:'Dịch vụ tài khoản tạm thời không khả dụng.'});
  }
}
