import { AIStoredMemory, DailyPlan, LearnerProfile, LearnerKnowledgeProfile, PersonalizedDifficulty, PersonalizationRecommendation, KnowledgeMetric, MasteryBand } from '../types/learning';

const clamp=(n:number,min=0,max=100)=>Math.max(min,Math.min(max,Math.round(n)));
const metric=(mastery:number,confidence:number,attemptCount:number,lastPracticed:string|null,lastCorrect:string|null,lastIncorrect:string|null,reviewDueAt:string|null):KnowledgeMetric=>({mastery:clamp(mastery),confidence:clamp(confidence),attemptCount,lastPracticed,lastCorrect,lastIncorrect,reviewDueAt});

function buildMetric(schedule:{mastery:number;correctCount:number;incorrectCount:number;lastReviewed:string|null;nextReview:string}|undefined,fallback=0):KnowledgeMetric{
 const attempts=(schedule?.correctCount||0)+(schedule?.incorrectCount||0);
 const confidence=attempts?clamp(((schedule?.correctCount||0)/attempts)*100):fallback;
 return metric(schedule?.mastery??fallback,confidence,attempts,schedule?.lastReviewed||null,schedule?.correctCount?schedule.lastReviewed:null,schedule?.incorrectCount?schedule.lastReviewed:null,schedule?.nextReview||null);
}
function bandFor(mastery:number,confidence:number,due:boolean,attempts:number):MasteryBand{
 if(attempts===0)return 'NEW';
 if(due&&mastery>=60)return 'REVIEW_DUE';
 if(mastery<35||confidence<40)return 'STRUGGLING';
 if(mastery<60)return 'LEARNING';
 if(mastery<85)return 'FAMILIAR';
 return 'MASTERED';
}

export function buildKnowledgeProfile(profile:LearnerProfile,memory:AIStoredMemory,schedules:Record<string,{mastery:number;correctCount:number;incorrectCount:number;lastReviewed:string|null;nextReview:string}>,progress:Record<string,{mastery:number;speaking:number;listening:number;grammar:number}>):LearnerKnowledgeProfile{
 const scheduleEntries=Object.entries(schedules);
 const vocabularyItems=scheduleEntries.slice(-50).map(([id,s])=>({id,mastery:clamp(s.mastery),confidence:buildMetric(s).confidence,band:bandFor(s.mastery,buildMetric(s).confidence,new Date(s.nextReview).getTime()<=Date.now(),s.correctCount+s.incorrectCount),attempts:s.correctCount+s.incorrectCount,correct:s.correctCount,incorrect:s.incorrectCount,lastPracticed:s.lastReviewed,reviewDueAt:s.nextReview}));
 const dueReviewCount=scheduleEntries.filter(([,s])=>new Date(s.nextReview).getTime()<=Date.now()).length;
 const values=Object.values(progress);
 const avg=(key:keyof typeof values[number])=>values.length?values.reduce((n,p)=>n+p[key],0)/values.length:0;
 const scheduleMastery=scheduleEntries.length?scheduleEntries.reduce((n,[,s])=>n+s.mastery,0)/scheduleEntries.length:profile.vocabularyStats.learned?45:0;
 const grammar=metric(avg('grammar'),memory.grammarWeaknesses.length?35:Math.max(avg('grammar'),50),values.length,null,null,null,null);
 const speaking=metric(avg('speaking'),avg('speaking'),0,null,null,null,null);
 const listening=metric(avg('listening'),avg('listening'),0,null,null,null,null);
 const pronunciation=metric(profile.pronunciationStats.accuracy,profile.pronunciationStats.accuracy,0,null,null,null,null);
 const reading=metric(profile.readingStats.accuracy,profile.readingStats.accuracy,profile.readingStats.practiceCount,null,null,null,null);
 const writing=metric(profile.writingStats.accuracy,profile.writingStats.accuracy,profile.writingStats.practiceCount,null,null,null,null);
 const tone=metric(memory.pronunciationWeaknesses.length?Math.max(20,pronunciation.mastery-20):pronunciation.mastery,memory.pronunciationWeaknesses.length?35:pronunciation.confidence,memory.pronunciationWeaknesses.length,null,null,null,null);
 const vocabulary=metric(scheduleMastery,scheduleEntries.length?clamp(scheduleEntries.reduce((n,[,s])=>n+s.correctCount,0)/Math.max(1,scheduleEntries.reduce((n,[,s])=>n+s.correctCount+s.incorrectCount,0))*100):scheduleMastery,scheduleEntries.reduce((n,[,s])=>n+s.correctCount+s.incorrectCount,0),null,null,null,scheduleEntries.find(([,s])=>new Date(s.nextReview).getTime()<=Date.now())?.[1].nextReview||null);
 const skills={vocabulary,grammar,listening,speaking,reading,writing,pronunciation,tone};
 const overall=Object.values(skills).reduce((n,s)=>n+s.mastery,0)/Object.values(skills).length;
 const weak=[...memory.grammarWeaknesses,...memory.pronunciationWeaknesses,...memory.weakVocabulary].slice(-8);
 const mastered=Object.entries(skills).filter(([,s])=>s.mastery>=80).map(([k])=>k);
 const adaptiveDifficulty=getAdaptiveDifficulty(profile,memory,{overallMastery:overall,skills});
 return {generatedAt:new Date().toISOString(),overallMastery:clamp(overall),confidence:clamp(Object.values(skills).reduce((n,s)=>n+s.confidence,0)/Object.values(skills).length),skills,vocabulary:vocabularyItems,grammarWeaknesses:memory.grammarWeaknesses.slice(-8),pronunciationWeaknesses:memory.pronunciationWeaknesses.slice(-8),preferredTopics:memory.preferences.slice(-5),dueReviewCount,strugglingAreas:weak,masteredAreas:mastered,adaptiveDifficulty};
}

