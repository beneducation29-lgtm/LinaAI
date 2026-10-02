export type MotivationActivityType = 'lesson' | 'review' | 'vocabulary' | 'speaking' | 'conversation' | 'pronunciation' | 'daily_goal';

export interface MotivationActivity {
  id: string;
  type: MotivationActivityType;
  occurredAt: string;
  localDate: string;
  minutes: number;
  lessonId?: string;
  vocabularyCount?: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface MotivationState {
  activities: MotivationActivity[];
  xp: number;
  streakDays: number;
  lastStudyDate: string | null;
  dailyGoalMinutes: 5 | 10 | 15 | 20 | 30;
  achievementIds: string[];
}

export interface MotivationDailyStats { minutes: number; lessons: number; vocabulary: number; speaking: number; review: number; }
export interface MotivationWeeklySummary { minutesStudied: number; lessonsCompleted: number; wordsReviewed: number; speakingSessions: number; commonMistakes: string[]; nextRecommendedPractice: string; }
export interface MotivationSnapshot { today: MotivationDailyStats; xp: number; streakDays: number; achievements: string[]; weekly: MotivationWeeklySummary; }
