import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const gradlePath = 'android/app/build.gradle';
const required = [
  'ANDROID_KEYSTORE_PATH',
  'ANDROID_KEYSTORE_PASSWORD',
  'ANDROID_KEY_ALIAS',
  'ANDROID_KEY_PASSWORD',
];

if (!required.every((name) => process.env[name])) {
  console.log('Android release signing secrets are not configured; keeping the release build unsigned.');
  process.exit(0);
}

if (!existsSync(gradlePath)) throw new Error(`Android app Gradle file not found: ${gradlePath}`);

const source = readFileSync(gradlePath, 'utf8');
if (source.includes('signingConfigs {') && source.includes('signingConfig signingConfigs.release')) {
  console.log('Android release signing configuration already present.');
  process.exit(0);
}

const signingBlock = [
  '',
  '    signingConfigs {',
  '        release {',
  "            storeFile file(System.getenv('ANDROID_KEYSTORE_PATH'))",
  "            storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD')",
  "            keyAlias System.getenv('ANDROID_KEY_ALIAS')",
  "            keyPassword System.getenv('ANDROID_KEY_PASSWORD')",
  '        }',
  '    }',
  '',
].join('\n');

const androidMarker = 'android {\n';
if (!source.includes(androidMarker)) throw new Error('Could not find android { block in app/build.gradle');

let updated = source.replace(androidMarker, androidMarker + signingBlock);
const buildTypesIndex = updated.indexOf('buildTypes {');
if (buildTypesIndex < 0) throw new Error('Could not find buildTypes block in app/build.gradle');

const releaseIndex = updated.indexOf('release {', buildTypesIndex);
if (releaseIndex < 0) throw new Error('Could not find buildTypes release block in app/build.gradle');

const closeIndex = updated.indexOf('\n        }', releaseIndex);
if (closeIndex < 0) throw new Error('Could not locate buildTypes release block end in app/build.gradle');

updated = updated.slice(0, closeIndex) + '\n            signingConfig signingConfigs.release' + updated.slice(closeIndex);
writeFileSync(gradlePath, updated);
console.log('Android release signing configuration prepared.');
