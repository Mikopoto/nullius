import { createHash, randomUUID } from "node:crypto";
import type { Claim, EvidenceItem, LiteratureItem, MethodItem, NodeSummary, Patch, ProtocolAmendment, ProtocolLock, SupportRef } from "../model/schemas.js";
import { isAllowedCitation } from "./citations.js";
import { groundingReport, isScannablePath } from "./numericGrounding.js";

export function citationKeys(markdown: string): string[] {
  const keys = new Set<string>();
  const bracketPattern = /\[@([A-Za-z][A-Za-z0-9_.:\-]*)(?:[;\]\s])/g;
  const barePattern = /(?<![\w.-])@([A-Za-z][A-Za-z0-9_.:\-]*)\b/g;

  for (const match of markdown.matchAll(bracketPattern)) {
    if (match[1]) keys.add(cleanCitationKey(match[1]));
  }
  for (const match of markdown.matchAll(barePattern)) {
    const key = match[1];
    if (!key || looksLikeEmail(markdown, match.index ?? 0)) continue;
    keys.add(cleanCitationKey(key));
  }

  return Array.from(keys).filter((key) => key.length > 0);
}

function cleanCitationKey(key: string): string {
  return key.replace(/[;\],.]+$/g, "");
}

function looksLikeEmail(text: string, atIndex: number): boolean {
  const before = text.slice(Math.max(0, atIndex - 64), atIndex);
  const after = text.slice(atIndex + 1, atIndex + 65);
  return /[\w.+-]+$/.test(before) && /^[\w.-]+\.[A-Za-z]{2,}/.test(after);
}

export interface GateProject {
  manuscriptBody: string;
  evidence: EvidenceItem[];
  claims: Claim[];
  literature: LiteratureItem[];
  methods?: MethodItem[];
  protocolLock?: ProtocolLock | undefined;
  amendments?: ProtocolAmendment[];
  patches?: Patch[];
  nodes?: NodeSummary[];
}

export interface GateIO {
  artifactExists?: (evidence: EvidenceItem) => boolean;
  artifactText?: (evidence: EvidenceItem) => string | undefined;
}

export type ReadinessDepth = "quick" | "standard" | "deep";

export interface ReadinessReport {
  blankBody: boolean;
  foundSections: number;
  requiredSections: number;
  supportedClaims: number;
  totalNodeCount: number;
  reviewedNodeCount: number;
  openMarkers: number;
  criticalCount: number;
  executableErrorCount: number;
  staleSupportRefCount: number;
  orphanResultClaimCount: number;
  approvedUnappliedPatchCount: number;
  pendingPatchCount: number;
  rejectedClaimPatchCount: number;
  missingArtifactCount: number;
  unverifiedCitationRefCount: number;
  internalLeakTerms: string[];
  unapprovedAmendmentCount: number;
  ungroundedResultNumbers: string[];
  ungroundedIntegers: string[];
  irreproducibleNodeCount: number;
  readinessScore: number;
  ready: boolean;
}

export const sectionGroups = [
  ["abstract", "要旨", "概要"],
  ["introduction", "background", "背景", "序論", "はじめに"],
  ["methods", "method", "方法", "手法"],
  ["results", "result", "結果"],
  ["discussion", "考察", "議論"],
  ["limitations", "limitation", "限界", "制限"],
  ["data/code availability", "data availability", "code availability", "references", "citation", "再現", "データ", "コード", "参考文献"]
] as const;

export const blockingMarkerText: Record<string, string> = {
  executionNeeded: "[execution needed]",
  citationNeeded: "[citation needed]",
  dataNeeded: "[data needed]",
  userInputNeeded: "[user input needed]",
  unresolvedCriticalReview: "[unresolved critical review]",
  missingArtifact: "[missing artifact]",
  staleSupportRef: "[stale supportref]"
};

export function evidenceById(project: GateProject, targetId: string): EvidenceItem | undefined {
  return project.evidence.find((item) => item.id === targetId || item.path === targetId || item.nodeId === targetId);
}

export function literatureByTarget(project: GateProject, targetId: string): LiteratureItem | undefined {
  return project.literature.find((item) => item.id === targetId || item.citationKey === targetId);
}

export function citationIsAllowed(project: GateProject, targetId: string): boolean {
  const item = literatureByTarget(project, targetId);
  return item ? isAllowedCitation(item) : false;
}

