import { HSKLevel, UserLevel, DailyTimeGoal, ConversationMessage } from './index';

export type PinyinDisplayMode = 'marks' | 'numbers' | 'hidden';
export type ReviewType = 'zh-to-vi' | 'vi-to-zh' | 'audio-to-meaning' | 'pinyin-to-zh' | 'speak' | 'listen-repeat' | 'fill-blank' | 'conversation';

export interface StructuredVocabulary { id:string; hanzi:string; pinyin:string; pinyinNumbered:string; vietnamese:string; partOfSpeech:string; exampleChinese:string; examplePinyin:string; exampleVietnamese:string; hskLevel:HSKLevel; category:string; audio:string; difficulty:1|2|3; }
export interface GrammarRecord { id:string; pattern:string; meaning:string; explanationVi:string; examples:Array<{hanzi:string;pinyin:string;vietnamese:string}>; commonMistakes:string[]; practiceQuestions:string[]; }
export interface StructuredSentence { id:string; chinese:string; pinyin:string; vietnamese:string; }
export interface ReviewItem { id:string; type:ReviewType; prompt:string; answer:string; sentence?:StructuredSentence; vocabularyId?:string; }
export interface SpeakingExercise { id:string; prompt:StructuredSentence; expectedMeaning:string; followUp:StructuredSentence; }
export interface RoleplayScenario { id:string; title:string; situation:string; aiOpening:StructuredSentence; targetVocabIds:string[]; evaluationDimensions:Array<'meaning'|'grammar'|'vocabulary'|'naturalness'|'pronunciation'>; }
export interface StructuredLesson { id:string; hskLevel:HSKLevel; lessonNumber:number; titleVi:string; titleZh:string; pinyin:string; objective:string; estimatedMinutes:number; vocabulary:StructuredVocabulary[]; grammar:GrammarRecord[]; dialogue:StructuredSentence[]; listening:StructuredSentence[]; speaking:SpeakingExercise[]; roleplay:RoleplayScenario; review:ReviewItem[]; }
export interface ReviewSchedule { itemId:string; lastReviewed:string|null; nextReview:string; interval:number; ease:number; correctCount:number; incorrectCount:number; mastery:number; }

export type MistakeType='vocabulary'|'grammar'|'word-order'|'pinyin'|'tone'|'pronunciation'|'listening'|'character'|'naturalness';
export interface MistakeRecord { id:string; type:MistakeType; original:string; corrected:string; explanation:string; severity:'low'|'medium'|'high'; frequency:number; firstSeen:string; lastSeen:string; resolved:boolean; mastery:number; relatedVocabulary?:string[]; relatedGrammar?:string[]; relatedPronunciation?:string[]; }

export interface LearnerProfile { id:string; displayName:string; nativeLanguage:string; targetLanguage:string; currentLevel:UserLevel; hskLevel:HSKLevel; pinyinLevel:'marks'|'numbers'|'hidden'; learningGoal:string; dailyGoalMinutes:DailyTimeGoal; streak:number; totalStudyMinutes:number; vocabularyStats:{learned:number;mastered:number;weak:number}; grammarStats:{learned:number;weak:number}; pronunciationStats:{accuracy:number;weakTones:string[]}; speakingStats:{practiceCount:number;accuracy:number}; listeningStats:{practiceCount:number;accuracy:number}; readingStats:{practiceCount:number;accuracy:number}; writingStats:{practiceCount:number;accuracy:number}; weakAreas:string[]; strongAreas:string[]; recentLessons:string[]; recentMistakes:string[]; preferredTopics:string[]; lastActiveAt:string; }
export interface AIStoredMemory { learnerFacts:string[]; learningHistory:Array<{lessonId:string;completedAt:string}>; mistakes:MistakeRecord[]; masteredVocabulary:string[]; weakVocabulary:string[]; grammarWeaknesses:string[]; pronunciationWeaknesses:string[]; conversationSummary:string; goals:string[]; preferences:string[]; topics:string[]; lastConversationAt:string|null; }
export type MasteryBand='NEW'|'LEARNING'|'FAMILIAR'|'MASTERED'|'REVIEW_DUE'|'FADING'|'STRUGGLING';
export type PersonalizationLevel='support'|'balanced'|'challenge';
export interface KnowledgeMetric { mastery:number; confidence:number; lastPracticed:string|null; lastCorrect:string|null; lastIncorrect:string|null; attemptCount:number; reviewDueAt:string|null; }
export interface SkillKnowledgeProfile { vocabulary:KnowledgeMetric; grammar:KnowledgeMetric; listening:KnowledgeMetric; speaking:KnowledgeMetric; reading:KnowledgeMetric; writing:KnowledgeMetric; pronunciation:KnowledgeMetric; tone:KnowledgeMetric; }
export interface VocabularyKnowledge { id:string; mastery:number; confidence:number; band:MasteryBand; attempts:number; correct:number; incorrect:number; lastPracticed:string|null; reviewDueAt:string|null; }
export interface PersonalizedDifficulty { level:PersonalizationLevel; sentenceLength:'short'|'medium'|'long'; hints:'more'|'normal'|'fewer'; pinyin:'always'|'adaptive'|'minimal'; translation:'always'|'adaptive'|'minimal'; speakingSpeed:'slow'|'normal'|'natural'; grammarComplexity:'foundational'|'current'|'stretch'; roleplay:'guided'|'adaptive'|'open'; }
export interface LearnerKnowledgeProfile { generatedAt:string; overallMastery:number; confidence:number; skills:SkillKnowledgeProfile; vocabulary:VocabularyKnowledge[]; grammarWeaknesses:string[]; pronunciationWeaknesses:string[]; preferredTopics:string[]; dueReviewCount:number; strugglingAreas:string[]; masteredAreas:string[]; adaptiveDifficulty:PersonalizedDifficulty; }
export interface PersonalizationRecommendation { type:'review'|'vocabulary'|'grammar'|'speaking'|'listening'|'pronunciation'|'quiz'; title:string; target:string; minutes:number; reason:string; difficulty:PersonalizationLevel; }
export interface DailyPlan { generatedAt:string; minutes:number; items:Array<PersonalizationRecommendation>; }
export interface TutorContext { learner:Pick<LearnerProfile,'currentLevel'|'hskLevel'|'learningGoal'|'dailyGoalMinutes'|'weakAreas'|'strongAreas'>; lesson?:{id:string;title:string;hskLevel:HSKLevel;vocabulary:string[];grammar:string[]}; relevantMistakes:MistakeRecord[]; masteredVocabulary:string[]; conversationSummary:string; goals:string[]; }
export type MemoryRepository = { load:()=>AIStoredMemory; save:(memory:AIStoredMemory)=>void; clear:()=>void; };
