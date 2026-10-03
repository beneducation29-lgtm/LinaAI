import { json, parseCookies, getUser, clearAuthCookies } from '../auth/_utils.js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVER_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const headers = (extra={}) => ({ apikey: SUPABASE_SERVER_KEY, Authorization: 'Bearer '+SUPABASE_SERVER_KEY, ...extra });

export default async function handler(req,res){
  try{
    if(req.method!=='POST') return json(res,405,{error:'Method Not Allowed'});
    if(!SUPABASE_URL || !SUPABASE_SERVER_KEY) return json(res,503,{error:'Privacy database chưa được cấu hình.'});
    const user=await getUser(parseCookies(req).lina_access);
    if(!user) return json(res,401,{error:'Unauthorized'});
    const url=SUPABASE_URL+'/rest/v1/lina_learning_sync_records?user_id=eq.'+encodeURIComponent(user.id);
    const r=await fetch(url,{method:'DELETE',headers:headers({Prefer:'return=minimal'})});
    if(!r.ok){const detail=await r.text().catch(()=> '');console.error('[Lina][PRIVACY_DELETE_LEARNING]',r.status,detail.slice(0,300));return json(res,503,{error:'Không thể xóa dữ liệu học tập.'});}
    return json(res,200,{deleted:true});
  }catch(err){console.error('[Lina][PRIVACY_DELETE_LEARNING_ERROR]',err?.message||err);return json(res,503,{error:'Không thể hoàn tất xóa dữ liệu học tập.'});}
}