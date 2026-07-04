import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ExecutionBackend, ExecutionResult } from "../exec/executionBackend.js";
import { defaultExecutionBackend } from "../exec/executionBackend.js";
import type { Usage } from "../providers/streamParser.js";
import {
  applyPatchIfValid,
  readinessReport,
  stageManuscriptPatch
} from "../gates/evidence.js";
import type { AgentRunResult, Claim, EvidenceItem, Lane, NodeRecord, NodeReview, Patch, Plan, ProjectManifest, SourceActivity } from "../model/schemas.js";
import {
  atomicWriteText,
  loadProject,
  projectGateIO,
  saveAgentRunResults,
  saveClaims,
  saveEvidence,
  saveLane,
  saveManifest,
  saveManuscript,
  saveNode,
  savePatch,
  savePlan,
  saveSourceActivities,
  snapshotToGateProject,
  type ProjectSnapshot
} from "../store/projectStore.js";
import { RunTranscriptStore } from "../transcript/runTranscript.js";

export type FullAutoEventKind =
  | "protocol.locked"
  | "plan.created"
  | "lane.created"
  | "node.generated"
  | "node.executed"
  | "review.completed"
  | "selfCorrection.started"
  | "selfCorrection.completed"
  | "patch.staged"
  | "patch.applied"
  | "steering.consumed"
  | "intervention.required"
  | "run.completed";

export interface FullAutoEvent {
  seq: number;
  ts: string;
  kind: FullAutoEventKind;
  role: "planner" | "executor" | "reviewer" | "synthesizer" | "system";
  title: string;
  detail?: string;
}

export interface ExecutorDraft {
  title: string;
  code: string;
  claimText: string;
}

export interface SynthesisDraft {
  title: string;
  body: string;
}

export type AgentStreamDelta =
  | { type: "content" | "reasoning"; text: string }
  | { type: "usage"; usage: Usage }
  | { type: "done" };

export interface AgentCallOptions {
  onStream?: (delta: AgentStreamDelta) => void;
}

export interface ResearchAgents {
  createPlan(question: string, options?: AgentCallOptions): Promise<Plan>;
  createExecutorDraft(plan: Plan, options?: AgentCallOptions): Promise<ExecutorDraft>;
  reviseExecutorDraft?(context: { plan: Plan; draft: ExecutorDraft; review: NodeReview; execution: ExecutionResult }, options?: AgentCallOptions): Promise<ExecutorDraft>;
  reviewNode(context: { draft: ExecutorDraft; exitCode: number; stdout: string; stderr: string }, options?: AgentCallOptions): Promise<NodeReview>;
  synthesize(context: { plan: Plan; claim: Claim; evidence: EvidenceItem[] }, options?: AgentCallOptions): Promise<SynthesisDraft>;
}

export interface FullAutoStreamEvent {
  runId: string;
  role: FullAutoEvent["role"];
  purpose: string;
  kind: "content" | "reasoning" | "usage" | "done";
  text?: string;
  usage?: Usage;
}

export interface FullAutoResult {
  runId: string;
  ready: boolean;
  patch?: Patch;
  events: FullAutoEvent[];
}

type Emit = (event: Omit<FullAutoEvent, "seq" | "ts">) => Promise<void>;
type LoadedLane = Lane & { nodes: NodeRecord[] };

interface ProducedNode {
  agents: ResearchAgents;
  lane: LoadedLane;
  plan: Plan;
  node: NodeRecord;
  draft: ExecutorDraft;
  execution: ExecutionResult;
  review: NodeReview;
  sourceActivity: SourceActivity;
  agentRunResult: AgentRunResult;
}

export class FullAutoOrchestrator {
  private readonly backend: ExecutionBackend;
  private readonly transcriptStore: RunTranscriptStore;

  constructor(options: { backend?: ExecutionBackend; transcriptStore?: RunTranscriptStore } = {}) {
    this.backend = options.backend ?? defaultExecutionBackend();
    this.transcriptStore = options.transcriptStore ?? new RunTranscriptStore();
  }

