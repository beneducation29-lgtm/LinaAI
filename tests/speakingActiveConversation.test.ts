import assert from 'node:assert/strict';
import fs from 'node:fs';

const api = fs.readFileSync('api/tutor.js', 'utf8');
const client = fs.readFileSync('src/services/aiTutor.ts', 'utf8');
const screen = fs.readFileSync('src/components/tutor/TutorScreen.tsx', 'utf8');
const types = fs.readFileSync('src/types/index.ts', 'utf8');

assert.match(api, /sessionTurnNumber/);
assert.match(api, /sessionElapsedMinutes/);
assert.match(api, /Nhịp phiên 10-15 phút/);
assert.match(api, /lượt 3-7 đào sâu/);
assert.match(api, /từ lượt 12 có thể tổng kết/);
assert.match(api, /HSK 1-2: thường 2-3 câu ngắn/);
assert.match(api, /HSK 3-4: thường 3-4 câu/);
assert.match(api, /HSK 5-6: thường 4-6 câu/);
assert.match(api, /memoryFacts như ký ức dài hạn/);
assert.match(api, /nextBranch/);
assert.match(client, /sessionTurnNumber: options\.sessionTurnNumber/);
assert.match(client, /sessionElapsedMinutes: options\.sessionElapsedMinutes/);
assert.match(screen, /conversation\.messages\.filter\(message => message\.sender === 'user'\)/);
assert.match(screen, /preference: structuredRes\.memoryUpdate\?\.interest/);
assert.match(types, /conversationSummary\?: string/);

console.log('Active conversation roadmap tests passed');
