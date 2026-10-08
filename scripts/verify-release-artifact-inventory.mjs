import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const inventoryPath = 'android/app/build/outputs/play-upload/release-artifact-sha256.txt';
if (!existsSync(inventoryPath)) throw new Error(`Release artifact inventory missing: ${inventoryPath}`);

const expectedFiles = [
  'android/app/build/outputs/bundle/release/app-release.aab',
  'android/app/build/outputs/apk/debug/app-debug.apk',
  'android/app/build/outputs/apk/debug/app-debug.apk.sha256',
  'android/app/build/outputs/bundle/release/app-release.aab.sha256',
  'android/app/build/outputs/bundle/release/lina-ai-local-testing.apks',
  'android/app/build/outputs/bundle/release/release-summary.txt',
  'android/app/build/outputs/bundle/release/play-preflight.txt',
  'android/app/build/outputs/bundle/release/release-manifest.json',
  'android/app/build/outputs/play-upload/README.txt',
  'android/app/build/outputs/play-upload/release-readiness.json',
  'android/app/build/outputs/play-upload/production-gate.txt',
  'android/app/build/outputs/play-upload/release-handoff.json',
  'android/app/build/outputs/play-upload/signing-certificate-sha256.txt',
  'android/app/build/outputs/play-upload/aab-attestation.json',
  'android/app/build/outputs/play-upload/aab-attestation.bundle.json',
];

const lines = readFileSync(inventoryPath, 'utf8').trim().split(/\r?\n/);
if (lines[0] !== 'artifact-inventory-version=1') {
  throw new Error('Release artifact inventory has an unsupported version.');
}

const entries = new Map();
for (const line of lines.slice(1)) {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 2 || !/^[0-9a-f]{64}$/i.test(parts[0])) {
    throw new Error('Release artifact inventory contains a malformed checksum entry.');
  }
  const path = parts.slice(1).join(' ');
  if (entries.has(path)) throw new Error(`Release artifact inventory contains a duplicate path: ${path}`);
  entries.set(path, parts[0].toLowerCase());
}

if (entries.size !== expectedFiles.length) {
  throw new Error(`Release artifact inventory contains ${entries.size} files; expected ${expectedFiles.length}.`);
}

for (const path of expectedFiles) {
  if (!entries.has(path)) throw new Error(`Release artifact inventory is missing: ${path}`);
  if (!existsSync(path)) throw new Error(`Release artifact listed in inventory is missing: ${path}`);
  const actual = execFileSync('sha256sum', [path], { encoding: 'utf8' }).trim().split(/\s+/)[0].toLowerCase();
  if (entries.get(path) !== actual) {
    throw new Error(`Release artifact checksum mismatch: ${path}`);
  }
}

for (const path of entries.keys()) {
  if (!expectedFiles.includes(path)) {
    throw new Error(`Release artifact inventory contains an unexpected file: ${path}`);
  }
}

console.log('Release artifact inventory verified.');
console.log(`Artifacts covered: ${entries.size}`);
