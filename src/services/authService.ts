export interface AuthUser{id:string;email?:string;name?:string;}
export interface AuthState{user:AuthUser|null;loading:boolean;error:string|null;}
export async function getCurrentUser():Promise<AuthUser|null>{let r=await fetch('/api/auth/me',{credentials:'include'});if(r.status===401){await fetch('/api/auth/refresh',{method:'POST',credentials:'include'});r=await fetch('/api/auth/me',{credentials:'include'});}if(!r.ok)return null;const d=await r.json();return d.user||null;}
export async function login(email:string,password:string){const r=await fetch('/api/auth/login',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Đăng nhập thất bại.');return d.user as AuthUser;}
export async function signup(email:string,password:string,name?:string){const r=await fetch('/api/auth/signup',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,name})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Đăng ký thất bại.');return d.user as AuthUser;}
export function loginWithGoogle(): void {
  window.location.assign('/api/auth/google/start');
}
export async function logout(){await fetch('/api/auth/logout',{method:'POST',credentials:'include'});}
