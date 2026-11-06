import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
assert.ok(chapterIds.size >= 35, 'the library should contain a substantial multi-level chapter collection');
const hsk1ReadingCount = READING_STORY_SERIES.filter(series => series.level === 'HSK 1').reduce((total, series) => total + series.chapters.length, 0);
assert.equal(hsk1ReadingCount, 23, 'HSK 1 should contain 23 complete readings after the new story series');
for (const level of expectedLevels.slice(1)) {
  const levelStories = READING_STORY_SERIES.filter(series => series.level === level);
  assert.ok(levelStories.length >= 2, level + ' should contain at least two separate story series');
  assert.ok(levelStories.reduce((total, series) => total + series.chapters.length, 0) >= 4, level + ' should contain at least four complete readings');
}
const newSeries = READING_STORY_SERIES.find(series => series.id === 'hsk1-market-day');
assert.equal(newSeries?.chapters.length, 3, 'the new HSK 1 market story should contain three chapters');
assert.ok(READING_STORY_SERIES.some(series => series.id === 'hsk6-critical-thinking'), 'HSK 6 should include original critical-thinking reading content');

const morningStory = READING_STORY_SERIES.find(series => series.id === 'hsk1-school-day');
const morningChapter = morningStory?.chapters.find(chapter => chapter.id === 'hsk1-school-day-03');
assert.ok(morningChapter, 'the continuous HSK 1 morning paragraph should be available');
assert.equal(
  morningChapter.sentences.map(sentence => sentence.chinese).join(''),
  '今天早上，我六点起床。妈妈已经在厨房做早饭了。我吃了一个鸡蛋，又喝了一杯牛奶。出门以前，妈妈帮我把书放进书包。七点半，我和朋友一起去学校。路上，朋友发现自己忘了带笔。我把自己的笔给他用。他笑着说谢谢，我也觉得很高兴。到了教室，老师让我们读中文。我认真地听，也大声地读。下课以后，我们约好明天一起复习。回家的路上，我想：学习新词很重要，关心朋友也很重要。',
  'the HSK 1 morning story should be a continuous, meaningful long-form passage'
);
assert.ok(morningChapter.sentences.length >= 10, 'the morning chapter should provide enough context for sustained reading');
const readingScreen = readFileSync(new URL('../src/components/reading/ReadingScreen.tsx', import.meta.url), 'utf8');
const storyReader = readFileSync(new URL('../src/components/reading/ReadingStoryLibrary.tsx', import.meta.url), 'utf8');
assert.ok(!readingScreen.includes('Bài đọc ('), 'the duplicate legacy graded-reading list should not render below the story library');
assert.ok(storyReader.includes('<rt>{token.pinyin}</rt>'), 'Pinyin should render as ruby text above Hanzi');
assert.ok(storyReader.includes('alignPinyinWithTones'), 'fallback character readings should preserve tone marks');
assert.ok(storyReader.includes('voiceschanged'), 'Chinese voice options should refresh when browser voices load asynchronously');
assert.ok(storyReader.includes('test(voice.lang)'), 'selected playback voices must be Chinese voices');
assert.ok(storyReader.includes('aria-label="Chọn giọng đọc tiếng Trung"'), 'learners should be able to select an available Chinese voice');
assert.ok(storyReader.includes('aria-label="Tốc độ giọng đọc"'), 'learners should be able to adjust reading speed');
assert.ok(storyReader.includes('window.speechSynthesis.pause()') && storyReader.includes('window.speechSynthesis.resume()'), 'reading audio should support pause and resume');
assert.ok(storyReader.includes('utterance.onboundary'), 'audio playback should keep synchronizing the active text highlight');
for (const hanzi of ['今天', '早上', '六点', '起床', '妈妈', '一起', '吃早饭', '牛奶', '七点半', '学校', '汉语']) {
  assert.ok(morningChapter.vocabulary.some(word => word.hanzi === hanzi), hanzi + ' should have a clickable Pinyin and Vietnamese glossary entry');
}

console.log('Reading story series validation passed.');
