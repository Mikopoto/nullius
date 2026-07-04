import { z } from "zod";

export const SchemaVersion = 1;

export function enumWithFallback<T extends readonly [string, ...string[]]>(
  values: T,
  fallback: T[number]
) {
  return z.preprocess((value) => {
    if (typeof value !== "string") return fallback;
    return (values as readonly string[]).includes(value) ? value : fallback;
  }, z.enum(values));
}

export const ProviderKindSchema = enumWithFallback(
  ["openrouter", "openai", "anthropic", "customOpenAICompatible", "codexCli", "claudeCode", "opencode"] as const,
  "openrouter"
);

export const ReasoningEffortSchema = enumWithFallback(
  ["none", "low", "medium", "high"] as const,
  "none"
);

export const AgentRoleSchema = z.object({
  provider: ProviderKindSchema,
  model: z.string().min(1),
  reasoningEffort: ReasoningEffortSchema.default("none")
});

export const ProtocolLockSchema = z.object({
  researchQuestion: z.string(),
  scope: z.string().default(""),
  plannedObservables: z.array(z.string()).default([]),
  successCriteria: z.array(z.string()).default([]),
  falsificationCriteria: z.array(z.string()).default([]),
  requiredEvidence: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  lockedAt: z.string().optional()
});

export const ProtocolAmendmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  rationale: z.string(),
  status: enumWithFallback(["proposed", "approved", "rejected"] as const, "proposed"),
  createdAt: z.string()
});

export const SourceActivitySchema = z.object({
  id: z.string(),
  type: enumWithFallback(
    ["execution", "literatureImport", "userInput", "protocolLock", "methodRegistration", "manualDatasetImport", "legacyImport"] as const,
    "legacyImport"
  ),
  title: z.string(),
  startedAt: z.string(),
  finishedAt: z.string().optional(),
  actorType: enumWithFallback(["system", "user", "agent", "cli"] as const, "system"),
  actorId: z.string().optional(),
  relatedTaskId: z.string().optional(),
  agentRunResultId: z.string().optional(),
  userActionId: z.string().optional()
});

export const ProjectManifestSchema = z.object({
  schemaVersion: z.literal(SchemaVersion).default(SchemaVersion),
  name: z.string(),
  question: z.string(),
  roles: z.object({
    planner: AgentRoleSchema,
    executor: AgentRoleSchema,
    reviewer: AgentRoleSchema
  }),
  settings: z.object({
    maxLanes: z.number().int().positive().default(3),
    maxNodes: z.number().int().positive().optional(),
    depth: enumWithFallback(["quick", "standard", "deep"] as const, "standard"),
    sandboxPolicy: enumWithFallback(["required", "prefer", "disabled"] as const, "required"),
    selfCorrectionRounds: z.number().int().min(1).max(5).default(2)
  }),
  protocolLock: ProtocolLockSchema.optional(),
  amendments: z.array(ProtocolAmendmentSchema).default([])
});

export const PlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  purpose: z.string(),
  method: z.string(),
  observables: z.array(z.string()).default([]),
  successCriteria: z.array(z.string()).default([]),
  falsificationCriteria: z.array(z.string()).default([]),
  approved: z.boolean().default(false)
});

export const LaneSchema = z.object({
  id: z.string(),
  name: z.string(),
  planId: z.string(),
  nodeOrder: z.array(z.string()).default([])
});

export const NodeExecutionRecordSchema = z.object({
  exitCode: z.number().int().nullable(),
  startedAt: z.string(),
  durationMs: z.number().nonnegative(),
  backend: enumWithFallback(["pyodide", "sandboxExec", "docker"] as const, "pyodide")
});

export const NodeReviewSchema = z.object({
  severity: enumWithFallback(["clear", "info", "warning", "critical"] as const, "info"),
  findings: z.array(z.string()).default([]),
  concerns: z.array(z.string()).default([]),
  summary: z.string().default("")
});

export const NodeRecordSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: enumWithFallback(["notStarted", "running", "completed", "error", "waitingForUser", "settled"] as const, "notStarted"),
  prerequisiteNodeIds: z.array(z.string()).default([]),
  generatedCode: z.string().default(""),
  executionRecord: NodeExecutionRecordSchema.optional(),
  review: NodeReviewSchema.optional(),
  reproducibility: enumWithFallback(["notChecked", "reproduced", "divergent", "failed"] as const, "notChecked").default("notChecked")
});

export const LiteratureStatusSchema = enumWithFallback(
  ["unverified", "verified", "importedByUser", "needsCitation", "rejected", "retracted"] as const,
  "unverified"
);

export const LiteratureItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.string().default(""),
  year: z.string().default(""),
  doi: z.string().optional(),
  url: z.string().optional(),
  citationKey: z.string(),
  status: LiteratureStatusSchema.default("unverified"),
  notes: z.string().default("")
});

export const SupportRefSchema = z.object({
  targetType: enumWithFallback(["evidence", "citation", "method", "protocol", "review"] as const, "evidence"),
  targetId: z.string(),
  role: enumWithFallback(
    ["primary", "secondary", "method", "background", "limitation", "contradiction", "provenance"] as const,
    "secondary"
  ),
  validation: enumWithFallback(["valid", "invalid", "stale", "missing"] as const, "missing")
});

