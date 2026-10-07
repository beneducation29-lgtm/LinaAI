import { ReviewRating } from '../types';
import { MistakeRecord, ReviewSchedule } from '../types/learning';

const DAY = 24 * 60 * 60 * 1000;

export function scheduleReview(current: ReviewSchedule | undefined, rating: ReviewRating): ReviewSchedule {
  const now = new Date();
  const base: ReviewSchedule = current || {
    itemId: 'unknown', lastReviewed: null, nextReview: now.toISOString(),
    interval: 0, ease: 2.5, correctCount: 0, incorrectCount: 0, mastery: 0
  };
  const correct = rating !== 'again';
  let interval = base.interval;
  let ease = base.ease;
  if (!correct) {
    interval = 1;
    ease = Math.max(1.3, ease - 0.2);
  } else {
    const multiplier = rating === 'easy' ? 2.5 : rating === 'good' ? ease : 1.2;
    interval = Math.max(1, Math.round((interval || 1) * multiplier));
    if (rating === 'easy') ease = Math.min(3, ease + 0.15);
    if (rating === 'hard') ease = Math.max(1.3, ease - 0.15);
  }
  const correctCount = base.correctCount + (correct ? 1 : 0);
  const incorrectCount = base.incorrectCount + (correct ? 0 : 1);
  const mastery = Math.min(100, Math.round(
    (correctCount / Math.max(1, correctCount + incorrectCount)) * 70 +
    Math.min(interval, 30) / 30 * 30
  ));
  return { ...base, lastReviewed: now.toISOString(), nextReview: new Date(now.getTime() + interval * DAY).toISOString(),
    interval, ease, correctCount, incorrectCount, mastery };
}

export function isDue(nextReview: string, now = new Date()): boolean {
  return new Date(nextReview).getTime() <= now.getTime();
}

export function recordMistake(existing: MistakeRecord[], input: Omit<MistakeRecord, 'id' | 'frequency' | 'lastSeen' | 'firstSeen'> & Partial<Pick<MistakeRecord,'severity'|'resolved'|'mastery'|'relatedVocabulary'|'relatedGrammar'|'relatedPronunciation'>>): MistakeRecord[] {
  const match = existing.find(m => m.type === input.type && m.original === input.original && m.corrected === input.corrected);
  if (match) {
    return existing.map(m => m.id === match.id
      ? { ...m, frequency: m.frequency + 1, lastSeen: new Date().toISOString(), resolved: false, mastery: Math.max(0, m.mastery - 5) }
      : m
    );
  }
  return [...existing, {
    ...input,
    id: 'mistake-' + Date.now(),
    frequency: 1,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    severity: input.severity || 'medium',
    resolved: input.resolved ?? false,
    mastery: input.mastery ?? 0
  } as MistakeRecord];
}
export function getWeakAreas(mistakes: MistakeRecord[]) {
  const grammar = mistakes.filter(m => m.type === 'grammar').sort((a,b) => b.frequency - a.frequency);
  const vocabulary = mistakes.filter(m => m.type === 'vocabulary').sort((a,b) => b.frequency - a.frequency);
  const tones = mistakes.filter(m => m.type === 'tone').sort((a,b) => b.frequency - a.frequency);
  return {
    grammar: grammar.slice(0, 5).map(m => m.corrected),
    vocabulary: vocabulary.slice(0, 5).map(m => m.original),
    tones: tones.slice(0, 5).map(m => m.original)
  };
}

export function buildLearnerMemory(profile: {level:string; goal:string; dailyMinutes:number; preferredTopics:string[]; recentMistakes:string[]}, mistakes: MistakeRecord[]) {
  const weak = getWeakAreas(mistakes);
  return {
    level: profile.level, goal: profile.goal, dailyMinutes: profile.dailyMinutes,
    weakGrammar: weak.grammar, weakVocabulary: weak.vocabulary, weakTones: weak.tones,
    preferredTopics: profile.preferredTopics, recentMistakes: mistakes.slice(-5).map(m => m.original)
  };
}


export interface RetentionSnapshot {
  totalTracked: number;
  due: number;
  fading: number;
  struggling: number;
  mastered: number;
  newItems: number;
  recentErrors: number;
  priority: 'urgent' | 'balanced' | 'maintenance';
}

export function buildRetentionSnapshot(
  schedules: Record<string, ReviewSchedule>,
  mistakes: MistakeRecord[],
  now = new Date()
): RetentionSnapshot {
  const values = Object.values(schedules);
  const due = values.filter(s => isDue(s.nextReview, now)).length;
  const fading = values.filter(s => {
    const dueNow = isDue(s.nextReview, now);
    return dueNow && s.mastery >= 35 && s.mastery < 70;
  }).length;
  const struggling = values.filter(s => s.mastery < 35 || s.incorrectCount > s.correctCount).length;
  const mastered = values.filter(s => s.mastery >= 80 && !isDue(s.nextReview, now)).length;
  const newItems = values.filter(s => s.correctCount + s.incorrectCount === 0).length;
  const recentErrors = mistakes.slice(-12).filter(m => !m.resolved).length;
  const priority = due + fading + recentErrors >= 8
    ? 'urgent'
    : due + fading + recentErrors >= 3
      ? 'balanced'
      : 'maintenance';
  return { totalTracked: values.length, due, fading, struggling, mastered, newItems, recentErrors, priority };
}


export interface ReviewQueueItem extends ReviewSchedule {
  priorityScore: number;
  priorityReason: 'struggling' | 'fading' | 'due' | 'maintenance';
}

/**
 * Builds a deterministic review queue so the learner sees the most valuable
 * cards first instead of simply reviewing in object/insertion order.
 */
export function buildReviewQueue(
  schedules: Record<string, ReviewSchedule>,
  now = new Date()
): ReviewQueueItem[] {
  return Object.values(schedules)
    .filter(schedule => isDue(schedule.nextReview, now))
    .map(schedule => {
      const overdueDays = Math.max(0, (now.getTime() - new Date(schedule.nextReview).getTime()) / DAY);
      const accuracy = schedule.correctCount + schedule.incorrectCount > 0
        ? schedule.correctCount / (schedule.correctCount + schedule.incorrectCount)
        : 0;
      const struggling = schedule.mastery < 35 || schedule.incorrectCount > schedule.correctCount;
      const fading = schedule.mastery >= 35 && schedule.mastery < 70;
      const priorityScore =
        (struggling ? 100 : 0) +
        (fading ? 45 : 0) +
        Math.min(40, Math.round(overdueDays * 4)) +
        Math.round((1 - accuracy) * 20);
      return {
        ...schedule,
        priorityScore,
        priorityReason: struggling ? 'struggling' : fading ? 'fading' : overdueDays > 0 ? 'due' : 'maintenance'
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore || a.nextReview.localeCompare(b.nextReview));
}
