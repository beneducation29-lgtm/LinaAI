import type { HSKLevel } from './index';

export type CurriculumVersion = string;
export type KnowledgeType = 'vocabulary'|'grammar'|'sentence-pattern'|'pronunciation'|'character'|'dialogue'|'story'|'reading'|'listening'|'writing'|'culture';
export type KnowledgeRelation = 'PREREQUISITE'|'RELATED'|'CONTRAST'|'USES'|'APPEARS_IN'|'SUPPORTS'|'REINFORCES';
export type HSKMasteryBand = 'NEW'|'LEARNING'|'FAMILIAR'|'MASTERED'|'REVIEW_DUE'|'STRUGGLING';
export type ContentStatus = 'DRAFT'|'REVIEW'|'APPROVED'|'PUBLISHED'|'ARCHIVED';
export type ContentHealthStatus = 'READY'|'PARTIAL'|'CONTENT_GAP'|'BLOCKED';

export interface ContentSource { id:string; label:string; version:CurriculumVersion; verified:boolean; reference?:string; }
export interface HSKVocabularyKnowledge {
  id:string; hanzi:string; simplified:string; traditional?:string; pinyin:string; tone?:string; meaningVi:string; partOfSpeech?:string; measureWord?:string;
  collocations:string[]; synonyms:string[]; antonyms:string[]; examples:string[]; hskLevel:HSKLevel; curriculumVersion:CurriculumVersion;
  frequency?:number; difficulty:1|2|3|4|5; audio?:string; relatedWords:string[]; commonMistakes:string[]; prerequisiteVocabulary:string[];
  status:ContentStatus; source?:ContentSource; version:string; createdAt:string; updatedAt:string; reviewer?:string;
}
export interface HSKGrammarKnowledge {
  id:string; pattern:string; structure:string; meaningVi:string; usage:string; examples:string[]; negativeForm?:string; questionForm?:string;
  spokenUsage?:string; writtenUsage?:string; commonMistakes:string[]; contrastGrammar:string[]; hskLevel:HSKLevel; curriculumVersion:CurriculumVersion;
  prerequisiteGrammar:string[]; relatedVocabulary:string[]; status:ContentStatus; source?:ContentSource; version:string; createdAt:string; updatedAt:string; reviewer?:string;
}
export interface HSKSentencePattern { id:string; pattern:string; explanation:string; examples:string[]; substitutions:string[]; hskLevel:HSKLevel; difficulty:1|2|3|4|5; curriculumVersion:CurriculumVersion; status:ContentStatus; }
export interface KnowledgeNode { id:string; type:KnowledgeType; title:string; level:HSKLevel; curriculumVersion:CurriculumVersion; prerequisiteIds:string[]; relatedIds:string[]; metadata?:Record<string,unknown>; }
export interface KnowledgeEdge { from:string; to:string; relation:KnowledgeRelation; }
export interface HSKKnowledgeGraph { nodes:KnowledgeNode[]; edges:KnowledgeEdge[]; }
export interface HSKSkillCoverage { vocabulary:number; grammar:number; pronunciation:number; listening:number; speaking:number; reading:number; writing:number; characters:number; dialogue:number; roleplay:number; stories:number; status:ContentHealthStatus; }
export interface HSKReadinessProfile {
  level:HSKLevel; vocabularyReadiness:number; grammarReadiness:number; listeningReadiness:number; speakingReadiness:number; readingReadiness:number;
  writingReadiness:number; pronunciationReadiness:number; retention:number; generatedAt:string; isOfficialCertification:false;
}
export interface HSKDailySessionInput {
  userId:string; hskLevel:HSKLevel; availableMinutes:number; weakSkills:string[]; mastery:Record<string,number>; reviewDueIds:string[];
  recentMistakes:string[]; recentLessonId?:string; learningGoal?:string;
}
export interface HSKDailySessionItem {
  stage:'warm-up'|'review'|'new-knowledge'|'listening-speaking'|'practice'|'assessment';
  skill:'vocabulary'|'grammar'|'pronunciation'|'listening'|'speaking'|'reading'|'writing';
  targetIds:string[]; minutes:number; difficulty:'EASY'|'NORMAL'|'CHALLENGING'; rationale:string;
}
export interface HSKDailySession { id:string; userId:string; hskLevel:HSKLevel; minutes:number; items:HSKDailySessionItem[]; generatedAt:string; }
