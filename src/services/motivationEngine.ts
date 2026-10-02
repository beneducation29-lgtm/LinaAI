import { storage } from './storage';
import { MotivationActivity, MotivationActivityType, MotivationDailyStats, MotivationSnapshot, MotivationState, MotivationWeeklySummary } from '../types/motivation';

export const MOTIVATION_STORAGE_KEY = 'lina_motivation_v1';
export const DAILY_GOAL_OPTIONS = [5, 10, 15, 20, 30] as const;
export type DailyGoalMinutes = typeof DAILY_GOAL_OPTIONS[number];

const XP_REWARDS: Record<MotivationActivityType, number> = { lesson:50, review:10, vocabulary:5, speaking:15, conversation:20, pronunciation:15, daily_goal:25 };

export const ACHIEVEMENTS = [
  { id:'first-lesson', label:'First Lesson', description:'Hoàn thành bài học đầu tiên.' },
  { id:'first-conversation', label:'First Conversation', description:'Có cuộc hội thoại đầu tiên với Lina.' },
  { id:'100-words', label:'100 Words', description:'Ôn hoặc học đủ 100 lượt từ vựng.' },
  { id:'7-day-streak', label:'7 Day Streak', description:'Duy trì 7 ngày học liên tiếp.' },
  { id:'first-roleplay', label:'First Roleplay', description:'Hoàn thành một lượt roleplay.' },
  { id:'pronunciation-practice', label:'Pronunciation Practice', description:'Luyện phát âm ít nhất một lần.' },
  { id:'hsk1-complete', label:'HSK 1 Complete', description:'Hoàn thành toàn bộ 10 bài HSK 1.' },
] as const;

const localDate=(date=new Date())=>{
  const p=new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const g=(t:string)=>p.find(x=>x.type===t)?.value||'';
  return g('year')+'-'+g('month')+'-'+g('day');
};
const dayNumber=(date:string)=>{const [y,m,d]=date.split('-').map(Number);return Math.floor(Date.UTC(y,m-1,d)/86400000);};
const dayDifference=(a:string,b:string)=>dayNumber(b)-dayNumber(a);

export const emptyMotivationState=(dailyGoalMinutes:DailyGoalMinutes=5,legacyStreakDays=0):MotivationState=>({activities:[],xp:0,streakDays:legacyStreakDays,lastStudyDate:null,dailyGoalMinutes,achievementIds:[]});

export const loadMotivationState=(dailyGoalMinutes:DailyGoalMinutes,legacyStreakDays=0):MotivationState=>{
  try{
    const raw=storage.getItem(MOTIVATION_STORAGE_KEY);
    if(raw){
      const parsed=JSON.parse(raw) as MotivationState;
      return {...emptyMotivationState(dailyGoalMinutes,legacyStreakDays),...parsed,
        dailyGoalMinutes:DAILY_GOAL_OPTIONS.includes(parsed.dailyGoalMinutes)?parsed.dailyGoalMinutes:dailyGoalMinutes,
        activities:Array.isArray(parsed.activities)?parsed.activities:[],
        achievementIds:Array.isArray(parsed.achievementIds)?parsed.achievementIds:[]};
    }
  }catch{}
  return emptyMotivationState(dailyGoalMinutes,legacyStreakDays);
};
export const saveMotivationState=(state:MotivationState)=>{try{storage.setItem(MOTIVATION_STORAGE_KEY,JSON.stringify(state));}catch{}};

export const getTodayStats=(state:MotivationState,date=localDate()):MotivationDailyStats=>{
  const a=state.activities.filter(x=>x.localDate===date);
  return {
    minutes:a.reduce((s,x)=>s+(x.type==='daily_goal'?0:x.minutes),0),
    lessons:a.filter(x=>x.type==='lesson').length,
    vocabulary:a.reduce((s,x)=>s+(x.type==='vocabulary'?Math.max(1,x.vocabularyCount||1):0),0),
    speaking:a.filter(x=>x.type==='speaking'||x.type==='conversation').length,
    review:a.filter(x=>x.type==='review').length
  };
};
const totalVocabulary=(s:MotivationState)=>s.activities.reduce((n,a)=>n+(a.type==='vocabulary'?Math.max(1,a.vocabularyCount||1):0),0);

