import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/components/tutor/TutorScreen.tsx'), 'utf8');

assert.match(source, /role="dialog"/);
assert.match(source, /aria-modal="true"/);
assert.match(source, /aria-labelledby="progressive-hints-title"/);
assert.match(source, /id="progressive-hints-title"/);
assert.match(source, /aria-label="Đóng cửa sổ gợi ý"/);
assert.match(source, /if \(event\.key === 'Escape'\) \{\s*setShowHintsModal\(false\);/);
assert.match(source, /window\.removeEventListener\('keydown', handleKeyDown\)/);

console.log('Prompt 32 progressive hints dialog accessibility checks passed.');
