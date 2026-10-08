import { existsSync, readFileSync } from 'node:fs';

const uploadDir = 'android/app/build/outputs/play-upload';
const aabPath = 'android/app/build/outputs/bundle/release/app-release.aab';
const metadataPath = `${uploadDir}/aab-attestation.json`;
const bundlePath = `${uploadDir}/aab-attestation.bundle.json`;

for (const file of [metadataPath, bundlePath, aabPath]) {
  if (!existsSync(file)) throw new Error(`Missing attestation provenance file: ${file}`);
}

let metadata;
try {
  metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
} catch (error) {
  throw new Error(`Invalid AAB attestation metadata JSON: ${error.message}`);
}

if (!/^[0-9a-f]{64}$/.test(metadata.subjectSha256 ?? '')) {
  throw new Error('AAB attestation subject SHA-256 is malformed.');
}

if (!/^[0-9a-f]{64}$/.test(metadata.bundleSha256 ?? '')) {
  throw new Error('AAB attestation bundle SHA-256 is malformed.');
}

if (metadata.subject !== 'app-release.aab') {
  throw new Error(`AAB attestation subject mismatch: expected app-release.aab, got ${metadata.subject}`);
}

if (!/^https:\/\/github\.com\/.+\/attestations\/[0-9]+$/.test(metadata.attestationUrl ?? '')) {
  throw new Error('AAB attestation URL is malformed.');
}

if (!String(metadata.attestationId ?? '').match(/^[0-9]+$/)) {
  throw new Error('AAB attestation ID is malformed.');
}

console.log('AAB attestation provenance metadata verified.');
