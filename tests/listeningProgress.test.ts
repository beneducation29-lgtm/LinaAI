import assert from 'node:assert/strict';
import {
  countDueListeningReviews,
  getDueListeningItemIds,
  getWeakListeningItemIds,
  recordListeningAnswer,
  sanitizeListeningProgress,
} from '../src/services/listeningProgress';

const reviewedAt = new Date('2026-10-14T00:00:00.000Z');
let progress = recordListeningAnswer({}, 'greeting', true, reviewedAt);
assert.equal(progress.greeting.attempts, 1);
assert.equal(progress.greeting.correct, 1);
assert.equal(progress.greeting.streak, 1);
assert.equal(progress.greeting.dueAt, '2026-10-15T00:00:00.000Z');

progress = recordListeningAnswer(progress, 'greeting', true, reviewedAt);
assert.equal(progress.greeting.attempts, 2);
assert.equal(progress.greeting.streak, 2);
assert.equal(progress.greeting.dueAt, '2026-10-17T00:00:00.000Z');

progress = recordListeningAnswer(progress, 'greeting', false, reviewedAt);
assert.equal(progress.greeting.correct, 2);
assert.equal(progress.greeting.streak, 0);
assert.equal(progress.greeting.dueAt, '2026-10-14T00:10:00.000Z');
assert.equal(countDueListeningReviews(progress, new Date('2026-10-14T00:09:59.999Z')), 0);
assert.equal(countDueListeningReviews(progress, new Date('2026-10-14T00:10:00.000Z')), 1);

const sanitized = sanitizeListeningProgress({
  valid: { attempts: 2, correct: 1, streak: 0, lastReviewedAt: '2026-10-14T00:00:00.000Z', dueAt: '2026-10-15T00:00:00.000Z' },
  invalid: { attempts: -1, correct: 9, streak: 'bad', dueAt: 'n/a' },
  malformed: null,
});
assert.deepEqual(Object.keys(sanitized), ['valid']);
assert.deepEqual(sanitizeListeningProgress([]), {});
assert.deepEqual(sanitizeListeningProgress(null), {});

const reviewCandidates = {
  weakAndDue: { attempts: 4, correct: 1, streak: 0, lastReviewedAt: '2026-10-14T00:00:00.000Z', dueAt: '2026-10-14T00:10:00.000Z' },
  strongestDueFirst: { attempts: 3, correct: 3, streak: 0, lastReviewedAt: '2026-10-13T00:00:00.000Z', dueAt: '2026-10-14T00:05:00.000Z' },
  weakNotDue: { attempts: 10, correct: 5, streak: 0, lastReviewedAt: '2026-10-13T00:00:00.000Z', dueAt: '2026-10-15T00:00:00.000Z' },
  neverAttempted: { attempts: 0, correct: 0, streak: 0, lastReviewedAt: null, dueAt: null },
};
assert.deepEqual(
  getDueListeningItemIds(reviewCandidates, new Date('2026-10-14T00:10:00.000Z')),
  ['strongestDueFirst', 'weakAndDue'],
);
assert.deepEqual(getWeakListeningItemIds(reviewCandidates), ['weakAndDue', 'weakNotDue']);
assert.deepEqual(getWeakListeningItemIds(reviewCandidates, 0.25), []);
assert.deepEqual(getWeakListeningItemIds(reviewCandidates, 0.8), ['weakAndDue', 'weakNotDue']);
assert.deepEqual(getDueListeningItemIds({}, reviewedAt), []);

console.log('Listening progress scheduling and validation tests passed.');
