import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/components/tutor/TutorScreen.tsx'), 'utf8');

assert.match(source, /const \[sentenceExplanationError, setSentenceExplanationError\] = useState<string \| null>\(null\)/);
assert.match(source, /const explanationRequestIdRef = useRef\(0\)/);
assert.match(source, /const requestId = \+\+explanationRequestIdRef\.current/);
assert.match(source, /if \(requestId !== explanationRequestIdRef\.current\) return;\s*setSentenceExplanation\(explanation\)/);
assert.match(source, /catch \{\s*if \(requestId !== explanationRequestIdRef\.current\) return;\s*setSentenceExplanationError\(/);
assert.match(source, /if \(requestId === explanationRequestIdRef\.current\) setIsExplaining\(false\)/);
assert.match(source, /role="alert" aria-live="assertive" aria-atomic="true" className="mt-2 rounded-2xl border border-amber-200/);
assert.match(source, /onClick=\{\(\) => void handleExplainLastMessage\(\)\} disabled=\{isExplaining\}/);
assert.match(source, /Thử giải thích lại/);
assert.match(source, /explanationRequestIdRef\.current \+= 1;\s*setIsExplaining\(false\);\s*setSentenceExplanation\(null\)/);

console.log('Prompt 36 sentence explanation recovery checks passed.');
