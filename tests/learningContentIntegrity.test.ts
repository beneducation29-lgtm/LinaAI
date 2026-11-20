import assert from 'node:assert/strict';
import { HSK_CLASSIC_VOCABULARY } from '../src/data/hskClassicVocabulary';
import { HSK_SPEAKING_VOCABULARY } from '../src/data/hskSpeakingVocabulary';
import { HSK1_VOCABULARY } from '../src/data/hsk1Structured';
import { HSK1_LESSONS } from '../src/data/hsk1Lessons';
import { HSK2_6_LESSONS } from '../src/data/hskExpandedLessons';
import { GRADED_READINGS } from '../src/data/gradedReadings';
import { READING_STORY_SERIES } from '../src/data/readingStorySeries';

function assertUnique(values: string[], label: string) {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  assert.deepEqual([...new Set(duplicates)], [], `${label} must not contain duplicates`);
}

assert.equal(HSK_CLASSIC_VOCABULARY.length, 5000, 'classic HSK corpus should retain all 5,000 source entries');
assertUnique(HSK_CLASSIC_VOCABULARY.map(item => item.id), 'classic HSK IDs');
assertUnique(HSK_CLASSIC_VOCABULARY.map(item => item.hanzi), 'classic HSK Hanzi entries');
assert.ok(HSK_CLASSIC_VOCABULARY.every(item => item.hanzi.trim() && item.pinyin.trim()), 'classic HSK entries require Hanzi and Pinyin');

assert.equal(HSK_SPEAKING_VOCABULARY.length, 120, 'curated speaking pack should retain 20 entries per level');
assertUnique(HSK_SPEAKING_VOCABULARY.map(item => item.id), 'speaking vocabulary IDs');
assertUnique(HSK_SPEAKING_VOCABULARY.map(item => item.hanzi), 'speaking vocabulary across HSK levels');
assert.ok(HSK_SPEAKING_VOCABULARY.every(item => item.pinyin.trim() && item.vietnamese.trim()), 'speaking vocabulary requires Pinyin and Vietnamese gloss');
assert.ok(HSK_SPEAKING_VOCABULARY.every(item => item.exampleSentence?.hanzi?.trim() && item.exampleSentence?.pinyin?.trim() && item.exampleSentence?.vietnamese?.trim()), 'speaking examples require aligned Hanzi, Pinyin and Vietnamese');

assertUnique(HSK1_VOCABULARY.map(item => item.id), 'HSK 1 structured vocabulary IDs');
assertUnique(HSK1_VOCABULARY.map(item => item.hanzi), 'HSK 1 structured vocabulary Hanzi');
assert.ok(HSK1_VOCABULARY.every(item => item.pinyin.trim() && item.vietnamese.trim() && item.exampleChinese.trim() && item.examplePinyin.trim() && item.exampleVietnamese.trim()), 'HSK 1 vocabulary and examples require complete language alignment');

const lessons = [...HSK1_LESSONS, ...HSK2_6_LESSONS];
assertUnique(lessons.map(item => item.id), 'structured lesson IDs');
assert.ok(lessons.every(item => item.objective.trim() && item.titleVi.trim() && item.titleZh.trim()), 'every lesson requires a clear learning objective and bilingual title');
assert.ok(lessons.every(item => item.vocabulary.length > 0 && item.vocabulary.every(word => word.hanzi.trim() && word.pinyin.trim() && word.vietnamese.trim())), 'every lesson requires complete target vocabulary');
assertUnique(HSK2_6_LESSONS.flatMap(item => item.vocabulary.map(word => word.hanzi)), 'HSK 2–6 lesson vocabulary across levels');
for (const lesson of lessons) assertUnique(lesson.vocabulary.map(word => word.hanzi), `vocabulary in ${lesson.id}`);

const readingSentences = [
  ...GRADED_READINGS.flatMap(reading => reading.sentences),
  ...READING_STORY_SERIES.flatMap(series => series.chapters.flatMap(chapter => chapter.sentences))
];
assertUnique(readingSentences.map(sentence => sentence.chinese), 'graded reading sentences across the reading library');
assert.ok(readingSentences.every(sentence => sentence.chinese.trim() && sentence.pinyin.trim() && sentence.vietnamese.trim()), 'every reading sentence requires Hanzi, Pinyin and Vietnamese alignment');

const generatedExampleAlignmentIssues = HSK2_6_LESSONS.flatMap(lesson => lesson.vocabulary
  .filter(word => word.exampleChinese && (word.examplePinyin === word.pinyin || word.exampleVietnamese === word.vietnamese))
  .map(word => `${lesson.id}:${word.hanzi}`));
if (generatedExampleAlignmentIssues.length) {
  console.warn(`[CONTENT AUDIT] ${generatedExampleAlignmentIssues.length} HSK 2–6 vocabulary examples still reuse word-level Pinyin/gloss instead of sentence-level alignment. These entries need editorial correction.`);
}

const generatedGrammarAlignmentIssues = HSK2_6_LESSONS.flatMap(lesson => lesson.grammar.flatMap(grammar =>
  grammar.examples.filter(example => !example.pinyin.trim() || example.vietnamese === example.chinese)
    .map(example => `${lesson.id}:${grammar.id}`)));
if (generatedGrammarAlignmentIssues.length) {
  console.warn(`[CONTENT AUDIT] ${generatedGrammarAlignmentIssues.length} HSK 2–6 grammar examples are missing sentence-level Pinyin or Vietnamese translations.`);
}

console.log(`Learning content integrity passed: ${HSK_CLASSIC_VOCABULARY.length} classic terms, ${HSK_SPEAKING_VOCABULARY.length} curated speaking terms, ${lessons.length} structured lessons.`);
