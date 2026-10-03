import type { HSKLevel } from '../types';
import type { HSKDailySession, HSKDailySessionInput, HSKReadinessProfile, HSKSkillCoverage, HSKMasteryBand, KnowledgeEdge, KnowledgeNode } from '../types/hskKnowledge';

const skills:Array<keyof HSKSkillCoverage>=['vocabulary','grammar','pronunciation','listening','speaking','reading','writing','characters','dialogue','roleplay','stories'];

export function masteryBand(mastery:number,reviewDue:boolean,attempts:number,recentErrors:number):HSKMasteryBand{
 if(recentErrors>=2&&attempts>0)return 'STRUGGLING';
 if(reviewDue&&attempts>0)return 'REVIEW_DUE';
 if(attempts===0)return 'NEW';
 if(mastery>=85&&attempts>=4)return 'MASTERED';
 if(mastery>=65)return 'FAMILIAR';
 return 'LEARNING';
}
export function chooseDifficulty(mastery:number,recentErrorRate:number):'EASY'|'NORMAL'|'CHALLENGING'{if(mastery<40||recentErrorRate>=.5)return 'EASY';if(mastery>=82&&recentErrorRate<.2)return 'CHALLENGING';return 'NORMAL';}
export function buildKnowledgeGraph(nodes:KnowledgeNode[],edges:KnowledgeEdge[]){const ids=new Set(nodes.map(n=>n.id));return{nodes:[...nodes],edges:edges.filter(e=>ids.has(e.from)&&ids.has(e.to))};}
export function getPrerequisites(nodeId:string,graph:{nodes:KnowledgeNode[];edges:KnowledgeEdge[]}){return[...new Set(graph.edges.filter(e=>e.to===nodeId&&e.relation==='PREREQUISITE').map(e=>e.from))];}
export function calculateReadiness(level:HSKLevel,mastery:Record<string,number>,values:Partial<Record<keyof HSKSkillCoverage,number>>):HSKReadinessProfile{
 const ms=Object.values(mastery);const retention=ms.length?Math.round(ms.reduce((a,b)=>a+b,0)/ms.length):0;
 return{level,vocabularyReadiness:values.vocabulary||0,grammarReadiness:values.grammar||0,listeningReadiness:values.listening||0,speakingReadiness:values.speaking||0,readingReadiness:values.reading||0,writingReadiness:values.writing||0,pronunciationReadiness:values.pronunciation||0,retention,generatedAt:new Date().toISOString(),isOfficialCertification:false};
}
export function buildHSKCoverage(records:Array<{level:HSKLevel;skills:Partial<Record<keyof HSKSkillCoverage,number>>}>,verified:(level:HSKLevel)=>boolean):HSKSkillCoverage[]{
 return(['HSK 1','HSK 2','HSK 3','HSK 4','HSK 5','HSK 6'] as HSKLevel[]).map(level=>{const rows=records.filter(x=>x.level===level);const coverage=Object.fromEntries(skills.map(skill=>[skill,rows.reduce((s,r)=>s+(r.skills[skill]||0),0)])) as HSKSkillCoverage;const present=skills.filter(s=>(coverage[s]||0)>0).length;return{...coverage,status:!verified(level)?'CONTENT_GAP':present===skills.length?'READY':present?'PARTIAL':'CONTENT_GAP'};});
}
function allocate(minutes:number,items:HSKDailySession['items']){if(!items.length)return[];if(items.length>=minutes)return items.slice(0,minutes).map(x=>({...x,minutes:1}));const total=items.reduce((s,x)=>s+x.minutes,0);if(total<=minutes)return items;const scaled=items.map(x=>x.minutes*minutes/total);const base=scaled.map(x=>Math.max(1,Math.floor(x)));let used=base.reduce((s,x)=>s+x,0);while(used>minutes){const i=base.findIndex((m,idx)=>m>1&&m>=base[idx]);if(i<0)break;base[i]-=1;used--;}const order=scaled.map((x,i)=>({i,frac:x-Math.floor(x)})).sort((a,b)=>b.frac-a.frac);let cursor=0;while(used<minutes){base[order[cursor%order.length].i]+=1;used++;cursor++;}return items.map((x,i)=>({...x,minutes:base[i]}));}
export function generateDailyHSKSession(input:HSKDailySessionInput):HSKDailySession{
 const minutes=Math.max(5,Math.round(input.availableMinutes));const weak=new Set(input.weakSkills.map(x=>x.toLowerCase()));
 const items:HSKDailySession['items']=[
 {stage:'warm-up',skill:'vocabulary',targetIds:input.reviewDueIds.slice(0,3),minutes:Math.min(3,minutes),difficulty:'NORMAL',rationale:input.reviewDueIds.length?'Khởi động bằng retrieval mục đến hạn.':'Khởi động ngắn để kích hoạt kiến thức.'},
 {stage:'review',skill:weak.has('grammar')?'grammar':'vocabulary',targetIds:input.reviewDueIds.slice(0,4),minutes:Math.min(4,minutes),difficulty:'EASY',rationale:'Ưu tiên nội dung đến hạn và vùng yếu.'},
 {stage:'new-knowledge',skill:weak.has('vocabulary')?'vocabulary':'grammar',targetIds:input.recentLessonId?[input.recentLessonId]:[],minutes:Math.min(4,minutes),difficulty:chooseDifficulty(input.mastery[input.recentLessonId||'']||50,0)},
 {stage:'listening-speaking',skill:weak.has('listening')?'listening':'speaking',targetIds:[],minutes:Math.min(4,minutes),difficulty:'NORMAL',rationale:'Cross-skill practice trong ngữ cảnh.'},
 {stage:'practice',skill:weak.has('reading')?'reading':'writing',targetIds:[],minutes:Math.min(3,minutes),difficulty:'NORMAL',rationale:'Củng cố comprehension và production.'},
 {stage:'assessment',skill:'vocabulary',targetIds:[],minutes:Math.min(2,minutes),difficulty:'NORMAL',rationale:'Mini assessment trước review tiếp theo.'}];
 return{id:'hsk-session-'+Date.now(),userId:input.userId,hskLevel:input.hskLevel,minutes,items:allocate(minutes,items),generatedAt:new Date().toISOString()};
}
export function getScaffolding(level:HSKLevel,mastery:number){if(level==='HSK 1'||mastery<45)return{pinyin:'always',translation:'always',speakingSpeed:'slow',sentenceLength:'short',hints:'more'} as const;if(level==='HSK 2'||mastery<70)return{pinyin:'adaptive',translation:'adaptive',speakingSpeed:'normal',sentenceLength:'medium',hints:'normal'} as const;return{pinyin:'minimal',translation:'minimal',speakingSpeed:'natural',sentenceLength:'long',hints:'fewer'} as const;}
