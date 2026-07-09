// `nullius list <kind>` id-discovery helpers.
//
// Read-only: mirrors the `status` command's style (no activity record for reads).
// The list-building is a pure function of the loaded snapshot so it can be tested
// without spawning a process. Each item is re-parsed through its core schema, so
// `--json` emits a zod-validated array of the raw objects.
import {
  ClaimSchema,
  EvidenceItemSchema,
  NodeRecordSchema,
  PatchSchema,
  PlanSchema,
  type Claim,
  type EvidenceItem,
  type NodeRecord,
  type Patch,
  type Plan,
  type ProjectSnapshot
} from "@nullius/core";

export const LIST_SCHEMA_VERSION = 1 as const;

export const listKinds = ["plans", "patches", "nodes", "claims", "evidence"] as const;
export type ListKind = (typeof listKinds)[number];

export function isListKind(value: string): value is ListKind {
  return (listKinds as readonly string[]).includes(value);
}

export interface ListResult {
  schemaVersion: typeof LIST_SCHEMA_VERSION;
  kind: ListKind;
  items: unknown[];
}

/**
 * Build the `list --json` payload. Every item is re-parsed through its core schema,
 * so the emitted `items` array is zod-validated and throws on a drifting shape.
 */
export function buildListResult(snapshot: ProjectSnapshot, kind: ListKind): ListResult {
  return { schemaVersion: LIST_SCHEMA_VERSION, kind, items: validatedItems(snapshot, kind) };
}

function validatedItems(snapshot: ProjectSnapshot, kind: ListKind): unknown[] {
  switch (kind) {
    case "plans":
      return snapshot.plans.map((item) => PlanSchema.parse(item));
    case "patches":
      return snapshot.patches.map((item) => PatchSchema.parse(item));
    case "nodes":
      return snapshot.lanes.flatMap((lane) => lane.nodes).map((item) => NodeRecordSchema.parse(item));
    case "claims":
      return snapshot.claims.map((item) => ClaimSchema.parse(item));
    case "evidence":
      return snapshot.evidence.map((item) => EvidenceItemSchema.parse(item));
  }
}

/** One human-readable line per item, in the same order as the JSON payload. */
export function formatListLines(snapshot: ProjectSnapshot, kind: ListKind): string[] {
  switch (kind) {
    case "plans":
      return snapshot.plans.map(formatPlanLine);
    case "patches":
      return snapshot.patches.map(formatPatchLine);
    case "nodes":
      return snapshot.lanes.flatMap((lane) => lane.nodes.map((node) => formatNodeLine(node, lane.name)));
    case "claims":
      return snapshot.claims.map(formatClaimLine);
    case "evidence":
      return snapshot.evidence.map(formatEvidenceLine);
  }
}

function formatPlanLine(plan: Plan): string {
  return [shortId(plan.id), plan.approved ? "adopted" : "pending", truncate(plan.title, 70)].join("  ");
}

function formatPatchLine(patch: Patch): string {
  const blocking = patch.warnings.filter((warning) => warning.blocking).length;
  return [shortId(patch.id), patch.status, `${blocking} blocking`].join("  ");
}

function formatNodeLine(node: NodeRecord, laneName: string): string {
  return [shortId(node.id), truncate(laneName, 70), node.status, node.reproducibility].join("  ");
}

function formatClaimLine(claim: Claim): string {
  return [shortId(claim.id), claim.type, claim.review, truncate(claim.text, 70)].join("  ");
}

function formatEvidenceLine(evidence: EvidenceItem): string {
  return [shortId(evidence.id), `${evidence.review}/${evidence.validation}`, evidence.path ?? "(no path)"].join("  ");
}

function shortId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id;
}

function truncate(text: string, max: number): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  return collapsed.length > max ? `${collapsed.slice(0, max - 1)}…` : collapsed;
}
