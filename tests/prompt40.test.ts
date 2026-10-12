import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/services/speech.ts'), 'utf8');
const start = source.indexOf('private async startMediaRecorderFallback');
const end = source.indexOf('private cleanupMediaRecorder', start);
assert.ok(start >= 0 && end > start, 'MediaRecorder fallback should exist');
const fallback = source.slice(start, end);

assert.match(fallback, /let transcript: string;\s*try \{\s*transcript = await this\.transcribeAudio\(blob\);\s*\} catch \{\s*if \(sessionId !== this\.mediaRecorderSessionId\) return;\s*this\.usingMediaRecorderFallback = false;\s*options\.onError\('Không thể chuyển giọng nói thành văn bản lúc này\. Bạn kiểm tra kết nối rồi thử lại nhé\.'\);\s*options\.onEnd\(\);\s*return;/);
assert.match(fallback, /if \(sessionId !== this\.mediaRecorderSessionId\) return;\s*this\.usingMediaRecorderFallback = false;/);

console.log('Transcription failure handling regression checks passed.');
