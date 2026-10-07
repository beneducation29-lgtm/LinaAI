import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const gradlePath = resolve('android/app/build.gradle');
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
if (source.includes('signingConfig signingConfigs.release')) {
  console.log('Android release signing configuration already present.');
  process.exit(0);
}

const signingBlock = [
  '    signingConfigs {',
  '        release {',
  "            storeFile file(System.getenv('ANDROID_KEYSTORE_PATH'))",
  "            storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD')",
  "            keyAlias System.getenv('ANDROID_KEY_ALIAS')",
  "            keyPassword System.getenv('ANDROID_KEY_PASSWORD')",
  '        }',
  '    }',
].join('\n');

const androidMarker = /^android\s*\{\s*$/m;
if (!androidMarker.test(source)) throw new Error('Could not find android { block in app/build.gradle');

let updated = source.replace(androidMarker, (match) => `${match}\n${signingBlock}`);

const releaseBlock = /(buildTypes\s*\{[\s\S]*?release\s*\{)([\s\S]*?)(\n\s*\})/m;
if (!releaseBlock.test(updated)) throw new Error('Could not find buildTypes release block in app/build.gradle');

updated = updated.replace(
  releaseBlock,
  (match, opening, body, closing) =>
    body.includes('signingConfig signingConfigs.release')
      ? match
      : `${opening}${body}\n            signingConfig signingConfigs.release${closing}`,
);

writeFileSync(gradlePath, updated);
console.log('Android release signing configuration prepared.');
