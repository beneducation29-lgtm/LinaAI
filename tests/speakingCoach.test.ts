import assert from 'node:assert/strict';
import fs from 'node:fs';

const tutorScreen = fs.readFileSync('src/components/tutor/TutorScreen.tsx', 'utf8');
const tutorMessage = fs.readFileSync('src/components/tutor/TutorMessage.tsx', 'utf8');
const tutorApi = fs.readFileSync('api/tutor.js', 'utf8');
const types = fs.readFileSync('src/types/index.ts', 'utf8');

assert.match(tutorScreen, /isSpoken = false/);
assert.match(tutorScreen, /isSpoken }/);
assert.match(tutorScreen, /structuredRes\.speakingCoach/);
assert.match(tutorScreen, /addMistake\(/);
assert.match(tutorMessage, /Speaking Coach/);
assert.match(tutorMessage, /naturalnessScore/);
assert.match(tutorMessage, /onRetrySpeaking/);
assert.match(tutorApi, /isSpoken=true/);
assert.match(tutorApi, /speakingCoach/);
assert.match(tutorApi, /acoustic/);
assert.match(types, /speakingCoach\?:/);

console.log('Speaking Coach architecture tests passed');
