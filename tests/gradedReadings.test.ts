import assert from 'node:assert/strict';
import { GRADED_READINGS, HSK_LEVELS } from '../src/data/gradedReadings';

assert.ok(GRADED_READINGS.length >= 20, 'The reading library should keep expanding with varied topics.');
for (const level of HSK_LEVELS) {
  assert.ok(GRADED_READINGS.filter(item => item.level === level).length >= 2, '' + level + ' should retain at least two original readings.');
}
for (const reading of GRADED_READINGS) {
  assert.ok(reading.sentences.length >= 3, '' + reading.id + ' should contain multiple aligned sentences.');
  for (const sentence of reading.sentences) {
    assert.match(sentence.chinese, /[\u3400-\u9fff]/u, 'Chinese sentence must contain Han characters.');
    assert.ok(sentence.pinyin.trim().length > 0, 'Pinyin must be present.');
    assert.ok(sentence.vietnamese.trim().length > 0, 'Vietnamese translation must be present.');
  }
  assert.ok(reading.focusWords.length >= 8, 'Each reading should have a vocabulary focus list.');
  for (const question of reading.questions) {
    assert.ok(question.options.length >= 2);
    assert.ok(question.answer >= 0 && question.answer < question.options.length);
    assert.ok(question.explanation.trim().length > 0);
  }
}
console.log('Lina graded reading content tests passed.');
