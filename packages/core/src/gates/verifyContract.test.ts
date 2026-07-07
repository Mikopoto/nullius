import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  buildVerifyResult,
  createProject,
  loadProject,
  projectGateIO,
  ProjectManifestSchema,
  readinessReport,
  snapshotToGateProject,
  VERIFY_SCHEMA_VERSION,
  VerifyResultSchema,
  type ReadinessReport
} from "../index.js";

/**
 * GOLDEN CONTRACT TEST for `nullius verify --json` (docs/verify-contract.md).
 *
 * If this test fails because a readiness field was added, removed, or renamed:
 *   1. bump VERIFY_SCHEMA_VERSION in packages/core/src/gates/verifyContract.ts,
 *   2. update ReadinessReportSchema there to match,
 *   3. update docs/verify-contract.md,
 *   4. update GOLDEN_READINESS_FIELDS below.
 * Consumers pin on schemaVersion; silent shape drift breaks research CI.
 */
const GOLDEN_READINESS_FIELDS = [
  "approvedUnappliedPatchCount",
  "blankBody",
  "criticalCount",
  "executableErrorCount",
  "foundSections",
  "internalLeakTerms",
  "irreproducibleNodeCount",
  "missingArtifactCount",
  "openMarkers",
  "orphanResultClaimCount",
  "pendingPatchCount",
  "readinessScore",
  "ready",
  "rejectedClaimPatchCount",
  "requiredSections",
  "reviewedNodeCount",
  "staleSupportRefCount",
  "supportedClaims",
  "totalNodeCount",
  "unapprovedAmendmentCount",
  "ungroundedIntegers",
  "ungroundedResultNumbers",
  "unverifiedCitationRefCount"
] as const;

const GOLDEN_TOP_LEVEL_FIELDS = ["failures", "gate", "ok", "readiness", "schemaVersion"] as const;

describe("verify --json frozen contract", () => {
  let projectRoot = "";
  let report: ReadinessReport;

  beforeAll(async () => {
    projectRoot = await mkdtemp(join(tmpdir(), "nullius-verify-contract-"));
    const manifest = ProjectManifestSchema.parse({
      schemaVersion: 1,
      name: "Contract fixture",
      question: "Does the verify contract stay frozen?",
      roles: {
        planner: { provider: "openrouter", model: "openrouter/auto", reasoningEffort: "none" },
        executor: { provider: "openrouter", model: "openrouter/auto", reasoningEffort: "none" },
        reviewer: { provider: "openrouter", model: "openrouter/auto", reasoningEffort: "none" }
      },
      settings: { maxLanes: 3, depth: "standard", sandboxPolicy: "required", selfCorrectionRounds: 2 },
      amendments: []
    });
    await createProject(projectRoot, manifest);
    const snapshot = await loadProject(projectRoot);
    report = readinessReport(snapshotToGateProject(snapshot), "standard", projectGateIO(projectRoot));
  });

  afterAll(async () => {
    if (projectRoot) await rm(projectRoot, { recursive: true, force: true });
  });

  it("builds a result for every gate that validates against VerifyResultSchema", () => {
    for (const gate of ["numbers", "citations", "repro", "all"] as const) {
      const result = buildVerifyResult(gate, report);
      const parsed = VerifyResultSchema.safeParse(result);
      expect(parsed.success, `verify --json payload for gate "${gate}" no longer matches VerifyResultSchema: ${parsed.success ? "" : parsed.error.message}`).toBe(true);
      expect(result.schemaVersion).toBe(VERIFY_SCHEMA_VERSION);
      expect(result.gate).toBe(gate);
    }
  });

  it("keeps the exact readiness field set (golden list)", () => {
    const actual = Object.keys(report).sort();
    expect(actual, [
      "The readiness field set of `nullius verify --json` changed.",
      "This is a BREAKING change to a frozen public contract.",
      "You must: (1) bump VERIFY_SCHEMA_VERSION in packages/core/src/gates/verifyContract.ts,",
      "(2) update ReadinessReportSchema, (3) update docs/verify-contract.md,",
      "(4) update GOLDEN_READINESS_FIELDS in this test."
    ].join(" ")).toEqual([...GOLDEN_READINESS_FIELDS]);
  });

  it("keeps the exact top-level field set (golden list)", () => {
    const result = buildVerifyResult("all", report);
    const actual = Object.keys(result).sort();
    expect(actual, [
      "The top-level field set of `nullius verify --json` changed.",
      "This is a BREAKING change to a frozen public contract.",
      "Bump VERIFY_SCHEMA_VERSION, update VerifyResultSchema, docs/verify-contract.md, and this test."
    ].join(" ")).toEqual([...GOLDEN_TOP_LEVEL_FIELDS]);
  });

  it("rejects payloads with unknown or missing fields", () => {
    const good = buildVerifyResult("all", report);
    expect(VerifyResultSchema.safeParse({ ...good, extra: true }).success).toBe(false);
    expect(VerifyResultSchema.safeParse({ ...good, readiness: { ...good.readiness, surprise: 1 } }).success).toBe(false);
    const { failures: _failures, ...missing } = good;
    expect(VerifyResultSchema.safeParse(missing).success).toBe(false);
    expect(VerifyResultSchema.safeParse({ ...good, schemaVersion: 2 }).success).toBe(false);
  });
});
