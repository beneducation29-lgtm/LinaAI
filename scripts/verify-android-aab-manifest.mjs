import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const aab = 'android/app/build/outputs/bundle/release/app-release.aab';
const bundletool = 'bundletool.jar';

if (!existsSync(aab)) throw new Error(`Release AAB missing: ${aab}`);
if (!existsSync(bundletool)) throw new Error(`bundletool missing: ${bundletool}`);

const manifest = execFileSync(
  'java',
  ['-jar', bundletool, 'dump', 'manifest', '--bundle', aab],
  { encoding: 'utf8', maxBuffer: 1024 * 1024 },
);

const packageName = manifest.match(/package=['"]([^'"]+)['"]/i)?.[1];
const versionCode = manifest.match(/android:versionCode=['"]([^'"]+)['"]/i)?.[1];
const versionName = manifest.match(/android:versionName=['"]([^'"]+)['"]/i)?.[1];
const targetSdk = manifest.match(/android:targetSdkVersion=['"]([^'"]+)['"]/i)?.[1];
const hasMicrophone = /android\.permission\.RECORD_AUDIO/i.test(manifest);
const activityBlocks = [...manifest.matchAll(/<activity\\b[\\s\\S]*?<\\/activity>/gi)].map((match) => match[0]);
const hasLauncherActivity = activityBlocks.some((activity) =>
  /android:exported=['"]true['"]/i.test(activity) &&
  /android.intent.action.MAIN/i.test(activity) &&
  /android.intent.category.LAUNCHER/i.test(activity),
);

const expectedPackage = 'com.linaai.chinese';
const expectedVersionCode = process.env.ANDROID_VERSION_CODE;
const expectedVersionName = process.env.ANDROID_VERSION_NAME;

if (packageName !== expectedPackage) {
  throw new Error(`Compiled AAB package mismatch: expected ${expectedPackage}, got ${packageName || 'missing'}`);
}
if (!expectedVersionCode || versionCode !== expectedVersionCode) {
  throw new Error(`Compiled AAB versionCode mismatch: expected ${expectedVersionCode || 'missing'}, got ${versionCode || 'missing'}`);
}
if (!expectedVersionName || versionName !== expectedVersionName) {
  throw new Error(`Compiled AAB versionName mismatch: expected ${expectedVersionName || 'missing'}, got ${versionName || 'missing'}`);
}
if (!targetSdk || Number(targetSdk) < 36) {
  throw new Error(`Compiled AAB targetSdk must be >= 36, got ${targetSdk || 'missing'}`);
}
if (!hasMicrophone) {
  throw new Error('Compiled AAB is missing android.permission.RECORD_AUDIO');
}
if (!hasLauncherActivity) {
  throw new Error('Compiled AAB is missing an exported launcher activity');
}

readFileSync(aab);

console.log('Compiled Android AAB manifest verified.');
console.log(`Package: ${packageName}`);
console.log(`Version: ${versionName} (${versionCode})`);
console.log(`Target SDK: ${targetSdk}`);
console.log('Microphone permission: RECORD_AUDIO');
console.log('Launcher activity: exported MAIN/LAUNCHER verified');
