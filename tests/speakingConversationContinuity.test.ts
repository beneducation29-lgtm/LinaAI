import assert from 'node:assert/strict';
import fs from 'node:fs';

const tutorApi = fs.readFileSync('api/tutor.js', 'utf8');
const tutorClient = fs.readFileSync('src/services/aiTutor.ts', 'utf8');
const tutorScreen = fs.readFileSync('src/components/tutor/TutorScreen.tsx', 'utf8');

assert.match(tutorApi, /const MAX_HISTORY = 8/);
assert.match(tutorClient, /options\.history\.slice\(-8\)/);
assert.match(tutorApi, /Duy trì mạch hội thoại qua tối đa 4 lượt trao đổi gần nhất/);
assert.match(tutorApi, /Không hỏi lại thông tin người học đã trả lời/);
assert.match(tutorApi, /function comparableChinese/);
assert.match(tutorApi, /function repeatsPreviousTutorReply/);
assert.match(tutorApi, /REGENERATION REQUIRED/);
assert.match(tutorApi, /TUTOR_REPETITIVE_RESPONSE/);
assert.match(tutorClient, /TUTOR_REPETITIVE_RESPONSE/);
assert.match(tutorScreen, /TUTOR_REPETITIVE_RESPONSE/);

console.log('Speaking conversation continuity tests passed');
