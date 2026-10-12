import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/services/speech.ts'), 'utf8');
const start = source.indexOf('private async startMediaRecorderFallback');
const stop = source.indexOf('  stopListening(): void');
const end = source.indexOf('  async transcribeAudio', stop);
assert.ok(start >= 0 && stop > start && end > stop, 'Speech fallback and stopListening should exist');
const fallback = source.slice(start, stop);
const stopMethod = source.slice(stop, end);

assert.match(source, /private pendingMediaRecorderStart: \{ sessionId: number; onEnd: \(\) => void \} \| null = null/);
assert.match(fallback, /this\.pendingMediaRecorderStart = \{ sessionId, onEnd: options\.onEnd \}/);
assert.match(fallback, /if \(sessionId !== this\.mediaRecorderSessionId\) \{\s*stream\.getTracks\(\)\.forEach\(track => track\.stop\(\)\);/);
assert.match(stopMethod, /if \(!this\.recognition && !this\.mediaRecorder && !this\.usingMediaRecorderFallback\) \{\s*this\.mediaRecorderSessionId \+= 1;\s*const pendingStart = this\.pendingMediaRecorderStart;\s*this\.pendingMediaRecorderStart = null;\s*this\.isListeningActive = false;\s*pendingStart\?\.onEnd\(\);/);
assert.match(fallback, /if \(this\.pendingMediaRecorderStart\?\.sessionId === sessionId\) this\.pendingMediaRecorderStart = null;/);

console.log('Pending microphone start cancellation regression checks passed.');
