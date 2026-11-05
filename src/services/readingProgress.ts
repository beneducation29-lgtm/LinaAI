import type { HSKLevel } from '../types';
import type { ReadingStorySeries } from '../data/readingStorySeries';

export interface ReadingProgressEntry {
  completedAt?: string;
  correct?: number;
  total?: number;
}
export type ReadingProgressMap = Record<string, ReadingProgressEntry>;

export interface ReadingLevelSummary {
  level: HSKLevel;
  completedChapters: number;
  totalChapters: number;
  percent: number;
}
export interface ReadingProgressSummary {
  completedChapters: number;
  totalChapters: number;
  completedQuestions: number;
  totalQuestions: number;
  accuracy: number;
  byLevel: ReadingLevelSummary[];
}

/** Summarizes account-scoped reading progress without mutating stored records. */
export function summarizeReadingProgress(
  stories: ReadingStorySeries[],
  progress: ReadingProgressMap,
): ReadingProgressSummary {
  const chapters = stories.flatMap(story => story.chapters);
  const completed = chapters.filter(chapter => Boolean(progress[chapter.id]));
  const completedQuestions = completed.reduce((sum, chapter) => {
    const value = progress[chapter.id]?.correct;
    return sum + (typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0);
  }, 0);
  const totalQuestions = completed.reduce((sum, chapter) => {
    const value = progress[chapter.id]?.total;
    return sum + (typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0);
  }, 0);
  const byLevel = (['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'] as HSKLevel[]).map(level => {
    const levelChapters = stories.filter(story => story.level === level).flatMap(story => story.chapters);
    const completedChapters = levelChapters.filter(chapter => Boolean(progress[chapter.id])).length;
    return {
      level,
      completedChapters,
      totalChapters: levelChapters.length,
      percent: levelChapters.length ? Math.round((completedChapters / levelChapters.length) * 100) : 0,
    };
  });
  return {
    completedChapters: completed.length,
    totalChapters: chapters.length,
    completedQuestions,
    totalQuestions,
    accuracy: totalQuestions ? Math.round((completedQuestions / totalQuestions) * 100) : 0,
    byLevel,
  };
}
