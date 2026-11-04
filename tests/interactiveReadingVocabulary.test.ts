import assert from 'node:assert/strict';
import { tokenizeReadingSentence } from '../src/components/reading/ReadingScreen';

const tokens = tokenizeReadingSentence('今天早上，我去学校学习汉语。', ['今天', '早上', '学校', '学习', '汉语']);
assert.equal(tokens.map(token => token.text).join(''), '今天早上，我去学校学习汉语。', 'Tokenization must preserve every original character.');
assert.deepEqual(tokens.filter(token => token.focus).map(token => token.text), ['今天', '早上', '学校', '学习', '汉语']);
assert.ok(tokens.filter(token => token.focus).every(token => token.focus), 'Matched vocabulary should be marked as interactive.');

const longest = tokenizeReadingSentence('公共交通很方便。', ['公共', '公共交通', '交通']);
assert.deepEqual(longest.filter(token => token.focus).map(token => token.text), ['公共交通'], 'Longest matching vocabulary phrase should win.');

const unknown = tokenizeReadingSentence('没有匹配的词。', ['学校']);
assert.equal(unknown.map(token => token.text).join(''), '没有匹配的词。', 'Unmatched characters must remain visible.');
assert.equal(unknown.some(token => token.focus), false);
console.log('Interactive reading vocabulary tokenizer tests passed.');
