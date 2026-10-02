import { HSKLevel } from './index';

export type PinyinDisplayMode = 'marks' | 'numbers' | 'hidden';
export type ReviewType = 'zh-to-vi' | 'vi-to-zh' | 'audio-to-meaning' | 'pinyin-to-zh' | 'speak' | 'listen-repeat' | 'fill-blank' | 'conversation';

export interface StructuredVocabulary {
  id: string;
  hanzi: string;
  pinyin: string;
  pinyinNumbered: string;
  vietnamese: string;
  partOfSpeech: string;
  exampleChinese: string;
  examplePinyin: string;
  exampleVietnamese: string;
  hskLevel: HSKLevel;
  category: string;
  audio?: string;
  difficulty: 1 | 2 | 3;
}

export interface GrammarRecord {
  id: string;
  pattern: string;
  meaning: string;
  explanationVi: string;
  examples: Array<{ hanzi: string; pinyin: string; vietnamese: string }>;
  commonMistakes: string[];
  practiceQuestions: string[];
}

export interface StructuredSentence {
  id: string;
  chinese: string;
  pinyin: string;
  vietnamese: string;
}

export interface ReviewItem {
  id: string;
  type: ReviewType;
  prompt: string;
  answer: string;
  sentence?: StructuredSentence;
  vocabularyId?: string;
}

export interface SpeakingExercise {
  id: string;
  prompt: StructuredSentence;
  expectedMeaning: string;
  followUp: StructuredSentence;
}

export interface RoleplayScenario {
  id: string;
  title: string;
  situation: string;
  aiOpening: StructuredSentence;
  targetVocabIds: string[];
  evaluationDimensions: Array<'meaning' | 'grammar' | 'vocabulary' | 'naturalness' | 'pronunciation'>;
}

export interface StructuredLesson {
  id: string;
  hskLevel: HSKLevel;
  lessonNumber: number;
  titleVi: string;
  titleZh: string;
  pinyin: string;
  objective: string;
  estimatedMinutes: number;
  vocabulary: StructuredVocabulary[];
  grammar: GrammarRecord[];
  dialogue: StructuredSentence[];
  listening: StructuredSentence[];
  speaking: SpeakingExercise[];
  roleplay: RoleplayScenario;
  review: ReviewItem[];
}

export interface ReviewSchedule {
  itemId: string;
  lastReviewed: string | null;
  nextReview: string;
  interval: number;
  ease: number;
  correctCount: number;
  incorrectCount: number;
  mastery: number;
}

export interface MistakeRecord {
  id: string;
  type: 'grammar' | 'vocabulary' | 'pronunciation' | 'tone' | 'word-order';
  original: string;
  corrected: string;
  explanation: string;
  frequency: number;
  lastSeen: string;
  mastery: number;
}

export interface LearnerProfile {
  level: HSKLevel;
  goal: 'conversation' | 'exam' | 'travel' | 'work' | 'general';
  dailyMinutes: number;
  weakGrammar: string[];
  weakVocabulary: string[];
  weakTones: string[];
  preferredTopics: string[];
  recentMistakes: string[];
}
