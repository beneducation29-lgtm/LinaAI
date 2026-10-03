import {json,setAuthCookies,publicUser,signIn} from './_utils.js';

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
    const {email,password}=req.body||{};
    if(!validEmail(email)||typeof password!=='string'||password.length<8||password.length>128)
      return json(res,400,{error:'Email hợp lệ và mật khẩu từ 8 đến 128 ký tự là bắt buộc.'});
    const r=await signIn(email.trim(),password);
    if(!r.ok) return json(res,r.status===400?401:r.status,{error:message(r.data,'Email hoặc mật khẩu không đúng.')});
    if(!r.data?.access_token||!r.data?.refresh_token||!r.data?.user)
      return json(res,502,{error:'Máy chủ xác thực trả về phiên đăng nhập không hợp lệ.'});
    setAuthCookies(req,res,r.data.access_token,r.data.refresh_token);
    return json(res,200,{user:publicUser(r.data.user)});
  }catch(err){
    console.error('[Lina][AUTH_LOGIN_ERROR]',err?.message||err);
    return json(res,500,{error:'Dịch vụ đăng nhập tạm thời không khả dụng.'});
  }
}