  async runOnce(root: string, agents: ResearchAgents, onEvent?: (event: FullAutoEvent) => void, options: { signal?: AbortSignal; onStream?: (event: FullAutoStreamEvent) => void } = {}): Promise<FullAutoResult> {
    const releaseLock = await acquireProjectRunLock(root, randomUUID());
    try {
      return await this.runOnceUnlocked(root, agents, onEvent, options);
    } finally {
      await releaseLock();
    }
  }

  private async runOnceUnlocked(root: string, agents: ResearchAgents, onEvent?: (event: FullAutoEvent) => void, options: { signal?: AbortSignal; onStream?: (event: FullAutoStreamEvent) => void } = {}): Promise<FullAutoResult> {
    const runId = randomUUID();
    const events: FullAutoEvent[] = [];
    let seq = 0;
    const emit: Emit = async (event) => {
      const full: FullAutoEvent = { ...event, seq: ++seq, ts: new Date().toISOString() };
      events.push(full);
      onEvent?.(full);
      await this.transcriptStore.append(root, runId, { kind: "event", role: full.role, text: `${full.title}${full.detail ? `\n${full.detail}` : ""}` });
    };
    const streamOptions = (role: FullAutoEvent["role"], purpose: string): AgentCallOptions => ({
      onStream: (delta) => {
        const kind = delta.type;
        options.onStream?.({
          runId,
          role,
          purpose,
          kind,
          ...(delta.type === "content" || delta.type === "reasoning" ? { text: delta.text } : {}),
          ...(delta.type === "usage" ? { usage: delta.usage } : {})
        });
        void this.transcriptStore.append(root, runId, {
          kind: delta.type === "reasoning" ? "reasoning" : delta.type === "usage" ? "usage" : "delta",
          role,
          text: delta.type === "usage" ? JSON.stringify(delta.usage) : delta.type === "done" ? "[done]" : delta.text
        });
      }
    });

    let snapshot = await loadProject(root);
    const steering = await consumeSteering(root);
    if (steering) {
      await emit({ kind: "steering.consumed", role: "system", title: "Steering instruction consumed", detail: steering });
    }

    const approvedPlans = snapshot.plans.filter((plan) => plan.approved);
    if (approvedPlans.length === 0) {
      const candidate = { ...(await agents.createPlan(withSteering(snapshot.manifest.question, steering), streamOptions("planner", "planning"))), approved: false };
      await savePlan(root, candidate);
      await emit({ kind: "plan.created", role: "planner", title: "Plan candidate created", detail: `${candidate.title}\nAdopt a plan before Full Auto can execute it.` });
      await emit({ kind: "intervention.required", role: "system", title: "Plan adoption required", detail: "Nullius will not lock a protocol or execute research from an unapproved AI plan." });
      const current = await loadProject(root);
      return { runId, ready: readinessReport(snapshotToGateProject(current), current.manifest.settings.depth, projectGateIO(root)).ready, events };
    }

    let manifest = snapshot.manifest;
    if (!manifest.protocolLock) {
      manifest = ensureProtocolLockFromPlan(manifest, approvedPlans[0]!);
      await saveManifest(root, manifest);
      await emit({ kind: "protocol.locked", role: "planner", title: "Protocol locked", detail: approvedPlans[0]!.title });
    }

    await ensureLanesForApprovedPlans(root, snapshot, approvedPlans, emit);
    snapshot = await loadProject(root);

    const maxLanes = Math.max(1, manifest.settings.maxLanes ?? 1);
    const maxNodes = manifest.settings.maxNodes ?? maxLanes;
    const existingNodeCount = snapshot.lanes.reduce((count, lane) => count + lane.nodes.length, 0);
    const remainingNodeBudget = Math.max(0, maxNodes - existingNodeCount);
    if (remainingNodeBudget === 0) {
      await emit({ kind: "run.completed", role: "system", title: "Node budget reached", detail: `maxNodes=${maxNodes}` });
      return { runId, ready: readinessReport(snapshotToGateProject(snapshot), manifest.settings.depth, projectGateIO(root)).ready, events };
    }

    const eligible = selectEligibleLanes(snapshot, approvedPlans, Math.min(maxLanes, remainingNodeBudget));
    if (eligible.length === 0) {
      await emit({ kind: "intervention.required", role: "system", title: "No eligible lane", detail: "All lanes are blocked, running, or waiting for user action." });
      return { runId, ready: readinessReport(snapshotToGateProject(snapshot), manifest.settings.depth, projectGateIO(root)).ready, events };
    }

    const produced = await Promise.all(
      eligible.map(({ lane, plan }) => this.produceNode(root, runId, lane, withPlanSteering(plan, steering), agents, emit, streamOptions, manifest.settings.selfCorrectionRounds, options.signal))
    );

    let lastPatch: Patch | undefined;
    for (const item of produced) {
      const patch = await this.applyProducedNode(root, item, emit, streamOptions);
      if (patch) lastPatch = patch;
    }

    const finalSnapshot = await loadProject(root);
    const ready = readinessReport(snapshotToGateProject(finalSnapshot), manifest.settings.depth, projectGateIO(root)).ready;
    await emit({ kind: "run.completed", role: "system", title: "Run completed", detail: ready ? "ready" : "not ready" });
    return lastPatch ? { runId, ready, patch: lastPatch, events } : { runId, ready, events };
  }

