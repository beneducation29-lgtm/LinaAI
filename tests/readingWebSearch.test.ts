import assert from 'node:assert/strict';
import { normalizeReadingSearchRequest, validateGeneratedReading } from '../api/lesson/generate.js';

const vocabulary = [
  { hanzi: '学习', pinyin: 'xuéxí', vietnamese: 'học tập', hskLevel: 'HSK 1' },
  { hanzi: '朋友', pinyin: 'péngyou', vietnamese: 'bạn bè', hskLevel: 'HSK 1' }
];
const normalized = normalizeReadingSearchRequest({ query: '  học tập  ', level: 'HSK 1', vocabulary });
assert.equal(normalized.query, 'học tập');
assert.equal(normalized.vocabulary.length, 2);
assert.match(normalizeReadingSearchRequest({ query: '', level: 'HSK 1', vocabulary }).error, /nhập chủ đề/);
assert.match(normalizeReadingSearchRequest({ query: 'du lịch', level: 'HSK 7', vocabulary }).error, /HSK từ 1 đến 6/);
assert.equal(normalizeReadingSearchRequest({ query: 'x'.repeat(250), level: 'HSK 1', vocabulary }).query.length, 180);

const valid = validateGeneratedReading({
  title: 'Một ngày học tập', titleZh: '学习的一天', summary: 'Bài đọc ngắn',
  sentences: [
    { chinese: '我喜欢学习。', pinyin: 'Wǒ xǐhuan xuéxí.', vietnamese: 'Tôi thích học.' },
    { chinese: '我的朋友也学习汉语。', pinyin: 'Wǒ de péngyou yě xuéxí Hànyǔ.', vietnamese: 'Bạn tôi cũng học tiếng Trung.' },
    { chinese: '我们一起学习。', pinyin: 'Wǒmen yìqǐ xuéxí.', vietnamese: 'Chúng tôi cùng học.' }
  ],
  focusWords: ['学习', '朋友', '不存在'],
  questions: [{ question: 'Hai người làm gì?', options: ['Học', 'Ngủ'], answer: 0, explanation: 'Bài đọc nói họ cùng học.' }]
}, vocabulary);
assert.equal(valid.error, undefined);
assert.deepEqual(valid.reading.focusWords, ['学习', '朋友']);
assert.match(validateGeneratedReading({ sentences: [{ chinese: 'No Hanzi', pinyin: 'x', vietnamese: 'y' }] }, vocabulary).error, /3 đến 12 câu/);
const invalidSentence = validateGeneratedReading({
  sentences: [{ chinese: '学习', pinyin: '', vietnamese: 'học' }, { chinese: '朋友', pinyin: 'péngyou', vietnamese: 'bạn' }, { chinese: '我们', pinyin: 'wǒmen', vietnamese: 'chúng tôi' }],
  focusWords: ['学习'], questions: [{ question: 'Q?', options: ['A','B'], answer: 0, explanation: 'E' }]
}, vocabulary);
assert.match(invalidSentence.error, /Mỗi câu phải có/);
const invalidQuestion = validateGeneratedReading({
  sentences: [
    { chinese: '我学习。', pinyin: 'Wǒ xuéxí.', vietnamese: 'Tôi học.' },
    { chinese: '朋友学习。', pinyin: 'Péngyou xuéxí.', vietnamese: 'Bạn học.' },
    { chinese: '我们学习。', pinyin: 'Wǒmen xuéxí.', vietnamese: 'Chúng tôi học.' }
  ],
  focusWords: ['学习'], questions: [{ question: 'Q?', options: ['A','B'], answer: 8, explanation: 'E' }]
}, vocabulary);
assert.match(invalidQuestion.error, /câu hỏi kiểm tra hợp lệ/);
console.log('Lina web-grounded reading validation tests passed.');
