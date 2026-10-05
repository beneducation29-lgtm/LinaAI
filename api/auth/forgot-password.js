import {json,sendPasswordRecovery} from './_utils.js';

function validEmail(value){ return typeof value==='string' && value.trim().length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()); }

export default async function handler(req,res){
  try{
    if(req.method!=='POST') return json(res,405,{error:'Method Not Allowed'});
    const {email}=req.body||{};
    if(!validEmail(email)) return json(res,400,{error:'Vui lòng nhập email hợp lệ.'});
    const origin=`${req.headers['x-forwarded-proto']||'https'}://${req.headers.host}`;
    const r=await sendPasswordRecovery(email.trim(),`${origin}/auth/reset-password`);
    if(!r.ok) return json(res,502,{error:r.data?.msg||r.data?.message||'Không thể gửi email đặt lại mật khẩu.'});
    return json(res,200,{ok:true});
  }catch(err){
    console.error('[Lina][AUTH_FORGOT_ERROR]',err?.message||err);
    return json(res,500,{error:'Dịch vụ đặt lại mật khẩu tạm thời không khả dụng.'});
  }
}
