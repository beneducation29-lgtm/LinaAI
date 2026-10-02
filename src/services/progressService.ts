import type {Lesson} from '../types';
export interface StructuredProgressEntry{mastery:number;speaking:number;listening:number;grammar:number;}
const emptyProgress=():StructuredProgressEntry=>({mastery:0,speaking:0,listening:0,grammar:0});
export function findLessonForItem(lessons:Lesson[],itemId:string):Lesson|undefined{return lessons.find(lesson=>lesson.vocabulary.some(v=>v.id===itemId)||lesson.roleplay.id===itemId||lesson.speaking.some(s=>s.id===itemId));}
export function updateLessonProgress(progress:Record<string,StructuredProgressEntry>,lessonId:string,itemId:string,correct:boolean):Record<string,StructuredProgressEntry>{const current=progress[lessonId]||emptyProgress();const mastery=Math.min(100,Math.max(0,current.mastery+(correct?10:-5)));const speaking=itemId.includes('-sp')||itemId.includes('-rp')?Math.min(100,current.speaking+(correct?15:0)):current.speaking;return{...progress,[lessonId]:{...current,mastery,speaking}};}
