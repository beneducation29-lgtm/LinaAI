import assert from 'node:assert/strict';
import fs from 'node:fs';

const card = fs.readFileSync('src/components/vocabulary/VocabularyCard.tsx', 'utf8');
const speech = fs.readFileSync('src/services/speech.ts', 'utf8');

assert.ok(card.includes("import { speechService } from '../../services/speech'"), 'lesson vocabulary cards must use the shared speech engine');
assert.ok(card.includes('useGeminiTTS: true'), 'lesson vocabulary should prefer the configured Chinese Gemini voice');
assert.ok(card.includes("lang: 'zh-CN'"), 'vocabulary audio must use Mandarin');
assert.ok(card.includes('onError: () => setPlaybackError('), 'audio failures must be visible to the learner');
assert.ok(card.includes('finally {\n      setIsPlaying(false);'), 'the play control must recover after playback settles');
assert.ok(speech.includes('if (!this.synth) {\n      options?.onError?.();\n      options?.onEnd?.();'), 'unsupported native speech must report a playback failure');

console.log('Lesson vocabulary audio routing tests passed.');
