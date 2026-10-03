import {json,parseCookies,setAuthCookies,publicUser,getUser,refresh} from './_utils.js';

export default async function handler(req,res){
  try{
    if(req.method!=='GET') return json(res,405,{error:'Method Not Allowed'});
    const cookies=parseCookies(req);
    let user=await getUser(cookies.lina_access);
    if(!user&&cookies.lina_refresh){
      const r=await refresh(cookies.lina_refresh);
      if(r.ok&&r.data?.access_token&&r.data?.refresh_token){
        setAuthCookies(req,res,r.data.access_token,r.data.refresh_token);
        user=await getUser(r.data.access_token);
      }
    }
    if(!user) return json(res,401,{error:'Unauthorized'});
    return json(res,200,{user:publicUser(user)});
  }catch(err){
    console.error('[Lina][AUTH_ME_ERROR]',err?.message||err);
    return json(res,500,{error:'Dịch vụ tài khoản tạm thời không khả dụng.'});
  }
}
