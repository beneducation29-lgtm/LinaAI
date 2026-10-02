const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const jsonSchema = {
  type:'object',
  required:['id','title','description','hskLevel','level','objectives','vocabulary','grammar','dialogue','listening','speaking','reading','writing','roleplay','quiz','review','estimatedMinutes','lessonType'],
  properties:{
    id:{type:'string'}, title:{type:'string'}, description:{type:'string'}, hskLevel:{type:'string',enum:['HSK 1','HSK 2','HSK 3','HSK 4','HSK 5','HSK 6']},
    level:{type:'string'}, objectives:{type:'array',items:{type:'string'}},
    vocabulary:{type:'array',items:{type:'object',required:['id','hanzi','pinyin','pinyinNumbered','vietnamese','partOfSpeech','exampleChinese','examplePinyin','exampleVietnamese','hskLevel','category','difficulty'],properties:{id:{type:'string'},hanzi:{type:'string'},pinyin:{type:'string'},pinyinNumbered:{type:'string'},vietnamese:{type:'string'},partOfSpeech:{type:'string'},exampleChinese:{type:'string'},examplePinyin:{type:'string'},exampleVietnamese:{type:'string'},hskLevel:{type:'string'},category:{type:'string'},difficulty:{type:'integer'}}}},
    grammar:{type:'array',items:{type:'object'}}, dialogue:{type:'array',items:{type:'object'}}, listening:{type:'array',items:{type:'object'}}, speaking:{type:'array',items:{type:'object'}}, reading:{type:'array',items:{type:'object'}}, writing:{type:'array',items:{type:'object'}}, roleplay:{type:'array',items:{type:'object'}}, quiz:{type:'array',items:{type:'object'}}, review:{type:'array',items:{type:'object'}},
    estimatedMinutes:{type:'integer'}, lessonType:{type:'string'}
  }
};

const promptFor = (p) => `You are Lina AI's Chinese Lesson Engine. Return ONLY one JSON object matching the requested lesson schema. Never return markdown, prose outside JSON, or code fences.
Rules:
1. Use only the requested hskLevel; never invent or upgrade an HSK label.
2. If hskLevel is HSK 1, vocabulary must use only the supplied targetVocabulary terms and their supplied verified records. Do not invent HSK 1 vocabulary records.
3. Every Chinese sentence needs Chinese, Pinyin, and Vietnamese. Keep vocabulary consistent across all sections.
4. Quiz questions must contain question, options when relevant, answer, explanation, difficulty, skill, relatedVocabulary and relatedGrammar.
5. For a micro lesson of 5-10 minutes, keep content small and focused.
6. Personalize from learnerWeaknesses and goal without creating a second content system.
7. For HSK 1, only use vocabulary from verifiedVocabulary supplied in Parameters; copy its Chinese, Pinyin and Vietnamese fields exactly.
Parameters:
${JSON.stringify(p)}
Verified HSK 1 vocabulary records:
${JSON.stringify(p.verifiedVocabulary || [])}
Schema:
${JSON.stringify(jsonSchema)}
`;

export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  const apiKey=process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if(!apiKey) return res.status(500).json({error:'Gemini API key is not configured on the server.'});
  try{
    const p=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
    const endpoint=`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      contents:[{role:'user',parts:[{text:promptFor(p)}]}],
      generationConfig:{responseMimeType:'application/json',responseSchema:jsonSchema,temperature:0.2}
    })});
    const data=await r.json();
    if(!r.ok) return res.status(502).json({error:'Gemini lesson generation failed.',detail:data?.error?.message});
    const text=data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if(!text) return res.status(502).json({error:'Gemini returned no lesson JSON.'});
    let lesson; try{lesson=JSON.parse(text);}catch{ return res.status(502).json({error:'Gemini returned invalid JSON.'});}
    return res.status(200).json({lesson});
  }catch(err){ return res.status(500).json({error:err?.message || 'Lesson generation error.'});}
}