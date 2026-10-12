import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/services/speech.ts'), 'utf8');
const fallbackStart = source.indexOf('private async startMediaRecorderFallback');
const fallbackEnd = source.indexOf('private cleanupMediaRecorder', fallbackStart);
assert.ok(fallbackStart >= 0 && fallbackEnd > fallbackStart, 'MediaRecorder fallback should exist');
const fallback = source.slice(fallbackStart, fallbackEnd);

assert.match(fallback, /const recorder = new MediaRecorder\(stream,/);
assert.match(fallback, /const chunks: Blob\[\] = \[\]/);
assert.match(fallback, /recorder\.ondataavailable = event => \{\s*if \(event\.data\.size > 0\) chunks\.push\(event\.data\)/);
assert.match(fallback, /recorder\.onstop = async \(\) => \{\s*stream\.getTracks\(\)\.forEach\(track => track\.stop\(\)\);\s*if \(sessionId !== this\.mediaRecorderSessionId\) return;/);
assert.match(fallback, /const transcript = await this\.transcribeAudio\(blob\);\s*if \(sessionId !== this\.mediaRecorderSessionId\) return;/);
assert.match(fallback, /\} catch \(error\) \{\s*if \(sessionId !== this\.mediaRecorderSessionId\) \{\s*if \(this\.pendingMediaRecorderStart\?\.sessionId === sessionId\) this\.pendingMediaRecorderStart = null;\s*return;\s*\}/);

console.log('Stale MediaRecorder callback regression checks passed.');
