export interface ReadingVocabularyFit {
  matchedCount: number;
  missingCount: number;
  totalCount: number;
  coveragePercent: number;
  matchedWords: string[];
  missingWords: string[];
}

/** Compare a reading's focus words with the learner's saved vocabulary. */
export function getReadingVocabularyFit(focusWords: string[], vocabularyHanzi: string[]): ReadingVocabularyFit {
  const uniqueFocusWords = [...new Set(focusWords.map(word => word.trim()).filter(Boolean))];
  const available = new Set(vocabularyHanzi.map(word => word.trim()).filter(Boolean));
  const matchedWords = uniqueFocusWords.filter(word => available.has(word));
  const missingWords = uniqueFocusWords.filter(word => !available.has(word));
  const totalCount = uniqueFocusWords.length;
  return {
    matchedCount: matchedWords.length,
    missingCount: missingWords.length,
    totalCount,
    coveragePercent: totalCount === 0 ? 0 : Math.round((matchedWords.length / totalCount) * 100),
    matchedWords,
    missingWords
  };
}
