import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/components/tutor/TutorScreen.tsx'), 'utf8');

assert.match(source, /const hintsRequestIdRef = useRef\(0\)/);
assert.match(source, /const requestId = \+\+hintsRequestIdRef\.current/);
assert.match(source, /if \(requestId !== hintsRequestIdRef\.current\) return;\s*setActiveHints\(hints\)/);
assert.match(source, /if \(requestId !== hintsRequestIdRef\.current\) return;\s*setHintsError\(/);
assert.match(source, /if \(requestId === hintsRequestIdRef\.current\) setIsLoadingHints\(false\)/);

console.log('Prompt 35 stale progressive hints response checks passed.');
