import {json,setAuthCookies,publicUser,getUser} from '../_utils.js';

export default async function handler(req,res){
  try{
    if(req.method!=='POST') return json(res,405,{error:'Method Not Allowed'});
    let {accessToken,refreshToken}=req.body||{};
    if(typeof accessToken!=='string'||accessToken.length<20) return json(res,400,{error:'Phiên Google không hợp lệ.'});
    const user=await getUser(accessToken);
    if(!user) return json(res,401,{error:'Phiên Google đã hết hạn.'});
    if(typeof refreshToken==='string'&&refreshToken) setAuthCookies(req,res,accessToken,refreshToken);
    else setAuthCookies(req,res,accessToken,'');
    return json(res,200,{user:publicUser(user)});
  }catch(err){
    console.error('[Lina][AUTH_OAUTH_SESSION_ERROR]',err?.message||err);
    return json(res,500,{error:'Không thể hoàn tất đăng nhập Google.'});
  }
}
