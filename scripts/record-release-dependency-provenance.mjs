import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const outputDir = 'android/app/build/outputs/play-upload';
mkdirSync(outputDir, { recursive: true });

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const sha256File = (file) => sha256(readFileSync(file));

const packageJson = readFileSync('package.json', 'utf8');
const npmVersion = execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim();

let npmTreeRaw = '';
let npmTreeExitCode = 0;
try {
  npmTreeRaw = execFileSync('npm', ['ls', '--all', '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
} catch (error) {
  npmTreeExitCode = Number(error.status ?? 1);
  npmTreeRaw = String(error.stdout ?? '');
}

if (!npmTreeRaw.trim()) throw new Error('npm dependency tree output is empty.');

let npmTree;
try {
  npmTree = JSON.parse(npmTreeRaw);
} catch (error) {
  throw new Error(`npm dependency tree is not valid JSON: ${error.message}`);
}

if (npmTreeExitCode !== 0 || (Array.isArray(npmTree.problems) && npmTree.problems.length > 0)) {
  const problems = Array.isArray(npmTree.problems) ? npmTree.problems.join('; ') : 'npm ls returned a non-zero exit code';
  throw new Error(`npm dependency tree is not clean: ${problems}`);
}

const npmTreePath = `${outputDir}/npm-dependency-tree.json`;
writeFileSync(npmTreePath, JSON.stringify(npmTree, null, 2) + '\n');

const gradleTreePath = `${outputDir}/gradle-release-runtime-dependencies.txt`;
const gradleTree = execFileSync('./gradlew', [':app:dependencies', '--configuration', 'releaseRuntimeClasspath', '--no-daemon'], {
  cwd: 'android',
  encoding: 'utf8',
});
writeFileSync(gradleTreePath, gradleTree);

const provenance = {
  provenanceVersion: 1,
  sourceCommit: process.env.GITHUB_SHA ?? '',
  packageJsonSha256: sha256(packageJson),
  npmVersion,
  npmDependencyTreeSha256: sha256File(npmTreePath),
  npmDependencyTreeExitCode: npmTreeExitCode,
  gradleReleaseRuntimeDependenciesSha256: sha256File(gradleTreePath),
};

if (!/^[0-9a-f]{40}$/.test(provenance.sourceCommit)) throw new Error('GITHUB_SHA is missing or malformed.');

writeFileSync(`${outputDir}/dependency-provenance.json`, JSON.stringify(provenance, null, 2) + '\n');
console.log('Release dependency provenance recorded.');
