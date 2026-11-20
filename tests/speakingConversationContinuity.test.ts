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


assert.match(tutorApi, /function isGenericAcknowledgement/);
assert.match(tutorApi, /isGenericAcknowledgement\(response\)/);
assert.match(tutorApi, /Do not say only that you understood/);
assert.doesNotMatch(tutorClient, /getLocalFallbackResponse/, 'AI failures must never be converted into canned learner-facing replies');
assert.match(tutorClient, /code: 'TUTOR_PROVIDER_UNAVAILABLE'/);
assert.match(tutorScreen, /TUTOR_PROVIDER_UNAVAILABLE/);

console.log('Speaking conversation continuity tests passed');