export function isSupportRefValid(ref: SupportRef, project: GateProject): boolean {
  if (ref.validation !== "valid") return false;
  switch (ref.targetType) {
    case "evidence": {
      const evidence = evidenceById(project, ref.targetId);
      return Boolean(evidence && evidence.validation === "valid" && evidence.review !== "rejected");
    }
    case "citation":
      return citationIsAllowed(project, ref.targetId);
    case "method":
      return Boolean(project.methods?.some((method) => method.id === ref.targetId || method.title === ref.targetId));
    case "protocol":
      return Boolean(project.protocolLock && (ref.targetId === "protocol" || project.protocolLock.researchQuestion === ref.targetId));
    case "review":
      return Boolean(project.nodes?.some((node) => node.id === ref.targetId && node.reviewSeverity !== undefined));
  }
}

export function isSuccessfulExecutionEvidence(ref: SupportRef, project: GateProject): boolean {
  if (ref.targetType !== "evidence") return false;
  const evidence = evidenceById(project, ref.targetId);
  return Boolean(
    evidence &&
      evidence.validation === "valid" &&
      evidence.review !== "rejected" &&
      evidence.type === "execution" &&
      evidence.execution?.exitCode === 0
  );
}

export function claimCanEnterManuscript(claim: Claim, project: GateProject): boolean {
  if (claim.validation !== "valid" || claim.review !== "approved" || claim.supportRefs.length === 0) return false;
  if (!claim.supportRefs.every((ref) => isSupportRefValid(ref, project))) return false;

  switch (claim.type) {
    case "result":
      return claim.supportRefs.some((ref) => ref.role === "primary" && isSuccessfulExecutionEvidence(ref, project));
    case "background":
      return claim.supportRefs.some((ref) => ref.targetType === "citation" && citationIsAllowed(project, ref.targetId));
    case "methodological":
      return claim.supportRefs.some((ref) => ref.role === "method" || ref.targetType === "method" || ref.targetType === "protocol" || isSuccessfulExecutionEvidence(ref, project));
    case "limitation":
    case "interpretation":
      return true;
  }
}

export function blockingMarkers(markdown: string): string[] {
  const normalized = markdown.toLowerCase();
  return Object.entries(blockingMarkerText)
    .filter(([, marker]) => normalized.includes(marker))
    .map(([type]) => type);
}

export function internalOutputLeakTerms(markdown: string): string[] {
  const normalized = markdown.toLowerCase();
  return [
    "claim_id",
    "evidence_id",
    "qmdpatch",
    "qmd patch",
    "agent timeline",
    "agent run",
    "harness",
    "node.qmd",
    "sourceactivity",
    "supportref",
    "node",
    "lane",
    "patch"
  ].filter((term) => normalized.includes(term));
}

export function markdownHeaderTitles(markdown: string): string[] {
  const titles: string[] = [];
  let insideCodeFence = false;
  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith("```")) {
      insideCodeFence = !insideCodeFence;
      continue;
    }
    if (insideCodeFence || !line.startsWith("#")) continue;
    const title = line.replace(/^#+/, "").trim().toLowerCase();
    if (title) titles.push(title);
  }
  return titles;
}

export function foundSectionCount(markdown: string): number {
  const titles = markdownHeaderTitles(markdown);
  if (titles.length === 0) return 0;
  return sectionGroups.filter((group) => group.some((keyword) => titles.some((title) => title.includes(keyword)))).length;
}

export function normalizedTextHash(markdown: string): string {
  const normalized = markdown
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .trim();
  return createHash("sha256").update(normalized).digest("hex");
}

export function patchCanApply(patch: Patch): boolean {
  return patch.status === "approved" && patch.blockingMarkers.length === 0 && !patch.warnings.some((warning) => warning.blocking);
}

export function applyPatchIfValid(currentBody: string, patch: Patch): { applied: boolean; body: string; reason?: string } {
  if (!patchCanApply(patch)) return { applied: false, body: currentBody, reason: "patch is not approved or has blocking issues" };
  if (patch.baseHash !== normalizedTextHash(currentBody)) return { applied: false, body: currentBody, reason: "base hash mismatch" };
  switch (patch.operation) {
    case "replace":
      return { applied: true, body: patch.newBody };
    case "append":
      return { applied: true, body: `${currentBody.trimEnd()}\n\n${patch.newBody}` };
    case "insert":
      return { applied: true, body: `${patch.newBody}\n\n${currentBody.trimStart()}` };
    case "delete":
      return { applied: true, body: "" };
  }
}

