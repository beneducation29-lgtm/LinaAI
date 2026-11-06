import assert from 'node:assert/strict';
import fs from 'node:fs';

const speech = fs.readFileSync('src/services/speech.ts', 'utf8');
const screen = fs.readFileSync('src/components/tutor/TutorScreen.tsx', 'utf8');

assert.match(speech, /let finalTranscript = ''/);
assert.match(speech, /let interimTranscript = ''/);
assert.match(speech, /options\.onResult\(\{ transcript: finalTranscript, isFinal: true/);
assert.match(speech, /options\.onResult\(\{ transcript: interimTranscript, isFinal: false/);
assert.match(screen, /clearTimeout\(autoSendTimerRef\.current\)/);
assert.match(screen, /autoSendTimerRef\.current = null/);
assert.match(screen, /\}, 2600\)/);
assert.match(screen, /sessionId !== speechSessionRef\.current/);
assert.doesNotMatch(screen, /\}, 900\)/);

console.log('Speaking turn detection tests passed');
