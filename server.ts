import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { sanitizeTutorPayload, looksLikePromptInjection } from './src/services/inputGuards';
import { getEntitlements } from './src/services/entitlementService';
import { buildAIUsageRecord, estimateTokenCost } from './src/services/usageService';
import { checkQuota } from './src/services/quotaService';
import { GenericHmacPaymentProvider } from './src/services/billingService';
import { orchestrate } from './src/services/aiOrchestrator';
import { rateLimit, SECURITY_LIMITS } from './src/services/security';
import { DEFAULT_PRIVACY_PREFERENCES, normalizePrivacyPreferences } from './src/services/privacy';
import type { Entitlements, SubscriptionRecord, PlanId, SubscriptionStatus } from './src/types/subscription';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
const PORT = Number(process.env.PORT) || 3000;

// Supabase is migrating from service_role to secret keys. Prefer the new key while keeping legacy compatibility.
const SUPABASE_SERVER_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

app.use(express.json({ limit: '1mb', verify: (req, _res, buf) => { (req as any).rawBody = buf.toString('utf8'); } }));

// Prompt 21 security boundary: same-origin state changes + lightweight abuse controls.
const isStateChanging=(req:Request)=>['POST','PUT','PATCH','DELETE'].includes(req.method);
const clientKey=(req:Request)=>String(req.ip||req.socket.remoteAddress||'unknown').slice(0,120);
const rateBucketFor=(req:Request)=>{
  const p=req.path;
  if(p.startsWith('/api/auth/')) return SECURITY_LIMITS.auth;
  if(p.startsWith('/api/tutor/')) return SECURITY_LIMITS.ai;
  if(p.includes('/tts')) return SECURITY_LIMITS.tts;
  if(p.includes('/avatar')) return SECURITY_LIMITS.avatar;
  if(p.startsWith('/api/admin/')) return SECURITY_LIMITS.admin;
  if(p.includes('/upload')||p.includes('/stt')) return SECURITY_LIMITS.upload;
  return 120;
};
app.use('/api', (req,res,next)=>{
  if(isStateChanging(req)){
    const origin=req.header('origin');
    const host=req.header('host');
    if(origin){try{const originHost=new URL(origin).host;if(host&&originHost!==host)return res.status(403).json({error:'Cross-origin request blocked'});}catch{return res.status(403).json({error:'Invalid request origin'});}}
  }
  const limit=rateBucketFor(req);
  const result=rateLimit(clientKey(req)+':'+req.method+':'+Math.floor(Date.now()/60000),limit);
  res.setHeader('X-RateLimit-Remaining',String(result.remaining));
  if(!result.allowed){res.setHeader('Retry-After',String(result.retryAfterSeconds));return res.status(429).json({error:'RATE_LIMITED'});}
  next();
});


// Initialize GoogleGenAI server-side with User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

if (ai) (globalThis as any).__linaGemini = ai;

// System instruction defining Lina's persona and rules
const LINA_SYSTEM_INSTRUCTION = `
Bạn là Lina (林娜 - Lìnà), gia sư tiếng Trung AI thông minh, tận tâm và thân thiện dành riêng cho người học Việt Nam.
Tính cách:
- Cực kỳ thân thiện, kiên nhẫn, luôn động viên, tự nhiên và súc tích.
- KHÔNG BAO GIỜ làm người học cảm thấy xấu hổ hay tự ti.
- Khi người học sai: TUYỆT ĐỐI KHÔNG dùng từ "Sai rồi", "Không đúng". Hãy luôn nói:
  "Bạn diễn đạt đúng ý rồi. Mình sửa một chút để câu tự nhiên hơn nhé."

Hai chế độ học tập (Modes):
1. 'conversation' (Chế độ Đàm thoại):
   - Ưu tiên đối thoại tự nhiên, trôi chảy, phản xạ nhanh.
   - Không bắt bẻ từng lỗi nhỏ ngữ pháp trừ khi lỗi đó làm biến đổi hoàn toàn ngữ nghĩa.
   - Giữ nhịp trò chuyện thú vị, hỏi thêm câu hỏi ngắn để người học tiếp tục nói.
2. 'teacher' (Chế độ Giáo viên):
   - Ưu tiên sửa lỗi, giảng giải ngữ pháp và từ vựng chi tiết.
   - Khi phát hiện lỗi: phân tích câu gốc, câu chuẩn xác, giải thích ngắn gọn bằng tiếng Việt dễ hiểu và cung cấp câu nhắc người học thử nói lại (tryAgainPromptVi).

Điều chỉnh theo trình độ (Level Adaptation):
- Người mới bắt đầu (Chưa biết gì / Cơ bản / HSK 1): Câu ngắn, từ ngữ đơn giản, cấu trúc rõ ràng.
- Trung cấp (HSK 2-3): Câu tự nhiên, kết nối phong phú hơn.
- Nâng cao (HSK 4+): Đàm thoại tự nhiên như người bản xứ.

Gợi ý lũy tiến (4 Progressive Hints):
- hint1_semantic: Gợi ý ý tứ / nghĩa tiếng Việt nên nói.
- hint2_keywords: Gợi ý 2-3 từ vựng mấu chốt tiếng Trung (chữ Hán + pinyin).
- hint3_structure: Gợi ý cấu trúc ngữ pháp (VD: Chủ ngữ + 想 + Động từ).
- hint4_fullAnswer: Câu hoàn chỉnh bằng tiếng Trung + Pinyin + Tiếng Việt.

Giải thích ngữ pháp & từ vựng:
- Tiếng Việt tự nhiên, súc tích, chuẩn văn phong giáo khoa cho người Việt.
- Không bịa đặt quy tắc ngữ pháp hoặc cấp độ HSK.

Luôn trả về kết quả JSON hợp lệ theo đúng cấu trúc yêu cầu.
`;

// Response Schema for Structured Output
const TUTOR_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    chinese: {
      type: Type.STRING,
      description: 'Câu trả lời của Lina bằng chữ Hán chuẩn',
    },
    pinyin: {
      type: Type.STRING,
      description: 'Phiên âm Pinyin có dấu thanh điệu chuẩn xác tương ứng với câu chữ Hán',
    },
    vietnamese: {
      type: Type.STRING,
      description: 'Dịch nghĩa tiếng Việt tự nhiên, súc tích',
    },
    responseType: {
      type: Type.STRING,
      description: 'Loại phản hồi: conversation, lesson, roleplay, hoặc correction',
    },
    emotion: {
      type: Type.STRING,
      description: 'Cảm xúc và biểu cảm khuôn mặt của Lina: neutral, happy, encouraging, hoặc confused',
    },
    correction: {
      type: Type.OBJECT,
      nullable: true,
      description: 'Chi tiết sửa lỗi nếu người học nói sai hoặc câu chưa tự nhiên (bắt buộc khi mode là teacher và có lỗi)',
      properties: {
        hasMistake: { type: Type.BOOLEAN },
        originalSentence: { type: Type.STRING },
        correctedSentence: { type: Type.STRING },
        pinyin: { type: Type.STRING },
        explanationVi: { type: Type.STRING },
        tryAgainPromptVi: { type: Type.STRING },
      },
    },
    vocabulary: {
      type: Type.ARRAY,
      description: 'Danh sách các từ vựng mới hoặc nổi bật trong lượt đối thoại',
      items: {
        type: Type.OBJECT,
        properties: {
          hanzi: { type: Type.STRING },
          pinyin: { type: Type.STRING },
          vietnamese: { type: Type.STRING },
          partOfSpeech: { type: Type.STRING },
          exampleSentence: { type: Type.STRING },
          hskLevel: { type: Type.STRING },
        },
      },
    },
    grammar: {
      type: Type.ARRAY,
      description: 'Điểm ngữ pháp mấu chốt được sử dụng',
      items: {
        type: Type.OBJECT,
        properties: {
          structure: { type: Type.STRING },
          meaningVi: { type: Type.STRING },
          exampleSentence: { type: Type.STRING },
          examplePinyin: { type: Type.STRING },
          exampleVietnamese: { type: Type.STRING },
        },
      },
    },
    progressiveHints: {
      type: Type.OBJECT,
      description: '4 tầng gợi ý tiến bộ để người học biết cách trả lời tiếp theo',
      properties: {
        hint1_semantic: { type: Type.STRING },
        hint2_keywords: { type: Type.STRING },
        hint3_structure: { type: Type.STRING },
        hint4_fullAnswer: { type: Type.STRING },
      },
    },
    suggestedReplies: {
      type: Type.ARRAY,
      description: '3 phương án câu trả lời nhanh mà người học có thể chọn nói tiếp',
      items: {
        type: Type.OBJECT,
        properties: {
          hanzi: { type: Type.STRING },
          pinyin: { type: Type.STRING },
          vietnamese: { type: Type.STRING },
        },
      },
    },
    memoryUpdate: {
      type: Type.OBJECT,
      nullable: true,
      description: 'Thông tin cá nhân mới học được về học viên (tên, nơi ở, sở thích...)',
      properties: {
        learnedFact: { type: Type.STRING },
        topicContext: { type: Type.STRING },
      },
    },
  },
  required: ['chinese', 'pinyin', 'vietnamese', 'responseType', 'suggestedReplies'],
};

