import assert from 'node:assert/strict';
import fs from 'node:fs';

const tutor = fs.readFileSync('src/components/tutor/TutorScreen.tsx', 'utf8');
const listening = fs.readFileSync('src/components/listening/ListeningScreen.tsx', 'utf8');
const review = fs.readFileSync('src/components/review/ReviewScreen.tsx', 'utf8');
const appShell = fs.readFileSync('src/components/layout/AppShell.tsx', 'utf8');
const chineseSentence = fs.readFileSync('src/components/common/ChineseSentence.tsx', 'utf8');

assert.match(chineseSentence, /const handleSelectWord = \(word: string\) =>/ , 'selecting vocabulary should use the managed audio-selection handler');
assert.match(chineseSentence, /handleSelectWord\(part\.word!\.hanzi\)/, 'vocabulary taps should stop audio from the previously selected word');
assert.match(chineseSentence, /speechService\.stopSpeaking\(\);\s*setIsPlayingWord\(false\);\s*setSelectedWord\(/, 'changing vocabulary selection should stop speech and reset playback state');

for (const label of ['Luyện nói', 'Hội thoại AI']) {
  assert.ok(tutor.includes(label), 'Practice hub must expose ' + label);
}
assert.match(tutor, /grid-cols-2 gap-1\.5/, 'speaking modes should share a compact two-column layout');
assert.match(tutor, /aria-label="Chế độ luyện nói với Lina"/, 'speaking navigation should be labelled for assistive technology');
assert.match(tutor, /aria-current=\{activePracticeTab === id \? 'page' : undefined\}/, 'active practice mode should be announced');
assert.match(tutor, /setTutorMode\('teacher'\)/, 'speaking tab must use the speaking coach mode');
assert.match(tutor, /setTutorMode\('conversation'\)/, 'AI conversation tab must use conversation mode');
assert.match(tutor, /speechService\.stopListening\(\)/, 'switching modes should stop microphone capture');
assert.match(tutor, /realtimeConversationController\.interrupt\(\)/, 'switching modes should interrupt active AI audio');
assert.match(tutor, /clearTimeout\(autoSendTimerRef\.current\)/, 'switching modes should clear pending voice auto-send');
assert.match(listening, /recordListeningQuizResult/, 'listening results should continue to be recorded');
assert.match(review, /updateFlashcardRating/, 'review ratings should continue to update spaced repetition');
assert.match(appShell, /case 'speak':\s*return <TutorScreen \/>/, 'existing navigation should continue to enter the practice hub');
assert.match(appShell, /case 'listening':\s*return <ListeningScreen \/>/, 'listening remains available from the primary navigation');
assert.match(appShell, /case 'review':\s*return <ReviewScreen \/>/, 'review remains available from the primary navigation');
assert.doesNotMatch(tutor, /label: 'Luyện nghe'|label: 'Ôn tập'|<ListeningScreen \/>|<ReviewScreen \/>/, 'speaking hub must not duplicate primary navigation destinations');

assert.match(chineseSentence, /<span className="mr-1 text-\[10px\] font-bold uppercase tracking-wide opacity-70">Pinyin<\/span>\{selected\.pinyin\}/, 'selected vocabulary should visually emphasize the matching tone-marked pinyin');
assert.match(chineseSentence, /<span className="mr-1 text-\[10px\] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">Nghĩa<\/span>\{selected\.vietnamese\}/, 'selected vocabulary should visually emphasize its Vietnamese meaning alongside Hanzi and pinyin');

console.log('Speaking practice hub navigation and integration tests passed');
