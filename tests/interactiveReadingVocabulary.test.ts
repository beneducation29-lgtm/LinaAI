import assert from 'node:assert/strict';
import { alignPinyinToHanzi, tokenizeReadingSentence } from '../src/components/reading/ReadingScreen';

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
\nconsole.log('Interactive reading vocabulary tokenizer and ruby pinyin tests passed.');
