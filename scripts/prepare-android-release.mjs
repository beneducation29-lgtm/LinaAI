import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const gradlePath = resolve('android/app/build.gradle');
const packagePath = resolve('package.json');

if (!existsSync(gradlePath)) throw new Error(`Android app Gradle file not found: ${gradlePath}`);
if (!existsSync(packagePath)) throw new Error(`package.json not found: ${packagePath}`);

const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
const versionName = String(packageJson.version || '').trim();
if (!/^\d+\.\d+\.\d+$/.test(versionName)) {
  throw new Error(`Invalid app version "${versionName}". Expected semver x.y.z.`);
}

const rawVersionCode = process.env.ANDROID_VERSION_CODE || process.env.GITHUB_RUN_NUMBER || '1';
const versionCode = Number(rawVersionCode);
if (!Number.isInteger(versionCode) || versionCode < 1) {
  throw new Error(`Invalid Android versionCode "${rawVersionCode}".`);
}

let source = readFileSync(gradlePath, 'utf8');

const versionNamePattern = /versionName\s+"[^"]*"/;
const versionCodePattern = /versionCode\s+\d+/;

if (!versionNamePattern.test(source)) throw new Error('Could not find versionName in android/app/build.gradle');
if (!versionCodePattern.test(source)) throw new Error('Could not find versionCode in android/app/build.gradle');

source = source
  .replace(versionNamePattern, `versionName "${versionName}"`)
  .replace(versionCodePattern, `versionCode ${versionCode}`);

writeFileSync(gradlePath, source);
console.log(`Android release metadata prepared: versionName=${versionName}, versionCode=${versionCode}`);
