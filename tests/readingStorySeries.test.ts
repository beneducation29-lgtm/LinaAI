import assert from 'node:assert/strict';
import { READING_STORY_SERIES } from '../src/data/readingStorySeries';
import { summarizeReadingProgress } from '../src/services/readingProgress';

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

const morningStory = READING_STORY_SERIES.find(series => series.id === 'hsk1-school-day');
const morningChapter = morningStory?.chapters.find(chapter => chapter.id === 'hsk1-school-day-03');
assert.ok(morningChapter, 'the continuous HSK 1 morning paragraph should be available');
assert.equal(
  morningChapter.sentences.map(sentence => sentence.chinese).join(''),
  '今天早上，我六点起床。我和妈妈一起吃早饭，喝一杯牛奶。七点半，我去学校学习汉语。',
  'the sample paragraph should remain continuous and complete'
);
for (const hanzi of ['今天', '早上', '六点', '起床', '妈妈', '一起', '吃早饭', '牛奶', '七点半', '学校', '汉语']) {
  assert.ok(morningChapter.vocabulary.some(word => word.hanzi === hanzi), hanzi + ' should have a clickable Pinyin and Vietnamese glossary entry');
}

const secondHsk1Chapter = morningStory?.chapters.find(chapter => chapter.id !== morningChapter?.id);
assert.ok(secondHsk1Chapter, 'a second HSK 1 chapter should be available for progress aggregation');
const progressSummary = summarizeReadingProgress(READING_STORY_SERIES, {
  [morningChapter!.id]: { completedAt: '2026-11-05T00:00:00.000Z', correct: 2, total: 2 },
  [secondHsk1Chapter!.id]: { completedAt: '2026-11-05T01:00:00.000Z', correct: 1, total: 2 },
});
assert.equal(progressSummary.completedChapters, 2, 'overall progress should count completed chapters');
assert.equal(progressSummary.totalChapters, chapterIds.size, 'overall progress should count the complete library');
assert.equal(progressSummary.completedQuestions, 3, 'overall progress should sum correct answers');
assert.equal(progressSummary.totalQuestions, 4, 'overall progress should sum submitted questions');
assert.equal(progressSummary.accuracy, 75, 'reading accuracy should be calculated from submitted questions');
assert.equal(progressSummary.byLevel.find(item => item.level === 'HSK 1')?.completedChapters, 2, 'HSK level progress should be isolated by level');
assert.equal(progressSummary.byLevel.find(item => item.level === 'HSK 2')?.completedChapters, 0, 'unstarted levels should remain at zero');
assert.equal(summarizeReadingProgress(READING_STORY_SERIES, {}).accuracy, 0, 'empty progress should not produce NaN or a false accuracy');

console.log('Reading story series validation passed.');
