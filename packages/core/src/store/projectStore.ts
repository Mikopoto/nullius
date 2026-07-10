import { mkdir, readFile, rename, writeFile, readdir } from "node:fs/promises";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { z } from "zod";
import {
  ClaimSchema,
  EvidenceItemSchema,
  AgentRunResultSchema,
  LaneSchema,
  LiteratureItemSchema,
  MethodItemSchema,
  NodeRecordSchema,
  PatchSchema,
  PlanSchema,
  ProjectManifestSchema,
  SourceActivitySchema,
  type AgentRunResult,
  type Claim,
  type EvidenceItem,
  type Lane,
  type LiteratureItem,
  type MethodItem,
  type NodeRecord,
  type Patch,
  type Plan,
  type ProjectManifest,
  type SourceActivity
} from "../model/schemas.js";
import type { GateProject } from "../gates/evidence.js";
import type { GateIO } from "../gates/evidence.js";

export interface ProjectSnapshot {
  root: string;
  manifest: ProjectManifest;
  plans: Plan[];
  lanes: Array<Lane & { nodes: NodeRecord[] }>;
  manuscriptBody: string;
  evidence: EvidenceItem[];
  claims: Claim[];
  literature: LiteratureItem[];
  methods: MethodItem[];
  patches: Patch[];
  sourceActivities: SourceActivity[];
  agentRunResults: AgentRunResult[];
}

export async function createProject(root: string, manifest: ProjectManifest): Promise<void> {
  await mkdir(join(root, "plans"), { recursive: true });
  await mkdir(join(root, "lanes"), { recursive: true });
  await mkdir(join(root, "manuscript", "patches"), { recursive: true });
  await mkdir(join(root, "runtime", "transcripts"), { recursive: true });
  await atomicWriteJSON(join(root, "nullius.json"), ProjectManifestSchema.parse(manifest));
  await atomicWriteJSON(join(root, "evidence.json"), []);
  await atomicWriteJSON(join(root, "claims.json"), []);
  await atomicWriteJSON(join(root, "literature.json"), []);
  await atomicWriteJSON(join(root, "methods.json"), []);
  await atomicWriteJSON(join(root, "source-activities.json"), []);
  await atomicWriteJSON(join(root, "runtime", "agent-runs.json"), []);
  await atomicWriteText(join(root, "manuscript", "report.md"), "");
}

export async function loadProject(root: string): Promise<ProjectSnapshot> {
  const manifest = ProjectManifestSchema.parse(await readJSON(join(root, "nullius.json")));
  const plans = await loadPlans(join(root, "plans"));
  const lanes = await loadLanes(join(root, "lanes"));
  const evidence = z.array(EvidenceItemSchema).parse(await readJSONIfExists(join(root, "evidence.json"), []));
  const claims = z.array(ClaimSchema).parse(await readJSONIfExists(join(root, "claims.json"), []));
  const literature = z.array(LiteratureItemSchema).parse(await readJSONIfExists(join(root, "literature.json"), []));
  const methods = z.array(MethodItemSchema).parse(await readJSONIfExists(join(root, "methods.json"), []));
  const sourceActivities = z.array(SourceActivitySchema).parse(await readJSONIfExists(join(root, "source-activities.json"), []));
  const agentRunResults = z.array(AgentRunResultSchema).parse(await readJSONIfExists(join(root, "runtime", "agent-runs.json"), []));
  const manuscriptBody = await readTextIfExists(join(root, "manuscript", "report.md"), "");
  const patches = await loadPatches(join(root, "manuscript", "patches"));
  return { root, manifest, plans, lanes, manuscriptBody, evidence, claims, literature, methods, patches, sourceActivities, agentRunResults };
}

export function snapshotToGateProject(snapshot: ProjectSnapshot): GateProject {
  return {
    manuscriptBody: snapshot.manuscriptBody,
    evidence: snapshot.evidence,
    claims: snapshot.claims,
    literature: snapshot.literature,
    methods: snapshot.methods,
    patches: snapshot.patches,
    protocolLock: snapshot.manifest.protocolLock,
    amendments: snapshot.manifest.amendments,
    nodes: snapshot.lanes.flatMap((lane) =>
      lane.nodes.map((node) => ({
        id: node.id,
        status: node.status,
        reviewSeverity: node.review?.severity,
        reproducibilityStatus: node.reproducibility
      }))
    )
  };
}

export function evidenceArtifactPath(root: string, evidence: EvidenceItem): string | undefined {
  if (!evidence.path) return undefined;
  if (isAbsolute(evidence.path)) return evidence.path;
  if (evidence.laneId && evidence.nodeId) return join(root, "lanes", evidence.laneId, "nodes", evidence.nodeId, evidence.path);
  return join(root, evidence.path);
}


const maxGroundingArtifactBytes = 2 * 1024 * 1024;

/** Real artifact bytes for numeric grounding; falls back to the recorded summary
    when a file is missing, binary, or oversized. */
export function loadArtifactTexts(root: string, evidence: Array<{ laneId?: string | undefined; nodeId?: string | undefined; path?: string | undefined; summary?: string | undefined }>): string[] {
  const texts: string[] = [];
  for (const item of evidence) {
    let loaded: string | undefined;
    if (item.path && item.laneId && item.nodeId) {
      const absolute = join(root, "lanes", item.laneId, "nodes", item.nodeId, item.path);
      try {
        const stats = statSync(absolute);
        if (stats.isFile() && stats.size <= maxGroundingArtifactBytes) {
          loaded = readFileSync(absolute, "utf8");
        }
      } catch {
        loaded = undefined;
      }
    }
    const text = loaded ?? item.summary;
    if (text) texts.push(text);
  }
  return texts;
}

