import assert from 'node:assert/strict';
import { copyFileSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = mkdtempSync(join(tmpdir(), 'lina-android-release-inputs-'));
const scriptDir = join(root, 'scripts');
mkdirSync(scriptDir, { recursive: true });
copyFileSync(fileURLToPath(new URL('./verify-android-release-inputs.mjs', import.meta.url)), join(scriptDir, 'verify-android-release-inputs.mjs'));

function run({ packageVersion = '1.2.3', versionName = '1.2.3', versionCode = '1' } = {}) {
  writeFileSync(join(root, 'package.json'), JSON.stringify({ version: packageVersion }));
  return spawnSync(process.execPath, [join(scriptDir, 'verify-android-release-inputs.mjs')], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ANDROID_VERSION_NAME: versionName, ANDROID_VERSION_CODE: versionCode },
  });
}

try {
  for (const versionName of ['1.2.3', '1.2.4', '1.3.0', '2.0.0']) {
    const result = run({ versionName });
    assert.equal(result.status, 0, `Expected ${versionName} to pass: ${result.stderr}`);
  }

  for (const versionName of ['1.2.2', '1.1.99', '0.9.9']) {
    const result = run({ versionName });
    assert.notEqual(result.status, 0, `Expected older version ${versionName} to fail.`);
    assert.match(result.stderr, /cannot be older/);
  }

  for (const versionName of ['1.2', '01.2.3', '1.02.3', '1.2.03', '1.2.3-beta']) {
    const result = run({ versionName });
    assert.notEqual(result.status, 0, `Expected invalid version ${versionName} to fail.`);
  }

  for (const versionCode of ['0', '2100000001', '-1', '1.5', 'abc']) {
    const result = run({ versionCode });
    assert.notEqual(result.status, 0, `Expected invalid versionCode ${versionCode} to fail.`);
  }

  console.log('Android release input tests passed (17 cases).');
} finally {
  rmSync(root, { recursive: true, force: true });
}
