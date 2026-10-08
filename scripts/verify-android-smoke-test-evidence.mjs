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

const executionStatus = checklist.match(/Execution status:\s*(NOT_RUN|PASS|PASS WITH NOTES|FAIL)/)?.[1];
if (!executionStatus) {
  throw new Error('Smoke test checklist must declare an execution status.');
}

if (executionStatus === 'NOT_RUN') {
  console.log('Android smoke test checklist is present but has not been executed on a real release device yet.');
} else {
  console.log(`Android smoke test checklist execution status: ${executionStatus}`);
}

console.log('Android smoke test evidence gate passed.');
console.log(`Checklist: ${checklistPath}`);
console.log(`Required sections: ${requiredSections.length}`);
