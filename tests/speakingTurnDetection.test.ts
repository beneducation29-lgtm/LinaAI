import assert from 'node:assert/strict';
import fs from 'node:fs';

const speech = fs.readFileSync('src/services/speech.ts', 'utf8');
const screen = fs.readFileSync('src/components/tutor/TutorScreen.tsx', 'utf8');

assert.ok(speech.includes("let finalTranscript = ''"));
assert.ok(speech.includes("let interimTranscript = ''"));
assert.ok(speech.includes("isFinal: true, confidence: finalConfidence"));
assert.ok(speech.includes("isFinal: false"));
assert.ok(screen.includes("clearTimeout(autoSendTimerRef.current)"));
assert.ok(screen.includes("}, 2600)"));
assert.ok(screen.includes("sessionId !== speechSessionRef.current"));
assert.ok(screen.includes(".replace(/\\s+/g, ' ')"));
assert.ok(!screen.includes(".replace(/\\\\s+/g, ' ')"));

console.log('Speaking turn detection tests passed');
