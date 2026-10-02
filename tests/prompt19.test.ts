import assert from 'node:assert/strict';
import { parseAndSanitizeJSON, enforceLearningLevel } from '../src/services/aiValidation';
import { AI_PROMPT_VERSION, AI_TASK_CONFIG } from '../src/services/aiConfig';

const parsed = parseAndSanitizeJSON<any>('{"chinese":"你好","x":"ok"}');
assert.equal(parsed.ok, true);
assert.equal(parsed.value.chinese, '你好');

const invalid = parseAndSanitizeJSON<any>('{bad json');
assert.equal(invalid.ok, false);

const safe = parseAndSanitizeJSON<any>('{"text":"hello\\u0000world"}');
assert.equal(safe.ok, true);
assert.equal(safe.value.text, 'helloworld');

const level = enforceLearningLevel({ vocabulary: [{ hanzi: '你好', hskLevel: 'HSK 6' }, { hanzi: '你好', hskLevel: 'HSK 1' }] }, 'HSK 1');
assert.equal(level.vocabulary[0].hskLevel, undefined);
assert.equal(level.vocabulary[1].hskLevel, 'HSK 1');

assert.equal(AI_PROMPT_VERSION, '19.1.0');
for (const task of ['conversation','correction','translation','lesson_generation','roleplay','vocabulary','grammar','summary','personalization']) {
  assert.ok(AI_TASK_CONFIG[task as keyof typeof AI_TASK_CONFIG]);
  assert.ok(AI_TASK_CONFIG[task as keyof typeof AI_TASK_CONFIG].timeoutMs <= 18000);
}
console.log('Prompt 19 AI orchestration tests passed');