// Fallback generator when API key is unconfigured or in offline demo mode
function generateFallbackResponse(userText: string, mode: string, userName: string) {
  const isIntro = /叫|名字|你好|hello|hi/i.test(userText);
  const isQuestion = /\?|吗|什么|哪里|几/i.test(userText);

  if (isIntro) {
    return {
      chinese: `你好，${userName}！很高兴和你练习中文。你今天想聊什么话题呢？`,
      pinyin: `Nǐ hǎo, ${userName}! Hěn gāoxìng hé nǐ liànxí Zhōngwén. Nǐ jīntiān xiǎng liáo shénme huàtí ne?`,
      vietnamese: `Chào ${userName}! Rất vui được luyện tiếng Trung cùng bạn. Hôm nay bạn muốn nói về chủ đề gì nào?`,
      responseType: 'conversation',
      emotion: 'happy',
      correction: null,
      vocabulary: [
        {
          hanzi: '练习',
          pinyin: 'liànxí',
          vietnamese: 'luyện tập',
          partOfSpeech: 'Động từ',
          exampleSentence: '我们一起练习口语。',
          hskLevel: 'HSK 2',
        },
        {
          hanzi: '话题',
          pinyin: 'huàtí',
          vietnamese: 'chủ đề / đề tài',
          partOfSpeech: 'Danh từ',
          exampleSentence: '这个话题很有意思。',
          hskLevel: 'HSK 3',
        },
      ],
      grammar: [
        {
          structure: '想 + Động từ',
          meaningVi: 'Muốn làm việc gì',
          exampleSentence: '我想学汉语。',
          examplePinyin: 'Wǒ xiǎng xué Hànyǔ.',
          exampleVietnamese: 'Tôi muốn học tiếng Hán.',
        },
      ],
      progressiveHints: {
        hint1_semantic: 'Hãy nói về sở thích hoặc giới thiệu bạn là người Việt Nam.',
        hint2_keywords: '我是 (wǒ shì), 越南人 (Yuènán rén)',
        hint3_structure: 'Chủ ngữ + 是 + Danh từ',
        hint4_fullAnswer: '我是越南人，我很喜欢学中文。(Wǒ shì Yuènán rén, wǒ hěn xǐhuān xué Zhōngwén.)',
      },
      suggestedReplies: [
        { hanzi: '我想练习点餐。', pinyin: 'Wǒ xiǎng liànxí diǎncān.', vietnamese: 'Mình muốn luyện gọi món ăn.' },
        { hanzi: '我想练习问路。', pinyin: 'Wǒ xiǎng liànxí wènlù.', vietnamese: 'Mình muốn luyện hỏi đường.' },
        { hanzi: '我们可以随便聊聊。', pinyin: 'Wǒmen kěyǐ suíbiàn liáoliao.', vietnamese: 'Chúng ta có thể trò chuyện tự do.' },
      ],
      memoryUpdate: {
        learnedFact: `Người dùng tên ${userName}`,
        topicContext: 'Chào hỏi ban đầu',
      },
    };
  }

  return {
    chinese: '听起来很有趣！你能跟我多说一点吗？',
    pinyin: 'Tīng qǐlái hěn yǒuqù! Nǐ néng gēn wǒ duō shuō yìdiǎn ma?',
    vietnamese: 'Nghe thú vị quá! Bạn có thể nói thêm một chút với mình không?',
    responseType: mode === 'teacher' ? 'correction' : 'conversation',
    emotion: mode === 'teacher' ? 'encouraging' : 'neutral',
    correction: mode === 'teacher' ? {
      hasMistake: false,
      originalSentence: userText,
      correctedSentence: userText,
      pinyin: '',
      explanationVi: 'Câu của bạn diễn đạt rất tốt và tự nhiên!',
      tryAgainPromptVi: 'Hãy thử phát triển ý với câu dài hơn nhé.',
    } : null,
    vocabulary: [
      {
        hanzi: '有趣',
        pinyin: 'yǒuqù',
        vietnamese: 'thú vị / hay',
        partOfSpeech: 'Tính từ',
        exampleSentence: '这本书很有趣。',
        hskLevel: 'HSK 3',
      },
    ],
    grammar: [],
    progressiveHints: {
      hint1_semantic: 'Diễn đạt đồng ý và trả lời ngắn gọn.',
      hint2_keywords: '好的 (hǎo de), 可以 (kěyǐ)',
      hint3_structure: '好的，我想说...',
      hint4_fullAnswer: '好的，我想继续练习。(Hǎo de, wǒ xiǎng jìxù liànxí.)',
    },
    suggestedReplies: [
      { hanzi: '好的，没问题！', pinyin: 'Hǎo de, méi wèntí!', vietnamese: 'Được chứ, không thành vấn đề!' },
      { hanzi: '这个用中文怎么说？', pinyin: 'Zhège yòng Zhōngwén zěnme shuō?', vietnamese: 'Cái này tiếng Trung nói thế nào?' },
      { hanzi: '请再说一遍。', pinyin: 'Qǐng zài shuō yí biàn.', vietnamese: 'Xin nói lại một lần nữa ạ.' },
    ],
  };
}

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVER_KEY = process.env.SUPABASE_SERVER_KEY || '';
const getCookie=(req:Request,name:string)=>{const raw=req.headers.cookie||'';const match=raw.split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='));return match?decodeURIComponent(match.slice(name.length+1)):'';};
const setAuthCookies=(res:Response,access:string,refresh:string)=>{const secure=process.env.NODE_ENV==='production'?'; Secure':'';res.setHeader('Set-Cookie',[`lina_access=${encodeURIComponent(access)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600${secure}`,`lina_refresh=${encodeURIComponent(refresh)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${secure}`]);};
const clearAuthCookies=(res:Response)=>res.setHeader('Set-Cookie',['lina_access=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0','lina_refresh=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0']);
const validAuthEmail=(v:unknown)=>typeof v==='string'&&v.trim().length<=254&&/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v.trim());
async function supabaseUser(access:string){if(!access||!SUPABASE_URL||!SUPABASE_ANON_KEY)return null;const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:SUPABASE_ANON_KEY,Authorization:`Bearer ${access}`}});if(!r.ok)return null;return await r.json();}
app.post('/api/auth/signup',async(req:Request,res:Response)=>{try{if(!SUPABASE_URL||!SUPABASE_ANON_KEY){res.status(503).json({error:'Cloud account chưa được cấu hình.'});return;}const {email,password,name}=req.body;if(!validAuthEmail(email)||typeof password!=='string'||password.length<8||password.length>128){res.status(400).json({error:'Email hợp lệ và mật khẩu từ 8 đến 128 ký tự là bắt buộc.'});return;}const r=await fetch(`${SUPABASE_URL}/auth/v1/signup`,{method:'POST',headers:{apikey:SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password,data:{name:typeof name==='string'?name.slice(0,80):undefined}})});const d=await r.json();if(!r.ok){res.status(r.status).json({error:d.msg||d.message||'Đăng ký thất bại.'});return;}if(d.access_token&&d.refresh_token)setAuthCookies(res,d.access_token,d.refresh_token);if(d.user?.id)await ensureFreeSubscription(d.user.id);res.json({user:d.user?{id:d.user.id,email:d.user.email,name:d.user.user_metadata?.name}:null,requiresEmailConfirmation:!d.access_token});}catch{res.status(500).json({error:'Đăng ký thất bại.'});}});
app.post('/api/auth/login',async(req:Request,res:Response)=>{try{if(!SUPABASE_URL||!SUPABASE_ANON_KEY){res.status(503).json({error:'Cloud account chưa được cấu hình.'});return;}const {email,password}=req.body;if(!validAuthEmail(email)||typeof password!=='string'||password.length<8||password.length>128){res.status(400).json({error:'Email hợp lệ và mật khẩu từ 8 đến 128 ký tự là bắt buộc.'});return;}const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})});const d=await r.json();if(!r.ok){res.status(401).json({error:d.error_description||d.msg||'Email hoặc mật khẩu không đúng.'});return;}setAuthCookies(res,d.access_token,d.refresh_token);await ensureFreeSubscription(d.user.id);res.json({user:{id:d.user.id,email:d.user.email,name:d.user.user_metadata?.name}});}catch{res.status(500).json({error:'Đăng nhập thất bại.'});}});
app.post('/api/auth/refresh',async(req:Request,res:Response)=>{try{if(!SUPABASE_URL||!SUPABASE_ANON_KEY){res.status(503).json({error:'Cloud account chưa được cấu hình.'});return;}const refresh=getCookie(req,'lina_refresh');if(!refresh){res.status(401).json({error:'No refresh session'});return;}const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:refresh})});const d=await r.json();if(!r.ok){clearAuthCookies(res);res.status(401).json({error:'Phiên đăng nhập đã hết hạn.'});return;}setAuthCookies(res,d.access_token,d.refresh_token);res.json({user:{id:d.user.id,email:d.user.email,name:d.user.user_metadata?.name}});}catch{res.status(401).json({error:'Không thể làm mới phiên đăng nhập.'});}});
app.get('/api/auth/me',async(req:Request,res:Response)=>{const user=await supabaseUser(getCookie(req,'lina_access'));if(!user){res.status(401).json({user:null});return;}res.json({user:{id:user.id,email:user.email,name:user.user_metadata?.name}});});
app.post('/api/auth/logout',async(req:Request,res:Response)=>{try{const access=getCookie(req,'lina_access');if(access&&SUPABASE_URL&&SUPABASE_ANON_KEY){await fetch(SUPABASE_URL+'/auth/v1/logout',{method:'POST',headers:{apikey:SUPABASE_ANON_KEY,Authorization:`Bearer ${access}`}}).catch(()=>{});}clearAuthCookies(res);res.setHeader('Cache-Control','no-store');res.json({ok:true});}catch{clearAuthCookies(res);res.status(200).json({ok:true});}});
async function requireSyncUser(req:Request){return await supabaseUser(getCookie(req,'lina_access'));}


