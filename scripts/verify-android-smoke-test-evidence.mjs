import { existsSync, readFileSync } from 'node:fs';

const checklistPath = 'docs/android-release-smoke-test.md';
if (!existsSync(checklistPath)) throw new Error(`Smoke test checklist missing: ${checklistPath}`);

const checklist = readFileSync(checklistPath, 'utf8');
const requiredSections = [
  '## Install and launch',
  '## Account and core app',
  '## Microphone and speaking',
  '## Network and resilience',
  '## Device coverage',
  '## Release evidence',
];

for (const section of requiredSections) {
  if (!checklist.includes(section)) {
    throw new Error(`Smoke test checklist is missing required section: ${section}`);
  }
}

if (!checklist.includes('Result: PASS / PASS WITH NOTES / FAIL')) {
  throw new Error('Smoke test checklist must record a final result.');
}

console.log('Android smoke test evidence gate passed.');
console.log(`Checklist: ${checklistPath}`);
console.log(`Required sections: ${requiredSections.length}`);
