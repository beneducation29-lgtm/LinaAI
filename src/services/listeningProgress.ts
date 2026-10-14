export interface ListeningProgressEntry {
  attempts: number;
  correct: number;
  streak: number;
  lastReviewedAt: string | null;
  dueAt: string | null;
}

export type ListeningProgress = Record<string, ListeningProgressEntry>;

const emptyEntry = (): ListeningProgressEntry => ({
  attempts: 0,
  correct: 0,
  streak: 0,
  lastReviewedAt: null,
  dueAt: null,
});

/** Validate data loaded from local storage or the sync service before it enters app state. */
export function sanitizeListeningProgress(value: unknown): ListeningProgress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: ListeningProgress = {};
  for (const [id, candidate] of Object.entries(value as Record<string, unknown>)) {
    if (!id || !candidate || typeof candidate !== 'object' || Array.isArray(candidate)) continue;
    const entry = candidate as Record<string, unknown>;
    const attempts = Number(entry.attempts);
    const correct = Number(entry.correct);
    const streak = Number(entry.streak);
    if (
      !Number.isSafeInteger(attempts) || attempts < 0 ||
      !Number.isSafeInteger(correct) || correct < 0 || correct > attempts ||
      !Number.isSafeInteger(streak) || streak < 0
    ) continue;
    const lastReviewedAt = typeof entry.lastReviewedAt === 'string' && Number.isFinite(Date.parse(entry.lastReviewedAt))
      ? new Date(entry.lastReviewedAt).toISOString() : null;
    const dueAt = typeof entry.dueAt === 'string' && Number.isFinite(Date.parse(entry.dueAt))
      ? new Date(entry.dueAt).toISOString() : null;
    result[id] = { attempts, correct, streak, lastReviewedAt, dueAt };
  }
  return result;
}

/**
 * Record one multiple-choice result. Repeated correct answers widen the interval
 * to 1, 3, 7, then 14 days; an incorrect answer schedules a retry after 10 minutes.
 */
export function recordListeningAnswer(
  progress: ListeningProgress,
  itemId: string,
  correct: boolean,
  reviewedAt: Date = new Date(),
): ListeningProgress {
  if (!itemId) return progress;
  const previous = progress[itemId] || emptyEntry();
  const streak = correct ? previous.streak + 1 : 0;
  const intervalHours = correct
    ? (streak === 1 ? 24 : streak === 2 ? 72 : streak === 3 ? 168 : 336)
    : 1 / 6;
  const dueAt = new Date(reviewedAt.getTime() + intervalHours * 60 * 60 * 1000).toISOString();
  return {
    ...progress,
    [itemId]: {
      attempts: previous.attempts + 1,
      correct: previous.correct + (correct ? 1 : 0),
      streak,
      lastReviewedAt: reviewedAt.toISOString(),
      dueAt,
    },
  };
}

export function getDueListeningItemIds(
  progress: ListeningProgress,
  now: Date = new Date(),
): string[] {
  const timestamp = now.getTime();
  return Object.entries(progress)
    .filter(([, entry]) => {
      if (!entry.dueAt) return false;
      const dueTimestamp = Date.parse(entry.dueAt);
      return Number.isFinite(dueTimestamp) && dueTimestamp <= timestamp;
    })
    .sort(([idA, a], [idB, b]) =>
      Date.parse(a.dueAt || '') - Date.parse(b.dueAt || '') || idA.localeCompare(idB)
    )
    .map(([id]) => id);
}

export function getWeakListeningItemIds(
  progress: ListeningProgress,
  minimumAccuracy = 0.6,
): string[] {
  const threshold = Number.isFinite(minimumAccuracy)
    ? Math.min(1, Math.max(0, minimumAccuracy))
    : 0.6;
  return Object.entries(progress)
    .filter(([, entry]) => entry.attempts > 0 && entry.correct / entry.attempts < threshold)
    .sort(([idA, a], [idB, b]) =>
      (a.correct / a.attempts) - (b.correct / b.attempts) ||
      b.attempts - a.attempts ||
      idA.localeCompare(idB)
    )
    .map(([id]) => id);
}

/** Build a short adaptive queue: overdue reviews first, weak items next, then unseen lessons. */
export function getSmartListeningItemIds(
  progress: ListeningProgress,
  candidateIds: string[],
  maxItems = 5,
  now: Date = new Date(),
): string[] {
  const limit = Number.isFinite(maxItems) ? Math.max(0, Math.floor(maxItems)) : 5;
  if (limit === 0 || candidateIds.length === 0) return [];

  const candidates = [...new Set(candidateIds.filter(id => typeof id === 'string' && id.length > 0))];
  const candidateSet = new Set(candidates);
  const ordered: string[] = [];
  const added = new Set<string>();
  const append = (ids: string[]) => {
    for (const id of ids) {
      if (candidateSet.has(id) && !added.has(id)) {
        ordered.push(id);
        added.add(id);
      }
    }
  };

  append(getDueListeningItemIds(progress, now));
  append(getWeakListeningItemIds(progress));
  append(candidates.filter(id => (progress[id]?.attempts || 0) === 0));

  const remaining = candidates
    .filter(id => !added.has(id))
    .sort((idA, idB) => {
      const a = progress[idA];
      const b = progress[idB];
      const attemptsDifference = (a?.attempts || 0) - (b?.attempts || 0);
      if (attemptsDifference !== 0) return attemptsDifference;
      const accuracyA = a?.attempts ? a.correct / a.attempts : 0;
      const accuracyB = b?.attempts ? b.correct / b.attempts : 0;
      return accuracyA - accuracyB || idA.localeCompare(idB);
    });
  append(remaining);
  return ordered.slice(0, limit);
}

export function countDueListeningReviews(
  progress: ListeningProgress,
  now: Date = new Date(),
): number {
  const timestamp = now.getTime();
  return Object.values(progress).filter(entry => {
    if (!entry.dueAt) return false;
    const dueTimestamp = Date.parse(entry.dueAt);
    return Number.isFinite(dueTimestamp) && dueTimestamp <= timestamp;
  }).length;
}
