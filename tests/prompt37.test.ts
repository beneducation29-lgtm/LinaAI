import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/services/speech.ts'), 'utf8');
const fallbackStart = source.indexOf('private async startMediaRecorderFallback');
const fallbackEnd = source.indexOf('private cleanupMediaRecorder', fallbackStart);
assert.ok(fallbackStart >= 0 && fallbackEnd > fallbackStart, 'MediaRecorder fallback should exist');
const fallback = source.slice(fallbackStart, fallbackEnd);

assert.match(source, /private mediaRecorderSessionId = 0/);
assert.match(fallback, /const sessionId = \+\+this\.mediaRecorderSessionId/);
assert.match(fallback, /const stream = await navigator\.mediaDevices\.getUserMedia\(\{ audio: true \}\);\s*if \(sessionId !== this\.mediaRecorderSessionId\)/);
assert.match(fallback, /this\.mediaRecorder\.onerror = \(\) => \{\s*if \(sessionId !== this\.mediaRecorderSessionId\) return;/);

console.log('Microphone session guard regression checks passed.');