const EvidenceBaseSchema = z.object({
  id: z.string(),
  type: enumWithFallback(["execution", "dataset", "plot", "table", "log", "humanInput", "manualDataset", "method", "protocol"] as const, "log"),
  laneId: z.string().optional(),
  nodeId: z.string().optional(),
  title: z.string(),
  summary: z.string().default(""),
  path: z.string().optional(),
  sha256: z.string().optional(),
  createdAt: z.string(),
  sourceActivityId: z.string(),
  sourceActivityType: enumWithFallback(
    ["execution", "literatureImport", "userInput", "protocolLock", "methodRegistration", "manualDatasetImport", "legacyImport"] as const,
    "legacyImport"
  ).default("legacyImport"),
  validation: enumWithFallback(["valid", "invalid", "stale", "missing"] as const, "missing"),
  review: enumWithFallback(["draft", "needsRevision", "approved", "rejected"] as const, "draft")
});

export const ExecutionEvidencePayloadSchema = z.object({
  producingCommand: z.string(),
  exitCode: z.number().int(),
  stdoutPath: z.string(),
  stderrPath: z.string(),
  artifactPaths: z.array(z.string()).default([]),
  sha256ByPath: z.record(z.string()).default({}),
  environmentSummary: z.string().default("")
});

export const EvidenceItemSchema = EvidenceBaseSchema.extend({
  execution: ExecutionEvidencePayloadSchema.optional()
}).superRefine((item, ctx) => {
  if (item.type === "execution" && !item.execution) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["execution"],
      message: "execution evidence requires an execution payload"
    });
  }
});

export const ClaimSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: enumWithFallback(["result", "background", "methodological", "limitation", "interpretation"] as const, "interpretation"),
  supportRefs: z.array(SupportRefSchema).default([]),
  validation: enumWithFallback(["valid", "invalid", "stale", "missing"] as const, "missing"),
  review: enumWithFallback(["draft", "needsRevision", "approved", "rejected"] as const, "draft"),
  intendedSectionId: z.string().optional(),
  appliedSectionId: z.string().optional(),
  qmdPatchIds: z.array(z.string()).default([])
});

export const BlockingMarkerSchema = enumWithFallback(
  ["executionNeeded", "citationNeeded", "dataNeeded", "userInputNeeded", "unresolvedCriticalReview", "missingArtifact", "staleSupportRef"] as const,
  "userInputNeeded"
);

export const PatchWarningSchema = z.object({
  message: z.string(),
  blocking: z.boolean().default(false),
  supportRefIds: z.array(z.string()).default([])
});

export const PatchSchema = z.object({
  id: z.string(),
  targetSection: z.string(),
  operation: enumWithFallback(["insert", "replace", "append", "delete"] as const, "replace"),
  baseHash: z.string(),
  newBody: z.string(),
  warnings: z.array(PatchWarningSchema).default([]),
  blockingMarkers: z.array(BlockingMarkerSchema).default([]),
  supportRefs: z.array(SupportRefSchema).default([]),
  claimIds: z.array(z.string()).default([]),
  status: enumWithFallback(["draft", "needsRevision", "approved", "rejected"] as const, "draft"),
  appliedAt: z.string().optional()
});

export const MethodItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string().default(""),
  path: z.string().optional()
});

export const NodeSummarySchema = z.object({
  id: z.string(),
  status: enumWithFallback(["notStarted", "running", "completed", "error", "waitingForUser", "settled"] as const, "notStarted"),
  reviewSeverity: enumWithFallback(["clear", "info", "warning", "critical"] as const, "info").optional(),
  reproducibilityStatus: enumWithFallback(["notChecked", "reproduced", "divergent", "failed"] as const, "notChecked").optional()
});

export const AgentRunResultSchema = z.object({
  id: z.string(),
  runStatus: enumWithFallback(["succeeded", "failed", "cancelled", "blockedInvalidSchema"] as const, "failed"),
  exitCode: z.number().int().nullable(),
  structuredResultPath: z.string().optional(),
  declaredSchemaPath: z.string().optional(),
  schemaValidationStatus: enumWithFallback(["valid", "invalid", "missing", "notApplicable"] as const, "notApplicable"),
  stdoutPath: z.string(),
  stderrPath: z.string(),
  createdFiles: z.array(z.string()).default([]),
  modifiedFiles: z.array(z.string()).default([]),
  deletedFiles: z.array(z.string()).default([]),
  sha256ByPath: z.record(z.string()).default({}),
  gitDiffPath: z.string(),
  artifactManifestStatus: enumWithFallback(["valid", "partial", "missing", "invalid"] as const, "missing"),
  artifactManifest: z.unknown().optional(),
  startedAt: z.string(),
  finishedAt: z.string()
});

export type ProjectManifest = z.infer<typeof ProjectManifestSchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type Lane = z.infer<typeof LaneSchema>;
export type NodeRecord = z.infer<typeof NodeRecordSchema>;
export type NodeReview = z.infer<typeof NodeReviewSchema>;
export type LiteratureItem = z.infer<typeof LiteratureItemSchema>;
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;
export type Claim = z.infer<typeof ClaimSchema>;
export type Patch = z.infer<typeof PatchSchema>;
export type AgentRunResult = z.infer<typeof AgentRunResultSchema>;
export type SupportRef = z.infer<typeof SupportRefSchema>;
export type SourceActivity = z.infer<typeof SourceActivitySchema>;
export type MethodItem = z.infer<typeof MethodItemSchema>;
export type NodeSummary = z.infer<typeof NodeSummarySchema>;
export type ProtocolLock = z.infer<typeof ProtocolLockSchema>;
export type ProtocolAmendment = z.infer<typeof ProtocolAmendmentSchema>;
