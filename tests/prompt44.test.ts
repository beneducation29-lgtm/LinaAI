import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/services/speech.ts', 'utf8');
const apiSource = fs.readFileSync('api/tts/speak.js', 'utf8');
const speakStart = source.indexOf('  speakChinese(');
const synthStart = source.indexOf('  private speakWithSpeechSynthesis(', speakStart);
const stopStart = source.indexOf('  stopSpeaking(): void', synthStart);
assert.ok(speakStart >= 0 && synthStart > speakStart && stopStart > synthStart, 'speech playback methods should exist');

const speak = source.slice(speakStart, synthStart);
const synth = source.slice(synthStart, stopStart);
const stop = source.slice(stopStart, source.indexOf('  pauseSpeaking(): void', stopStart));

assert.match(source, /private playbackSessionId = 0;/, 'each playback should have a cancellation generation');
assert.match(source, /private activePlaybackResolve: \(\(\) => void\) \| null = null;/, 'stopping playback should settle the previous pending promise');
assert.match(speak, /this\.stopSpeaking\(\);\s*const playbackSessionId = this\.playbackSessionId;/, 'new playback should establish a fresh session after cancelling the old one');
assert.match(speak, /await this\.fetchGeminiTTSAudio\(text\);\s*if \(playbackSessionId !== this\.playbackSessionId\)/, 'a delayed TTS response must not start after its session was cancelled');
assert.match(speak, /audio\.onended = \(\) => \{\s*if \(playbackSessionId !== this\.playbackSessionId(?: \|\| this\.currentAudioElement !== audio)?\) return;/, 'stale audio end events must not clear newer playback state');
assert.match(speak, /audio\.onerror = \(\) => \{\s*if \(playbackSessionId !== this\.playbackSessionId(?: \|\| this\.currentAudioElement !== audio)?\) return;/, 'stale audio errors must not mutate newer playback state');
assert.match(synth, /utterance\.onstart = \(\) => \{\s*if \(playbackSessionId !== this\.playbackSessionId\) return;/, 'stale synthesis start events must be ignored');
assert.match(synth, /utterance\.onend = \(\) => \{\s*if \(playbackSessionId !== this\.playbackSessionId\) return;/, 'stale synthesis end events must be ignored');
assert.match(synth, /utterance\.onerror = \(\) => \{\s*if \(playbackSessionId !== this\.playbackSessionId\) return;/, 'stale synthesis errors must be ignored');
assert.match(stop, /this\.playbackSessionId \+= 1;[\s\S]*?this\.activePlaybackResolve = null;[\s\S]*?resolveActivePlayback\?\.\(\);/, 'stop should invalidate async playback and settle its pending promise');
assert.match(speak, /this\.speakWithSpeechSynthesis\(text, options, finish, playbackSessionId\)/, 'native speech fallback should use the same cancellation session');
const ttsFetchStart = source.indexOf('async fetchGeminiTTSAudio(');
const ttsFetchEnd = source.indexOf('  speakChinese(', ttsFetchStart);
const ttsFetch = source.slice(ttsFetchStart, ttsFetchEnd);
assert.match(ttsFetch, /failure\?\.cooldownSeconds/, 'server cooldown hints should be honored for provider failures');
assert.match(ttsFetch, /res\.status === 429 \? 30 : res\.status === 503 \? 60 : 15/, 'rate limits, disabled providers and transient failures need distinct fallback cooldowns');
assert.match(ttsFetch, /this\.audioFailureUntil = Date\.now\(\) \+ cooldownSeconds \* 1000/, 'failed Gemini TTS should be circuit-broken before the next phrase');
assert.match(apiSource, /TTS_PROVIDER_DISABLED/, 'a billing-disabled TTS provider should be classified as unavailable');

console.log('Speech playback cancellation and stale-event regression checks passed.');
