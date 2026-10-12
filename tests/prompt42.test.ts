import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('server.ts', 'utf8');
const streamStart = source.indexOf("app.post('/api/tutor/chat/stream'");
const analyticsStart = source.indexOf("const ANALYTICS_EVENT_NAMES", streamStart);
assert.ok(streamStart >= 0 && analyticsStart > streamStart, 'Tutor streaming route should exist');
const streamRoute = source.slice(streamStart, analyticsStart);
assert.ok(streamRoute.includes("'Content-Type', 'text/event-stream; charset=utf-8'") || streamRoute.includes("'Content-Type','text/event-stream; charset=utf-8'"), 'streaming route should declare SSE content type');
assert.ok(streamRoute.includes(String.raw`JSON.stringify(payload)+'\\n\\n'`) === false, 'SSE frames must not contain literal backslash-n sequences');
assert.ok(streamRoute.includes(String.raw`JSON.stringify(payload)+'\n\n'`), 'each SSE event must end with actual newline delimiters');
assert.ok(streamRoute.includes("send({type:'response'") && streamRoute.includes("send({type:'done'})"), 'stream should emit response and completion events');

console.log('Tutor SSE framing regression checks passed.');
