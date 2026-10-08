import fs from "node:fs";
import path from "node:path";

const outputPath = path.resolve(
  process.env.GITHUB_WORKSPACE ?? process.cwd(),
  "android/app/build/outputs/play-upload/release-handoff.json",
);

if (!fs.existsSync(outputPath)) {
  throw new Error(`Missing release handoff manifest: ${outputPath}`);
}

let handoff;
try {
  handoff = JSON.parse(fs.readFileSync(outputPath, "utf8"));
} catch (error) {
  throw new Error(`Invalid release handoff JSON: ${error.message}`);
}

const expectedVersionCode = process.env.ANDROID_VERSION_CODE;
const expectedVersionName = process.env.ANDROID_VERSION_NAME;
const expectedSourceCommit = process.env.GITHUB_SHA;

if (expectedVersionCode && String(handoff.versionCode) !== String(expectedVersionCode)) {
  throw new Error(`Release handoff versionCode mismatch: expected ${expectedVersionCode}, got ${handoff.versionCode}`);
}

if (expectedVersionName && handoff.versionName !== expectedVersionName) {
  throw new Error(`Release handoff versionName mismatch: expected ${expectedVersionName}, got ${handoff.versionName}`);
}

if (expectedSourceCommit && handoff.sourceCommit !== expectedSourceCommit) {
  throw new Error(`Release handoff sourceCommit mismatch: expected ${expectedSourceCommit}, got ${handoff.sourceCommit}`);
}

const required = {
  app: "Lina AI",
  packageId: "com.linaai.chinese",
  technicalPipeline: "READY",
  signedAab: "READY",
  googlePlayTargetApiRequired: 36,
  targetApiCompliant: true,
  sourceCommit: process.env.GITHUB_SHA,
  internalTesting: "MANUAL_REQUIRED",
  realDeviceSmokeTest: "MANUAL_REQUIRED",
  playConsolePolicySetup: "MANUAL_REQUIRED",
  productionAccess: "MANUAL_REQUIRED",
  productionPublish: "BLOCKED",
};

for (const [key, expected] of Object.entries(required)) {
  if (handoff[key] !== expected) {
    throw new Error(`Release handoff mismatch for ${key}: expected ${expected}, got ${handoff[key]}`);
  }
}

if (handoff.productionPublish === "READY") {
  throw new Error("Release handoff must never claim production publish is READY from CI alone.");
}

if (handoff.technicalPipeline === "READY" && handoff.signedAab === "READY" && handoff.productionPublish !== "BLOCKED") {
  throw new Error("A release handoff with ready engineering artifacts must remain blocked for production.");
}

console.log("Release handoff manifest verified.");
console.log(JSON.stringify(handoff, null, 2));
