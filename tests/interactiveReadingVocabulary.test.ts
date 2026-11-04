import assert from 'node:assert/strict';
import { alignPinyinToHanzi, getReadingProsody, tokenizeReadingSentence } from '../src/components/reading/ReadingScreen';

const tokens = tokenizeReadingSentence('今天早上，我去学校学习汉语。', ['今天', '早上', '学校', '学习', '汉语']);
assert.equal(tokens.map(token => token.text).join(''), '今天早上，我去学校学习汉语。', 'Tokenization must preserve every original character.');
assert.deepEqual(tokens.filter(token => token.focus).map(token => token.text), ['今天', '早上', '学校', '学习', '汉语']);
assert.ok(tokens.filter(token => token.focus).every(token => token.focus), 'Matched vocabulary should be marked as interactive.');

const longest = tokenizeReadingSentence('公共交通很方便。', ['公共', '公共交通', '交通']);
assert.deepEqual(longest.filter(token => token.focus).map(token => token.text), ['公共交通'], 'Longest matching vocabulary phrase should win.');

const unknown = tokenizeReadingSentence('没有匹配的词。', ['学校']);
assert.equal(unknown.map(token => token.text).join(''), '没有匹配的词。', 'Unmatched characters must remain visible.');
assert.equal(unknown.some(token => token.focus), false);

const aligned = alignPinyinToHanzi('今天早上，我六点起床。', 'Jīntiān zǎoshang, wǒ liù diǎn qǐchuáng.');
assert.ok(aligned, 'A sentence with one syllable per Hanzi should align.');
assert.deepEqual(aligned?.map(item => item.pinyin), ['jin', 'tian', 'zao', 'shang', 'wo', 'liu', 'dian', 'qi', 'chuang']);
assert.equal(alignPinyinToHanzi('你好世界', 'nǐhǎo'), null, 'Do not invent character alignment when syllable and Hanzi counts differ.');

const questionProsody = getReadingProsody('你今天有空吗？');
assert.equal(questionProsody.rate, 0.78, 'Reading voice should be slower than the browser default.');
assert.ok(questionProsody.pitch > 1, 'Questions should use a raised pitch.');
assert.ok(getReadingProsody('这件事特别重要。').pitch > getReadingProsody('今天天气很好。').pitch, 'Emphasis words should receive a distinct pitch contour.');
assert.ok(getReadingProsody('今天天气很好。').pause >= 300, 'Sentence endings should include a natural pause.');

console.log('Interactive reading vocabulary, ruby pinyin and speech prosody tests passed.');
