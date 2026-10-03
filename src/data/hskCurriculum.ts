import type { HSKLevel } from '../types';
import type { ContentSource, HSKSkillCoverage, ContentHealthStatus } from '../types/hskKnowledge';

export const HSK_CURRICULUM_SOURCE:ContentSource={
 id:'project-hsk-source-pending-verification',
 label:'Project HSK content source — verification required',
 version:'UNVERIFIED_PROJECT_CURRICULUM',
 verified:false
};
const levels=['HSK 1','HSK 2','HSK 3','HSK 4','HSK 5','HSK 6'] as HSKLevel[];
const focus:Record<HSKLevel,string[]>={
 'HSK 1':['Pinyin','initials/finals','tones','characters','greetings','self introduction','numbers','time','family','food','shopping','daily routine'],
 'HSK 2':['time','frequency','comparison','experience','plans','preferences','transportation','weather','daily communication'],
 'HSK 3':['connected sentences','opinions','reasons','experiences','plans','study/work contexts','inference'],
 'HSK 4':['natural conversation','explanation','comparison','cause/effect','problem solving','school/work contexts','summary'],
 'HSK 5':['complex grammar','long texts','register','argument structure','inference','discussion','presentation','paragraph writing'],
 'HSK 6':['advanced reading','nuance','register','argumentation','summarization','inference','abstract discussion','structured writing']
};
export const HSK_CURRICULUM_LEVELS=levels.map(level=>({level,focus:focus[level],contentStatus:'CONTENT_GAP' as ContentHealthStatus,source:HSK_CURRICULUM_SOURCE}));
export const HSK_SKILL_KEYS:Array<keyof HSKSkillCoverage>=['vocabulary','grammar','pronunciation','listening','speaking','reading','writing','characters','dialogue','roleplay','stories'];
export function getHSKLevelConfig(level:HSKLevel){return HSK_CURRICULUM_LEVELS.find(x=>x.level===level)!;}
