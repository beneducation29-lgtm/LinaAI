import { existsSync, readFileSync } from 'node:fs';

const versionCodeRaw = process.env.ANDROID_VERSION_CODE ?? '';
const versionName = String(process.env.ANDROID_VERSION_NAME ?? '').trim();

if (!/^\d+$/.test(versionCodeRaw)) {
  throw new Error(`Android versionCode must be a positive integer, got "${versionCodeRaw}".`);
}

const versionCode = Number(versionCodeRaw);
if (!Number.isSafeInteger(versionCode) || versionCode < 1) {
  throw new Error(`Android versionCode must be a positive safe integer, got "${versionCodeRaw}".`);
}

if (!/^\d+\.\d+\.\d+$/.test(versionName)) {
  throw new Error(`Android versionName must use x.y.z semver, got "${versionName}".`);
}

const packagePath = 'package.json';
if (!existsSync(packagePath)) throw new Error('package.json not found.');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

if (typeof packageJson.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(packageJson.version)) {
  throw new Error(`package.json version is not valid semver: ${packageJson.version}`);
}

const [major, minor, patch] = versionName.split('.').map(Number);
const [baseMajor, baseMinor] = packageJson.version.split('.').map(Number);
if (major < baseMajor || (major === baseMajor && minor < baseMinor)) {
  throw new Error(`Android versionName ${versionName} cannot be older than package version ${packageJson.version}.`);
}

console.log('Android release inputs verified.');
console.log(`versionName=${versionName}`);
console.log(`versionCode=${versionCode}`);
console.log(`package.json version=${packageJson.version}`);
