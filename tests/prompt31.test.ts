import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/components/tutor/TutorScreen.tsx'), 'utf8');

assert.match(source, /const \[hintsError, setHintsError\] = useState<string \| null>\(null\)/);
assert.match(source, /catch \{\s*if \(requestId !== hintsRequestIdRef\.current\) return;\s*setHintsError\('Chưa thể tạo gợi ý do kết nối hoặc dịch vụ AI đang bận\./);
assert.match(source, /role="alert" aria-live="assertive" className="p-4 rounded-2xl bg-amber-50/);
assert.match(source, /onClick=\{\(\) => void handleOpenHints\(\)\}/);
assert.match(source, /Thử tạo gợi ý lại/);
assert.match(source, /setHintsError\(null\);\s*setIsLoadingHints\(true\)/);

console.log('Prompt 31 progressive hints error and retry checks passed.');
