// Renders the frozen `nullius verify --json` payload (docs/verify-contract.md)
// as a markdown table for $GITHUB_STEP_SUMMARY.
import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("usage: node summary.mjs <verify.json>");
  process.exit(2);
}

const result = JSON.parse(readFileSync(file, "utf8"));
const r = result.readiness;

const mark = (pass) => (pass ? "PASS" : "FAIL");
const rows = [
  ["numbers", r.ungroundedResultNumbers.length === 0, r.ungroundedResultNumbers.length === 0 ? "all result numbers trace to execution artifacts" : `ungrounded: ${r.ungroundedResultNumbers.join(", ")}`],
  ["citations", r.unverifiedCitationRefCount === 0, r.unverifiedCitationRefCount === 0 ? "all citation references verified" : `${r.unverifiedCitationRefCount} unverified citation reference(s)`],
  ["repro", r.irreproducibleNodeCount === 0, r.irreproducibleNodeCount === 0 ? "no divergent or failed reruns" : `${r.irreproducibleNodeCount} irreproducible node(s)`],
  ["all (readiness)", r.ready, `score ${Math.round(r.readinessScore * 100)}%, ${r.supportedClaims} supported claim(s), ${r.foundSections}/${r.requiredSections} sections`]
];

const lines = [
  `## Nullius verify: ${result.ok ? "PASS" : "FAIL"} (gate: \`${result.gate}\`, schemaVersion ${result.schemaVersion})`,
  "",
  "| Gate | Result | Detail |",
  "| --- | --- | --- |",
  ...rows.map(([name, pass, detail]) => `| \`${name}\` | ${mark(pass)} | ${detail} |`)
];

if (!result.ok && result.failures.length > 0) {
  lines.push("", "**Failures**", "", ...result.failures.map((f) => `- ${f}`));
}
if (r.ungroundedIntegers.length > 0) {
  lines.push("", `Advisory: ${r.ungroundedIntegers.length} integer(s) not found in artifacts (non-blocking): ${r.ungroundedIntegers.join(", ")}`);
}

console.log(lines.join("\n"));
