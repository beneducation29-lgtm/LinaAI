export interface AuthUser{id:string;email?:string;name?:string;}
export interface AuthState{user:AuthUser|null;loading:boolean;error:string|null;}

async function readResponse(response:Response):Promise<any>{
  const contentType=response.headers.get('content-type')||'';
  const body=await response.text();
  if(!body) return {};
  if(contentType.toLowerCase().includes('application/json')){
    try{return JSON.parse(body);}catch{return {error:'Máy chủ trả về dữ liệu JSON không hợp lệ.'};}
  }
  const compact=body.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,240);
  return {error:compact||`Yêu cầu thất bại (HTTP ${response.status}).`};
}
async function request(path:string,init:RequestInit={}){
  try{
    const response=await fetch(path,{...init,credentials:'include',headers:{...(init.body?{'Content-Type':'application/json'}:{}),...(init.headers||{})}});
    const data=await readResponse(response);
    return {response,data};
  }catch{return {response:null,data:{error:'Không thể kết nối máy chủ tài khoản.'}};}
}
export async function getCurrentUser():Promise<AuthUser|null>{let {response:r,data}=await request('/api/auth/me');if(r?.status===401){const refreshed=await request('/api/auth/refresh',{method:'POST'});if(refreshed.response?.ok){({response:r,data}=await request('/api/auth/me'));}}if(!r?.ok)return null;return data.user||null;}
export async function login(email:string,password:string){const {response:r,data:d}=await request('/api/auth/login',{method:'POST',body:JSON.stringify({email,password})});if(!r?.ok)throw new Error(d.error||`Đăng nhập thất bại (HTTP ${r?.status||0}).`);return d.user as AuthUser;}
export async function signup(email:string,password:string,name?:string){const {response:r,data:d}=await request('/api/auth/signup',{method:'POST',body:JSON.stringify({email,password,name})});if(!r?.ok)throw new Error(d.error||`Đăng ký thất bại (HTTP ${r?.status||0}).`);return d.user as AuthUser;}
export async function logout(){await request('/api/auth/logout',{method:'POST'});}
