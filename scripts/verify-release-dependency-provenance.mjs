import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

const dir = 'android/app/build/outputs/play-upload';
const files = [
  `${dir}/dependency-provenance.json`,
  `${dir}/npm-dependency-tree.json`,
  `${dir}/gradle-release-runtime-dependencies.txt`,
  'package.json',
];
for (const file of files) if (!existsSync(file)) throw new Error(`Missing dependency provenance file: ${file}`);

const sha256File = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
let provenance;
try {
  provenance = JSON.parse(readFileSync(`${dir}/dependency-provenance.json`, 'utf8'));
} catch (error) {
  throw new Error(`Invalid dependency provenance JSON: ${error.message}`);
}

if (provenance.provenanceVersion !== 1) throw new Error('Unsupported dependency provenance version.');
if (!/^[0-9a-f]{40}$/.test(provenance.sourceCommit ?? '')) throw new Error('Dependency provenance source commit is malformed.');
if (provenance.sourceCommit !== process.env.GITHUB_SHA) throw new Error('Dependency provenance source commit does not match GITHUB_SHA.');
if (!/^[0-9a-f]{64}$/.test(provenance.packageJsonSha256 ?? '')) throw new Error('package.json SHA-256 is malformed.');
if (provenance.packageJsonSha256 !== sha256File('package.json')) throw new Error('package.json SHA-256 mismatch.');
if (!/^[0-9a-f]{64}$/.test(provenance.npmDependencyTreeSha256 ?? '')) throw new Error('npm dependency tree SHA-256 is malformed.');
if (provenance.npmDependencyTreeSha256 !== sha256File(`${dir}/npm-dependency-tree.json`)) throw new Error('npm dependency tree SHA-256 mismatch.');
if (!/^[0-9a-f]{64}$/.test(provenance.gradleReleaseRuntimeDependenciesSha256 ?? '')) throw new Error('Gradle dependency tree SHA-256 is malformed.');
if (provenance.gradleReleaseRuntimeDependenciesSha256 !== sha256File(`${dir}/gradle-release-runtime-dependencies.txt`)) throw new Error('Gradle dependency tree SHA-256 mismatch.');
if (!Number.isInteger(provenance.npmDependencyTreeExitCode) || provenance.npmDependencyTreeExitCode < 0) throw new Error('npm dependency tree exit code is malformed.');

JSON.parse(readFileSync(`${dir}/npm-dependency-tree.json`, 'utf8'));
if (readFileSync(`${dir}/gradle-release-runtime-dependencies.txt`, 'utf8').trim().length === 0) throw new Error('Gradle dependency tree is empty.');

console.log('Release dependency provenance, hashes, and source binding verified.');
