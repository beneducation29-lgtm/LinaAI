import {json,parseCookies,setAuthCookies,clearAuthCookies,publicUser,refresh as refreshSession} from './_utils.js';

export default async function handler(req,res){
  try{
    if(req.method!=='POST') return json(res,405,{error:'Method Not Allowed'});
    const cookies=parseCookies(req);
    if(!cookies.lina_refresh) return json(res,401,{error:'Phiên đăng nhập đã hết hạn.'});
    const r=await refreshSession(cookies.lina_refresh);
    if(!r.ok||!r.data?.access_token||!r.data?.refresh_token){clearAuthCookies(res);return json(res,401,{error:'Phiên đăng nhập đã hết hạn.'});}
    setAuthCookies(req,res,r.data.access_token,r.data.refresh_token);
    return json(res,200,{user:publicUser(r.data.user)});
  }catch(err){
    console.error('[Lina][AUTH_REFRESH_ERROR]',err?.message||err);
    return json(res,500,{error:'Dịch vụ phiên đăng nhập tạm thời không khả dụng.'});
  }
}
