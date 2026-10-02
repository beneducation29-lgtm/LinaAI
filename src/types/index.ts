/**
 * Core Data Models & TypeScript Interfaces for Lina AI Chinese
 */

export type HSKLevel = 'HSK 1' | 'HSK 2' | 'HSK 3' | 'HSK 4' | 'HSK 5' | 'HSK 6';

export type UserLevel = 'Chưa biết gì' | 'Cơ bản' | 'Trung cấp' | 'Nâng cao';

export type LearningGoalOption = 
  | '✈️ Du lịch'
  | '💼 Công việc'
  | '🗣 Giao tiếp'
  | '📚 HSK'
  | '🎓 Học tập'
  | '🎬 Văn hóa';

export type DailyTimeGoal = 5 | 10 | 15 | 20 | 30;

export interface DisplayPreferences {
  showChinese: boolean;
  showPinyin: boolean;
  showVietnamese: boolean;
  theme: 'light' | 'dark';
}

export interface LearningGoal {
  id: string;
  category: LearningGoalOption;
  targetMinutesPerDay: DailyTimeGoal;
  targetHskLevel: HSKLevel;
  weeklyTargetDays: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  currentLevel: UserLevel;
  currentHsk: HSKLevel;
  learningGoal: LearningGoal;
  dailyGoalMinutes: DailyTimeGoal;
  todayMinutesSpent: number;
  streakDays: number;
  vocabularyLearnedCount: number;
  lessonsCompletedCount: number;
  pronunciationAccuracy: number; // percentage 0 - 100
  savedVocabularyIds: string[];
  preferences: DisplayPreferences;
  onboardingCompleted: boolean;
}

export interface User {
  id: string;
  email?: string;
  profile: UserProfile;
  createdAt: string;
  lastActiveAt: string;
}

export interface Vocabulary {
  id: string;
  hanzi: string;
  pinyin: string;
  vietnamese: string;
  partOfSpeech?: string;
  hskLevel: HSKLevel;
  audioUrl?: string;
  exampleSentence?: {
    hanzi: string;
    pinyin: string;
    vietnamese: string;
  };
  notes?: string;
  tags?: string[];
}

export type LessonSectionType = 
  | 'vocabulary' 
  | 'grammar' 
  | 'listening' 
  | 'speaking' 
  | 'roleplay' 
  | 'review';

export interface GrammarPoint {
  id: string;
  title: string;
  structure: string;
  explanationVi: string;
  examples: Array<{
    hanzi: string;
    pinyin: string;
    vietnamese: string;
  }>;
}

export interface PracticeExercise {
  id: string;
  type: 'listening' | 'speaking' | 'multiple_choice' | 'arrange_order';
  promptVi: string;
  targetSentence?: {
    hanzi: string;
    pinyin: string;
    vietnamese: string;
  };
  options?: string[];
  correctAnswer?: string;
  hint?: string;
}

export interface LessonSection {
  id: string;
  type: LessonSectionType;
  title: string;
  descriptionVi: string;
  vocabularies?: Vocabulary[];
  grammarPoints?: GrammarPoint[];
  exercises?: PracticeExercise[];
}

export interface Lesson {
  id: string;
  hskLevel: HSKLevel;
  lessonNumber: number;
  titleVi: string;
  titleZh: string;
  pinyin: string;
  description: string;
  estimatedMinutes: number;
  sections: LessonSection[];
}

export interface LessonProgress {
  lessonId: string;
  currentSectionIndex: number;
  completedSectionIds: string[];
  isCompleted: boolean;
  score: number;
  lastAttemptedAt: string;
}

export type AvatarState = 
  | 'IDLE' 
  | 'LISTENING' 
  | 'THINKING' 
  | 'SPEAKING' 
  | 'HAPPY' 
  | 'ENCOURAGING' 
  | 'CONFUSED' 
  | 'ERROR';

export type TutorState = 'idle' | 'listening' | 'thinking' | 'speaking' | AvatarState;

export type AvatarProviderLevel = 'level1_fallback' | 'level2_interactive' | 'level3_realtime';

export type TutorEmotion = 'neutral' | 'happy' | 'encouraging' | 'confused';

