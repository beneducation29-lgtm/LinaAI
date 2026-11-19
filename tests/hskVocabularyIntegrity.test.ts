import { HSK1_LESSONS } from '../src/data/hsk1Lessons';
import { HSK2_6_LESSONS } from '../src/data/hskExpandedLessons';

const lessons = [...HSK1_LESSONS, ...HSK2_6_LESSONS];
const owners = new Map<string, string>();
const ids = new Set<string>();

for (const lesson of lessons) {
  if (lesson.vocabulary.length !== 5) {
    throw new Error(`${lesson.id} should contain five vocabulary items; found ${lesson.vocabulary.length}`);
  }
  for (const item of lesson.vocabulary) {
    if (ids.has(item.id)) throw new Error(`Duplicate vocabulary id: ${item.id}`);
    ids.add(item.id);
    const previousLevel = owners.get(item.hanzi);
    if (previousLevel && previousLevel !== lesson.hskLevel) {
      throw new Error(`Vocabulary "${item.hanzi}" is repeated across ${previousLevel} and ${lesson.hskLevel}`);
    }
    owners.set(item.hanzi, lesson.hskLevel);
  }
}

console.log(`HSK vocabulary integrity passed: ${lessons.length} lessons, ${ids.size} vocabulary entries, no cross-level duplicates.`);
