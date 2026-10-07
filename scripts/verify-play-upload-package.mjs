import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const outputDir = 'android/app/build/outputs/play-upload';
const requiredFiles = [
  'app-release.aab',
  'app-release.aab.sha256',
  'release-summary.txt',
  'README.txt',
];

for (const name of requiredFiles) {
  const file = `${outputDir}/${name}`;
  if (!existsSync(file)) throw new Error(`Play upload artifact missing: ${file}`);
}

const checksumFile = `${outputDir}/app-release.aab.sha256`;
const expected = readFileSync(checksumFile, 'utf8').trim().split(/\\s+/)[0];
const actual = execFileSync('sha256sum', [`${outputDir}/app-release.aab`], { encoding: 'utf8' })
  .trim()
  .split(/\\s+/)[0];

if (!expected || expected !== actual) {
  throw new Error(`Play upload AAB checksum mismatch: expected ${expected || 'missing'}, got ${actual}`);
}

const readme = readFileSync(`${outputDir}/README.txt`, 'utf8');
if (!readme.includes('app-release.aab') || !readme.includes('Internal testing')) {
  throw new Error('Play upload README does not describe the expected internal-testing upload.');
}

console.log('Play upload package verified.');
console.log(`AAB SHA256: ${actual}`);
