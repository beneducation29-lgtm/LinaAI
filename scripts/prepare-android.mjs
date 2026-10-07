import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const manifestPath = 'android/app/src/main/AndroidManifest.xml';

if (!existsSync(manifestPath)) {
  throw new Error(`Android manifest not found: ${manifestPath}`);
}

const manifest = readFileSync(manifestPath, 'utf8');
const permission = 'android.permission.RECORD_AUDIO';

if (manifest.includes(permission)) {
  console.log('RECORD_AUDIO permission already present.');
  process.exit(0);
}

const marker = '<manifest';
const index = manifest.indexOf(marker);
if (index < 0) throw new Error('Invalid AndroidManifest.xml: <manifest> not found.');

const end = manifest.indexOf('>', index);
if (end < 0) throw new Error('Invalid AndroidManifest.xml: manifest tag is not closed.');

const updated = manifest.slice(0, end + 1)
  + `\\n    <uses-permission android:name="${permission}" />`
  + manifest.slice(end + 1);

writeFileSync(manifestPath, updated);
console.log('Added RECORD_AUDIO permission for Lina AI voice learning.');