// Prompt 21-23 privacy API. Identity is always derived from the authenticated session.
const privacyTable='lina_privacy_preferences';
async function privacyFetch(userId:string){
  if(!SUPABASE_URL||!SUPABASE_SERVER_KEY)return DEFAULT_PRIVACY_PREFERENCES;
  const url=new URL(SUPABASE_URL+'/rest/v1/'+privacyTable);url.searchParams.set('select','ai_memory_enabled,conversation_history_enabled,analytics_enabled,voice_data_enabled,personalization_enabled');url.searchParams.set('user_id','eq.'+userId);url.searchParams.set('limit','1');
  const r=await fetch(url,{headers:{apikey:SUPABASE_SERVER_KEY,Authorization:'Bearer '+SUPABASE_SERVER_KEY}});if(!r.ok)return DEFAULT_PRIVACY_PREFERENCES;const row=(await r.json())[0];return row?normalizePrivacyPreferences({aiMemoryEnabled:row.ai_memory_enabled,conversationHistoryEnabled:row.conversation_history_enabled,analyticsEnabled:row.analytics_enabled,voiceDataEnabled:row.voice_data_enabled,personalizationEnabled:row.personalization_enabled}):DEFAULT_PRIVACY_PREFERENCES;
}
app.get('/api/privacy/preferences',async(req,res)=>{try{const user=await requireSyncUser(req);if(!user)return res.status(401).json({error:'Unauthorized'});res.json({preferences:await privacyFetch(user.id)});}catch{res.status(503).json({error:'Privacy service unavailable'});}});
app.post('/api/privacy/preferences',async(req,res)=>{try{const user=await requireSyncUser(req);if(!user)return res.status(401).json({error:'Unauthorized'});if(!SUPABASE_URL||!SUPABASE_SERVER_KEY)return res.status(503).json({error:'Privacy database unavailable'});const p=normalizePrivacyPreferences(req.body?.preferences);const r=await fetch(SUPABASE_URL+'/rest/v1/'+privacyTable,{method:'POST',headers:{apikey:SUPABASE_SERVER_KEY,Authorization:'Bearer '+SUPABASE_SERVER_KEY,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:user.id,ai_memory_enabled:p.aiMemoryEnabled,conversation_history_enabled:p.conversationHistoryEnabled,analytics_enabled:p.analyticsEnabled,voice_data_enabled:p.voiceDataEnabled,personalization_enabled:p.personalizationEnabled,updated_at:new Date().toISOString()})});if(!r.ok)return res.status(503).json({error:'Could not save privacy preferences'});res.json({preferences:p});}catch{res.status(503).json({error:'Privacy service unavailable'});}});

app.get('/api/privacy/export',async(req,res)=>{try{const user=await requireSyncUser(req);if(!user||!SUPABASE_URL||!SUPABASE_SERVER_KEY)return res.status(401).json({error:'Unauthorized'});const h={apikey:SUPABASE_SERVER_KEY,Authorization:'Bearer '+SUPABASE_SERVER_KEY};const syncUrl=new URL(SUPABASE_URL+'/rest/v1/lina_learning_sync_records');syncUrl.searchParams.set('select','record_key,payload,version,updated_at,device_id');syncUrl.searchParams.set('user_id','eq.'+user.id);const analyticsUrl=new URL(SUPABASE_URL+'/rest/v1/lina_analytics_events');analyticsUrl.searchParams.set('select','event_id,event_name,properties,occurred_at');analyticsUrl.searchParams.set('user_id','eq.'+user.id);analyticsUrl.searchParams.set('order','occurred_at.desc');analyticsUrl.searchParams.set('limit','5000');const subUrl=new URL(SUPABASE_URL+'/rest/v1/lina_subscriptions');subUrl.searchParams.set('select','plan,status,provider,current_period_start,current_period_end,cancel_at_period_end');subUrl.searchParams.set('user_id','eq.'+user.id);subUrl.searchParams.set('limit','1');const [a,b,c]=await Promise.all([fetch(syncUrl,{headers:h}),fetch(analyticsUrl,{headers:h}),fetch(subUrl,{headers:h})]);const sync=a.ok?await a.json():[];const analyticsRows=b.ok?await b.json():[];const subscription=c.ok?(await c.json())[0]||null:null;const safeSync=sync.map((x:any)=>({recordKey:x.record_key,data:x.payload,version:x.version,updatedAt:x.updated_at,deviceId:x.device_id}));res.setHeader('Content-Disposition','attachment; filename="lina-learning-export.json"');res.json({exportedAt:new Date().toISOString(),user:{id:user.id,email:user.email||null},profile:safeSync.find((x:any)=>x.recordKey==='profile')?.data||null,learningData:safeSync.filter((x:any)=>x.recordKey!=='profile'),analytics:analyticsRows,subscription});}catch{res.status(503).json({error:'Data export unavailable'});}});

app.post('/api/privacy/delete-learning-data',async(req,res)=>{try{const user=await requireSyncUser(req);if(!user||!SUPABASE_URL||!SUPABASE_SERVER_KEY)return res.status(401).json({error:'Unauthorized'});const h={apikey:SUPABASE_SERVER_KEY,Authorization:'Bearer '+SUPABASE_SERVER_KEY};const keys=['conversation','flashcards','structuredProgress','reviewSchedules','mistakes','structuredSavedVocabulary','aiMemory','motivation','learnerMemory'];const url=new URL(SUPABASE_URL+'/rest/v1/lina_learning_sync_records');url.searchParams.set('user_id','eq.'+user.id);url.searchParams.set('record_key','in.('+keys.join(',')+')');const d=await fetch(url,{method:'DELETE',headers:h});const analyticsUrl=new URL(SUPABASE_URL+'/rest/v1/lina_analytics_events');analyticsUrl.searchParams.set('user_id','eq.'+user.id);const ad=await fetch(analyticsUrl,{method:'DELETE',headers:h});if(!d.ok||!ad.ok)return res.status(503).json({error:'Learning data deletion incomplete'});res.json({ok:true});}catch{res.status(503).json({error:'Learning data deletion unavailable'});}});