export function stageManuscriptPatch(
  project: GateProject,
  newBody: string,
  options: { operation?: Patch["operation"]; autoApprove?: boolean; artifactTexts?: string[] } = {}
): Patch {
  const eligibleClaims = project.claims.filter((claim) => claimCanEnterManuscript(claim, project));
  const supportRefs = eligibleClaims.flatMap((claim) => claim.supportRefs);
  const invalidRefs = supportRefs.filter((ref) => !isSupportRefValid(ref, project));
  const markers = blockingMarkers(newBody);
  const leaks = internalOutputLeakTerms(newBody);
  const artifactTexts = options.artifactTexts ?? project.evidence.filter((evidence) => evidence.validation === "valid" && evidence.review !== "rejected" && isScannablePath(evidence.path)).map((evidence) => evidence.summary);
  const numeric = groundingReport(newBody, artifactTexts);
  const unverifiedKeys = citationKeys(newBody).filter((key) => !citationIsAllowed(project, key));
  const warnings = [
    ...invalidRefs.map((ref) => ({
      message: `Invalid support reference: ${ref.targetType}/${ref.targetId}`,
      blocking: true,
      supportRefIds: [ref.targetId]
    })),
    ...leaks.map((term) => ({ message: `Internal term would leak into the final body: ${term}`, blocking: true, supportRefIds: [] })),
    ...numeric.ungroundedNumbers.map((value) => ({ message: `Number not traceable to any execution artifact: ${value}`, blocking: true, supportRefIds: [] })),
    ...numeric.ungroundedIntegers.map((value) => ({ message: `Integer not traceable to any execution artifact (advisory): ${value}`, blocking: false, supportRefIds: [] })),
    ...unverifiedKeys.map((key) => ({ message: `Citation key is not verified: @${key}`, blocking: true, supportRefIds: [] }))
  ];
  const clean = markers.length === 0 && !warnings.some((warning) => warning.blocking);
  return {
    id: cryptoRandomId(),
    targetSection: "document",
    operation: options.operation ?? "replace",
    baseHash: normalizedTextHash(project.manuscriptBody),
    newBody,
    warnings,
    blockingMarkers: markers as Patch["blockingMarkers"],
    supportRefs,
    claimIds: eligibleClaims.map((claim) => claim.id),
    status: options.autoApprove && clean ? "approved" : clean ? "draft" : "needsRevision"
  };
}

