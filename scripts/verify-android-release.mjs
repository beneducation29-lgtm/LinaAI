import { existsSync, readFileSync } from 'node:fs';

const manifestPath = 'android/app/src/main/AndroidManifest.xml';
const gradlePath = 'android/app/build.gradle';
const releaseAabPath = 'android/app/build/outputs/bundle/release/app-release.aab';
const debugApkPath = 'android/app/build/outputs/apk/debug/app-debug.apk';
const expectedAppId = 'com.linaai.chinese';

if (!existsSync(manifestPath)) throw new Error(`Android manifest not found: ${manifestPath}`);
if (!existsSync(gradlePath)) throw new Error(`Android Gradle file not found: ${gradlePath}`);
if (!existsSync(releaseAabPath)) throw new Error(`Release AAB not found: ${releaseAabPath}`);
if (!existsSync(debugApkPath)) throw new Error(`Debug APK not found: ${debugApkPath}`);

const manifest = readFileSync(manifestPath, 'utf8');
const gradle = readFileSync(gradlePath, 'utf8');

if (!manifest.includes('android.permission.RECORD_AUDIO')) {
  throw new Error('RECORD_AUDIO permission is missing from AndroidManifest.xml');
}

const packageMatch = manifest.match(/package="([^"]+)"/);
if (packageMatch && packageMatch[1] !== expectedAppId) {
  throw new Error(`Unexpected Android package: ${packageMatch[1]} (expected ${expectedAppId})`);
}

const versionNameMatch = gradle.match(/versionName\s+"([^"]+)"/);
const versionCodeMatch = gradle.match(/versionCode\s+(\d+)/);
if (!versionNameMatch) throw new Error('Android versionName is missing from build.gradle');
if (!versionCodeMatch) throw new Error('Android versionCode is missing from build.gradle');

const versionName = versionNameMatch[1];
const versionCode = Number(versionCodeMatch[1]);
if (!/^\d+\.\d+\.\d+$/.test(versionName)) {
  throw new Error(`Invalid Android versionName: ${versionName}`);
}
if (!Number.isInteger(versionCode) || versionCode < 1) {
  throw new Error(`Invalid Android versionCode: ${versionCode}`);
}

const signingRequired = process.env.ANDROID_REQUIRE_SIGNING === 'true';
const signingConfigured = gradle.includes('signingConfig signingConfigs.release');
if (signingRequired && !signingConfigured) {
  throw new Error('Android release signing is required but release signingConfig is not configured.');
}

console.log('Android release preflight passed.');
console.log(`App ID: ${expectedAppId}`);
console.log(`Version: ${versionName} (${versionCode})`);
console.log(`Release signing: ${signingConfigured ? 'configured' : 'not configured'}`);
console.log(`Debug APK: ${debugApkPath}`);
console.log(`Release AAB: ${releaseAabPath}`);
