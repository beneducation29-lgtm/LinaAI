import React from 'react';
import { accountStorageKey } from '../../services/accountStorage';
import { READING_STORY_SERIES } from '../../data/readingStorySeries';
import type { HSKLevel } from '../../types';

type ProgressEntry = { completedAt?: string; correct?: number; total?: number };
type ProgressMap = Record<string, ProgressEntry>;
const STORAGE_KEY = 'lina-story-chapter-progress-v1';
const LEVELS: HSKLevel[] = ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'];

function readProgress(ownerId: string): ProgressMap {
  try {
    if (typeof window === 'undefined') return {};
    const value = JSON.parse(localStorage.getItem(accountStorageKey(STORAGE_KEY, ownerId)) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

export const ReadingProgressOverview: React.FC<{ ownerId: string }> = ({ ownerId }) => {
  const [progress, setProgress] = React.useState<ProgressMap>(() => readProgress(ownerId));
  React.useEffect(() => {
    const refresh = () => setProgress(readProgress(ownerId));
    refresh();
    window.addEventListener('lina-reading-progress-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('lina-reading-progress-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [ownerId]);

  const chapters = READING_STORY_SERIES.flatMap(story => story.chapters.map(chapter => ({ ...chapter, level: story.level })));
  const completed = chapters.filter(chapter => Boolean(progress[chapter.id]));
  const totalQuestions = completed.reduce((sum, chapter) => {
    const value = progress[chapter.id]?.total;
    return sum + (typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0);
  }, 0);
  const correctAnswers = completed.reduce((sum, chapter) => {
    const value = progress[chapter.id]?.correct;
    const total = progress[chapter.id]?.total;
    const safeTotal = typeof total === 'number' && Number.isFinite(total) ? Math.max(0, total) : 0;
    const safeCorrect = typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0;
    return sum + Math.min(safeCorrect, safeTotal);
  }, 0);
  const accuracy = totalQuestions ? Math.round(correctAnswers / totalQuestions * 100) : 0;

  return <section aria-label="Tổng quan tiến độ đọc" className="grid gap-3 rounded-2xl border border-amber-200 bg-white/90 p-3 dark:border-amber-950 dark:bg-stone-950 sm:grid-cols-3">
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Chương đã hoàn thành</p>
      <p className="mt-1 text-2xl font-black tabular-nums text-stone-900 dark:text-stone-100">{completed.length}<span className="ml-1 text-sm font-semibold text-stone-400">/ {chapters.length}</span></p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800"><div className="h-full rounded-full bg-amber-600" style={{ width: (chapters.length ? completed.length / chapters.length * 100 : 0) + '%' }} /></div>
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Độ chính xác đọc hiểu</p>
      <p className="mt-1 text-2xl font-black tabular-nums text-stone-900 dark:text-stone-100">{accuracy}<span className="ml-1 text-sm font-semibold text-stone-400">%</span></p>
      <p className="mt-2 text-[11px] text-stone-500">{correctAnswers}/{totalQuestions} câu đúng từ các chương đã nộp</p>
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Tiến độ theo cấp độ</p>
      <div className="mt-2 flex flex-wrap gap-1.5">{LEVELS.map(level => {
        const levelChapters = chapters.filter(chapter => chapter.level === level);
        const count = levelChapters.filter(chapter => Boolean(progress[chapter.id])).length;
        return <span key={level} className="rounded-lg border border-stone-200 px-2 py-1 text-[10px] font-bold text-stone-600 dark:border-stone-700 dark:text-stone-300">{level.replace('HSK ', '')}: {count}/{levelChapters.length}</span>;
      })}</div>
    </div>
  </section>;
};
