import assert from 'node:assert/strict';
import { READING_STORY_SERIES } from '../src/data/readingStorySeries';

const seriesIds = new Set<string>();
const chapterIds = new Set<string>();
for (const series of READING_STORY_SERIES) {
  assert.ok(series.id && !seriesIds.has(series.id), 'story IDs must be unique');
  seriesIds.add(series.id);
  assert.ok(series.chapters.length >= 2, 'each story should contain multiple chapters');
  for (const chapter of series.chapters) {
    assert.ok(chapter.id && !chapterIds.has(chapter.id), 'chapter IDs must be unique');
    chapterIds.add(chapter.id);
    assert.ok(chapter.sentences.length >= 3, 'chapters need enough reading material');
    assert.ok(chapter.questions.length >= 1, 'each chapter needs comprehension questions');
    for (const sentence of chapter.sentences) {
      assert.ok(sentence.chinese.trim(), 'Chinese sentence must not be empty');
      assert.ok(sentence.pinyin.trim(), 'Pinyin must not be empty');
      assert.ok(sentence.vietnamese.trim(), 'Vietnamese translation must not be empty');
    }
    for (const question of chapter.questions) {
      assert.ok(question.options.length >= 2, 'questions need at least two options');
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length, 'answer index must point to an option');
      assert.ok(question.explanation.trim(), 'question explanation must be present');
    }
    for (const word of chapter.vocabulary) {
      assert.ok(word.hanzi.trim() && word.pinyin.trim() && word.vietnamese.trim(), 'vocabulary entries need Hanzi, Pinyin and Vietnamese');
    }
  }
}
const expectedLevels = ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'];
for (const level of expectedLevels) {
  assert.ok(READING_STORY_SERIES.some(series => series.level === level), level + ' stories should be available');
}
assert.ok(chapterIds.size >= 14, 'the library should contain a meaningful multi-level chapter collection');
console.log('Reading story series validation passed.');
