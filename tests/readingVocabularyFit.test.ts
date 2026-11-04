import assert from 'node:assert/strict';
import { getReadingVocabularyFit } from '../src/services/readingVocabularyFit';

const fit = getReadingVocabularyFit(['你好', '学习', '朋友', '你好', ''], ['你好', '朋友', '你好']);
assert.equal(fit.totalCount, 3, 'Focus words should be unique and empty values ignored.');
assert.equal(fit.matchedCount, 2);
assert.equal(fit.missingCount, 1);
assert.equal(fit.coveragePercent, 67);
assert.deepEqual(fit.matchedWords, ['你好', '朋友']);
assert.deepEqual(fit.missingWords, ['学习']);

const empty = getReadingVocabularyFit([], ['你好']);
assert.equal(empty.coveragePercent, 0);
assert.equal(empty.totalCount, 0);

console.log('Reading vocabulary fit tests passed.');