  private async produceNode(root: string, runId: string, lane: LoadedLane, plan: Plan, agents: ResearchAgents, emit: Emit, streamOptions: (role: FullAutoEvent["role"], purpose: string) => AgentCallOptions, selfCorrectionRounds: number, signal?: AbortSignal): Promise<ProducedNode> {
    let draft = await agents.createExecutorDraft(plan, streamOptions("executor", "nodeExecution"));
    const node: NodeRecord = {
      id: randomUUID(),
      title: draft.title,
      status: "running",
      prerequisiteNodeIds: lane.nodes.at(-1)?.id ? [lane.nodes.at(-1)!.id] : [],
      generatedCode: draft.code,
      reproducibility: "notChecked"
    };
    const laneRecord: Lane = { id: lane.id, name: lane.name, planId: lane.planId, nodeOrder: [...lane.nodeOrder, node.id] };
    await saveLane(root, laneRecord);
    await saveNode(root, lane.id, node, nodeNarrative(node, "Generated; execution pending."));
    await emit({ kind: "node.generated", role: "executor", title: "Node generated", detail: `${lane.name}: ${draft.title}` });

    const nodeDir = join(root, "lanes", lane.id, "nodes", node.id);
    const executionOptions = signal
      ? { allowNetwork: false, timeoutSec: 30, signal }
      : { allowNetwork: false, timeoutSec: 30 };
    let execution: ExecutionResult | undefined;
    let review: NodeReview | undefined;
    let started = Date.now();
    const maxCorrectionRounds = Math.max(0, selfCorrectionRounds);

    for (let attempt = 0; attempt <= maxCorrectionRounds; attempt += 1) {
      started = Date.now();
      node.generatedCode = draft.code;
      node.status = "running";
      await saveNode(root, lane.id, node, nodeNarrative(node, attempt === 0 ? "Executing." : `Executing corrected draft round ${attempt}.`));
      execution = await this.backend.run(draft.code, nodeDir, executionOptions);
      node.status = execution.status === "succeeded" ? "completed" : "error";
      node.executionRecord = {
        exitCode: execution.exitCode,
        startedAt: new Date(started).toISOString(),
        durationMs: Date.now() - started,
        backend: execution.backend
      };
      await saveNode(root, lane.id, node, nodeNarrative(node, execution.stdout || execution.stderr));
      await emit({ kind: "node.executed", role: "executor", title: execution.status === "succeeded" ? "Node executed" : "Execution failed", detail: execution.stderr || execution.stdout });

      review = await agents.reviewNode({ draft, exitCode: execution.exitCode, stdout: execution.stdout, stderr: execution.stderr }, streamOptions("reviewer", "review"));
      node.review = review;
      await saveNode(root, lane.id, node, nodeNarrative(node, review.summary));
      await emit({ kind: "review.completed", role: "reviewer", title: "Review completed", detail: review.summary });

      if (execution.status === "succeeded" && (review.severity === "clear" || review.severity === "info")) break;
      if (attempt >= maxCorrectionRounds || !agents.reviseExecutorDraft) break;

      await emit({
        kind: "selfCorrection.started",
        role: "executor",
        title: `Self-correction round ${attempt + 1}`,
        detail: [...review.concerns, execution.stderr].filter(Boolean).join("\n") || review.summary
      });
      draft = await agents.reviseExecutorDraft({ plan, draft, review, execution }, streamOptions("executor", "selfCorrection"));
      node.title = draft.title;
      node.generatedCode = draft.code;
      await saveNode(root, lane.id, node, nodeNarrative(node, "Corrected draft generated; execution pending."));
      await emit({ kind: "selfCorrection.completed", role: "executor", title: "Corrected draft generated", detail: draft.title });
    }

    if (!execution || !review) throw new Error("Full Auto failed before node execution completed.");

    const nodeRelativeDir = join("lanes", lane.id, "nodes", node.id);
    const gitDiffPath = join(nodeRelativeDir, "logs", "git.diff");
    await atomicWriteText(join(root, gitDiffPath), "");
    const finishedAt = new Date().toISOString();
    const agentRunResult: AgentRunResult = {
      id: `agent-run-${runId}-${node.id}`,
      runStatus: execution.status === "succeeded" ? "succeeded" : execution.status === "timedOut" ? "cancelled" : "failed",
      exitCode: execution.exitCode,
      schemaValidationStatus: "notApplicable",
      stdoutPath: join(nodeRelativeDir, "logs", "stdout.log"),
      stderrPath: join(nodeRelativeDir, "logs", "stderr.log"),
      createdFiles: execution.generatedFiles.map((file) => join(nodeRelativeDir, file.path)),
      modifiedFiles: [],
      deletedFiles: [],
      sha256ByPath: Object.fromEntries(execution.generatedFiles.map((file) => [join(nodeRelativeDir, file.path), file.sha256])),
      gitDiffPath,
      artifactManifestStatus: execution.generatedFiles.length > 0 ? "valid" : "missing",
      startedAt: new Date(started).toISOString(),
      finishedAt,
      ...(execution.generatedFiles.length > 0
        ? { artifactManifest: { files: execution.generatedFiles.map((file) => ({ path: file.path, sha256: file.sha256, bytes: file.bytes })) } }
        : {})
    };
    const sourceActivity: SourceActivity = {
      id: `activity-${runId}-${node.id}`,
      type: "execution",
      title: draft.title,
      startedAt: new Date(started).toISOString(),
      finishedAt,
      actorType: "agent",
      actorId: "executor",
      relatedTaskId: node.id,
      agentRunResultId: agentRunResult.id
    };

    return { agents, lane, plan, node, draft, execution, review, sourceActivity, agentRunResult };
  }

