import type { ReadingChapter } from '../data/readingStorySeries';

export interface ReadingWeakWord {
  hanzi: string;
  pinyin: string;
  vietnamese: string;
  chapterId: string;
  markedAt: string;
}

export interface ListeningChoice {
  chinese: string;
  sentenceIndex: number;
  correct: boolean;
}

/** Builds a small sentence-recognition exercise using only source sentences in the chapter. */
export function buildListeningChoices(chapter: ReadingChapter, targetIndex: number): ListeningChoice[] {
  const target = chapter.sentences[targetIndex];
  if (!target) return [];
  const candidates = chapter.sentences
    .map((sentence, sentenceIndex) => ({ chinese: sentence.chinese, sentenceIndex, correct: sentenceIndex === targetIndex }))
    .filter(item => item.sentenceIndex !== targetIndex);
  const distractors = candidates.slice(0, 3);
  return [...distractors, { chinese: target.chinese, sentenceIndex: targetIndex, correct: true }]
    .sort((a, b) => a.sentenceIndex - b.sentenceIndex);
}

/** Normalize punctuation/spacing only; never claims to score tones or pronunciation quality. */
export function normalizeChineseTranscript(value: string): string {
  return value.normalize('NFKC').replace(/[，。！？、；：,.!?;:“”"'\s]/g, '').trim();
}

export function matchesShadowReading(expected: string, transcript: string): boolean {
  const normalizedExpected = normalizeChineseTranscript(expected);
  const normalizedTranscript = normalizeChineseTranscript(transcript);
  return Boolean(normalizedExpected && normalizedTranscript && normalizedExpected === normalizedTranscript);
}

export function addWeakWord(words: ReadingWeakWord[], word: ReadingWeakWord): ReadingWeakWord[] {
  const key = (item: ReadingWeakWord) => item.chapterId + '::' + item.hanzi;
  return [...words.filter(item => key(item) !== key(word)), word];
}

export function removeWeakWord(words: ReadingWeakWord[], chapterId: string, hanzi: string): ReadingWeakWord[] {
  return words.filter(item => !(item.chapterId === chapterId && item.hanzi === hanzi));
}
