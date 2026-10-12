import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/components/tutor/TutorScreen.tsx'), 'utf8');

assert.match(source, /const previousBodyOverflow = document\.body\.style\.overflow/);
assert.match(source, /document\.body\.style\.overflow = 'hidden'/);
assert.match(source, /document\.body\.style\.overflow = previousBodyOverflow/);

console.log('Prompt 34 progressive hints scroll-lock checks passed.');
