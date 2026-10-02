import { HSKLevel, UserLevel } from './index';
import { StructuredVocabulary, GrammarRecord, StructuredSentence, RoleplayScenario } from './learning';

export type LessonType = 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'reading' | 'writing' | 'conversation' | 'review' | 'mixed';

export interface LessonQuizQuestion {
  id: string;
  type: 'multiple_choice' | 'translation' | 'fill_blank' | 'reorder_words' | 'listen_and_choose' | 'listen_and_type' | 'speaking' | 'matching';
  question: string;
  options?: string[];
  answer: string | string[];
  explanation: string;
  difficulty: 1 | 2 | 3;
  skill: 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'reading' | 'writing';
  relatedVocabulary: string[];
  relatedGrammar: string[];
}

export interface LessonReviewItem {
  id: string;
  prompt: string;
  answer: string;
  type: 'recall' | 'translate' | 'listen' | 'speak' | 'write';
  relatedVocabulary: string[];
  relatedGrammar: string[];
}

export interface LessonEngineLesson {
  id: string;
  title: string;
  description: string;
  hskLevel: HSKLevel;
  level: UserLevel;
  objectives: string[];
  vocabulary: StructuredVocabulary[];
  grammar: GrammarRecord[];
  dialogue: StructuredSentence[];
  listening: StructuredSentence[];
  speaking: StructuredSentence[];
  reading: StructuredSentence[];
  writing: StructuredSentence[];
  roleplay: RoleplayScenario[];
  quiz: LessonQuizQuestion[];
  review: LessonReviewItem[];
  estimatedMinutes: number;
  lessonType: LessonType;
  generatedAt: string;
  source: 'curated' | 'gemini' | 'personalized';
}

export interface LessonGenerationParameters {
  level: UserLevel;
  topic: string;
  goal: string;
  duration: number;
  learnerWeaknesses?: string[];
  targetVocabulary?: string[];
  targetGrammar?: string[];
  hskLevel?: HSKLevel;
  lessonType?: LessonType;
  personalized?: boolean;
}

export interface LessonValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface LessonCompletionResult {
  lessonId: string;
  completedAt: string;
  accuracy: number;
  mastery: number;
  correctCount: number;
  totalCount: number;
  mistakeIds: string[];
  reviewItemIds: string[];
}

export interface LessonQuizResult {
  questionId: string;
  correct: boolean;
  answer?: string;
  mistake?: {
    type: 'vocabulary' | 'grammar' | 'word-order' | 'listening' | 'naturalness';
    original: string;
    corrected: string;
    explanation: string;
    relatedVocabulary?: string[];
    relatedGrammar?: string[];
  };
}