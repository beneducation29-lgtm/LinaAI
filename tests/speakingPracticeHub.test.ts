import assert from 'node:assert/strict';
import fs from 'node:fs';

const tutor = fs.readFileSync('src/components/tutor/TutorScreen.tsx', 'utf8');
const listening = fs.readFileSync('src/components/listening/ListeningScreen.tsx', 'utf8');
const review = fs.readFileSync('src/components/review/ReviewScreen.tsx', 'utf8');
const appShell = fs.readFileSync('src/components/layout/AppShell.tsx', 'utf8');

for (const label of ['Luyện nghe', 'Luyện nói', 'Hội thoại AI', 'Ôn tập']) {
  assert.ok(tutor.includes(label), 'Practice hub must expose ' + label);
}
assert.match(tutor, /grid-cols-2 sm:grid-cols-4/, 'practice navigation should adapt to mobile and desktop');
assert.match(tutor, /aria-label="Khu luyện nghe nói"/, 'practice navigation should be labelled for assistive technology');
assert.match(tutor, /aria-current=\{activePracticeTab === id \? 'page' : undefined\}/, 'active practice mode should be announced');
assert.match(tutor, /<ListeningScreen \/>/, 'listening tab must open the existing listening experience');
assert.match(tutor, /<ReviewScreen \/>/, 'review tab must open the existing review experience');
assert.match(tutor, /setTutorMode\('teacher'\)/, 'speaking tab must use the speaking coach mode');
assert.match(tutor, /setTutorMode\('conversation'\)/, 'AI conversation tab must use conversation mode');
assert.match(tutor, /speechService\.stopListening\(\)/, 'switching modes should stop microphone capture');
assert.match(tutor, /realtimeConversationController\.interrupt\(\)/, 'switching modes should interrupt active AI audio');
assert.match(tutor, /clearTimeout\(autoSendTimerRef\.current\)/, 'switching modes should clear pending voice auto-send');
assert.match(listening, /recordListeningQuizResult/, 'listening results should continue to be recorded');
assert.match(review, /updateFlashcardRating/, 'review ratings should continue to update spaced repetition');
assert.match(appShell, /case 'speak':\s*return <TutorScreen \/>/, 'existing navigation should continue to enter the practice hub');

console.log('Speaking practice hub navigation and integration tests passed');
