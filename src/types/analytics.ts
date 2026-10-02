export const ANALYTICS_EVENTS=['app_open','lesson_start','lesson_complete','vocabulary_review','vocabulary_mastered','mistake','correction','speaking_start','speaking_complete','roleplay_start','roleplay_complete','pronunciation_practice','quiz_answer','quiz_complete','subscription_start','subscription_cancel'] as const;
export type AnalyticsEventName=typeof ANALYTICS_EVENTS[number];
export interface AnalyticsEventProperties{[key:string]:string|number|boolean|null|undefined}
export interface AnalyticsEvent{eventId:string;eventName:AnalyticsEventName;anonymousId:string;sessionId:string;occurredAt:string;properties:AnalyticsEventProperties}
export interface AnalyticsPreferences{enabled:boolean}
export interface LearnerAnalyticsSummary{studyMinutes:number;sessions:number;lessonCompletion:number;vocabularyMastery:number;grammarWeaknesses:number;speakingFrequency:number;pronunciationPractice:number;reviewConsistency:number;eventsTracked:number}
export interface AdminAnalyticsSummary{rangeDays:number;dau:number;wau:number;mau:number;newUsers:number;retentionD1:number;retentionD7:number;lessonCompletion:number;popularLessons:Array<{id:string;label:string;count:number}>;dropOffPoints:Array<{point:string;count:number}>;aiUsage:number;voiceUsage:number;costPerActiveUser:number;subscriptionConversion:number;churn:number;events:number}
