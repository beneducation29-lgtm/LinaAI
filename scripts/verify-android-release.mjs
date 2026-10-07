import { existsSync, readFileSync } from 'node:fs';

const manifestPath = 'android/app/src/main/AndroidManifest.xml';
const releaseAabPath = 'android/app/build/outputs/bundle/release/app-release.aab';
const debugApkPath = 'android/app/build/outputs/apk/debug/app-debug.apk';
const expectedAppId = 'com.linaai.chinese';

if (!existsSync(manifestPath)) throw new Error(`Android manifest not found: ${manifestPath}`);
if (!existsSync(releaseAabPath)) throw new Error(`Release AAB not found: ${releaseAabPath}`);
if (!existsSync(debugApkPath)) throw new Error(`Debug APK not found: ${debugApkPath}`);

const manifest = readFileSync(manifestPath, 'utf8');
if (!manifest.includes('android.permission.RECORD_AUDIO')) {
  throw new Error('RECORD_AUDIO permission is missing from AndroidManifest.xml');
}

const packageMatch = manifest.match(/package="([^"]+)"/);
if (packageMatch && packageMatch[1] !== expectedAppId) {
  throw new Error(`Unexpected Android package: ${packageMatch[1]} (expected ${expectedAppId})`);
}

console.log('Android release preflight passed.');
console.log(`App ID: ${expectedAppId}`);
console.log(`Debug APK: ${debugApkPath}`);
console.log(`Release AAB: ${releaseAabPath}`);
