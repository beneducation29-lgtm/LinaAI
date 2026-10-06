import assert from 'node:assert/strict';
import fs from 'node:fs';

const tutorScreen = fs.readFileSync('src/components/tutor/TutorScreen.tsx', 'utf8');
const tutorMessage = fs.readFileSync('src/components/tutor/TutorMessage.tsx', 'utf8');
const tutorApi = fs.readFileSync('api/tutor.js', 'utf8');
const types = fs.readFileSync('src/types/index.ts', 'utf8');

assert.match(tutorScreen, /isSpoken = false/);
assert.match(tutorScreen, /isSpoken, isSpeakingRetry/);
assert.match(tutorScreen, /speakingCoachRef|speakingRetryRef/);
assert.match(tutorScreen, /structuredRes\.speakingCoach/);
assert.match(tutorScreen, /addMistake\(/);
assert.match(tutorMessage, /Speaking Coach/);
assert.match(tutorMessage, /naturalnessScore/);
assert.match(tutorMessage, /onRetrySpeaking/);
assert.match(tutorApi, /isSpoken=true/);
assert.match(tutorApi, /speakingCoach/);
assert.match(tutorApi, /isSpeakingRetry/);
assert.match(tutorApi, /speakingCoachTarget/);
assert.match(tutorApi, /retryResolved/);
assert.match(tutorApi, /acoustic/);
assert.match(types, /speakingCoach\?:/);
assert.match(types, /SpeakingCoachDetails/);
assert.match(types, /retryResolved\?: boolean/);

console.log('Speaking Coach architecture tests passed');


const hskVocabulary = fs.readFileSync('src/data/hskSpeakingVocabulary.ts', 'utf8');
const learningScreen = fs.readFileSync('src/components/learning/LearningSystemScreen.tsx', 'utf8');
assert.match(hskVocabulary, /HSK 1/);
assert.match(hskVocabulary, /HSK 2/);
assert.match(hskVocabulary, /HSK 3/);
assert.match(hskVocabulary, /HSK 4/);
assert.match(hskVocabulary, /HSK 5/);
assert.match(hskVocabulary, /HSK 6/);
assert.match(learningScreen, /Kho HSK cổ điển · dữ liệu thật/);
assert.match(learningScreen, /vocabularyQuery/);
assert.match(learningScreen, /toggleSaveVocabulary/);

const packCounts = [...hskVocabulary.matchAll(/v\('(hsk[1-6]-v\d+)'/g)].map(m => m[1]).reduce((acc, id) => {
  const level = id.slice(0, 4);
  acc[level] = (acc[level] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
for (const level of ['hsk1','hsk2','hsk3','hsk4','hsk5','hsk6']) {
  assert.equal(packCounts[level], 20, level + ' speaking vocabulary pack should contain 20 entries');
}
console.log('HSK speaking vocabulary catalog tests passed');


const classicVocabulary = fs.readFileSync('src/data/hskClassicVocabulary.ts', 'utf8');
const classicIds = [...classicVocabulary.matchAll(/id: 'hsk-classic-(\d{4})'/g)].map(m => m[1]);
assert.equal(classicIds.length, 5000, 'classic HSK corpus should contain exactly 5000 entries');
assert.equal(new Set(classicIds).size, 5000, 'classic HSK corpus IDs must be unique');
assert.match(classicVocabulary, /HSK 1–6 vocabulary corpus/);
assert.match(classicVocabulary, /CC0-1\.0/);
assert.match(learningScreen, /const \[vocabularyQuery,setVocabularyQuery\]/);
console.log('Classic HSK 5000 vocabulary tests passed');


const appShell = fs.readFileSync('src/components/layout/AppShell.tsx', 'utf8');
const appContext = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
assert.match(appShell, /!authUser/);
assert.match(appShell, /Kho học tập riêng của bạn/);
assert.match(appShell, /Đăng nhập tài khoản/);
assert.match(appContext, /currentLevel: 'Chưa biết gì'/);
assert.match(appContext, /vocabularyLearnedCount: 0/);
assert.match(appContext, /tags: \[\.\.\.new Set/);
assert.match(learningScreen, /Kho HSK cổ điển · dữ liệu thật/);
assert.match(learningScreen, /vocabularyPageSize = 48/);
assert.match(learningScreen, /classicVocabulary/);
console.log('Authenticated real-data learning UI tests passed');


const authService = fs.readFileSync('src/services/authService.ts', 'utf8');
const authApi = fs.readFileSync('api/auth/[...path].js', 'utf8');
const googleApi = fs.readFileSync('api/auth/google.js', 'utf8');
assert.match(appShell, /Đăng ký ngay/);
assert.match(appShell, /Quên mật khẩu\?/);
assert.match(appShell, /Tiếp tục với Google/);
assert.match(appShell, /\/auth\/callback/);
assert.match(appShell, /\/auth\/reset-password/);
assert.match(authService, /startGoogleLogin/);
assert.match(authService, /requestPasswordReset/);
assert.match(authService, /resetPassword/);
for (const route of ['login','signup','google','me','refresh','logout','forgot-password','reset-password','oauth/session']) {
  assert.match(authApi, new RegExp(`action===['"]${route}['"]`));
}
assert.match(authApi, /signIn\(/);
assert.match(authApi, /signUp\(/);
assert.match(googleApi, /auth\/v1\/authorize/);
assert.match(googleApi, /provider.*google/);
assert.match(googleApi, /flow_type.*implicit/);
assert.match(googleApi, /redirectTo.*auth\/callback/);
assert.match(googleApi, /Content-Security-Policy/);
assert.match(authApi, /sendPasswordRecovery/);
assert.match(authApi, /updatePassword/);
console.log('Authentication signup, Google OAuth and password recovery tests passed');