  private async applyProducedNode(root: string, item: ProducedNode, emit: Emit, streamOptions: (role: FullAutoEvent["role"], purpose: string) => AgentCallOptions): Promise<Patch | undefined> {
    const beforeAppend = await loadProject(root);
    await saveAgentRunResults(root, [...beforeAppend.agentRunResults, item.agentRunResult]);
    await saveSourceActivities(root, [...beforeAppend.sourceActivities, item.sourceActivity]);

    if (item.execution.status !== "succeeded" || item.review.severity === "critical") {
      await emit({ kind: "intervention.required", role: "system", title: "Execution needs attention", detail: item.execution.stderr || item.review.summary || "Execution or review did not clear." });
      return undefined;
    }

    const reviewStatus = item.review.severity === "clear" || item.review.severity === "info" ? "approved" : "needsRevision";
    const validation = reviewStatus === "approved" ? "valid" : "stale";
    const evidenceItems = item.execution.generatedFiles.map((file): EvidenceItem => ({
      id: randomUUID(),
      type: "execution",
      laneId: item.lane.id,
      nodeId: item.node.id,
      title: file.path,
      summary: file.text ?? "",
      path: file.path,
      sha256: file.sha256,
      createdAt: new Date().toISOString(),
      sourceActivityId: item.sourceActivity.id,
      sourceActivityType: "execution",
      validation,
      review: reviewStatus,
      execution: {
        producingCommand: "pyodide python",
        exitCode: item.execution.exitCode,
        stdoutPath: join("lanes", item.lane.id, "nodes", item.node.id, "logs", "stdout.log"),
        stderrPath: join("lanes", item.lane.id, "nodes", item.node.id, "logs", "stderr.log"),
        artifactPaths: item.execution.generatedFiles.map((generated) => generated.path),
        sha256ByPath: Object.fromEntries(item.execution.generatedFiles.map((generated) => [generated.path, generated.sha256])),
        environmentSummary: `${item.execution.backend} sandbox`
      }
    }));

    const evidenceSnapshot = await loadProject(root);
    const evidence = [...evidenceSnapshot.evidence, ...evidenceItems];
    await saveEvidence(root, evidence);

    const primaryEvidence = evidenceItems.find((entry) => entry.review === "approved" && entry.execution?.exitCode === 0);
    const claim: Claim = {
      id: randomUUID(),
      text: item.draft.claimText,
      type: "result",
      supportRefs: primaryEvidence
        ? [{ targetType: "evidence", targetId: primaryEvidence.id, role: "primary", validation: "valid" }]
        : [],
      validation: primaryEvidence ? "valid" : "stale",
      review: primaryEvidence ? "approved" : "needsRevision",
      qmdPatchIds: []
    };
    const claimSnapshot = await loadProject(root);
    const claims = [...claimSnapshot.claims, claim];
    await saveClaims(root, claims);

    if (!primaryEvidence) {
      await emit({ kind: "intervention.required", role: "system", title: "Review did not approve evidence", detail: item.review.summary });
      return undefined;
    }

    const synthesis = await item.agents.synthesize({ plan: item.plan, claim, evidence }, streamOptions("synthesizer", "synthesis"));
    const patchSnapshot = await loadProject(root);
    const projectForPatch = {
      ...snapshotToGateProject(patchSnapshot),
      evidence,
      claims
    };
    const patch = stageManuscriptPatch(projectForPatch, synthesis.body, {
      autoApprove: true,
      artifactTexts: evidence.map((entry) => entry.summary).filter(Boolean)
    });
    await savePatch(root, patch);
    await emit({ kind: "patch.staged", role: "synthesizer", title: "Patch staged", detail: patch.status });

    const current = await loadProject(root);
    const applied = applyPatchIfValid(current.manuscriptBody, patch);
    if (applied.applied) {
      await saveManuscript(root, applied.body);
      await savePatch(root, { ...patch, appliedAt: new Date().toISOString() });
      await emit({ kind: "patch.applied", role: "synthesizer", title: "Patch applied", detail: synthesis.title });
    } else {
      await emit({ kind: "intervention.required", role: "system", title: "Patch blocked", detail: applied.reason ?? "Gate rejected patch." });
    }
    return patch;
  }
}