app.post('/api/privacy/delete-account',async(req,res)=>{try{const user=await requireSyncUser(req);if(!user||!SUPABASE_URL||!SUPABASE_SERVER_KEY)return res.status(401).json({error:'Unauthorized'});if(String(req.body?.confirmation||'')!=='DELETE')return res.status(400).json({error:'Confirmation DELETE is required'});const r=await fetch(SUPABASE_URL+'/auth/v1/admin/users/'+encodeURIComponent(user.id),{method:'DELETE',headers:{apikey:SUPABASE_SERVER_KEY,Authorization:'Bearer '+SUPABASE_SERVER_KEY}});if(!r.ok)return res.status(503).json({error:'Account deletion unavailable'});clearAuthCookies(res);res.json({ok:true});}catch{res.status(503).json({error:'Account deletion unavailable'});}});


const subscriptionProvider = new GenericHmacPaymentProvider(
  process.env.PAYMENT_PROVIDER_NAME || 'generic',
  process.env.PAYMENT_WEBHOOK_SECRET || ''
);
const aiInputRate = Number(process.env.GEMINI_INPUT_COST_PER_MILLION || 0);
const aiOutputRate = Number(process.env.GEMINI_OUTPUT_COST_PER_MILLION || 0);

async function ensureFreeSubscription(userId: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVER_KEY || !userId) return;
  await fetch(SUPABASE_URL + '/rest/v1/lina_subscriptions?on_conflict=user_id', {
    method: 'POST',
    headers: { apikey: SUPABASE_SERVER_KEY, Authorization: 'Bearer ' + SUPABASE_SERVER_KEY, 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify({ user_id: userId, plan: 'FREE', status: 'active' })
  });
}

async function getSubscriptionRecord(userId: string): Promise<SubscriptionRecord | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVER_KEY || !userId) return null;
  const url = new URL(SUPABASE_URL + '/rest/v1/lina_subscriptions');
  url.searchParams.set('select', 'user_id,plan,status,provider,provider_customer_id,provider_subscription_id,trial_ends_at,current_period_start,current_period_end,cancel_at_period_end');
  url.searchParams.set('user_id', 'eq.' + userId);
  url.searchParams.set('limit', '1');
  const r = await fetch(url, { headers: { apikey: SUPABASE_SERVER_KEY, Authorization: 'Bearer ' + SUPABASE_SERVER_KEY } });
  if (!r.ok) throw new Error('Subscription lookup failed');
  const x = (await r.json())[0];
  return x ? {
    userId: x.user_id, plan: x.plan, status: x.status, provider: x.provider || null,
    providerCustomerId: x.provider_customer_id || null, providerSubscriptionId: x.provider_subscription_id || null,
    trialEndsAt: x.trial_ends_at || null, currentPeriodStart: x.current_period_start || null,
    currentPeriodEnd: x.current_period_end || null, cancelAtPeriodEnd: Boolean(x.cancel_at_period_end)
  } : null;
}

async function getUsageSnapshot(userId: string) {
  const fallback = { dailyRequests: 0, monthlyMinutes: 0 };
  if (!SUPABASE_URL || !SUPABASE_SERVER_KEY) return fallback;
  const day = new Date().toISOString().slice(0, 10);
  const month = day.slice(0, 7) + '-01';
  const dayUrl = new URL(SUPABASE_URL + '/rest/v1/lina_usage_counters');
  dayUrl.searchParams.set('select', 'daily_requests,monthly_minutes');
  dayUrl.searchParams.set('user_id', 'eq.' + userId);
  dayUrl.searchParams.set('period_day', 'eq.' + day);
  const monthUrl = new URL(SUPABASE_URL + '/rest/v1/lina_usage_counters');
  monthUrl.searchParams.set('select', 'monthly_minutes');
  monthUrl.searchParams.set('user_id', 'eq.' + userId);
  monthUrl.searchParams.set('period_month', 'eq.' + month);
  monthUrl.searchParams.set('order', 'period_day.desc');
  monthUrl.searchParams.set('limit', '1');
  const headers = { apikey: SUPABASE_SERVER_KEY, Authorization: 'Bearer ' + SUPABASE_SERVER_KEY };
  const [d, m] = await Promise.all([fetch(dayUrl, { headers }), fetch(monthUrl, { headers })]);
  const dayRows = d.ok ? await d.json() : [];
  const monthRows = m.ok ? await m.json() : [];
  return {
    dailyRequests: Number(dayRows[0]?.daily_requests || 0),
    monthlyMinutes: Number(monthRows[0]?.monthly_minutes || 0)
  };
}

async function reserveAIQuota(userId: string, entitlements: Entitlements, requestedMinutes = 0) {
  if (!SUPABASE_URL || !SUPABASE_SERVER_KEY) throw new Error('Subscription database is not configured');
  const usage = await getUsageSnapshot(userId);
  const localDecision = checkQuota({
    ...entitlements,
    plan: entitlements.plan
  }, {
    ...usage, geminiRequests: 0, inputTokens: 0, outputTokens: 0, voiceMinutes: 0, ttsUsage: 0, sttUsage: 0, avatarUsage: 0
  }, requestedMinutes);
  if (!localDecision.allowed) return localDecision;
  const rpc = await fetch(SUPABASE_URL + '/rest/v1/rpc/lina_reserve_ai_quota', {
    method: 'POST',
    headers: { apikey: SUPABASE_SERVER_KEY, Authorization: 'Bearer ' + SUPABASE_SERVER_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      p_user_id: userId,
      p_daily_limit: entitlements.dailyRequests,
      p_monthly_minutes: entitlements.monthlyMinutes,
      p_requested_minutes: Math.max(0, requestedMinutes)
    })
  });
  if (!rpc.ok) throw new Error('Quota service unavailable');
  const result = await rpc.json();
  return result?.allowed ? { allowed: true as const } : { allowed: false as const, code: 'LIMIT_REACHED' as const, reason: String(result?.reason || 'QUOTA') };
}

async function requireAIEntitlement(req: Request, feature: 'ai' | 'voice' | 'advancedRoleplay' = 'ai', requestedMinutes = 0) {
  const user = await requireSyncUser(req);
  if (!user) return { error: 'UNAUTHORIZED', status: 401 as const };
  if (!SUPABASE_URL || !SUPABASE_SERVER_KEY) return { error: 'SUBSCRIPTION_UNAVAILABLE', status: 503 as const };
  await ensureFreeSubscription(user.id);
  const subscription = await getSubscriptionRecord(user.id);
  const entitlements = getEntitlements(subscription);
  if (feature === 'voice' && !entitlements.canUseVoice) return { error: 'ENTITLEMENT_REQUIRED', status: 403 as const, user, entitlements };
  if (feature === 'advancedRoleplay' && !entitlements.canUseAdvancedRoleplay) return { error: 'ENTITLEMENT_REQUIRED', status: 403 as const, user, entitlements };
  if (feature === 'ai' && !entitlements.canUseAI) return { error: 'ENTITLEMENT_REQUIRED', status: 403 as const, user, entitlements };
  const quota = await reserveAIQuota(user.id, entitlements, requestedMinutes);
  if (!quota.allowed) return { error: 'LIMIT_REACHED', status: 429 as const, user, entitlements, quota };
  return { user, entitlements };
}

async function recordAIUsage(userId: string, model: string, purpose: string, response: any, extra: Record<string, number> = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVER_KEY) return;
  const meta = response?.usageMetadata || {};
  const inputTokens = Number(meta.promptTokenCount || 0);
  const outputTokens = Number(meta.candidatesTokenCount || 0) + Number(meta.thoughtsTokenCount || 0);
  const record = buildAIUsageRecord({
    userId, model, purpose, inputTokens, outputTokens,
    estimatedCost: estimateTokenCost(inputTokens, outputTokens, { inputPerMillion: aiInputRate, outputPerMillion: aiOutputRate })
  });
  const row = { user_id: record.userId, model: record.model, purpose: record.purpose, estimated_cost: record.estimatedCost, input_tokens: record.inputTokens, output_tokens: record.outputTokens, voice_minutes: Number(extra.voiceMinutes || 0), tts_usage: Number(extra.ttsUsage || 0), stt_usage: Number(extra.sttUsage || 0), avatar_usage: Number(extra.avatarUsage || 0), occurred_at: record.timestamp };
  try {
    await fetch(SUPABASE_URL + '/rest/v1/lina_usage_events', {
      method: 'POST',
      headers: { apikey: SUPABASE_SERVER_KEY, Authorization: 'Bearer ' + SUPABASE_SERVER_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(row)
    });
  } catch (err) { console.error('[Lina][USAGE_RECORD_ERROR]', { name: (err as any)?.name || 'Error' }); }
}

