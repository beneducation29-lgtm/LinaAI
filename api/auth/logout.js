import {json,parseCookies,clearAuthCookies} from './_utils.js';

export default async function handler(req,res){
  try{
    if(req.method!=='POST') return json(res,405,{error:'Method Not Allowed'});
    const cookies=parseCookies(req);
    const key=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY;
    if(cookies.lina_access&&process.env.SUPABASE_URL&&key){
      try{await fetch(process.env.SUPABASE_URL+'/auth/v1/logout',{method:'POST',headers:{apikey:key,Authorization:`Bearer ${cookies.lina_access}`}});}catch{}
    }
    clearAuthCookies(res);
    return json(res,200,{ok:true});
  }catch(err){
    console.error('[Lina][AUTH_LOGOUT_ERROR]',err?.message||err);
    clearAuthCookies(res);
    return json(res,200,{ok:true});
  }
}
