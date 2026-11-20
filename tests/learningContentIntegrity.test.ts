import assert from 'node:assert/strict';
import fs from 'node:fs';
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

const listeningSource = fs.readFileSync('src/components/listening/ListeningScreen.tsx', 'utf8');
const listeningIds = [...listeningSource.matchAll(/\{ id:'([^']+)',hsk:/g)].map(match => match[1]);
const listeningLevels = [...listeningSource.matchAll(/\{ id:'[^']+',hsk:(\d+)/g)].map(match => Number(match[1]));
assert.equal(listeningIds.length, 50, 'listening library should retain its 50 curated activities');
assertUnique(listeningIds, 'listening activity IDs');
assert.ok(listeningLevels.every(level => level >= 1 && level <= 6), 'listening activities must stay within HSK 1–6');

const readingSentences = [
  ...GRADED_READINGS.flatMap(reading => reading.sentences),
  ...READING_STORY_SERIES.flatMap(series => series.chapters.flatMap(chapter => chapter.sentences))
];
assertUnique(readingSentences.map(sentence => sentence.chinese), 'graded reading sentences across the reading library');
assert.ok(readingSentences.every(sentence => sentence.chinese.trim() && sentence.pinyin.trim() && sentence.vietnamese.trim()), 'every reading sentence requires Hanzi, Pinyin and Vietnamese alignment');

assert.ok(HSK2_6_LESSONS.every(lesson => lesson.dialogue.every(line => line.chinese.trim() && line.pinyin.trim() && line.vietnamese.trim())), 'generated dialogue must contain only complete aligned turns');
assert.ok(HSK2_6_LESSONS.every(lesson => lesson.grammar.every(grammar => grammar.examples.every(example => example.chinese.trim() && example.pinyin.trim() && example.vietnamese.trim()))), 'grammar examples must never be published with missing sentence-level alignment');

const generatedVocabularyExamples = HSK2_6_LESSONS.flatMap(lesson => lesson.vocabulary);
assert.equal(generatedVocabularyExamples.length,125,'HSK 2–6 must retain 125 authored sentence examples');
assert.ok(generatedVocabularyExamples.every(word => word.exampleChinese.trim() && word.examplePinyin.trim() && word.exampleVietnamese.trim()),'every HSK 2–6 vocabulary example requires sentence-level Hanzi, Pinyin and Vietnamese');
assert.ok(generatedVocabularyExamples.every(word => word.examplePinyin !== word.pinyin && word.exampleVietnamese !== word.vietnamese),'sentence-level examples must not reuse the headword Pinyin or gloss');

const generatedGrammarExamples = HSK2_6_LESSONS.flatMap(lesson => lesson.grammar.flatMap(grammar => grammar.examples));
assert.equal(generatedGrammarExamples.length,50,'HSK 2–6 must contain 50 fully authored grammar examples');
assert.ok(generatedGrammarExamples.every(example => example.chinese.trim() && example.pinyin.trim() && example.vietnamese.trim()),'all grammar examples require aligned Hanzi, Pinyin and Vietnamese');

assert.ok(HSK2_6_LESSONS.every(lesson => lesson.dialogue.length===2 && lesson.dialogue[0].chinese!==lesson.dialogue[1].chinese && lesson.dialogue.every(line=>line.chinese.trim() && line.pinyin.trim() && line.vietnamese.trim())),'all 25 lessons require two distinct, complete dialogue turns');

console.log(`Learning content integrity passed: ${HSK_CLASSIC_VOCABULARY.length} classic terms, ${HSK_SPEAKING_VOCABULARY.length} curated speaking terms, ${lessons.length} structured lessons.`);