async function acquireProjectRunLock(root: string, id: string): Promise<() => Promise<void>> {
  const runtimeDir = join(root, "runtime");
  const lockPath = join(runtimeDir, "run.lock");
  await mkdir(runtimeDir, { recursive: true });
  const writeLock = async () => {
    await writeFile(lockPath, JSON.stringify({ id, pid: process.pid, startedAt: new Date().toISOString() }, null, 2), { encoding: "utf8", flag: "wx" });
  };

  try {
    await writeLock();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    const existing = await inspectProjectRunLock(lockPath);
    if (existing === "active") {
      throw new Error(`Another Nullius run is already active for this project: ${lockPath}`);
    }
    await rm(lockPath, { force: true });
    try {
      await writeLock();
    } catch (retryError) {
      if ((retryError as NodeJS.ErrnoException).code === "EEXIST") {
        throw new Error(`Another Nullius run is already active for this project: ${lockPath}`);
      }
      throw retryError;
    }
  }

  return async () => {
    try {
      const current = JSON.parse(await readFile(lockPath, "utf8")) as { id?: unknown };
      if (current.id !== id) return;
    } catch {
      return;
    }
    await rm(lockPath, { force: true });
  };
}

async function inspectProjectRunLock(lockPath: string): Promise<"active" | "stale"> {
  try {
    const lock = JSON.parse(await readFile(lockPath, "utf8")) as { pid?: unknown };
    return isLiveProcessId(lock.pid) ? "active" : "stale";
  } catch {
    return "stale";
  }
}

