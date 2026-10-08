import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const keystore = process.env.ANDROID_KEYSTORE_PATH;
const storePassword = process.env.ANDROID_KEYSTORE_PASSWORD;
const alias = process.env.ANDROID_KEY_ALIAS;
const aabPath = 'android/app/build/outputs/bundle/release/app-release.aab';

if (!keystore || !storePassword || !alias) {
  throw new Error('Android signing verification requires the keystore path, password, and alias.');
}
if (!existsSync(keystore)) throw new Error(`Android signing keystore not found: ${keystore}`);
if (!existsSync(aabPath)) throw new Error(`Signed AAB not found: ${aabPath}`);

const normalize = (value) => value.replace(/[^0-9a-f]/gi, '').toLowerCase();

const keytoolKeystore = execFileSync(
  'keytool',
  ['-list', '-v', '-keystore', keystore, '-alias', alias, '-storepass', storePassword],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
);
const expectedMatch = keytoolKeystore.match(/SHA256:\s*([0-9A-F: ]+)/i);
if (!expectedMatch) throw new Error('Could not read the signing certificate SHA-256 fingerprint from the release keystore.');
const expected = normalize(expectedMatch[1]);

const keytoolAab = execFileSync(
  'keytool',
  ['-printcert', '-jarfile', aabPath],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
);
const actualMatch = keytoolAab.match(/SHA256:\s*([0-9A-F: ]+)/i);
if (!actualMatch) throw new Error('Could not read the signing certificate SHA-256 fingerprint from the release AAB.');
const actual = normalize(actualMatch[1]);

if (expected.length !== 64 || actual.length !== 64) {
  throw new Error('Signing certificate SHA-256 fingerprint is malformed.');
}
if (expected !== actual) {
  throw new Error('Release AAB signing certificate does not match the configured release keystore alias.');
}

console.log('Android release signing certificate verified against the configured keystore alias.');
console.log(`Signing certificate SHA-256: ${actual}`);
