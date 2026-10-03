import {json,setAuthCookies,publicUser,signIn} from './_utils.js';

function message(data,fallback){ return data?.error_description||data?.msg||data?.message||fallback; }
function validEmail(value){ return typeof value==='string' && value.trim().length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()); }

export default async function handler(req,res){
  try{
    if(req.method!=='POST') return json(res,405,{error:'Method Not Allowed'});
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
