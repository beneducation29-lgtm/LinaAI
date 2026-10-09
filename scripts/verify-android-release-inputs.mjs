import { existsSync, readFileSync } from 'node:fs';

const versionCodeRaw = process.env.ANDROID_VERSION_CODE ?? '';
const versionName = String(process.env.ANDROID_VERSION_NAME ?? '').trim();
const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

if (!/^\d+$/.test(versionCodeRaw)) {
  throw new Error(`Android versionCode must be a positive integer, got "${versionCodeRaw}".`);
}

const versionCode = Number(versionCodeRaw);
if (!Number.isSafeInteger(versionCode) || versionCode < 1 || versionCode > 2100000000) {
  throw new Error(`Android versionCode must be between 1 and 2100000000, got "${versionCodeRaw}".`);
}

if (!semverPattern.test(versionName)) {
  throw new Error(`Android versionName must use x.y.z semver without leading zeroes, got "${versionName}".`);
}

const packagePath = 'package.json';
if (!existsSync(packagePath)) throw new Error('package.json not found.');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

if (typeof packageJson.version !== 'string' || !semverPattern.test(packageJson.version)) {
  throw new Error(`package.json version is not valid semver: ${packageJson.version}`);
}

const releaseParts = versionName.split('.').map(Number);
const packageParts = packageJson.version.split('.').map(Number);
if (![...releaseParts, ...packageParts].every(Number.isSafeInteger)) {
  throw new Error('Version components must be safe integers.');
}

const isOlder = releaseParts.some((part, index) => {
  if (part === packageParts[index]) return false;
  return part < packageParts[index] && releaseParts.slice(0, index).every((value, i) => value === packageParts[i]);
});
if (isOlder) {
  throw new Error(`Android versionName ${versionName} cannot be older than package version ${packageJson.version}.`);
}

console.log('Android release inputs verified.');
console.log(`versionName=${versionName}`);
console.log(`versionCode=${versionCode}`);
console.log(`package.json version=${packageJson.version}`);
