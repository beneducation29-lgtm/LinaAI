import assert from 'node:assert/strict';
import fs from 'node:fs';

const glossarySource = fs.readFileSync('src/data/hskVietnameseMeanings.ts', 'utf8');
const appContext = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
const flashcard = fs.readFileSync('src/components/flashcard/Flashcard.tsx', 'utf8');
const entries = [...glossarySource.matchAll(/'([^']+)'\s*:\s*'([^']*)'/g)];
const meanings = new Map(entries.map(([, hanzi, meaning]) => [hanzi, meaning]));

assert.ok(entries.length >= 300, 'Vietnamese glossary should retain its existing coverage');
assert.equal(meanings.size, entries.length, 'glossary keys must be unique to avoid silent overrides');
for (const hanzi of ['爱', '高兴', '工作', '叫', '零', '没', '日', '时间', '早上', '他们', '她们', '也', '一点儿', '哪（哪儿）', '那（那儿）']) {
  const meaning = meanings.get(hanzi);
  assert.ok(meaning && meaning.trim().length > 0, hanzi + ' should have a Vietnamese meaning');
  assert.ok(!meaning.includes('đang được bổ sung'), hanzi + ' must not use the missing-meaning placeholder');
}
assert.match(appContext, /HSK_VI_MEANINGS\[vocab\.hanzi\]/, 'app vocabulary enrichment should use the Vietnamese glossary');
assert.match(flashcard, /vocabulary\.vietnamese/, 'flashcard answer side should display the Vietnamese meaning');
assert.match(flashcard, /exampleSentence\.vietnamese/, 'flashcard should display Vietnamese example translations when available');

console.log('HSK Vietnamese glossary and flashcard tests passed');