app.get('/api/subscription/me', async (req, res) => {
  try {
    const user = await requireSyncUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    await ensureFreeSubscription(user.id);
    const subscription = await getSubscriptionRecord(user.id);
    const entitlements = getEntitlements(subscription);
    const usage = await getUsageSnapshot(user.id);
    res.json({ subscription, entitlements, usage });
  } catch (err) {
    console.error('[Lina][SUBSCRIPTION_ERROR]', { name: (err as any)?.name || 'Error' });
    res.status(503).json({ error: 'Subscription service unavailable' });
  }
});

app.post('/api/billing/checkout', async (req, res) => {
  try {
    const user = await requireSyncUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const plan = req.body?.plan === 'PRO' ? 'PRO' : req.body?.plan === 'PREMIUM' ? 'PREMIUM' : 'FREE';
    if (plan === 'FREE') return res.status(400).json({ error: 'Paid plan required' });
    const checkout = await subscriptionProvider.createCheckout({ userId: user.id, plan, email: user.email });
    res.json(checkout);
  } catch (err) {
    res.status(503).json({ error: 'Payment provider is not configured.' });
  }
});

app.post('/api/billing/webhook/:provider', async (req: Request, res: Response) => {
  const rawBody = String((req as any).rawBody || '');
  const signature = req.header('x-webhook-signature') || req.header('stripe-signature') || undefined;
  if (!subscriptionProvider.verifyWebhook(rawBody, signature)) return res.status(401).json({ error: 'Invalid webhook signature' });
  try {
    const payload = req.body || {};
    const eventId = String(payload.id || payload.eventId || '').slice(0, 200);
    const userId = String(payload.userId || payload.user_id || '').slice(0, 80);
    if (!eventId || !userId) return res.status(400).json({ error: 'Invalid webhook payload' });
    const plan: PlanId = payload.plan === 'PRO' ? 'PRO' : payload.plan === 'PREMIUM' ? 'PREMIUM' : 'FREE';
    const status: SubscriptionStatus = subscriptionProvider.mapSubscriptionStatus(String(payload.status || 'expired'));
    if (!SUPABASE_URL || !SUPABASE_SERVER_KEY) return res.status(503).json({ error: 'Billing database unavailable' });
    const safePayload = { id: eventId, userId, plan, status, provider: String(req.params.provider).slice(0, 50), providerCustomerId: payload.providerCustomerId || payload.customerId || null, providerSubscriptionId: payload.providerSubscriptionId || payload.subscriptionId || null, currentPeriodStart: payload.currentPeriodStart || null, currentPeriodEnd: payload.currentPeriodEnd || null, cancelAtPeriodEnd: Boolean(payload.cancelAtPeriodEnd) };
    const eventInsert = await fetch(SUPABASE_URL + '/rest/v1/lina_billing_webhook_events', { method: 'POST', headers: { apikey: SUPABASE_SERVER_KEY, Authorization: 'Bearer ' + SUPABASE_SERVER_KEY, 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: JSON.stringify({ event_id: eventId, provider: String(req.params.provider).slice(0, 50), payload: safePayload }) });
    if (!eventInsert.ok) return res.status(503).json({ error: 'Webhook event storage unavailable' });
    const update = await fetch(SUPABASE_URL + '/rest/v1/lina_subscriptions?user_id=eq.' + encodeURIComponent(userId), { method: 'PATCH', headers: { apikey: SUPABASE_SERVER_KEY, Authorization: 'Bearer ' + SUPABASE_SERVER_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ plan, status, provider: req.params.provider, provider_customer_id: safePayload.providerCustomerId, provider_subscription_id: safePayload.providerSubscriptionId, current_period_start: safePayload.currentPeriodStart, current_period_end: safePayload.currentPeriodEnd, cancel_at_period_end: safePayload.cancelAtPeriodEnd, updated_at: new Date().toISOString() }) });
    if (!update.ok) return res.status(503).json({ error: 'Subscription update failed' });
    await fetch(SUPABASE_URL + '/rest/v1/lina_billing_webhook_events?event_id=eq.' + encodeURIComponent(eventId), { method: 'PATCH', headers: { apikey: SUPABASE_SERVER_KEY, Authorization: 'Bearer ' + SUPABASE_SERVER_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ processed_at: new Date().toISOString(), status: 'processed' }) });
    res.json({ received: true });
  } catch (err) { console.error('[Lina][BILLING_WEBHOOK_ERROR]', { name: (err as any)?.name || 'Error' }); res.status(500).json({ error: 'Webhook processing failed' }); }
});

app.get('/api/admin/costs', async (req, res) => {
  try {
    if (!await requireAdmin(req)) return res.status(403).json({ error: 'Admin access required' });
    if (!SUPABASE_URL || !SUPABASE_SERVER_KEY) return res.status(503).json({ error: 'Usage database unavailable' });
    const days = Math.min(90, Math.max(1, Number(req.query.days) || 30));
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const url = new URL(SUPABASE_URL + '/rest/v1/lina_usage_events');
    url.searchParams.set('select', 'user_id,model,purpose,estimated_cost,input_tokens,output_tokens,voice_minutes,tts_usage,stt_usage,avatar_usage,occurred_at');
    url.searchParams.set('occurred_at', 'gte.' + since);
    url.searchParams.set('order', 'occurred_at.desc');
    url.searchParams.set('limit', '50000');
    const r = await fetch(url, { headers: { apikey: SUPABASE_SERVER_KEY, Authorization: 'Bearer ' + SUPABASE_SERVER_KEY } });
    if (!r.ok) throw new Error('Usage query failed');
    const rows = await r.json();
    const daily: Record<string, number> = {}, byUser: Record<string, number> = {}, byFeature: Record<string, number> = {}, byOperation: Record<string, number> = {};
    for (const x of rows) {
      const cost = Number(x.estimated_cost || 0);
      const day = String(x.occurred_at).slice(0, 10);
      daily[day] = (daily[day] || 0) + cost;
      byUser[x.user_id] = (byUser[x.user_id] || 0) + cost;
      byFeature[x.purpose] = (byFeature[x.purpose] || 0) + cost;
      const op = x.model + ':' + x.purpose;
      byOperation[op] = (byOperation[op] || 0) + cost;
    }
    const top = (map: Record<string, number>) => Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0,10).map(([key,cost]) => ({ key, cost: Number(cost.toFixed(8)) }));
    res.json({ days, dailyAICost: top(daily), monthlyAICost: Number(rows.reduce((s:number,x:any)=>s+Number(x.estimated_cost||0),0).toFixed(8)), costPerUser: top(byUser), costPerFeature: top(byFeature), topExpensiveOperations: top(byOperation), totals: { geminiRequests: rows.length, inputTokens: rows.reduce((s:number,x:any)=>s+Number(x.input_tokens||0),0), outputTokens: rows.reduce((s:number,x:any)=>s+Number(x.output_tokens||0),0), voiceMinutes: rows.reduce((s:number,x:any)=>s+Number(x.voice_minutes||0),0), ttsUsage: rows.reduce((s:number,x:any)=>s+Number(x.tts_usage||0),0), sttUsage: rows.reduce((s:number,x:any)=>s+Number(x.stt_usage||0),0), avatarUsage: rows.reduce((s:number,x:any)=>s+Number(x.avatar_usage||0),0) } });
  } catch (err) { console.error('[Lina][ADMIN_COST_ERROR]', { name: (err as any)?.name || 'Error' }); res.status(503).json({ error: 'Cost dashboard unavailable' }); }
});

