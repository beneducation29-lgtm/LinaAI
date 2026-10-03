import {json,parseCookies,setAuthCookies,publicUser,signUp} from './_utils.js';

function message(data,fallback){ return data?.error_description||data?.msg||data?.message||fallback; }
function validEmail(value){ return typeof value==='string' && value.trim().length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()); }
function sameOrigin(req){ const origin=req.headers.origin; if(!origin) return true; try{return new URL(origin).host===req.headers.host;}catch{return false;} }
const buckets=new Map();
function rateLimited(req){ const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim(); const now=Date.now(); const current=buckets.get(ip)||{at:now,count:0}; if(now-current.at>=60000){current.at=now;current.count=0;} current.count++; buckets.set(ip,current); return current.count>10; }

export default async function handler(req,res){
  try{
    if(req.method!=='POST') return json(res,405,{error:'Method Not Allowed'});
    if(!sameOrigin(req)) return json(res,403,{error:'Cross-origin request blocked.'});
    if(rateLimited(req)){res.setHeader('Retry-After','60');return json(res,429,{error:'Quá nhiều yêu cầu. Vui lòng thử lại sau.'});}
    const {email,password,name}=req.body||{};
    if(!validEmail(email)||typeof password!=='string'||password.length<8||password.length>128)
      return json(res,400,{error:'Email hợp lệ và mật khẩu từ 8 đến 128 ký tự là bắt buộc.'});
    if(name!==undefined && (typeof name!=='string'||name.trim().length>80))
      return json(res,400,{error:'Tên hiển thị không hợp lệ.'});
    const r=await signUp(email.trim(),password,name);
    if(!r.ok) return json(res,r.status,{error:message(r.data,'Đăng ký thất bại.')});
    if(r.data?.access_token&&r.data?.refresh_token) setAuthCookies(req,res,r.data.access_token,r.data.refresh_token);
    return json(res,200,{user:publicUser(r.data?.user),requiresEmailConfirmation:!r.data?.access_token});
  }catch(err){
    console.error('[Lina][AUTH_SIGNUP_ERROR]',err?.message||err);
    return json(res,500,{error:'Dịch vụ đăng ký tạm thời không khả dụng.'});
  }
}