export function projectGateIO(root: string): GateIO {
  return {
    artifactExists: (evidence) => {
      const path = evidenceArtifactPath(root, evidence);
      return path ? existsSync(path) : true;
    },
    artifactText: (evidence) => {
      const path = evidenceArtifactPath(root, evidence);
      if (!path || !existsSync(path)) return evidence.summary;
      try {
        return readFileSync(path, "utf8");
      } catch {
        return evidence.summary;
      }
    }
  };
}

export async function saveManifest(root: string, manifest: ProjectManifest): Promise<void> {
  await atomicWriteJSON(join(root, "nullius.json"), ProjectManifestSchema.parse(manifest));
}

export async function savePlan(root: string, plan: Plan): Promise<void> {
  await atomicWriteJSON(join(root, "plans", `${plan.id}.json`), PlanSchema.parse(plan));
}

export async function saveLane(root: string, lane: Lane): Promise<void> {
  await atomicWriteJSON(join(root, "lanes", lane.id, "lane.json"), LaneSchema.parse(lane));
}

export async function saveNode(root: string, laneId: string, node: NodeRecord, narrative: string): Promise<void> {
  const nodeDir = join(root, "lanes", laneId, "nodes", node.id);
  await atomicWriteJSON(join(nodeDir, "node.json"), NodeRecordSchema.parse(node));
  await atomicWriteText(join(nodeDir, "node.md"), narrative);
}

export async function saveEvidence(root: string, evidence: EvidenceItem[]): Promise<void> {
  await atomicWriteJSON(join(root, "evidence.json"), z.array(EvidenceItemSchema).parse(evidence));
}

export async function saveClaims(root: string, claims: Claim[]): Promise<void> {
  await atomicWriteJSON(join(root, "claims.json"), z.array(ClaimSchema).parse(claims));
}

export async function saveLiterature(root: string, literature: LiteratureItem[]): Promise<void> {
  await atomicWriteJSON(join(root, "literature.json"), z.array(LiteratureItemSchema).parse(literature));
}

export async function saveSourceActivities(root: string, activities: SourceActivity[]): Promise<void> {
  await atomicWriteJSON(join(root, "source-activities.json"), z.array(SourceActivitySchema).parse(activities));
}

export async function saveAgentRunResults(root: string, results: AgentRunResult[]): Promise<void> {
  await atomicWriteJSON(join(root, "runtime", "agent-runs.json"), z.array(AgentRunResultSchema).parse(results));
}

export async function saveManuscript(root: string, body: string): Promise<void> {
  await atomicWriteText(join(root, "manuscript", "report.md"), body);
}

export async function savePatch(root: string, patch: Patch): Promise<void> {
  await atomicWriteJSON(join(root, "manuscript", "patches", `${patch.id}.json`), PatchSchema.parse(patch));
}

export async function atomicWriteJSON(path: string, value: unknown): Promise<void> {
  await atomicWriteText(path, `${JSON.stringify(value, null, 2)}\n`);
}

export async function atomicWriteText(path: string, value: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const tempPath = `${path}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(tempPath, value, "utf8");
  await rename(tempPath, path);
}

async function readJSON(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, "utf8"));
}

async function readJSONIfExists(path: string, fallback: unknown): Promise<unknown> {
  if (!existsSync(path)) return fallback;
  return readJSON(path);
}

async function readTextIfExists(path: string, fallback: string): Promise<string> {
  if (!existsSync(path)) return fallback;
  return readFile(path, "utf8");
}

async function loadPatches(directory: string): Promise<Patch[]> {
  if (!existsSync(directory)) return [];
  const entries = await readdir(directory);
  const patches: Patch[] = [];
  for (const entry of entries.filter((item) => item.endsWith(".json")).sort()) {
    patches.push(PatchSchema.parse(await readJSON(join(directory, entry))));
  }
  return patches;
}

async function loadPlans(directory: string): Promise<Plan[]> {
  if (!existsSync(directory)) return [];
  const entries = await readdir(directory);
  const plans: Plan[] = [];
  for (const entry of entries.filter((item) => item.endsWith(".json")).sort()) {
    plans.push(PlanSchema.parse(await readJSON(join(directory, entry))));
  }
  return plans;
}

async function loadLanes(directory: string): Promise<Array<Lane & { nodes: NodeRecord[] }>> {
  if (!existsSync(directory)) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  const lanes: Array<Lane & { nodes: NodeRecord[] }> = [];
  for (const entry of entries.filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const laneDir = join(directory, entry.name);
    const lane = LaneSchema.parse(await readJSON(join(laneDir, "lane.json")));
    const nodes = await loadNodes(join(laneDir, "nodes"));
    lanes.push({ ...lane, nodes });
  }
  return lanes;
}

async function loadNodes(directory: string): Promise<NodeRecord[]> {
  if (!existsSync(directory)) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  const nodes: NodeRecord[] = [];
  for (const entry of entries.filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    nodes.push(NodeRecordSchema.parse(await readJSON(join(directory, entry.name, "node.json"))));
  }
  return nodes;
}