export interface CharacterDesignConfig {
  name: string;
  chineseName: string;
  taglineVi: string;
  face: {
    eyeColor: string;
    skinTone: string;
    style: string;
  };
  hair: {
    color: string;
    style: string;
  };
  outfit: {
    top: string;
    accessory: string;
  };
  background: {
    environment: string;
    ambientColor: string;
  };
  expression: string;
  lighting: string;
  cameraAngle: string;
}

export interface ConversationMessage {
  id: string;
  sender: 'ai' | 'user';
  hanzi: string;
  pinyin: string;
  vietnamese: string;
  timestamp: string;
  audioUrl?: string;
  grammarTip?: string;
  pronunciationScore?: number; // 0-100 for user voice input
  emotion?: TutorEmotion;
  suggestedReplies?: Array<{
    hanzi: string;
    pinyin: string;
    vietnamese: string;
  }>;
  correction?: CorrectionDetails | null;
  vocabulary?: ExtractedVocabulary[];
  grammar?: ExtractedGrammar[];
  progressiveHints?: ProgressiveHints;
  responseType?: 'conversation' | 'lesson' | 'roleplay' | 'correction';
}

export type TutorMode = 'conversation' | 'teacher';

export type RoleplayDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ImmersionLevel = 'beginner' | 'intermediate' | 'advanced';
export interface RoleplayScenario { id:string; scenario:string; context:string; character:string; learnerRole:string; aiRole:string; difficulty:RoleplayDifficulty; targetVocabulary:string[]; targetGrammar:string[]; successCriteria:string[]; }
export interface RoleplaySessionState { scenario:RoleplayScenario; immersion:ImmersionLevel; learnerFacts:string[]; choices:string[]; turnCount:number; startedAt:string; }
export interface RoleplaySummary { summary:string; vocabularyLearned:string[]; grammarLearned:string[]; mistakes:string[]; pronunciationIssues:string[]; usefulExpressions:string[]; suggestedReview:string[]; metrics?:{accuracy?:number;fluency?:number;vocabularyUsage?:number;grammarConsistency?:number}; }

export interface CorrectionDetails {
  hasMistake: boolean;
  originalSentence: string;
  correctedSentence: string;
  pinyin: string;
  explanationVi: string;
  tryAgainPromptVi: string;
}

export interface ExtractedVocabulary {
  hanzi: string;
  pinyin: string;
  vietnamese: string;
  partOfSpeech: string;
  exampleSentence: string;
  hskLevel?: string;
}

export interface ExtractedGrammar {
  structure: string;
  meaningVi: string;
  exampleSentence: string;
  examplePinyin: string;
  exampleVietnamese: string;
}

export interface ProgressiveHints {
  hint1_semantic: string; // Ý tưởng / Nghĩa cần diễn đạt
  hint2_keywords: string; // Từ khóa gợi ý
  hint3_structure: string; // Cấu trúc ngữ pháp gợi ý
  hint4_fullAnswer: string; // Câu trả lời hoàn chỉnh
}

export interface StructuredTutorResponse {
  chinese: string;
  pinyin: string;
  vietnamese: string;
  responseType: 'conversation' | 'lesson' | 'roleplay' | 'correction';
  emotion?: TutorEmotion;
  correction: CorrectionDetails | null;
  vocabulary: ExtractedVocabulary[];
  grammar: ExtractedGrammar[];
  progressiveHints?: ProgressiveHints;
  suggestedReplies: Array<{
    hanzi: string;
    pinyin: string;
    vietnamese: string;
  }>;
  memoryUpdate?: {
    learnedFact?: string;
    topicContext?: string;
  };
}

export interface Conversation {
  id: string;
  topicTitleVi: string;
  hskLevel: HSKLevel;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface Flashcard {
  id: string;
  vocabulary: Vocabulary;
  nextReviewDate: string;
  intervalDays: number;
  repetitionCount: number;
  easeFactor: number;
  lastRating?: ReviewRating;
}

export interface Review {
  id: string;
  date: string;
  totalCardsReviewed: number;
  cardsPassed: number;
  timeSpentSeconds: number;
}

export interface Mistake {
  id: string;
  type: 'tone' | 'pronunciation' | 'grammar' | 'vocabulary';
  userInput: string;
  correctForm: string;
  explanationVi: string;
  timestamp: string;
  resolved: boolean;
}

export interface UserMemory {
  id: string;
  keyFact: string; // e.g. "User lives in Hanoi", "User loves traveling to Chengdu"
  learnedContext: string;
  recordedAt: string;
}