app.get('/api/sync/pull',async(req:Request,res:Response)=>{try{const user=await requireSyncUser(req);if(!user||!SUPABASE_URL||!SUPABASE_SERVER_KEY){res.status(401).json({error:'Unauthorized'});return;}const url=new URL(`${SUPABASE_URL}/rest/v1/lina_learning_sync_records`);url.searchParams.set('select','record_key,payload,version,updated_at,device_id');url.searchParams.set('user_id',`eq.${user.id}`);const r=await fetch(url,{headers:{apikey:SUPABASE_SERVER_KEY,Authorization:`Bearer ${SUPABASE_SERVER_KEY}`}});if(!r.ok)throw new Error('DB pull failed');const rows=await r.json();res.json({records:rows.map((x:any)=>({key:x.record_key,data:x.payload,version:x.version,updatedAt:x.updated_at,deviceId:x.device_id})),serverTime:new Date().toISOString()});}catch{res.status(500).json({error:'Sync pull failed'});}});
app.post('/api/sync/push',async(req:Request,res:Response)=>{try{const user=await requireSyncUser(req);if(!user||!SUPABASE_URL||!SUPABASE_SERVER_KEY){res.status(401).json({error:'Unauthorized'});return;}const records=Array.isArray(req.body?.records)?req.body.records.slice(0,50):[];const accepted=[];const conflicts=[];for(const record of records){if(!record||typeof record.key!=='string'||typeof record.updatedAt!=='string')continue;const lookup=new URL(`${SUPABASE_URL}/rest/v1/lina_learning_sync_records`);lookup.searchParams.set('select','version,updated_at');lookup.searchParams.set('user_id',`eq.${user.id}`);lookup.searchParams.set('record_key',`eq.${record.key}`);const existingR=await fetch(lookup,{headers:{apikey:SUPABASE_SERVER_KEY,Authorization:`Bearer ${SUPABASE_SERVER_KEY}`}});const existing=existingR.ok?(await existingR.json())[0]:null;if(existing&&new Date(existing.updated_at).getTime()>new Date(record.updatedAt).getTime()){conflicts.push(record.key);continue;}const upsert=await fetch(`${SUPABASE_URL}/rest/v1/lina_learning_sync_records?on_conflict=user_id,record_key`,{method:'POST',headers:{apikey:SUPABASE_SERVER_KEY,Authorization:`Bearer ${SUPABASE_SERVER_KEY}`,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:user.id,record_key:record.key,payload:record.data,version:Math.max(Number(record.version)||1,Number(existing?.version||0)+1),updated_at:record.updatedAt,device_id:String(record.deviceId||'unknown').slice(0,100)})});if(upsert.ok)accepted.push(record.key);}res.json({accepted,conflicts,serverTime:new Date().toISOString()});}catch{res.status(500).json({error:'Sync push failed'});}});

// Prompt 19: all learner-facing Tutor AI calls pass through the orchestrator.
const tutorHintSchema = { type: Type.OBJECT, properties: { hint1_semantic:{type:Type.STRING}, hint2_keywords:{type:Type.STRING}, hint3_structure:{type:Type.STRING}, hint4_fullAnswer:{type:Type.STRING} }, required:['hint1_semantic','hint2_keywords','hint3_structure','hint4_fullAnswer'] };
const tutorExplainSchema = { type: Type.OBJECT, properties: { sentence:{type:Type.STRING}, pinyin:{type:Type.STRING}, meaningVi:{type:Type.STRING}, grammarBreakdown:{type:Type.ARRAY,items:{type:Type.OBJECT,properties:{part:{type:Type.STRING},role:{type:Type.STRING}}}}, culturalTipVi:{type:Type.STRING} }, required:['sentence','pinyin','meaningVi','grammarBreakdown'] };

function tutorFallbackHints(){return {hint1_semantic:'Hãy nói ý chính bằng tiếng Việt.',hint2_keywords:'我叫 (wǒ jiào), 名字 (míngzi)',hint3_structure:'我叫 + Tên',hint4_fullAnswer:'你好！我叫阿明。(Nǐ hǎo! Wǒ jiào Ā Míng.)'};}
function tutorFallbackExplain(sentence:string){return {sentence,pinyin:'',meaningVi:'',grammarBreakdown:[],culturalTipVi:''};}

app.post('/api/tutor/chat', async (req: Request,res: Response)=>{
  try{
    const {message,history=[],mode='conversation',hskLevel='HSK 1',userName='Bạn',userLevel='Cơ bản',topicTitle='Tự do',memoryFacts=[]}=req.body;
    if(typeof message!=='string'||!message.trim())return res.status(400).json({error:'Message string is required'});
    const access=await requireAIEntitlement(req,'ai');
    if('error' in access)return res.status(access.status).json({error:access.error,...(access.error==='LIMIT_REACHED'?{code:'LIMIT_REACHED'}:{})});
    const fallback=generateFallbackResponse(message,mode,userName);
    const result=await orchestrate({task:mode==='teacher'?'correction':'conversation',userId:access.user.id,learnerLevel:userLevel,hskLevel,input:message,context:'Topic: '+topicTitle+'; mode: '+mode+'; learner facts: '+(Array.isArray(memoryFacts)?memoryFacts.slice(-4).join('; '):''),history,schema:TUTOR_RESPONSE_SCHEMA,fallback,temperature:0.5,maxOutputTokens:1400});
    await recordAIUsage(access.user.id,result.model,result.purpose,result.raw||{});
    res.setHeader('X-Lina-Trace-Id',result.traceId);res.setHeader('X-Lina-Prompt-Version',result.promptVersion);res.json(result.value);
  }catch(err:any){if(err?.code==='AI_RATE_LIMITED')return res.status(429).json({error:'RATE_LIMITED',code:'RATE_LIMITED',traceId:err.traceId});console.error('[Lina][TUTOR_ORCHESTRATOR_ERROR]',{name:err?.name||'Error'});res.status(503).json({error:'Tutor temporarily unavailable'});}
});

app.post('/api/tutor/hints', async (req:Request,res:Response)=>{
  try{
    const {contextSentence='',topicTitle='Tự do',hskLevel='HSK 1',level=1}=req.body;
    const access=await requireAIEntitlement(req,'ai'); if('error' in access)return res.status(access.status).json({error:access.error,...(access.error==='LIMIT_REACHED'?{code:'LIMIT_REACHED'}:{})});
    const result=await orchestrate({task:'conversation',userId:access.user.id,learnerLevel:String(level),hskLevel,input:'Create progressive hints for: '+String(contextSentence).slice(0,1200),context:'Topic: '+String(topicTitle).slice(0,300),schema:tutorHintSchema,fallback:tutorFallbackHints(),temperature:0.3,maxOutputTokens:500});
    await recordAIUsage(access.user.id,result.model,'tutor_hints',result.raw||{});res.setHeader('X-Lina-Trace-Id',result.traceId);res.json(result.value);
  }catch(err:any){if(err?.code==='AI_RATE_LIMITED')return res.status(429).json({error:'RATE_LIMITED',code:'RATE_LIMITED'});res.json(tutorFallbackHints());}
});

app.post('/api/tutor/explain', async (req:Request,res:Response)=>{
  try{
    const {sentence,hskLevel='HSK 1'}=req.body;
    if(typeof sentence!=='string'||!sentence.trim())return res.status(400).json({error:'Sentence is required'});
    const access=await requireAIEntitlement(req,'ai');if('error' in access)return res.status(access.status).json({error:access.error,...(access.error==='LIMIT_REACHED'?{code:'LIMIT_REACHED'}:{})});
    const result=await orchestrate({task:'grammar',userId:access.user.id,learnerLevel:hskLevel,hskLevel,input:sentence.slice(0,2000),schema:tutorExplainSchema,fallback:tutorFallbackExplain(sentence),temperature:0.2,maxOutputTokens:900});
    await recordAIUsage(access.user.id,result.model,'tutor_explain',result.raw||{});res.setHeader('X-Lina-Trace-Id',result.traceId);res.json(result.value);
  }catch(err:any){if(err?.code==='AI_RATE_LIMITED')return res.status(429).json({error:'RATE_LIMITED',code:'RATE_LIMITED'});res.status(503).json({error:'Explanation temporarily unavailable'});}
});

app.post('/api/tutor/chat/stream', async (req:Request,res:Response)=>{
  try{
    const {message,history=[],mode='conversation',hskLevel='HSK 1',userName='Bạn',userLevel='Cơ bản',topicTitle='Tự do',memoryFacts=[]}=req.body;
    if(typeof message!=='string'||!message.trim())return res.status(400).json({error:'Message string is required'});
    const access=await requireAIEntitlement(req,'ai');if('error' in access)return res.status(access.status).json({error:access.error,...(access.error==='LIMIT_REACHED'?{code:'LIMIT_REACHED'}:{})});
    res.setHeader('Content-Type','text/event-stream; charset=utf-8');res.setHeader('Cache-Control','no-cache, no-transform');res.setHeader('Connection','keep-alive');res.flushHeaders?.();
    const send=(payload:Record<string,unknown>)=>{if(!res.writableEnded)res.write('data: '+JSON.stringify(payload)+'\\n\\n');};
    const result=await orchestrate({task:mode==='teacher'?'correction':'conversation',userId:access.user.id,learnerLevel:userLevel,hskLevel,input:message,context:'Topic: '+topicTitle+'; mode: '+mode+'; learner facts: '+(Array.isArray(memoryFacts)?memoryFacts.slice(-4).join('; '):''),history,schema:TUTOR_RESPONSE_SCHEMA,fallback:generateFallbackResponse(message,mode,userName),temperature:0.5,maxOutputTokens:1400});
    await recordAIUsage(access.user.id,result.model,'tutor_chat_stream',result.raw||{});send({type:'response',response:result.value,traceId:result.traceId,promptVersion:result.promptVersion});send({type:'done'});res.end();
  }catch(err:any){if(!res.headersSent)return res.status(err?.code==='AI_RATE_LIMITED'?429:503).json({error:err?.code==='AI_RATE_LIMITED'?'RATE_LIMITED':'Streaming tutor unavailable',...(err?.traceId?{traceId:err.traceId}:{})});try{res.end();}catch{}}
});

