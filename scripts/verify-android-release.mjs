import { existsSync, readFileSync } from 'node:fs';

const manifestPath = 'android/app/src/main/AndroidManifest.xml';
const gradlePath = 'android/app/build.gradle';
const rootGradlePath = 'android/build.gradle';
const variablesGradlePath = 'android/variables.gradle'
const variablesGradlePath = 'android/variables.gradle';
const releaseAabPath = 'android/app/build/outputs/bundle/release/app-release.aab';
const debugApkPath = 'android/app/build/outputs/apk/debug/app-debug.apk';
const expectedAppId = 'com.linaai.chinese';
const requiredTargetSdk = 36;

if (!existsSync(manifestPath)) throw new Error(`Android manifest not found: ${manifestPath}`);
if (!existsSync(gradlePath)) throw new Error(`Android Gradle file not found: ${gradlePath}`);
if (!existsSync(rootGradlePath)) throw new Error(`Root Android Gradle file not found: ${rootGradlePath}`);
if (!existsSync(variablesGradlePath)) throw new Error(`Android variables Gradle file not found: ${variablesGradlePath}`);
if (!existsSync(variablesGradlePath)) throw new Error(`Android variables Gradle file not found: ${variablesGradlePath}`);
if (!existsSync(releaseAabPath)) throw new Error(`Release AAB not found: ${releaseAabPath}`);
if (!existsSync(debugApkPath)) throw new Error(`Debug APK not found: ${debugApkPath}`);

const manifest = readFileSync(manifestPath, 'utf8');
const gradle = readFileSync(gradlePath, 'utf8');
const rootGradle = readFileSync(rootGradlePath, 'utf8');
const variablesGradle = readFileSync(variablesGradlePath, 'utf8');
const variablesGradle = readFileSync(variablesGradlePath, 'utf8');

if (!manifest.includes('android.permission.RECORD_AUDIO')) {
  throw new Error('RECORD_AUDIO permission is missing from AndroidManifest.xml');
}

const packageMatch = manifest.match(/package=["']([^"']+)["']/);
if (packageMatch && packageMatch[1] !== expectedAppId) {
  throw new Error(`Unexpected Android package: ${packageMatch[1]} (expected ${expectedAppId})`);
}

const applicationIdMatch = gradle.match(/applicationId\s+["']([^"']+)["']/);
if (!applicationIdMatch) throw new Error('Android applicationId is missing from build.gradle');
if (applicationIdMatch[1] !== expectedAppId) {
  throw new Error(`Unexpected applicationId: ${applicationIdMatch[1]} (expected ${expectedAppId})`);
}

const targetSdkMatch = gradle.match(/targetSdk(?:Version)?\\s*[= ]\\s*(\\d+)/);
const rootTargetSdkMatch = rootGradle.match(/targetSdkVersion\\s*[= ]\\s*(\\d+)/);
const variablesTargetSdkMatch = variablesGradle.match(/targetSdkVersion\\s*[= ]\\s*(\\d+)/);
const targetSdkText = targetSdkMatch?.[1] ?? rootTargetSdkMatch?.[1] ?? variablesTargetSdkMatch?.[1];
const targetSdk = targetSdkText === undefined ? Number.NaN : Number(targetSdkText);
if (!Number.isFinite(targetSdk)) {
  throw new Error('Android target SDK is missing from app/build.gradle, root build.gradle, and variables.gradle.');
}
if (targetSdk < requiredTargetSdk) {
  throw new Error(`Android target SDK ${targetSdk} is below required API ${requiredTargetSdk}`);
}

const versionNameMatch = gradle.match(/versionName\s+["']([^"']+)["']/);
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

const expectedVersionCode = process.env.ANDROID_VERSION_CODE;
const expectedVersionName = process.env.ANDROID_VERSION_NAME;
if (expectedVersionCode && versionCode !== Number(expectedVersionCode)) {
  throw new Error(`Android versionCode mismatch: expected ${expectedVersionCode}, got ${versionCode}`);
}
if (expectedVersionName && versionName !== expectedVersionName) {
  throw new Error(`Android versionName mismatch: expected ${expectedVersionName}, got ${versionName}`);
}

console.log('Android release preflight passed.');
console.log(`App ID: ${expectedAppId}`);
console.log(`Target SDK: ${targetSdk}`);
console.log(`Version: ${versionName} (${versionCode})`);
console.log(`Release signing: ${signingConfigured ? 'configured' : 'not configured'}`);
console.log(`Debug APK: ${debugApkPath}`);
console.log(`Release AAB: ${releaseAabPath}`);