export function readinessReport(project: GateProject, depth: ReadinessDepth, io: GateIO = {}): ReadinessReport {
  const body = project.manuscriptBody.trim();
  const report: ReadinessReport = {
    blankBody: body.length === 0,
    foundSections: 0,
    requiredSections: sectionGroups.length,
    supportedClaims: 0,
    totalNodeCount: project.nodes?.length ?? 0,
    reviewedNodeCount: 0,
    openMarkers: 0,
    criticalCount: 0,
    executableErrorCount: 0,
    staleSupportRefCount: 0,
    orphanResultClaimCount: 0,
    approvedUnappliedPatchCount: 0,
    pendingPatchCount: 0,
    rejectedClaimPatchCount: 0,
    missingArtifactCount: 0,
    unverifiedCitationRefCount: 0,
    internalLeakTerms: [],
    unapprovedAmendmentCount: 0,
    ungroundedResultNumbers: [],
    ungroundedIntegers: [],
    irreproducibleNodeCount: 0,
    readinessScore: 0,
    ready: false
  };
  if (report.blankBody) return report;

  const normalized = body.toLowerCase();
  report.foundSections = foundSectionCount(body);
  report.openMarkers = blockingMarkers(body).reduce((count, marker) => count + occurrenceCount(blockingMarkerText[marker] ?? "", normalized), 0);
  report.reviewedNodeCount = project.nodes?.filter((node) => node.reviewSeverity !== undefined).length ?? 0;
  report.criticalCount = project.nodes?.filter((node) => node.reviewSeverity === "critical").length ?? 0;
  report.executableErrorCount = project.nodes?.filter((node) => node.status === "error").length ?? 0;
  report.supportedClaims = project.claims.filter((claim) => claimCanEnterManuscript(claim, project)).length;

  const allSupportRefs = [...project.claims.flatMap((claim) => claim.supportRefs), ...(project.patches ?? []).flatMap((patch) => patch.supportRefs)];
  report.staleSupportRefCount = allSupportRefs.filter((ref) => ref.validation === "stale" || !isSupportRefValid(ref, project)).length;
  report.orphanResultClaimCount = project.claims.filter((claim) => claim.type === "result" && !claim.supportRefs.some((ref) => ref.role === "primary" && isSuccessfulExecutionEvidence(ref, project))).length;
  report.approvedUnappliedPatchCount = (project.patches ?? []).filter((patch) => patch.status === "approved" && !patch.appliedAt).length;
  report.pendingPatchCount = (project.patches ?? []).filter((patch) => (patch.status === "draft" || patch.status === "needsRevision") && !patch.appliedAt).length;
  report.rejectedClaimPatchCount = (project.patches ?? []).filter((patch) => patch.claimIds.some((claimId) => project.claims.find((claim) => claim.id === claimId)?.review === "rejected")).length;
  report.missingArtifactCount = project.evidence.filter((evidence) => evidence.validation === "valid" && Boolean(evidence.path) && !(io.artifactExists?.(evidence) ?? true)).length;
  report.unverifiedCitationRefCount = allSupportRefs.filter((ref) => ref.targetType === "citation" && !citationIsAllowed(project, ref.targetId)).length;
  report.internalLeakTerms = internalOutputLeakTerms(body);
  report.unapprovedAmendmentCount = (project.amendments ?? []).filter((amendment) => amendment.status !== "approved").length;

  const artifactTexts = project.evidence
    .filter((evidence) => evidence.validation === "valid" && evidence.review !== "rejected" && isScannablePath(evidence.path))
    .map((evidence) => io.artifactText?.(evidence) ?? evidence.summary)
    .filter((text) => text.length > 0);
  const numeric = groundingReport(body, artifactTexts);
  report.ungroundedResultNumbers = numeric.ungroundedNumbers;
  report.ungroundedIntegers = numeric.ungroundedIntegers;
  report.irreproducibleNodeCount = project.nodes?.filter((node) => node.reproducibilityStatus === "divergent" || node.reproducibilityStatus === "failed").length ?? 0;

  const config = depthConfig(depth);
  const sectionScore = report.foundSections / report.requiredSections;
  const evidenceScore = Math.min(1, Math.max(report.supportedClaims, report.reviewedNodeCount) / Math.max(1, config.minimumEvidenceNodes));
  const deterministicIssues =
    report.openMarkers +
    report.staleSupportRefCount +
    report.orphanResultClaimCount +
    report.approvedUnappliedPatchCount +
    report.pendingPatchCount +
    report.rejectedClaimPatchCount +
    report.missingArtifactCount +
    report.unverifiedCitationRefCount +
    report.internalLeakTerms.length +
    report.unapprovedAmendmentCount +
    report.ungroundedResultNumbers.length +
    report.irreproducibleNodeCount;
  const weightedIssues = deterministicIssues + 0.5 * report.ungroundedIntegers.length;
  const openIssueScore = Math.max(0, 1 - weightedIssues / Math.max(1, config.allowedOpenIssueMarkers + 1));
  const reviewScore = report.criticalCount > 0 ? 0 : report.executableErrorCount > 0 ? 0.45 : 1;
  report.readinessScore = sectionScore * 0.45 + evidenceScore * 0.25 + openIssueScore * 0.2 + reviewScore * 0.1;
  const enoughEvidence = report.totalNodeCount >= config.minimumEvidenceNodes || report.supportedClaims >= config.minimumEvidenceNodes;
  report.ready =
    enoughEvidence &&
    report.readinessScore + Number.EPSILON >= config.targetReadinessScore &&
    deterministicIssues <= config.allowedOpenIssueMarkers &&
    report.criticalCount === 0 &&
    report.executableErrorCount === 0 &&
    report.staleSupportRefCount === 0 &&
    report.orphanResultClaimCount === 0 &&
    report.approvedUnappliedPatchCount === 0 &&
    report.pendingPatchCount === 0 &&
    report.rejectedClaimPatchCount === 0 &&
    report.missingArtifactCount === 0 &&
    report.unverifiedCitationRefCount === 0 &&
    report.internalLeakTerms.length === 0 &&
    report.unapprovedAmendmentCount === 0 &&
    report.ungroundedResultNumbers.length === 0 &&
    report.irreproducibleNodeCount === 0 &&
    report.foundSections >= Math.min(report.requiredSections, depth === "quick" ? 5 : 6);
  return report;
}

function occurrenceCount(needle: string, haystack: string): number {
  if (needle.length === 0) return 0;
  return haystack.split(needle).length - 1;
}

function depthConfig(depth: ReadinessDepth): { minimumEvidenceNodes: number; allowedOpenIssueMarkers: number; targetReadinessScore: number } {
  switch (depth) {
    case "quick":
      return { minimumEvidenceNodes: 1, allowedOpenIssueMarkers: 0, targetReadinessScore: 0.7 };
    case "deep":
      return { minimumEvidenceNodes: 3, allowedOpenIssueMarkers: 0, targetReadinessScore: 0.9 };
    case "standard":
      return { minimumEvidenceNodes: 2, allowedOpenIssueMarkers: 0, targetReadinessScore: 0.8 };
  }
}

function cryptoRandomId(): string {
  return randomUUID();
}
