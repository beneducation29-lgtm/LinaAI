import {json,getUser,updatePassword,publicUser,setAuthCookies} from './_utils.js';

export default async function handler(req,res){
  try{
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
  }catch(err){
    console.error('[Lina][AUTH_RESET_ERROR]',err?.message||err);
    return json(res,500,{error:'Dịch vụ đặt lại mật khẩu tạm thời không khả dụng.'});
  }
}