const ANALYTICS_EVENT_NAMES=new Set(['app_open','lesson_start','lesson_complete','vocabulary_review','vocabulary_mastered','mistake','correction','speaking_start','speaking_complete','roleplay_start','roleplay_complete','pronunciation_practice','quiz_answer','quiz_complete','subscription_start','subscription_cancel']);
const ANALYTICS_BLOCKED_KEYS=new Set(['email','name','userName','displayName','rawAudio','audioBase64','audio','transcript','message','originalSentence','correctedSentence']);
const sanitizeAnalyticsProperties=(input:any)=>{const out:any={};if(!input||typeof input!=='object')return out;for(const [k,v] of Object.entries(input)){if(ANALYTICS_BLOCKED_KEYS.has(k))continue;if(typeof v==='string')out[k]=v.slice(0,120);else if(typeof v==='number'&&Number.isFinite(v))out[k]=v;else if(typeof v==='boolean')out[k]=v;}return out;};
app.post('/api/analytics/events',async(req,res)=>{try{const raw=Array.isArray(req.body?.events)?req.body.events.slice(0,50):[];if(!raw.length)return res.status(204).end();if(!SUPABASE_URL||!SUPABASE_SERVER_KEY)return res.status(202).json({accepted:0,queued:false});const user=await requireSyncUser(req);const rows=raw.map((e:any)=>({event_id:String(e.eventId||'').slice(0,100),user_id:user?.id||null,anonymous_id:String(e.anonymousId||'').slice(0,100),session_id:String(e.sessionId||'').slice(0,100),event_name:String(e.eventName||''),properties:sanitizeAnalyticsProperties(e.properties),occurred_at:new Date(e.occurredAt||Date.now()).toISOString()})).filter((e:any)=>e.event_id&&e.anonymous_id&&e.session_id&&ANALYTICS_EVENT_NAMES.has(e.event_name));if(!rows.length)return res.status(400).json({error:'No valid analytics events'});const r=await fetch(SUPABASE_URL+'/rest/v1/lina_analytics_events',{method:'POST',headers:{apikey:SUPABASE_SERVER_KEY,Authorization:'Bearer '+SUPABASE_SERVER_KEY,'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(rows)});if(!r.ok){console.error('[Lina][ANALYTICS_ERROR]',{status:r.status});return res.status(503).json({error:'Analytics provider unavailable'});}res.status(202).json({accepted:rows.length});}catch(err){console.error('[Lina][ANALYTICS_ERROR]',{name:(err as any)?.name||'Error'});res.status(503).json({error:'Analytics unavailable'});}});
app.get('/api/admin/analytics',async(req,res)=>{try{if(!await requireAdmin(req))return res.status(403).json({error:'Admin access required'});const days=Math.min(90,Math.max(7,Number(req.query.days)||30));if(!SUPABASE_URL||!SUPABASE_SERVER_KEY)return res.status(503).json({error:'Analytics database chưa được cấu hình.'});const since=new Date(Date.now()-days*86400000).toISOString();const url=new URL(SUPABASE_URL+'/rest/v1/lina_analytics_events');url.searchParams.set('select','event_id,user_id,anonymous_id,session_id,event_name,properties,occurred_at');url.searchParams.set('occurred_at','gte.'+since);url.searchParams.set('order','occurred_at.asc');url.searchParams.set('limit','20000');const r=await fetch(url,{headers:{apikey:SUPABASE_SERVER_KEY,Authorization:'Bearer '+SUPABASE_SERVER_KEY}});if(!r.ok)throw new Error('Analytics query failed');const rows=await r.json();const identity=(x:any)=>x.user_id||x.anonymous_id;const active=(windowDays:number)=>{const cutoff=Date.now()-windowDays*86400000;return new Set(rows.filter((x:any)=>new Date(x.occurred_at).getTime()>=cutoff).map(identity)).size;};const dau=active(1),wau=active(7),mau=active(30);const appOpens=rows.filter((x:any)=>x.event_name==='app_open');const first=new Map<string,number>();for(const e of appOpens){const id=identity(e),t=new Date(e.occurred_at).getTime();if(!first.has(id)||t<first.get(id)!)first.set(id,t);}const newUsers=[...first.entries()].filter(([,t])=>t>=new Date(since).getTime());const retained=(offset:number)=>{if(!newUsers.length)return 0;let kept=0;for(const [id,t] of newUsers){if(rows.some((e:any)=>identity(e)===id&&e.event_name==='app_open'&&new Date(e.occurred_at).getTime()>=t+offset*86400000))kept++;}return Math.round(kept/newUsers.length*100);};const starts=rows.filter((x:any)=>x.event_name==='lesson_start').length,completes=rows.filter((x:any)=>x.event_name==='lesson_complete').length;const lessons:any={};for(const e of rows.filter((x:any)=>x.event_name==='lesson_start')){const id=String(e.properties?.lessonId||'unknown');lessons[id]=(lessons[id]||0)+1;}const popularLessons=Object.entries(lessons).sort((a:any,b:any)=>b[1]-a[1]).slice(0,8).map(([id,count]:any)=>({id,label:id,count}));const dropOffPoints=popularLessons.map(x=>({point:x.label,count:Math.max(0,x.count-rows.filter((e:any)=>e.event_name==='lesson_complete'&&e.properties?.lessonId===x.id).length)})).sort((a,b)=>b.count-a.count).slice(0,8);const aiUsage=rows.filter((e:any)=>e.properties?.ai===true).length;const voiceUsage=rows.filter((e:any)=>['speaking_start','speaking_complete','roleplay_start','roleplay_complete','pronunciation_practice'].includes(e.event_name)).length;const cost=rows.reduce((sum:number,e:any)=>sum+(typeof e.properties?.costUsd==='number'?e.properties.costUsd:0),0);const subs=rows.filter((e:any)=>e.event_name==='subscription_start').length,cancels=rows.filter((e:any)=>e.event_name==='subscription_cancel').length;const activeUsers=Math.max(1,mau);res.json({rangeDays:days,dau,wau,mau,newUsers:newUsers.length,retentionD1:retained(1),retentionD7:retained(7),lessonCompletion:starts?Math.round(completes/starts*100):0,popularLessons,dropOffPoints,aiUsage,voiceUsage,costPerActiveUser:Number((cost/activeUsers).toFixed(4)),subscriptionConversion:newUsers.length?Math.round(subs/newUsers.length*100):0,churn:subs?Math.round(cancels/subs*100):0,events:rows.length});}catch(err){console.error('[Lina][ADMIN_ANALYTICS_ERROR]',{name:(err as any)?.name||'Error'});res.status(503).json({error:'Không thể tải analytics.'});}});

const ADMIN_EMAILS=new Set((process.env.LINA_ADMIN_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean));async function requireAdmin(req:Request){const u=await requireSyncUser(req);return u&&ADMIN_EMAILS.has(String(u.email||'').toLowerCase())?u:null}async function cmsRows(){const r=await fetch(SUPABASE_URL+'/rest/v1/lina_cms_content?select=id,type,slug,title,status,payload,content_version,updated_by,updated_at,created_at&order=updated_at.desc',{headers:{apikey:SUPABASE_SERVER_KEY,Authorization:'Bearer '+SUPABASE_SERVER_KEY}});if(!r.ok)throw new Error('CMS database unavailable');return await r.json()}app.get('/api/admin/me',async(req,res)=>{const u=await requireAdmin(req);if(!u)return res.status(403).json({admin:false});res.json({admin:true,user:{id:u.id,email:u.email}})});app.get('/api/admin/content',async(req,res)=>{try{if(!await requireAdmin(req))return res.status(403).json({error:'Admin access required'});let rows=await cmsRows();if(typeof req.query.type==='string')rows=rows.filter((x:any)=>x.type===req.query.type);if(typeof req.query.status==='string')rows=rows.filter((x:any)=>x.status===req.query.status);res.json({items:rows.map((x:any)=>({id:x.id,type:x.type,slug:x.slug,title:x.title,status:x.status,data:x.payload,contentVersion:x.content_version,updatedBy:x.updated_by,updatedAt:x.updated_at,createdAt:x.created_at}))})}catch(e){res.status(503).json({error:e instanceof Error?e.message:'CMS unavailable'})}});
app.put('/api/admin/content',async(req:Request,res:Response)=>{try{const u=await requireAdmin(req);if(!u)return res.status(403).json({error:'Admin access required'});const x=req.body||{},rows=await cmsRows(),old=rows.find((r:any)=>r.id===x.id);if(!old)return res.status(404).json({error:'Not found'});const v=Number(old.content_version)+1,now=new Date().toISOString();await fetch(SUPABASE_URL+'/rest/v1/lina_cms_content_versions',{method:'POST',headers:{apikey:SUPABASE_SERVER_KEY,Authorization:'Bearer '+SUPABASE_SERVER_KEY,'Content-Type':'application/json'},body:JSON.stringify({content_id:x.id,version:old.content_version,payload:old.payload,status:old.status,saved_by:u.email,saved_at:old.updated_at})});const r=await fetch(SUPABASE_URL+'/rest/v1/lina_cms_content?id=eq.'+encodeURIComponent(x.id),{method:'PATCH',headers:{apikey:SUPABASE_SERVER_KEY,Authorization:'Bearer '+SUPABASE_SERVER_KEY,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({type:x.type,slug:x.slug,title:x.title,status:x.status,payload:x.data||{},content_version:v,updated_by:u.email,updated_at:now})});if(!r.ok)return res.status(400).json({error:await r.text()});const a=(await r.json())[0];res.json({item:{id:a.id,type:a.type,slug:a.slug,title:a.title,status:a.status,data:a.payload,contentVersion:a.content_version,updatedBy:a.updated_by,updatedAt:a.updated_at,createdAt:a.created_at}})}catch(e){res.status(500).json({error:e instanceof Error?e.message:'Update failed'})}});
app.post('/api/admin/content/:id/rollback',async(req:Request,res:Response)=>{try{const u=await requireAdmin(req);if(!u)return res.status(403).json({error:'Admin access required'});const v=Number(req.body?.version);const r=await fetch(SUPABASE_URL+'/rest/v1/lina_cms_content_versions?content_id=eq.'+encodeURIComponent(req.params.id)+'&version=eq.'+v+'&select=*',{headers:{apikey:SUPABASE_SERVER_KEY,Authorization:'Bearer '+SUPABASE_SERVER_KEY}}),rows=await r.json();if(!rows[0])return res.status(404).json({error:'Version not found'});const now=new Date().toISOString(),p=await fetch(SUPABASE_URL+'/rest/v1/lina_cms_content?id=eq.'+encodeURIComponent(req.params.id),{method:'PATCH',headers:{apikey:SUPABASE_SERVER_KEY,Authorization:'Bearer '+SUPABASE_SERVER_KEY,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({payload:rows[0].payload,status:'draft',content_version:v+1,updated_by:u.email,updated_at:now})}),a=(await p.json())[0];res.json({item:{id:a.id,type:a.type,slug:a.slug,title:a.title,status:a.status,data:a.payload,contentVersion:a.content_version,updatedBy:a.updated_by,updatedAt:a.updated_at,createdAt:a.created_at}})}catch(e){res.status(500).json({error:e instanceof Error?e.message:'Rollback failed'})}});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(apiKey), model: 'gemini-3.8-flash' });
});

// 4. API: Studio Quality Text-to-Speech using Gemini TTS
app.post('/api/tts/speak', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    const aiAccess = await requireAIEntitlement(req, 'voice', Math.max(0.1, Math.min(5, text && typeof text === 'string' ? text.length / 600 : 0.1)));
    if ('error' in aiAccess) { res.status(aiAccess.status).json({ error: aiAccess.error, ...(aiAccess.error === 'LIMIT_REACHED' ? { code: 'LIMIT_REACHED' } : {}) }); return; }
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text string is required' });
      return;
    }

    if (!ai) {
      res.status(503).json({ error: 'Gemini API key not configured, fallback to client speech synthesis' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: 'Clear, gentle, and standard Mandarin Chinese tutor pronunciation for language learners',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      await recordAIUsage(aiAccess.user.id, 'gemini-3.8-flash-lite-tts', 'tts', response, { ttsUsage: 1, voiceMinutes: Math.max(0.1, Math.min(5, text.length / 600)) });
      res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
      });
    } else {
      res.status(500).json({ error: 'No audio generated by model' });
    }
  } catch (err: any) {
    console.error('Error in /api/tts/speak:', err);
    res.status(500).json({ error: 'TTS generation failed' });
  }
});

// 5. API: Speech-to-Text Transcription via Gemini Transcribe
app.post('/api/tts/elevenlabs/stream', async (req: Request, res: Response) => {
  const aiAccess = await requireAIEntitlement(req, 'voice', 1);
  if ('error' in aiAccess) { res.status(aiAccess.status).json({ error: aiAccess.error, ...(aiAccess.error === 'LIMIT_REACHED' ? { code: 'LIMIT_REACHED' } : {}) }); return; }
  const apiKey = process.env.ELEVENLABS_API_KEY || '';
  const voiceId = process.env.ELEVENLABS_VOICE_ID || '';
  const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5';
  const outputFormat = process.env.ELEVENLABS_OUTPUT_FORMAT || 'mp3_44100_128';
  try {
    const { text, lang = 'zh-CN', rate = 1 } = req.body;
    if (!apiKey || !voiceId) { res.status(503).json({ error: 'ElevenLabs streaming TTS is not configured.' }); return; }
    if (typeof text !== 'string' || !text.trim() || text.length > 1000) { res.status(400).json({ error: 'TTS text is required and must be <= 1000 characters.' }); return; }
    const safeRate = typeof rate === 'number' && rate >= 0.7 && rate <= 1.2 ? rate : 1;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream`);
    url.searchParams.set('output_format', outputFormat);
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({
        text: text.trim(),
        model_id: modelId,
        language_code: lang === 'zh-CN' ? 'zh' : undefined,
        voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: safeRate }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!upstream.ok || !upstream.body) {
      console.error('[Lina][ELEVENLABS_TTS_ERROR]', { status: upstream.status });
      res.status(502).json({ error: 'Streaming TTS provider unavailable.' });
      return;
    }
    await recordAIUsage(aiAccess.user.id, 'elevenlabs:' + modelId, 'tts_external', { usageMetadata: {} }, { ttsUsage: 1, voiceMinutes: 1 });
    res.status(200);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Transfer-Encoding', 'chunked');
    const reader = upstream.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done || res.writableEnded) break;
        if (value?.byteLength) res.write(Buffer.from(value));
      }
    } finally {
      try { reader.releaseLock(); } catch {}
      if (!res.writableEnded) res.end();
    }
  } catch (err: any) {
    console.error('[Lina][ELEVENLABS_TTS_ERROR]', { name: err?.name || 'Error' });
    if (!res.headersSent) res.status(502).json({ error: 'Streaming TTS provider unavailable.' });
    else if (!res.writableEnded) res.end();
  }
});

app.post('/api/stt/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    const aiAccess = await requireAIEntitlement(req, 'voice', 1);
    if ('error' in aiAccess) { res.status(aiAccess.status).json({ error: aiAccess.error, ...(aiAccess.error === 'LIMIT_REACHED' ? { code: 'LIMIT_REACHED' } : {}) }); return; }
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      res.status(400).json({ error: 'Audio base64 string is required' });
      return;
    }

    if (!ai) {
      res.status(503).json({ error: 'Gemini API not configured' });
      return;
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: 'Transcribe this spoken Mandarin Chinese audio into simplified Chinese characters. Output only the Chinese transcript.' },
        ],
      },
    });

    const transcript = response.text?.trim() || '';
    await recordAIUsage(aiAccess.user.id, 'gemini-3.5-transcribe', 'stt', response, { sttUsage: 1, voiceMinutes: 1 });
    res.json({ transcript });
  } catch (err: any) {
    console.error('Error in /api/stt/transcribe:', err);
    res.status(500).json({ error: 'Audio transcription failed' });
  }
});

// Mount Vite or static server
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lina AI Chinese server listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
