import assert from 'node:assert/strict';
import { normalizeReadingTextRequest, validateReadingTextAnalysis } from '../api/lesson/generate.js';

const knownVocabulary = [{ hanzi: '学习', pinyin: 'xuéxí', vietnamese: 'học tập' }];
const request = normalizeReadingTextRequest({ text: '  我喜欢学习。  ', knownVocabulary });
assert.equal(request.text, '我喜欢学习。');
assert.equal(request.knownVocabulary.length, 1);
assert.match(normalizeReadingTextRequest({ text: 'only English' }).error, /chữ Hán/);
assert.match(normalizeReadingTextRequest({ text: '我'.repeat(12001) }).error, /12.000/);

const result = validateReadingTextAnalysis({
  sentences: [{
    chinese: '我喜欢学习。',
    pinyin: 'Wǒ xǐhuan xuéxí.',
    vietnamese: 'Tôi thích học tập.',
    tokens: [
      { text: '我', pinyin: 'wǒ', meaning: 'tôi', isNew: false },
      { text: '喜欢', pinyin: 'xǐhuan', meaning: 'thích', isNew: true },
      { text: '学习', pinyin: 'xuéxí', meaning: 'học tập', isNew: true },
      { text: '。', pinyin: '', meaning: '', isNew: false }
    ]
  }],
  grammar: [{ pattern: '喜欢 + động từ', explanation: 'Diễn tả sở thích.', exampleChinese: '我喜欢学习。' }]
}, '我喜欢学习。', knownVocabulary);
assert.equal(result.error, undefined);
assert.equal(result.analysis.sentences[0].tokens[2].isNew, false);
assert.deepEqual(result.analysis.vocabulary.map(item => item.text), ['喜欢']);

const invalidAlignment = validateReadingTextAnalysis({
  sentences: [{ chinese: '我喜欢学习。', pinyin: 'Wǒ xǐhuan xuéxí.', vietnamese: 'Tôi thích học.', tokens: [
    { text: '我', pinyin: 'wǒ', meaning: 'tôi', isNew: false },
    { text: '喜欢', pinyin: 'xǐhuan', meaning: 'thích', isNew: true },
    { text: '学习', pinyin: 'xuéxí', meaning: 'học', isNew: false }
  ] }]
}, '我喜欢学习。', knownVocabulary);
assert.match(invalidAlignment.error, /không khớp nguyên văn/);

const invalidQuote = validateReadingTextAnalysis({
  sentences: [{ chinese: '我爱北京。', pinyin: 'Wǒ ài Běijīng.', vietnamese: 'Tôi yêu Bắc Kinh.', tokens: [
    { text: '我爱北京。', pinyin: 'wǒ ài Běijīng', meaning: 'tôi yêu Bắc Kinh', isNew: true }
  ] }]
}, '我喜欢学习。', knownVocabulary);
assert.match(invalidQuote.error, /không khớp nguyên văn/);
console.log('Lina pasted Chinese story analysis tests passed.');
