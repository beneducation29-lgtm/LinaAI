import { readFileSync } from 'node:fs';

const workflowPath = '.github/workflows/android-release.yml';
const workflow = readFileSync(workflowPath, 'utf8');

const violations = [];
for (const [index, line] of workflow.split('\n').entries()) {
  const match = line.match(/^\s*uses:\s*([^\s#]+)/);
  if (!match) continue;

  const ref = match[1];
  if (!/^[0-9a-f]{40}$/.test(ref)) {
    violations.push(`line ${index + 1}: ${ref}`);
  }
}

if (violations.length > 0) {
  throw new Error(
    'Android release workflow contains unpinned actions. Every uses: reference must use a full 40-character commit SHA.\n' +
    violations.join('\n'),
  );
}

console.log('Android release workflow action references are pinned to full commit SHAs.');