const calculateAchievements=(s:MotivationState)=>{
  const ids=new Set(s.achievementIds);
  if(s.activities.some(a=>a.type==='lesson'))ids.add('first-lesson');
  if(s.activities.some(a=>a.type==='conversation'))ids.add('first-conversation');
  if(totalVocabulary(s)>=100)ids.add('100-words');
  if(s.streakDays>=7)ids.add('7-day-streak');
  if(s.activities.some(a=>a.type==='speaking'&&a.metadata?.roleplay===true))ids.add('first-roleplay');
  if(s.activities.some(a=>a.type==='pronunciation'))ids.add('pronunciation-practice');
  const hsk=new Set(s.activities.filter(a=>a.type==='lesson'&&a.metadata?.hskLevel==='HSK 1').map(a=>String(a.metadata?.lessonNumber||'')));
  if([1,2,3,4,5,6,7,8,9,10].every(n=>hsk.has(String(n))))ids.add('hsk1-complete');
  return [...ids];
};

export const applyMotivationActivity=(state:MotivationState,input:Omit<MotivationActivity,'occurredAt'|'localDate'>&{occurredAt?:string}):MotivationState=>{
  if(state.activities.some(a=>a.id===input.id))return state;
  const occurredAt=input.occurredAt||new Date().toISOString();
  const date=localDate(new Date(occurredAt));
  let streak=state.streakDays;
  if(state.lastStudyDate!==date){
    if(!state.lastStudyDate)streak=Math.max(1,state.streakDays||1);
    else {const gap=dayDifference(state.lastStudyDate,date);if(gap===1)streak=Math.max(1,state.streakDays)+1;else if(gap>1)streak=1;}
  }
  let next:MotivationState={...state,activities:[...state.activities,{...input,occurredAt,localDate:date}].slice(-1000),xp:state.xp+XP_REWARDS[input.type],streakDays:streak,lastStudyDate:date};
  const today=getTodayStats(next,date);
  if(input.type!=='daily_goal'&&today.minutes>=next.dailyGoalMinutes&&!next.activities.some(a=>a.id==='daily-goal:'+date)){
    next={...next,activities:[...next.activities,{id:'daily-goal:'+date,type:'daily_goal',occurredAt,localDate:date,minutes:0}].slice(-1000),xp:next.xp+XP_REWARDS.daily_goal};
  }
  next.achievementIds=calculateAchievements(next);
  return next;
};
export const recordMotivationActivity=(state:MotivationState,input:Omit<MotivationActivity,'occurredAt'|'localDate'>):MotivationState=>applyMotivationActivity(state,input);

export const getWeeklySummary=(state:MotivationState,mistakes:string[]=[],now=new Date()):MotivationWeeklySummary=>{
  const today=localDate(now), n=dayNumber(today);
  const w=state.activities.filter(a=>dayNumber(a.localDate)>=n-6&&dayNumber(a.localDate)<=n);
  return {
    minutesStudied:w.reduce((s,a)=>s+(a.type==='daily_goal'?0:a.minutes),0),
    lessonsCompleted:w.filter(a=>a.type==='lesson').length,
    wordsReviewed:w.reduce((s,a)=>s+(a.type==='vocabulary'?Math.max(1,a.vocabularyCount||1):0),0),
    speakingSessions:w.filter(a=>a.type==='speaking'||a.type==='conversation').length,
    commonMistakes:mistakes.slice(-5),
    nextRecommendedPractice:mistakes.length?'Ôn nhẹ: '+mistakes[0]:(w.some(a=>a.type==='speaking'||a.type==='conversation')?'Ôn lại các từ đang đến hạn':'Một lượt hội thoại 5 phút với Lina')
  };
};
export const getMotivationSnapshot=(s:MotivationState,mistakes:string[]=[]):MotivationSnapshot=>({today:getTodayStats(s),xp:s.xp,streakDays:s.streakDays,achievements:s.achievementIds,weekly:getWeeklySummary(s,mistakes)});
export const motivationMessage=(s:MotivationState)=>{
  const r=Math.max(0,s.dailyGoalMinutes-getTodayStats(s).minutes);
  return r===0?'Hôm nay bạn đã đủ mục tiêu. Nếu muốn, mình có thể học thêm một chút — hoàn toàn không áp lực.':'Hôm nay bạn chỉ cần '+r+' phút để tiếp tục.';
};
