import assert from 'node:assert/strict';
import { HSK2_6_LESSONS } from '../src/data/hskExpandedLessons';

const hanziPattern = /[\u3400-\u9fff]/;
let vocabularyExamples = 0;
let grammarExamples = 0;

for (const lesson of HSK2_6_LESSONS) {
  assert.equal(lesson.vocabulary.length, 5, `${lesson.id} must contain five vocabulary entries`);
  assert.ok(lesson.grammar.length > 0, `${lesson.id} must contain grammar content`);

  for (const word of lesson.vocabulary) {
    assert.ok(word.exampleChinese.trim(), `${word.id} is missing its Chinese example sentence`);
    const hasPinyin = Boolean(word.examplePinyin.trim());
    const hasVietnamese = Boolean(word.exampleVietnamese.trim());
    assert.equal(hasPinyin, hasVietnamese, `${word.id} must provide both sentence pinyin and Vietnamese, or neither`);
    if (lesson.hskLevel === 'HSK 2' || lesson.hskLevel === 'HSK 3') {
      assert.ok(hasPinyin && hasVietnamese, `${word.id} HSK 2 example must have curated sentence pinyin and Vietnamese`);
    }
    if (hasVietnamese) {
      assert.ok(!hanziPattern.test(word.exampleVietnamese), `${word.id} Vietnamese translation must not contain Chinese characters`);
      assert.notEqual(word.exampleVietnamese, word.vietnamese, `${word.id} must not reuse the headword meaning as a sentence translation`);
      assert.notEqual(word.examplePinyin, word.pinyin, `${word.id} must not reuse headword pinyin as sentence pinyin`);
    }
    vocabularyExamples++;
  }

  for (const grammar of lesson.grammar) {
    assert.ok(grammar.examples.length > 0, `${grammar.id} must contain example sentences`);
    for (const example of grammar.examples) {
      assert.ok(example.chinese.trim(), `${example.id} is missing Chinese text`);
      const hasPinyin = Boolean(example.pinyin.trim());
      const hasVietnamese = Boolean(example.vietnamese.trim());
      assert.equal(hasPinyin, hasVietnamese, `${example.id} must provide both pinyin and Vietnamese, or neither`);
      if (lesson.hskLevel === 'HSK 2' || lesson.hskLevel === 'HSK 3') {
        assert.ok(hasPinyin && hasVietnamese, `${example.id} HSK 2 grammar example must have curated pinyin and Vietnamese`);
      }
      if (hasVietnamese) {
        assert.ok(!hanziPattern.test(example.vietnamese), `${example.id} Vietnamese translation must not contain Chinese characters`);
      }
      grammarExamples++;
    }
  }
}

console.log(`HSK content integrity passed: ${HSK2_6_LESSONS.length} lessons, ${vocabularyExamples} vocabulary examples, ${grammarExamples} grammar examples.`);
