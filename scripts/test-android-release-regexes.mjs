import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const playUpload = readFileSync('scripts/verify-play-upload-package.mjs', 'utf8');
const aabManifest = readFileSync('scripts/verify-android-aab-manifest.mjs', 'utf8');

// Guard the exact regular-expression forms that previously regressed due to
// double escaping when the release validation scripts were edited.
for (const [label, source, snippet] of [
  ['checksum whitespace split', playUpload, 'checksumText.split(/\\s+/)'],
  ['AAB checksum whitespace split', playUpload, ".trim()\\n  .split(/\\s+/)[0]"],
  ['strict numeric versionName', playUpload, '!/^\\d+\\.\\d+\\.\\d+$/.test(manifest.versionName)'],
  ['GitHub attestation URL', playUpload, '!/^https:\\\\/\\\\/github\\\\.com\\\\/[^/]+\\\\/[^/]+\\\\/attestations\\\\/[0-9]+$/.test'],
  ['summary newline split', playUpload, 'summary.split(/\\r?\\n/)'],
  ['launcher activity extraction', aabManifest, 'manifest.matchAll(/<activity\\b[\\s\\S]*?<\\/activity>/gi)'],
]) {
  assert.ok(source.includes(snippet), `Expected release validator source to retain correct regex: ${label}`);
}

assert.deepEqual('aabb  app-release.aab'.split(/\\s+/), ['aabb', 'app-release.aab']);
assert.match('1.2.3', /^\\d+\\.\\d+\\.\\d+$/);
assert.doesNotMatch('1.2.3-beta', /^\\d+\\.\\d+\\.\\d+$/);
assert.match('https://github.com/owner/repo/attestations/123', /^https:\\/\\/github\\.com\\/[^/]+\\/[^/]+\\/attestations\\/[0-9]+$/);
assert.equal([...'<activity android:exported="true"><intent-filter></intent-filter></activity>'.matchAll(/<activity\\b[\\s\\S]*?<\\/activity>/gi)].length, 1);
assert.deepEqual('one=1\\r\\ntwo=2'.split(/\\r?\\n/), ['one=1', 'two=2']);

console.log('Android release regex regression tests passed (12 assertions).');
