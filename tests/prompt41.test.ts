import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/services/speech.ts'), 'utf8');
const start = source.indexOf('  async transcribeAudio(');
const end = source.indexOf('  // ===================== TEXT-TO-SPEECH', start);
assert.ok(start >= 0 && end > start, 'transcribeAudio should exist');
const transcribe = source.slice(start, end);

assert.ok(transcribe.includes('if (!res.ok)'), 'non-success HTTP responses should be treated as failures');
assert.ok(transcribe.includes('throw new Error(`Speech transcription request failed (${res.status})`)'), 'HTTP failures should throw');
assert.match(transcribe, /catch \(err\) \{[\s\S]*?throw err;\s*\}/, 'network and file-read failures should propagate');
assert.match(source, /catch \{\s*if \(sessionId !== this\.mediaRecorderSessionId\) return;\s*this\.usingMediaRecorderFallback = false;\s*options\.onError\('Không thể chuyển giọng nói thành văn bản lúc này\. Bạn kiểm tra kết nối rồi thử lại nhé\.'\);\s*options\.onEnd\(\);/);

console.log('Transcription request failure propagation regression checks passed.');
