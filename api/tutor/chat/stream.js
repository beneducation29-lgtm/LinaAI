import { GoogleGenAI, Type } from '@google/genai';
import { orchestrate } from '../../../src/services/aiOrchestrator.ts';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const schema = {
  type: Type.OBJECT,
  properties: {
    chinese: { type: Type.STRING },
    pinyin: { type: Type.STRING },
    vietnamese: { type: Type.STRING },
    responseType: { type: Type.STRING },
    emotion: { type: Type.STRING },
    correction: { type: Type.OBJECT, nullable: true, properties: {
      hasMistake:{type:Type.BOOLEAN}, originalSentence:{type:Type.STRING}, correctedSentence:{type:Type.STRING},
      pinyin:{type:Type.STRING}, explanationVi:{type:Type.STRING}, tryAgainPromptVi:{type:Type.STRING}
    }},
    vocabulary: { type: Type.ARRAY, items:{type:Type.OBJECT,properties:{
      hanzi:{type:Type.STRING},pinyin:{type:Type.STRING},vietnamese:{type:Type.STRING},
      partOfSpeech:{type:Type.STRING},exampleSentence:{type:Type.STRING},hskLevel:{type:Type.STRING}
    }}},
    grammar: { type: Type.ARRAY, items:{type:Type.OBJECT,properties:{
      structure:{type:Type.STRING},meaningVi:{type:Type.STRING},exampleSentence:{type:Type.STRING},
      examplePinyin:{type:Type.STRING},exampleVietnamese:{type:Type.STRING}
    }}},
    progressiveHints:{type:Type.OBJECT,properties:{
      hint1_semantic:{type:Type.STRING},hint2_keywords:{type:Type.STRING},
      hint3_structure:{type:Type.STRING},hint4_fullAnswer:{type:Type.STRING}
    }},
    suggestedReplies:{type:Type.ARRAY,items:{type:Type.OBJECT,properties:{
      hanzi:{type:Type.STRING},pinyin:{type:Type.STRING},vietnamese:{type:Type.STRING}
    }}},
    memoryUpdate:{type:Type.OBJECT,nullable:true,properties:{learnedFact:{type:Type.STRING},topicContext:{type:Type.STRING}}}
  },
  required:['chinese','pinyin','vietnamese','responseType','suggestedReplies']
};

function cookies(req){
  const raw=String(req.headers.cookie||'');
  const out={};
  for(const part of raw.split(';')){
    const i=part.indexOf('=');
    if(i<0) continue;
    const k=part.slice(0,i).trim();
    try{out[k]=decodeURIComponent(part.slice(i+1));}catch{out[k]=part.slice(i+1);}
  }
  return out;
}

async function getUser(req){
  const token=cookies(req).lina_access;
  if(!token||!SUPABASE_URL||!SUPABASE_KEY) return null;
  const r=await fetch(SUPABASE_URL+'/auth/v1/user',{headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+token}});
  if(!r.ok) return null;
  return await r.json();
}

function fallback(message,userName='Bạn'){
  return {
    chinese:'听起来很有意思！你能再多说一点吗？',
    pinyin:'Tīng qǐlái hěn yǒuyìsi! Nǐ néng zài duō shuō yìdiǎn ma?',
    vietnamese:'Nghe thú vị đấy! Bạn có thể nói thêm một chút không?',
    responseType:'conversation', emotion:'encouraging', correction:null, vocabulary:[], grammar:[],
    progressiveHints:{
      hint1_semantic:'Hãy nói thêm một ý về chủ đề bạn vừa nói.',
      hint2_keywords:'我觉得 (wǒ juéde), 因为 (yīnwèi), 很 (hěn)',
      hint3_structure:'我觉得 + ý kiến + 因为 + lý do',
      hint4_fullAnswer:'我觉得很有意思，因为我喜欢学习中文。'
    },
    suggestedReplies:[
      {hanzi:'我觉得很有意思。',pinyin:'Wǒ juéde hěn yǒuyìsi.',vietnamese:'Mình thấy rất thú vị.'},
      {hanzi:'我想继续练习中文。',pinyin:'Wǒ xiǎng jìxù liànxí Zhōngwén.',vietnamese:'Mình muốn tiếp tục luyện tiếng Trung.'},
      {hanzi:'你可以问我一个问题。',pinyin:'Nǐ kěyǐ wèn wǒ yí ge wèntí.',vietnamese:'Bạn có thể hỏi mình một câu.'}
    ],
    memoryUpdate:null
  };
}

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method Not Allowed'});
  try{
    const user=await getUser(req);
    if(!user) return res.status(401).json({error:'Unauthorized'});
    const body=req.body||{};
    const message=typeof body.message==='string'?body.message.trim():'';
    if(!message) return res.status(400).json({error:'Message string is required'});

    if(GEMINI_API_KEY){
      (globalThis).__linaGemini ||= new GoogleGenAI({
        apiKey:GEMINI_API_KEY,
        httpOptions:{headers:{'User-Agent':'aistudio-build'}}
      });
    }

    const mode=body.mode==='teacher'?'teacher':'conversation';
    const hskLevel=typeof body.hskLevel==='string'?body.hskLevel:'HSK 1';
    const userLevel=typeof body.userLevel==='string'?body.userLevel:'Cơ bản';
    const userName=typeof body.userName==='string'&&body.userName.trim()?body.userName.trim():'Bạn';
    const history=Array.isArray(body.history)?body.history.slice(-8):[];
    const memoryFacts=Array.isArray(body.memoryFacts)?body.memoryFacts.slice(-12):[];
    const topicTitle=typeof body.topicTitle==='string'?body.topicTitle:'Tự do';

    const result=await orchestrate({
      task:mode==='teacher'?'correction':'conversation',
      userId:String(user.id),
      learnerLevel:userLevel,
      hskLevel,
      input:message,
      context:'Topic: '+topicTitle+'; mode: '+mode+'; learner facts: '+memoryFacts.join('; '),
      history,
      schema,
      fallback:fallback(message,userName),
      temperature:0.5,
      maxOutputTokens:1400
    });

    res.setHeader('Content-Type','text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control','no-cache, no-transform');
    res.setHeader('Connection','keep-alive');
    res.flushHeaders?.();

    const send=(payload)=>{if(!res.writableEnded)res.write('data: '+JSON.stringify(payload)+'\\n\\n');};
    send({type:'response',response:result.value,traceId:result.traceId,promptVersion:result.promptVersion});
    send({type:'done'});
    res.end();
  }catch(err){
    console.error('[Lina][TUTOR_STREAM_ERROR]',{name:err?.name||'Error',message:err?.message||'unknown'});
    if(!res.headersSent) return res.status(err?.code==='AI_RATE_LIMITED'?429:503).json({error:err?.code==='AI_RATE_LIMITED'?'RATE_LIMITED':'Streaming tutor unavailable'});
    if(!res.writableEnded) res.end();
  }
}
