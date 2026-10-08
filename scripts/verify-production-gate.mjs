import fs from "node:fs";
import path from "node:path";

const gatePath = path.resolve(
  process.env.GITHUB_WORKSPACE ?? process.cwd(),
  "android/app/build/outputs/play-upload/production-gate.txt",
);

if (!fs.existsSync(gatePath)) {
  throw new Error(`Missing production gate report: ${gatePath}`);
}

const gate = fs.readFileSync(gatePath, "utf8");

const requiredAutomated = [
  "AUTOMATED: READY",
  "Android release inputs validated",
  "Signed AAB verification enabled",
  "Target SDK 36+ validation enabled",
  "Compiled manifest/version consistency enabled",
  "AAB checksum validation enabled",
  "Play upload package validation enabled",
  "Android smoke-test evidence gate enabled",
];

const requiredManual = [
  "MANUAL: REQUIRED",
  "Generate and download the first signed AAB",
  "Upload to Google Play Internal testing",
  "Complete Play Console store listing and App content",
  "Publish accurate privacy policy and complete Data safety declarations as applicable",
  "Complete real-device release smoke testing",
  "Complete closed testing requirements if applicable",
  "Obtain production access before production publishing",
];

for (const item of [...requiredAutomated, ...requiredManual]) {
  if (!gate.includes(item)) {
    throw new Error(`Production gate report is missing required entry: ${item}`);
  }
}

if (!gate.includes("PRODUCTION STATUS: BLOCKED_UNTIL_MANUAL_GATES_COMPLETE")) {
  throw new Error(
    "Production gate must remain blocked until manual Google Play/device gates are complete.",
  );
}

if (gate.includes("PRODUCTION STATUS: READY")) {
  throw new Error(
    "Production gate must not claim READY from CI alone; Play Console and real-device gates are manual.",
  );
}

console.log("Production gate verified: engineering checks READY; manual production gates remain REQUIRED.");
