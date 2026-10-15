import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  countDueListeningReviews,
  getDueListeningItemIds,
  getWeakListeningItemIds,
  getSmartListeningItemIds,
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
assert.deepEqual(
  getSmartListeningItemIds(
    reviewCandidates,
    ['neverAttempted', 'weakNotDue', 'strongestDueFirst', 'weakAndDue'],
    3,
    new Date('2026-10-14T00:10:00.000Z'),
  ),
  ['strongestDueFirst', 'weakAndDue', 'weakNotDue'],
);
assert.deepEqual(
  getSmartListeningItemIds(
    reviewCandidates,
    ['neverAttempted', 'weakNotDue', 'strongestDueFirst', 'weakAndDue', 'weakNotDue'],
    10,
    new Date('2026-10-14T00:10:00.000Z'),
  ),
  ['strongestDueFirst', 'weakAndDue', 'weakNotDue', 'neverAttempted'],
);
assert.deepEqual(getSmartListeningItemIds(reviewCandidates, [], 5, reviewedAt), []);
assert.deepEqual(getSmartListeningItemIds(reviewCandidates, ['weakAndDue'], 0, reviewedAt), []);


const listeningSource = fs.readFileSync('src/components/listening/ListeningScreen.tsx', 'utf8');
const newListeningLessons: Array<[string, number]> = [
  ['introduce-school', 1], ['daily-breakfast', 1],
  ['library-card', 2], ['missed-bus', 2],
  ['return-package', 3], ['team-decision', 3],
  ['train-change', 4], ['project-risk', 4],
  ['media-literacy', 5], ['urban-planning', 5],
  ['research-limits', 6], ['negotiation', 6],
];
for (const [id, hsk] of newListeningLessons) {
  const lessonLine = listeningSource.split(/\r?\n/).find(line => line.includes(`id:'${id}',hsk:${hsk},`));
  assert.ok(lessonLine, `Missing HSK ${hsk} listening lesson: ${id}`);
  assert.match(lessonLine, /hanzi:/, `${id} must include Chinese listening text`);
  assert.match(lessonLine, /pinyin:/, `${id} must include pinyin`);
  assert.match(lessonLine, /meaning:/, `${id} must include Vietnamese meaning`);
  assert.match(lessonLine, /question:/, `${id} must include a comprehension question`);
  assert.match(lessonLine, /options:/, `${id} must include answer options`);
  assert.match(lessonLine, /answer:[0-2]/, `${id} must include a valid answer index`);
  assert.match(lessonLine, /note:/, `${id} must include a learning note`);
}
assert.equal(new Set(newListeningLessons.map(([id]) => id)).size, 12, 'new listening lesson IDs must be unique');

console.log('Listening progress scheduling and validation tests passed.');
