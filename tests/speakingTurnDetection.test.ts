import assert from 'node:assert/strict';
import fs from 'node:fs';

const speech = fs.readFileSync('src/services/speech.ts', 'utf8');
const screen = fs.readFileSync('src/components/tutor/TutorScreen.tsx', 'utf8');

// Recognition final and interim segments must never be conflated.
assert.match(speech, /let finalTranscript = ''/);
assert.match(speech, /let interimTranscript = ''/);
assert.match(speech, /options\.onResult\(\{ transcript: finalTranscript, isFinal: true/);
assert.match(speech, /options\.onResult\(\{ transcript: interimTranscript, isFinal: false/);

// Every new speech result cancels the silence timer; auto-send waits for a
// substantially longer pause and is protected against stale recognition sessions.
assert.match(screen, /Any new speech activity \(including interim words\) cancels the pending/);
assert.match(screen, /clearTimeout\(autoSendTimerRef\.current\)/);
assert.match(screen, /\}, 2600\)/);
assert.match(screen, /sessionId !== speechSessionRef\.current \|\| spokenSendInFlightRef\.current/);
assert.doesNotMatch(screen, /\}, 900\)/);

console.log('Speaking turn detection tests passed');
