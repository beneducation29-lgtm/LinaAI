import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const scriptPath = resolve(process.cwd(), 'scripts/prepare-android.mjs');
const permission = 'android.permission.RECORD_AUDIO';

function withManifest(manifest: string, run: (cwd: string) => void) {
  const cwd = mkdtempSync(join(tmpdir(), 'lina-android-manifest-'));
  try {
    const manifestPath = join(cwd, 'android/app/src/main/AndroidManifest.xml');
    mkdirSync(join(cwd, 'android/app/src/main'), { recursive: true });
    writeFileSync(manifestPath, manifest, 'utf8');
    run(cwd);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

function runPrepare(cwd: string) {
  return spawnSync(process.execPath, [scriptPath], { cwd, encoding: 'utf8' });
}

const initialManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:label="Lina AI" />
</manifest>
`;

withManifest(initialManifest, (cwd) => {
  const result = runPrepare(cwd);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const output = readFileSync(join(cwd, 'android/app/src/main/AndroidManifest.xml'), 'utf8');
  assert.equal(output.split(permission).length - 1, 1, 'permission should be inserted exactly once');
  assert.match(output, /<manifest[^>]*>\n    <uses-permission android:name="android\.permission\.RECORD_AUDIO" \/>\n/);
  assert.doesNotMatch(output, /\\n\s*<uses-permission/, 'permission should use a real newline, not a literal \\n sequence');

  const secondRun = runPrepare(cwd);
  assert.equal(secondRun.status, 0, secondRun.stderr || secondRun.stdout);
  assert.equal(readFileSync(join(cwd, 'android/app/src/main/AndroidManifest.xml'), 'utf8'), output, 'script should be idempotent');
});

withManifest(initialManifest.replace(
  '<application',
  '    <uses-permission android:name="android.permission.RECORD_AUDIO" />\n    <application',
), (cwd) => {
  const before = readFileSync(join(cwd, 'android/app/src/main/AndroidManifest.xml'), 'utf8');
  const result = runPrepare(cwd);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(readFileSync(join(cwd, 'android/app/src/main/AndroidManifest.xml'), 'utf8'), before, 'existing permission must not be duplicated');
});

withManifest('<not-a-manifest />\n', (cwd) => {
  const result = runPrepare(cwd);
  assert.notEqual(result.status, 0, 'malformed manifest should fail');
  assert.match(result.stderr, /<manifest> not found/);
});

console.log('Android manifest permission regression tests passed.');
