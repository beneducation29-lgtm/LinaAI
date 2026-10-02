import { AIStoredMemory, DailyPlan, LearnerProfile } from '../types/learning';
export function generateDailyPlan(profile:LearnerProfile,memory:AIStoredMemory,dueReviews:number):DailyPlan{
 const weak=memory.weakVocabulary.slice(-5);
 const grammar=memory.grammarWeaknesses.slice(-1)[0]||'ngữ pháp đang học';
 const items:DailyPlan['items']=[];
 if(dueReviews) items.push({type:'review',title:'Review đến hạn',target:String(dueReviews)+' mục',minutes:Math.min(5,Math.max(2,dueReviews))});
 if(weak.length) items.push({type:'vocabulary',title:'5 từ vựng cần củng cố',target:weak.join(' · '),minutes:5});
 items.push({type:'grammar',title:'1 điểm ngữ pháp',target:grammar,minutes:2});
 items.push({type:'pronunciation',title:'Luyện thanh điệu',target:memory.pronunciationWeaknesses.slice(-1)[0]||'thanh điệu hiện tại',minutes:3});
 items.push({type:'conversation',title:'Hội thoại cùng Lina',target:profile.preferredTopics[0]||'chủ đề gần đây',minutes:Math.max(3,Math.min(5,profile.dailyGoalMinutes))});
 items.push({type:'quiz',title:'Mini quiz',target:'Ôn lại lỗi gần đây',minutes:3});
 return {generatedAt:new Date().toISOString(),minutes:items.reduce((n,x)=>n+x.minutes,0),items:items.slice(0,6)};
}
export function getAdaptiveDifficulty(profile:LearnerProfile,memory:AIStoredMemory){const unresolved=memory.mistakes.filter(m=>!m.resolved);const pressure=unresolved.length+memory.mistakes.slice(-10).reduce((n,m)=>n+(m.frequency>2?1:0),0);return pressure>=5?{level:'simplify',sentenceLength:'short',hints:'more',roleplay:'guided'}:pressure<=1?{level:'increase',sentenceLength:'longer',hints:'fewer',roleplay:'open'}:{level:'stable',sentenceLength:'same',hints:'normal',roleplay:'guided'};}
