import {json,parseCookies,setAuthCookies,clearAuthCookies,publicUser,getUser,signUp,signIn,refresh} from './_utils.js';

function message(data,fallback){
  return data?.error_description||data?.msg||data?.message||fallback;
}

export default async function handler(req,res){
  const path=req.query?.path;
  const action=Array.isArray(path)?path.join('/'):String(path||'');
  try{
    if(action==='signup' && req.method==='POST'){
      const {email,password,name}=req.body||{};
      if(typeof email!=='string'||typeof password!=='string'||password.length<8)
        return json(res,400,{error:'Email và mật khẩu tối thiểu 8 ký tự là bắt buộc.'});
      const r=await signUp(email.trim(),password,name);
      if(!r.ok) return json(res,r.status,{error:message(r.data,'Đăng ký thất bại.')});
      if(r.data?.access_token&&r.data?.refresh_token)
        setAuthCookies(req,res,r.data.access_token,r.data.refresh_token);
      return json(res,200,{
        user:publicUser(r.data?.user),
        requiresEmailConfirmation:!r.data?.access_token
      });
    }

    if(action==='login' && req.method==='POST'){
      const {email,password}=req.body||{};
      if(typeof email!=='string'||typeof password!=='string')
        return json(res,400,{error:'Email và mật khẩu là bắt buộc.'});
      const r=await signIn(email.trim(),password);
      if(!r.ok) return json(res,r.status===400?401:r.status,{error:message(r.data,'Email hoặc mật khẩu không đúng.')});
      if(!r.data?.access_token||!r.data?.refresh_token||!r.data?.user)
        return json(res,502,{error:'Máy chủ xác thực trả về phiên đăng nhập không hợp lệ.'});
      setAuthCookies(req,res,r.data.access_token,r.data.refresh_token);
      return json(res,200,{user:publicUser(r.data.user)});
    }

    if(action==='refresh' && req.method==='POST'){
      const cookies=parseCookies(req);
      if(!cookies.lina_refresh) return json(res,401,{error:'Phiên đăng nhập đã hết hạn.'});
      const r=await refresh(cookies.lina_refresh);
      if(!r.ok||!r.data?.access_token||!r.data?.refresh_token){
        clearAuthCookies(res);
        return json(res,401,{error:'Phiên đăng nhập đã hết hạn.'});
      }
      setAuthCookies(req,res,r.data.access_token,r.data.refresh_token);
      return json(res,200,{user:publicUser(r.data.user)});
    }

    if(action==='me' && req.method==='GET'){
      const cookies=parseCookies(req);
      let user=await getUser(cookies.lina_access);
      if(!user && cookies.lina_refresh){
        const r=await refresh(cookies.lina_refresh);
        if(r.ok&&r.data?.access_token&&r.data?.refresh_token){
          setAuthCookies(req,res,r.data.access_token,r.data.refresh_token);
          user=await getUser(r.data.access_token);
        }
      }
      if(!user) return json(res,401,{error:'Unauthorized'});
      return json(res,200,{user:publicUser(user)});
    }

    if(action==='logout' && req.method==='POST'){
      const cookies=parseCookies(req);
      if(cookies.lina_access&&process.env.SUPABASE_URL&&process.env.SUPABASE_ANON_KEY){
        try{
          await fetch(process.env.SUPABASE_URL+'/auth/v1/logout',{
            method:'POST',
            headers:{apikey:process.env.SUPABASE_ANON_KEY,Authorization:`Bearer ${cookies.lina_access}`}
          });
        }catch{}
      }
      clearAuthCookies(res);
      return json(res,200,{ok:true});
    }

    return json(res,404,{error:'Auth route not found.'});
  }catch(err){
    console.error('[Lina][AUTH_ERROR]',err?.message||err);
    return json(res,500,{error:'Dịch vụ tài khoản tạm thời không khả dụng.'});
  }
}