export function getAdaptiveDifficulty(profile:LearnerProfile,memory:AIStoredMemory,knowledge?:Pick<LearnerKnowledgeProfile,'overallMastery'|'skills'>):PersonalizedDifficulty{
 const unresolved=memory.mistakes.filter(m=>!m.resolved);
 const recent=memory.mistakes.slice(-12);
 const errorRate=recent.length?recent.filter(m=>m.frequency>1||m.severity==='high').length/recent.length:0;
 const mastery=knowledge?.overallMastery??(profile.vocabularyStats.mastered?70:45);
 if(mastery<45||unresolved.length>=5||errorRate>.5)return {level:'support',sentenceLength:'short',hints:'more',pinyin:'always',translation:'always',speakingSpeed:'slow',grammarComplexity:'foundational',roleplay:'guided'};
 if(mastery>=78&&unresolved.length<=1&&errorRate<.2)return {level:'challenge',sentenceLength:'long',hints:'fewer',pinyin:'minimal',translation:'minimal',speakingSpeed:'natural',grammarComplexity:'stretch',roleplay:'open'};
 return {level:'balanced',sentenceLength:'medium',hints:'normal',pinyin:'adaptive',translation:'adaptive',speakingSpeed:'normal',grammarComplexity:'current',roleplay:'adaptive'};
}

export function generateDailyPlan(profile:LearnerProfile,memory:AIStoredMemory,dueReviews:number,knowledge?:LearnerKnowledgeProfile):DailyPlan{
 const minutes=Math.max(5,profile.dailyGoalMinutes);
 const items:PersonalizationRecommendation[]=[];
 const level=knowledge?.adaptiveDifficulty.level||'balanced';
 const reason=(s:string)=>'Lina đề xuất vì '+s+'.';
 if(dueReviews)items.push({type:'review',title:'Ôn lại nội dung đến hạn',target:dueReviews+' mục cần nhớ lại',minutes:Math.min(5,Math.max(2,Math.round(minutes*.25))),reason:reason('một số nội dung đã đến lượt ôn'),difficulty:'balanced'});
 if(knowledge?.strugglingAreas.length||memory.weakVocabulary.length)items.push({type:'vocabulary',title:'Củng cố điểm còn yếu',target:(knowledge?.strugglingAreas||memory.weakVocabulary).slice(0,3).join(' · '),minutes:Math.max(2,Math.round(minutes*.2)),reason:reason('bạn đang gặp lại một số lỗi ở nhóm này'),difficulty:level});
 if(memory.grammarWeaknesses.length)items.push({type:'grammar',title:'Luyện ngữ pháp mục tiêu',target:memory.grammarWeaknesses.slice(-2).join(' · '),minutes:Math.max(2,Math.round(minutes*.15)),reason:reason('một điểm ngữ pháp xuất hiện trong các lỗi gần đây'),difficulty:level});
 const weakest=knowledge?Object.entries(knowledge.skills).sort((a,b)=>a[1].mastery-b[1].mastery)[0]?.[0]:'speaking';
 if(weakest==='speaking')items.push({type:'speaking',title:'Nói cùng Lina',target:memory.preferences[0]||'chủ đề gần đây',minutes:Math.max(2,Math.round(minutes*.2)),reason:reason('kỹ năng nói cần thêm lượt thực hành'),difficulty:level});
 else if(weakest==='listening')items.push({type:'listening',title:'Luyện nghe mục tiêu',target:'Nghe → nhận diện → trả lời',minutes:Math.max(2,Math.round(minutes*.2)),reason:reason('kỹ năng nghe đang thấp hơn các kỹ năng khác'),difficulty:level});
 else items.push({type:'pronunciation',title:'Luyện phát âm',target:memory.pronunciationWeaknesses[0]||'thanh điệu',minutes:Math.max(2,Math.round(minutes*.15)),reason:reason('cần duy trì độ chính xác khi nói'),difficulty:level});
 items.push({type:'quiz',title:'Mini check',target:'Kiểm tra lại điều vừa học',minutes:Math.max(2,Math.round(minutes*.1)),reason:reason('Lina cần tín hiệu mới để điều chỉnh bài tiếp theo'),difficulty:level});
 const selected=items.slice(0,5);
 return {generatedAt:new Date().toISOString(),minutes:selected.reduce((n,x)=>n+x.minutes,0),items:selected};
}
export function getPersonalizationReason(recommendation:PersonalizationRecommendation){return recommendation.reason;}
export function resetPersonalizationState(memory:AIStoredMemory):AIStoredMemory{return {...memory,conversationSummary:'',preferences:[],goals:[],learnerFacts:[],weakVocabulary:[],grammarWeaknesses:[],pronunciationWeaknesses:[]};}
export function resetPersonalizationSkill(memory:AIStoredMemory,skill:'vocabulary'|'grammar'|'pronunciation'|'conversation'):AIStoredMemory{
 if(skill==='vocabulary')return {...memory,weakVocabulary:[]};
 if(skill==='grammar')return {...memory,grammarWeaknesses:[]};
 if(skill==='pronunciation')return {...memory,pronunciationWeaknesses:[]};
 return {...memory,conversationSummary:''};
}