function isLiveProcessId(pid: unknown): boolean {
  if (typeof pid !== "number" || !Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    return code === "EPERM";
  }
}

async function ensureLanesForApprovedPlans(root: string, snapshot: ProjectSnapshot, approvedPlans: Plan[], emit: Emit): Promise<void> {
  for (const plan of approvedPlans) {
    if (snapshot.lanes.some((lane) => lane.planId === plan.id)) continue;
    const lane: Lane = { id: randomUUID(), name: plan.title, planId: plan.id, nodeOrder: [] };
    await saveLane(root, lane);
    await emit({ kind: "lane.created", role: "system", title: "Lane created", detail: lane.name });
  }
}

export interface LaneScheduleConformanceInput {
  approvedPlanIds: string[];
  limit: number;
  lanes: Array<{
    id: string;
    planId: string;
    nodes: Array<{ status: NodeRecord["status"]; reviewSeverity?: NodeReview["severity"] }>;
  }>;
}

export function scheduledLaneIds(input: LaneScheduleConformanceInput): string[] {
  const approved = new Set(input.approvedPlanIds);
  return input.lanes
    .filter((lane) => approved.has(lane.planId) && laneLikeCanRun(lane.nodes))
    .slice(0, Math.max(0, input.limit))
    .map((lane) => lane.id);
}

function laneLikeCanRun(nodes: Array<{ status: NodeRecord["status"]; reviewSeverity?: NodeReview["severity"] }>): boolean {
  const last = nodes.at(-1);
  if (!last) return true;
  if (last.status === "running" || last.status === "waitingForUser" || last.status === "error") return false;
  if (last.reviewSeverity === "critical") return false;
  return last.status === "completed" || last.status === "settled";
}

function selectEligibleLanes(snapshot: ProjectSnapshot, approvedPlans: Plan[], limit: number): Array<{ lane: LoadedLane; plan: Plan }> {
  const plansById = new Map(approvedPlans.map((plan) => [plan.id, plan]));
  return snapshot.lanes
    .flatMap((lane) => {
      const plan = plansById.get(lane.planId);
      if (!plan || !laneCanRun(lane)) return [];
      return [{ lane, plan }];
    })
    .slice(0, limit);
}

function laneCanRun(lane: LoadedLane): boolean {
  const last = lane.nodes.at(-1);
  if (!last) return true;
  if (last.status === "running" || last.status === "waitingForUser" || last.status === "error") return false;
  if (last.review?.severity === "critical") return false;
  return last.status === "completed" || last.status === "settled";
}

function ensureProtocolLockFromPlan(manifest: ProjectManifest, plan: Plan): ProjectManifest {
  if (manifest.protocolLock) return manifest;
  return {
    ...manifest,
    protocolLock: {
      researchQuestion: manifest.question,
      scope: plan.purpose,
      plannedObservables: plan.observables,
      successCriteria: plan.successCriteria,
      falsificationCriteria: plan.falsificationCriteria,
      requiredEvidence: ["approved evidence for every result claim"],
      exclusions: ["unsupported claims", "unapproved AI plans"],
      lockedAt: new Date().toISOString()
    }
  };
}

