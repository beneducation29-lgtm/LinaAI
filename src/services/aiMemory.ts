import { storage } from './storage';
import { AIStoredMemory, LearnerProfile, MistakeRecord, TutorContext, MemoryRepository } from '../types/learning';

const KEY='lina_ai_memory_v2';
const now=()=>new Date().toISOString();
const clean=(s:string)=>s.trim().slice(0,240);

export const createLocalMemoryRepository=():MemoryRepository=>({
 load:()=>{try{const v=storage.getItem(KEY);if(!v)return emptyMemory();const parsed=JSON.parse(v) as Partial<AIStoredMemory>;return {...emptyMemory(),...parsed,learnerFacts:Array.isArray(parsed.learnerFacts)?parsed.learnerFacts:[],mistakes:Array.isArray(parsed.mistakes)?parsed.mistakes:[],topics:Array.isArray(parsed.topics)?parsed.topics:[],lastConversationAt:typeof parsed.lastConversationAt==='string'?parsed.lastConversationAt:null};}catch{return emptyMemory();}},
 save:(m)=>{try{storage.setItem(KEY,JSON.stringify(m));}catch{}},
 clear:()=>{try{storage.removeItem(KEY);}catch{}}
});

export const emptyMemory=():AIStoredMemory=>({learnerFacts:[],learningHistory:[],mistakes:[],masteredVocabulary:[],weakVocabulary:[],grammarWeaknesses:[],pronunciationWeaknesses:[],conversationSummary:'',goals:[],preferences:[],topics:[],lastConversationAt:null});

export function updateMemory(memory:AIStoredMemory,input:{fact?:string;lessonId?:string;mistake?:MistakeRecord;masteredVocabulary?:string;weakVocabulary?:string;grammarWeakness?:string;pronunciationWeakness?:string;conversationSummary?:string;goal?:string;preference?:string;topic?:string}):AIStoredMemory{
 const m={...memory};
 if(input.fact){m.learnerFacts=[...new Set([...m.learnerFacts,clean(input.fact)])].slice(-20);}
 if(input.lessonId && !m.learningHistory.some(x=>x.lessonId===input.lessonId)){m.learningHistory=[...m.learningHistory,{lessonId:input.lessonId,completedAt:now()}].slice(-30);}
 if(input.mistake){const existing=m.mistakes.find(x=>x.type===input.mistake!.type&&x.original===input.mistake!.original&&x.corrected===input.mistake!.corrected);m.mistakes=existing?m.mistakes.map(x=>x.id===existing.id?{...x,frequency:x.frequency+1,lastSeen:now(),resolved:false}:x):[...m.mistakes,input.mistake].slice(-100);}
 if(input.masteredVocabulary)m.masteredVocabulary=[...new Set([...m.masteredVocabulary,input.masteredVocabulary])];
 if(input.weakVocabulary)m.weakVocabulary=[...new Set([...m.weakVocabulary,input.weakVocabulary])].slice(-30);
 if(input.grammarWeakness)m.grammarWeaknesses=[...new Set([...m.grammarWeaknesses,input.grammarWeakness])].slice(-20);
 if(input.pronunciationWeakness)m.pronunciationWeaknesses=[...new Set([...m.pronunciationWeaknesses,input.pronunciationWeakness])].slice(-20);
 if(input.conversationSummary)m.conversationSummary=clean(input.conversationSummary);
 if(input.goal)m.goals=[...new Set([...m.goals,input.goal])].slice(-10);
 if(input.preference)m.preferences=[...new Set([...m.preferences,input.preference])].slice(-20);
 if(input.topic){const topic=clean(input.topic); if(topic)m.topics=[...new Set([...(m.topics||[]),topic])].slice(-20);}
 if(input.conversationSummary)m.lastConversationAt=now();
 return m;
}

export function buildTutorContext(profile:LearnerProfile,memory:AIStoredMemory,lesson?:{id:string;title:string;hskLevel:any;vocabulary:string[];grammar:string[]},topic?:string):TutorContext{
 const terms=new Set([...(lesson?.vocabulary||[]),topic||''].map(x=>x.toLowerCase()));
 const relevant=memory.mistakes.filter(m=>!terms.size||[m.original,m.corrected,...(m.relatedVocabulary||[]),...(m.relatedGrammar||[])].some(x=>terms.has(x.toLowerCase()))).sort((a,b)=>{const priority=(m:MistakeRecord)=>m.resolved?-100:m.frequency*(m.severity==='high'?3:m.severity==='medium'?2:1);return priority(b)-priority(a);}).slice(0,8);
 return {learner:{currentLevel:profile.currentLevel,hskLevel:profile.hskLevel,learningGoal:profile.learningGoal,dailyGoalMinutes:profile.dailyGoalMinutes,weakAreas:profile.weakAreas,strongAreas:profile.strongAreas},lesson,relevantMistakes:relevant,masteredVocabulary:memory.masteredVocabulary.slice(-30),conversationSummary:memory.conversationSummary,goals:memory.goals};
}

export function clearLearningMemory(repo:MemoryRepository){repo.clear();}
export function resetProgress(repo:MemoryRepository){repo.clear();}
