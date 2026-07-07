# The `nullius verify --json` contract

`nullius verify [folder] --json [--gate numbers|citations|repro|all] [--depth quick|standard|deep]` prints a single JSON object on stdout and exits `0` when the selected gate passes, `1` when it fails. This document freezes that object. Research CI pipelines, scripts, and agents may parse it and pin on `schemaVersion`.

The shape is enforced twice in this repository:

- at runtime: the CLI validates every payload against `VerifyResultSchema` (exported from `@nullius/core`, defined in `packages/core/src/gates/verifyContract.ts`) before printing it, so an accidental drift throws instead of silently changing the output;
- at test time: a golden test (`packages/core/src/gates/verifyContract.test.ts`) compares the exact field list against a hardcoded array.

## schemaVersion policy

`schemaVersion` is currently `1`.

- Any breaking change (a field added, removed, renamed, or retyped, or a change in the meaning of an existing field) requires bumping `VERIFY_SCHEMA_VERSION` in `packages/core/src/gates/verifyContract.ts`, updating `VerifyResultSchema`, updating this document, and updating the golden test.
- Consumers should reject payloads whose `schemaVersion` they do not know, rather than guessing.
- Within a single `schemaVersion`, the field set is exact: no fields are added or removed, and no unknown fields will appear.

## Top-level fields

| Field | Type | Meaning |
| --- | --- | --- |
| `schemaVersion` | literal `1` | Contract version of this payload. |
| `ok` | boolean | Whether the selected gate passed. Mirrors the process exit code (`ok: true` exits `0`, `ok: false` exits `1`). |
| `gate` | `"numbers"` \| `"citations"` \| `"repro"` \| `"all"` | Which gate was evaluated. `all` requires full readiness; the others test one dimension. |
| `readiness` | object | The full readiness report, described below. Always complete regardless of `gate`. |
| `failures` | string[] | Human-readable reasons `ok` is false. Empty when `ok` is true. For `gate: "numbers"` it lists the ungrounded values themselves. |

## `readiness` fields

Depth (`quick`, `standard`, `deep`) sets the minimum evidence node count (1, 2, 3), the target readiness score (0.7, 0.8, 0.9), and the required section count (5 for quick, 6 otherwise). All fields below are always present.

Blocking means a nonzero or true value prevents `readiness.ready` (and therefore `gate: "all"`) from passing. Advisory means the value lowers `readinessScore` or is informational but does not by itself block readiness.

| Field | Type | Blocking | Meaning |
| --- | --- | --- | --- |
| `blankBody` | boolean | blocking | The manuscript body is empty. When true, all other fields are returned at their zero values. |
| `foundSections` | number | blocking | How many of the required section groups (abstract, introduction, methods, results, discussion, limitations, availability/references) were found as markdown headers. Must reach the depth threshold. |
| `requiredSections` | number | informational | Total number of section groups checked (currently 7). |
| `supportedClaims` | number | blocking (minimum) | Claims that are valid, approved, and fully supported by valid evidence, citations, methods, or protocol. Counts toward the evidence minimum for the chosen depth. |
| `totalNodeCount` | number | blocking (minimum) | Total execution nodes across lanes. Either this or `supportedClaims` must reach the depth minimum. |
| `reviewedNodeCount` | number | advisory | Nodes that have received a review severity. Feeds the evidence score. |
| `openMarkers` | number | blocking | Occurrences of open blocking markers in the body, such as `[execution needed]`, `[citation needed]`, `[data needed]`. Must be 0. |
| `criticalCount` | number | blocking | Nodes with an unresolved critical review. Must be 0; also zeroes the review score component. |
| `executableErrorCount` | number | blocking | Nodes whose latest execution ended in an error. Must be 0. |
| `staleSupportRefCount` | number | blocking | Support references (on claims or patches) that are stale or no longer resolve to valid targets. Must be 0. |
| `orphanResultClaimCount` | number | blocking | Result claims lacking a primary reference to a successful sandbox execution. Must be 0. |
| `approvedUnappliedPatchCount` | number | blocking | Approved manuscript patches that have not been applied yet. Must be 0. |
| `pendingPatchCount` | number | blocking | Draft or needs-revision patches that are still open. Must be 0. |
| `rejectedClaimPatchCount` | number | blocking | Patches that carry claims whose review was rejected. Must be 0. |
| `missingArtifactCount` | number | blocking | Valid evidence records whose artifact file no longer exists on disk. Must be 0. |
| `unverifiedCitationRefCount` | number | blocking | Citation support references that do not resolve to a verified, allowed literature record. Must be 0. This is the value tested by `--gate citations`. |
| `internalLeakTerms` | string[] | blocking | Internal identifiers or vocabulary (claim ids, node ids, patch jargon) found in the manuscript body. Must be empty. |
| `unapprovedAmendmentCount` | number | blocking | Protocol amendments that are not yet human approved. Must be 0. |
| `ungroundedResultNumbers` | string[] | blocking | Decimal or percentage values in the body that cannot be traced to any execution artifact. Must be empty. This is the value tested by `--gate numbers`. |
| `ungroundedIntegers` | string[] | advisory | Integers in the body not found in artifacts. Each one costs half an issue in the readiness score but does not block on its own. |
| `irreproducibleNodeCount` | number | blocking | Nodes whose reproducibility check diverged or failed. Must be 0. This is the value tested by `--gate repro`. |
| `readinessScore` | number | blocking (threshold) | Weighted score in [0, 1]: sections 45%, evidence 25%, open issues 20%, review 10%. Must reach the depth target. |
| `ready` | boolean | result | True only when every blocking condition above is satisfied. `gate: "all"` passes exactly when this is true. |

## Example output

A freshly initialized project (blank manuscript) with `--gate all`:

```json
{
  "schemaVersion": 1,
  "ok": false,
  "gate": "all",
  "readiness": {
    "blankBody": true,
    "foundSections": 0,
    "requiredSections": 7,
    "supportedClaims": 0,
    "totalNodeCount": 0,
    "reviewedNodeCount": 0,
    "openMarkers": 0,
    "criticalCount": 0,
    "executableErrorCount": 0,
    "staleSupportRefCount": 0,
    "orphanResultClaimCount": 0,
    "approvedUnappliedPatchCount": 0,
    "pendingPatchCount": 0,
    "rejectedClaimPatchCount": 0,
    "missingArtifactCount": 0,
    "unverifiedCitationRefCount": 0,
    "internalLeakTerms": [],
    "unapprovedAmendmentCount": 0,
    "ungroundedResultNumbers": [],
    "ungroundedIntegers": [],
    "irreproducibleNodeCount": 0,
    "readinessScore": 0,
    "ready": false
  },
  "failures": [
    "readiness failed"
  ]
}
```

The process exits `1` for this payload. A passing run prints the same shape with `"ok": true`, `"ready": true`, and `"failures": []`, and exits `0`.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Selected gate passed. |
| `1` | Selected gate failed (payload still printed) or the command errored. |

## Using it in CI

See the ready-made GitHub Action in [`action/`](../action/README.md), or call the CLI directly:

```bash
nullius verify myproject --json --gate all > verify.json
# nonzero exit fails the job; verify.json is the machine-readable report
```
