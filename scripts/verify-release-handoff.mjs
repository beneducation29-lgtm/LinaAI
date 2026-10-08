import fs from "node:fs";
import path from "node:path";

const outputPath = path.resolve(
  process.env.GITHUB_WORKSPACE ?? process.cwd(),
  "android/app/build/outputs/play-upload/release-handoff.json",
);

if (!fs.existsSync(outputPath)) {
  throw new Error(`Missing release handoff manifest: ${outputPath}`);
}

const handoff = JSON.parse(fs.readFileSync(outputPath, "utf8"));

const required = {
  app: "Lina AI",
  packageId: "com.linaai.chinese",
  technicalPipeline: "READY",
  signedAab: "READY",
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

console.log("Release handoff manifest verified.");
console.log(JSON.stringify(handoff, null, 2));
