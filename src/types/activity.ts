import type { HSKLevel } from './index';

export type ActivityType =
  | 'vocabulary-recall' | 'multiple-choice' | 'fill-blank' | 'sentence-ordering'
  | 'listening-choice' | 'listening-dictation' | 'pinyin-recognition' | 'tone-recognition'
  | 'tone-discrimination' | 'grammar-transformation' | 'translation' | 'chinese-to-vietnamese'
  | 'vietnamese-to-chinese' | 'speaking' | 'shadowing' | 'roleplay'
  | 'reading-comprehension' | 'writing' | 'free-response';

export type ActivityDifficulty = 'EASY' | 'NORMAL' | 'CHALLENGING' | 'ADAPTIVE';
export type RetrievalStage = 'recognize' | 'recall' | 'produce';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  hskLevel: HSKLevel;
  skill: 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'reading' | 'writing' | 'pronunciation' | 'mixed';
  difficulty: ActivityDifficulty;
  retrievalStage: RetrievalStage;
  targetIds: string[];
  prompt: string;
  answer?: string | string[];
  hints?: string[];
  metadata?: Record<string, unknown>;
}

export interface ActivityResult {
  activityId: string;
  correct: boolean;
  score?: number;
  response?: string;
  feedback?: string;
  completedAt: string;
}

export interface ActivitySRSItem {
  itemId: string;
  itemType: 'vocabulary' | 'grammar' | 'character' | 'sentence' | 'listening-pattern';
  schedule: {
    lastReviewed: string | null;
    nextReview: string;
    interval: number;
    ease: number;
    correctCount: number;
    incorrectCount: number;
    mastery: number;
  };
}

export interface LearningSessionInput {
  userId: string;
  hskLevel: HSKLevel;
  availableTime: number;
  weakAreas: string[];
  reviewDue: ActivitySRSItem[];
  recentLessons: string[];
}

export interface LearningSession {
  id: string;
  userId: string;
  hskLevel: HSKLevel;
  availableTime: number;
  activities: ActivityItem[];
  rationale: string[];
  generatedAt: string;
}

export interface SpeakingEvaluation {
  contentCorrectness: number | null;
  grammar: number | null;
  wordChoice: number | null;
  naturalness: number | null;
  pronunciation: number | null;
  pronunciationEvidence: 'acoustic-analysis' | 'unavailable' | 'not-requested';
  feedback: string[];
}
