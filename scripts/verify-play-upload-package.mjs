import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const outputDir = 'android/app/build/outputs/play-upload';
const requiredFiles = [
  'app-release.aab',
  'app-release.aab.sha256',
  'release-summary.txt',
  'release-manifest.json',
  'README.txt',
  'release-readiness.json',
];

for (const name of requiredFiles) {
  const file = `${outputDir}/${name}`;
  if (!existsSync(file)) throw new Error(`Play upload artifact missing: ${file}`);
}

const checksumFile = `${outputDir}/app-release.aab.sha256`;
const expected = readFileSync(checksumFile, 'utf8').trim().split(/\s+/)[0];
const actual = execFileSync('sha256sum', [`${outputDir}/app-release.aab`], { encoding: 'utf8' })
  .trim()
  .split(/\s+/)[0];

if (!expected || expected !== actual) {
  throw new Error(`Play upload AAB checksum mismatch: expected ${expected || 'missing'}, got ${actual}`);
}

const manifest = JSON.parse(readFileSync(`${outputDir}/release-manifest.json`, 'utf8'));
const expectedVersionCode = process.env.ANDROID_VERSION_CODE;
const expectedVersionName = process.env.ANDROID_VERSION_NAME;

if (
  manifest.package !== 'com.linaai.chinese' ||
  typeof manifest.versionName !== 'string' ||
  !/^\d+\.\d+\.\d+$/.test(manifest.versionName) ||
  !Number.isInteger(manifest.versionCode) ||
  manifest.versionCode < 1 ||
  manifest.versionCode > 2100000000 ||
  !Number.isInteger(manifest.targetSdk) ||
  manifest.targetSdk < 36 ||
  manifest.aabSha256 !== actual ||
  typeof manifest.sourceCommit !== 'string' ||
  !/^[0-9a-f]{40}$/.test(manifest.sourceCommit) ||
  (process.env.GITHUB_SHA && manifest.sourceCommit !== process.env.GITHUB_SHA) ||
  (expectedVersionCode && String(manifest.versionCode) !== String(expectedVersionCode)) ||
  (expectedVersionName && manifest.versionName !== expectedVersionName)
) {
  throw new Error('Play release manifest does not contain valid package, version, target SDK, or AAB checksum metadata.');
}

const readiness = JSON.parse(readFileSync(`${outputDir}/release-readiness.json`, 'utf8'));
if (
  readiness.technicalPipeline !== 'READY' ||
  readiness.signedAab !== 'READY' ||
  readiness.compiledManifest !== 'VERIFIED' ||
  readiness.playUploadPackage !== 'READY' ||
  readiness.internalTesting !== 'MANUAL_PLAY_CONSOLE' ||
  readiness.production !== 'BLOCKED_UNTIL_PLAY_CONSOLE_REQUIREMENTS'
) {
  throw new Error('Play release readiness artifact is not in a ready state.');
}

const readme = readFileSync(`${outputDir}/README.txt`, 'utf8');
if (
  !readme.includes('app-release.aab') ||
  !readme.includes('Internal testing') ||
  !readme.includes('API 36') ||
  !readme.includes('source commit') ||
  !readme.includes('does not publish the app automatically')
) {
  throw new Error('Play upload README does not describe the expected manual internal-testing flow.');
}

console.log('Play upload package verified.');
console.log(`Package: ${manifest.package}`);
console.log(`Version: ${manifest.versionName} (${manifest.versionCode})`);
console.log(`Target SDK: ${manifest.targetSdk}`);
console.log(`AAB SHA256: ${actual}`);
console.log(`Source commit: ${manifest.sourceCommit}`);
