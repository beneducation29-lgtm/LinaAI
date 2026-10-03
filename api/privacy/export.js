import { json, parseCookies, getUser } from '../auth/_utils.js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVER_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const headers = (extra={}) => ({ apikey: SUPABASE_SERVER_KEY, Authorization: 'Bearer '+SUPABASE_SERVER_KEY, ...extra });

export default async function handler(req,res){
  try{
    if(req.method!=='GET') return json(res,405,{error:'Method Not Allowed'});
    if(!SUPABASE_URL || !SUPABASE_SERVER_KEY) return json(res,503,{error:'Privacy database chưa được cấu hình.'});
    const user=await getUser(parseCookies(req).lina_access);
    if(!user) return json(res,401,{error:'Unauthorized'});
    const base=SUPABASE_URL+'/rest/v1/';
    const [syncRes,privacyRes]=await Promise.all([
      fetch(base+'lina_learning_sync_records?select=record_key,payload,version,updated_at,device_id&user_id=eq.'+encodeURIComponent(user.id),{headers:headers()}),
      fetch(base+'lina_privacy_preferences?select=ai_memory_enabled,conversation_history_enabled,analytics_enabled,voice_data_enabled,personalization_enabled,updated_at&user_id=eq.'+encodeURIComponent(user.id),{headers:headers()})
    ]);
    if(!syncRes.ok || !privacyRes.ok) return json(res,503,{error:'Không thể đọc dữ liệu để xuất.'});
    const sync=await syncRes.json(); const privacy=await privacyRes.json();
    const payload={
      exportedAt:new Date().toISOString(),
      account:{id:user.id,email:user.email||null},
      privacy:privacy[0]||null,
      learningSyncRecords:sync
    };
    res.status(200).setHeader('Content-Type','application/json; charset=utf-8').setHeader('Content-Disposition','attachment; filename="lina-learning-export.json"').setHeader('Cache-Control','no-store').send(JSON.stringify(payload,null,2));
  }catch(err){console.error('[Lina][PRIVACY_EXPORT]',err?.message||err);return json(res,503,{error:'Không thể xuất dữ liệu lúc này.'});}
}