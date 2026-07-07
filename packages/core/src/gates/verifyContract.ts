import { z } from "zod";
import type { ReadinessReport } from "./evidence.js";

/**
 * Frozen contract for `nullius verify --json`.
 *
 * The shape below is a public interface consumed by research CI pipelines.
 * Any breaking change (field added, removed, renamed, or retyped) requires:
 *   1. bumping VERIFY_SCHEMA_VERSION,
 *   2. updating docs/verify-contract.md,
 *   3. updating the golden test in verifyContract.test.ts.
 */
export const VERIFY_SCHEMA_VERSION = 1;

export const ReadinessReportSchema = z
  .object({
    blankBody: z.boolean(),
    foundSections: z.number(),
    requiredSections: z.number(),
    supportedClaims: z.number(),
    totalNodeCount: z.number(),
    reviewedNodeCount: z.number(),
    openMarkers: z.number(),
    criticalCount: z.number(),
    executableErrorCount: z.number(),
    staleSupportRefCount: z.number(),
    orphanResultClaimCount: z.number(),
    approvedUnappliedPatchCount: z.number(),
    pendingPatchCount: z.number(),
    rejectedClaimPatchCount: z.number(),
    missingArtifactCount: z.number(),
    unverifiedCitationRefCount: z.number(),
    internalLeakTerms: z.array(z.string()),
    unapprovedAmendmentCount: z.number(),
    ungroundedResultNumbers: z.array(z.string()),
    ungroundedIntegers: z.array(z.string()),
    irreproducibleNodeCount: z.number(),
    readinessScore: z.number(),
    ready: z.boolean()
  })
  .strict();

export const VerifyGateSchema = z.enum(["numbers", "citations", "repro", "all"]);

export const VerifyResultSchema = z
  .object({
    schemaVersion: z.literal(1),
    ok: z.boolean(),
    gate: VerifyGateSchema,
    readiness: ReadinessReportSchema,
    failures: z.array(z.string())
  })
  .strict();

export type VerifyGate = z.infer<typeof VerifyGateSchema>;
export type VerifyResult = z.infer<typeof VerifyResultSchema>;

/**
 * Compile-time drift guard: if ReadinessReport in evidence.ts gains, loses,
 * or retypes a field without a matching schema update here, these
 * assignments stop compiling.
 */
/** Deterministic per-gate pass/fail derivation shared by the CLI and the GitHub Action bundle. */
export function verifyGateStatus(gate: VerifyGate, report: ReadinessReport): { ok: boolean; failures: string[] } {
  switch (gate) {
    case "numbers":
      return { ok: report.ungroundedResultNumbers.length === 0, failures: report.ungroundedResultNumbers };
    case "citations":
      return { ok: report.unverifiedCitationRefCount === 0, failures: report.unverifiedCitationRefCount === 0 ? [] : [`${report.unverifiedCitationRefCount} unverified citation reference(s)`] };
    case "repro":
      return { ok: report.irreproducibleNodeCount === 0, failures: report.irreproducibleNodeCount === 0 ? [] : [`${report.irreproducibleNodeCount} irreproducible node(s)`] };
    case "all":
      return { ok: report.ready, failures: report.ready ? [] : ["readiness failed"] };
  }
}

/** Build and validate the frozen `verify --json` payload. Throws if the shape has drifted. */
export function buildVerifyResult(gate: VerifyGate, report: ReadinessReport): VerifyResult {
  const status = verifyGateStatus(gate, report);
  return VerifyResultSchema.parse({
    schemaVersion: VERIFY_SCHEMA_VERSION,
    ok: status.ok,
    gate,
    readiness: report,
    failures: status.failures
  });
}

type SchemaReadiness = z.infer<typeof ReadinessReportSchema>;
type MutuallyAssignable<A, B> = A extends B ? (B extends A ? true : never) : never;
export type ReadinessContractMatchesRuntime = MutuallyAssignable<SchemaReadiness, ReadinessReport>;
// Fails to compile (true is not assignable to never) when the shapes drift apart.
const contractMatchesRuntime: ReadinessContractMatchesRuntime = true;
void contractMatchesRuntime;