async function consumeSteering(root: string): Promise<string> {
  const path = join(root, "runtime", "steering.txt");
  try {
    const text = (await readFile(path, "utf8")).trim();
    await rm(path, { force: true });
    return text;
  } catch {
    return "";
  }
}

function withSteering(text: string, steering: string): string {
  return steering ? `${text}\n\nUser steering instruction for this run:\n${steering}` : text;
}

function withPlanSteering(plan: Plan, steering: string): Plan {
  if (!steering) return plan;
  return { ...plan, method: `${plan.method}\n\nUser steering instruction for this run:\n${steering}` };
}

function nodeNarrative(node: NodeRecord, detail: string): string {
  return [`# ${node.title}`, "", `Status: ${node.status}`, "", "```python", node.generatedCode, "```", "", detail].join("\n");
}

export class MockResearchAgents implements ResearchAgents {
  readonly fabricated: boolean;

  constructor(options: { fabricated?: boolean } = {}) {
    this.fabricated = options.fabricated ?? false;
  }

  async createPlan(question: string, options?: AgentCallOptions): Promise<Plan> {
    options?.onStream?.({ type: "content", text: "Planning synthetic slope check." });
    return {
      id: randomUUID(),
      title: "Synthetic slope check",
      purpose: question,
      method: "Generate a small CSV artifact with a known slope.",
      observables: ["slope"],
      successCriteria: ["slope equals 2.0"],
      falsificationCriteria: ["slope differs from 2.0"],
      approved: false
    };
  }

  async createExecutorDraft(_plan?: Plan, options?: AgentCallOptions): Promise<ExecutorDraft> {
    options?.onStream?.({ type: "content", text: "Generating executor code." });
    return {
      title: "Fit slope",
      code: [
        "import os",
        "os.makedirs('artifacts', exist_ok=True)",
        "with open('artifacts/fit.csv', 'w') as f:",
        "    f.write('metric,value\\nslope,2.0\\n')",
        "print('slope 2.0')"
      ].join("\n"),
      claimText: "The fit slope is 2.0."
    };
  }

  async reviewNode(context: { exitCode: number; stderr: string }, options?: AgentCallOptions): Promise<NodeReview> {
    options?.onStream?.({ type: "reasoning", text: context.exitCode === 0 ? "Artifact is present." : "Execution failed." });
    return {
      severity: context.exitCode === 0 ? "clear" : "critical",
      findings: context.exitCode === 0 ? ["Execution completed."] : [],
      concerns: context.exitCode === 0 ? [] : [context.stderr],
      summary: context.exitCode === 0 ? "Execution and artifact are consistent." : "Execution failed."
    };
  }

  async synthesize(_context?: { plan: Plan; claim: Claim; evidence: EvidenceItem[] }, options?: AgentCallOptions): Promise<SynthesisDraft> {
    options?.onStream?.({ type: "content", text: "Writing evidence-backed manuscript." });
    options?.onStream?.({ type: "usage", usage: { promptTokens: 10, completionTokens: 20, reasoningTokens: 3 } });
    const result = this.fabricated ? "9.4142" : "2.0";
    return {
      title: "Synthetic slope study",
      body: [
        "# Abstract",
        "We test a linear relation on synthetic data.",
        "# Introduction",
        "A deterministic synthetic fixture is used.",
        "# Methods",
        "Python code writes a CSV artifact and the manuscript only reports values grounded in that artifact.",
        "# Results",
        `The fit slope is ${result}.`,
        "# Discussion",
        "The output is accepted only when it is grounded in the generated artifact.",
        "# Limitations",
        "Synthetic data only.",
        "# References",
        "None."
      ].join("\n")
    };
  }
}
