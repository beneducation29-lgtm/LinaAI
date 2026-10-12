import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/components/tutor/TutorScreen.tsx'), 'utf8');

assert.match(source, /const hintsDialogRef = useRef<HTMLDivElement>\(null\)/);
assert.match(source, /const hintsTriggerRef = useRef<HTMLButtonElement>\(null\)/);
assert.match(source, /getFocusableElements\(\)\[0\]\?\.focus\(\)/);
assert.match(source, /event\.shiftKey[\s\S]*?last\.focus\(\)/);
assert.match(source, /!event\.shiftKey[\s\S]*?first\.focus\(\)/);
assert.match(source, /previouslyFocused\?\.isConnected\) previouslyFocused\.focus\(\)/);
assert.match(source, /window\.removeEventListener\('keydown', handleKeyDown\)/);

console.log('Prompt 33 progressive hints focus management checks passed.');
