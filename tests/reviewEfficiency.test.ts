import assert from 'node:assert/strict';
import fs from 'node:fs';

const home = fs.readFileSync('src/components/home/HomeDashboard.tsx', 'utf8');
const review = fs.readFileSync('src/components/review/ReviewScreen.tsx', 'utf8');
const flashcard = fs.readFileSync('src/components/flashcard/Flashcard.tsx', 'utf8');
const shell = fs.readFileSync('src/components/layout/AppShell.tsx', 'utf8');

assert.doesNotMatch(home, /label: 'Ôn tập'/, 'Review should not appear as a second shortcut beside the daily plan');
assert.match(review, /uniqueFlashcards/, 'Review queue should deduplicate vocabulary cards');
assert.match(review, /hardCards\.filter\(card => !dueIds\.has\(card\.id\)\)/, 'Smart review should not enqueue duplicate due/hard cards');
assert.doesNotMatch(review, /freshCards/, 'Smart review should not fill the queue with arbitrary unseen cards');
assert.match(review, /meaning-to-hanzi/, 'Review should test productive recall, not only recognition');
assert.match(review, /audio-to-hanzi/, 'Review should include audio-to-character recall');
assert.match(flashcard, /recallDraft/, 'Learners must attempt recall before revealing the answer');
assert.match(flashcard, /Câu trả lời của bạn/, 'The revealed answer should support self-comparison');
assert.match(shell, /React\.lazy\(\(\) => import\('\.\.\/tutor\/TutorScreen'\)/, 'Heavy tutor screen should be loaded on demand');
assert.match(shell, /React\.Suspense fallback/, 'Lazy screens should have a loading fallback');

console.log('Review efficiency and app-loading regression tests passed');
