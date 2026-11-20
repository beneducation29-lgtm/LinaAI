import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/components/learning/LearningSystemScreen.tsx', 'utf8');
const navigationStart = source.indexOf('<nav aria-label="Nội dung bài học"');
const navigationEnd = source.indexOf('</nav>', navigationStart);
assert.ok(navigationStart >= 0 && navigationEnd > navigationStart, 'lesson navigation should have a clear content label');
const navigation = source.slice(navigationStart, navigationEnd);
assert.ok(navigation.includes("['learn','vocabulary','roleplay']"), 'lesson tabs should contain only lesson-specific activities');
assert.ok(!navigation.includes("'listen'") && !navigation.includes("'speak'") && !navigation.includes("'review'"), 'standalone practice areas must not be duplicated as lesson tabs');
assert.ok(source.includes("setCurrentTab('listening')"), 'lesson should link to the dedicated listening area');
assert.ok(source.includes("setCurrentTab('speak')"), 'lesson should link to the dedicated Lina speaking room');
assert.ok(source.includes("setCurrentTab('review')"), 'lesson should link to the dedicated review area');
console.log('Learning navigation deduplication tests passed.');
