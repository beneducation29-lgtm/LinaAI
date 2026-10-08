import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

const uploadDir = 'android/app/build/outputs/play-upload';
const aabPath = 'android/app/build/outputs/bundle/release/app-release.aab';
const metadataPath = `${uploadDir}/aab-attestation.json`;
const bundlePath = `${uploadDir}/aab-attestation.bundle.json`;

for (const file of [metadataPath, bundlePath, aabPath]) {
  if (!existsSync(file)) throw new Error(`Missing attestation provenance file: ${file}`);
}

const sha256File = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const actualAabSha256 = sha256File(aabPath);
const actualBundleSha256 = sha256File(bundlePath);

let metadata;
try {
  metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
} catch (error) {
  throw new Error(`Invalid AAB attestation metadata JSON: ${error.message}`);
}

if (!/^[0-9a-f]{64}$/.test(metadata.subjectSha256 ?? '')) throw new Error('AAB attestation subject SHA-256 is malformed.');
if (!/^[0-9a-f]{64}$/.test(metadata.bundleSha256 ?? '')) throw new Error('AAB attestation bundle SHA-256 is malformed.');
if (metadata.subject !== 'app-release.aab') throw new Error(`AAB attestation subject mismatch: expected app-release.aab, got ${metadata.subject}`);
if (metadata.subjectSha256 !== actualAabSha256) throw new Error(`AAB attestation subject SHA-256 mismatch: metadata ${metadata.subjectSha256}, actual ${actualAabSha256}`);
if (metadata.bundleSha256 !== actualBundleSha256) throw new Error(`AAB attestation bundle SHA-256 mismatch: metadata ${metadata.bundleSha256}, actual ${actualBundleSha256}`);

const repository = process.env.GITHUB_REPOSITORY;
if (!repository || !/^[^/]+\/[^/]+$/.test(repository)) throw new Error('GITHUB_REPOSITORY is required to validate AAB attestation URL provenance.');
if (!String(metadata.attestationId ?? '').match(/^[0-9]+$/)) throw new Error('AAB attestation ID is malformed.');
if (metadata.attestationUrl !== `https://github.com/${repository}/attestations/${metadata.attestationId}`) throw new Error('AAB attestation URL does not match the current GitHub repository and attestation ID.');

console.log('AAB attestation provenance metadata, hashes, and repository binding verified.');
