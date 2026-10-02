import { ReviewRating } from '../types';
import { MistakeRecord, ReviewSchedule, LearnerProfile } from '../types/learning';

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

export function buildLearnerMemory(profile: LearnerProfile, mistakes: MistakeRecord[]) {
  const weak = getWeakAreas(mistakes);
  return {
    level: profile.level, goal: profile.goal, dailyMinutes: profile.dailyMinutes,
    weakGrammar: weak.grammar, weakVocabulary: weak.vocabulary, weakTones: weak.tones,
    preferredTopics: profile.preferredTopics, recentMistakes: mistakes.slice(-5).map(m => m.original)
  };
}
