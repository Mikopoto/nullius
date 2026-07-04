import { existsSync } from "node:fs";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { ExecutionBackend } from "./executionBackend.js";
import { defaultExecutionBackend } from "./executionBackend.js";
import { loadProject, saveNode } from "../store/projectStore.js";
import { canonicallyEqualText } from "./reproducibility.js";

export interface ProjectReproCheckResult {
  total: number;
  reproduced: number;
  divergent: number;
  failed: number;
  notChecked: number;
  nodes: Array<{ nodeId: string; status: "reproduced" | "divergent" | "failed" | "notChecked"; reason: string }>;
}

export async function checkProjectReproducibility(root: string, backend: ExecutionBackend = defaultExecutionBackend()): Promise<ProjectReproCheckResult> {
  const snapshot = await loadProject(root);
  const nodes: ProjectReproCheckResult["nodes"] = [];

  for (const lane of snapshot.lanes) {
    for (const node of lane.nodes) {
      if (!node.generatedCode.trim()) {
        nodes.push({ nodeId: node.id, status: "notChecked", reason: "node has no generated code" });
        continue;
      }
      const evidence = snapshot.evidence.filter((item) => item.nodeId === node.id && item.type === "execution" && item.path);
      if (evidence.length === 0) {
        nodes.push({ nodeId: node.id, status: "notChecked", reason: "node has no execution evidence" });
        continue;
      }
      const stage = await mkdtemp(join(tmpdir(), "nullius-repro-"));
      try {
        const originalNodeDir = join(root, "lanes", lane.id, "nodes", node.id);
        await cp(originalNodeDir, stage, { recursive: true, force: true });
        const remainingRecordedArtifacts = await removeRecordedArtifacts(stage, evidence.map((item) => item.path).filter((path): path is string => Boolean(path)));
        if (remainingRecordedArtifacts.length > 0) {
          await saveNode(root, lane.id, { ...node, reproducibility: "failed" }, nodeNarrative(node.title, node.generatedCode, "Reproducibility staging failed."));
          nodes.push({ nodeId: node.id, status: "failed", reason: `recorded artifacts could not be removed from staging: ${remainingRecordedArtifacts.join(", ")}` });
          continue;
        }
        const result = await backend.run(node.generatedCode, stage, { allowNetwork: false, timeoutSec: 30 });
        if (result.status !== "succeeded") {
          await saveNode(root, lane.id, { ...node, reproducibility: "failed" }, nodeNarrative(node.title, node.generatedCode, "Reproducibility run failed."));
          nodes.push({ nodeId: node.id, status: "failed", reason: result.stderr || result.error || "execution failed" });
          continue;
        }
        const generatedByPath = new Map(result.generatedFiles.map((file) => [file.path, file]));
        const mismatches = evidence.filter((item) => {
          const generated = generatedByPath.get(item.path ?? "");
          if (!generated) return true;
          if (item.sha256 && item.sha256 === generated.sha256) return false;
          return !(item.summary && generated.text && canonicallyEqualText(item.summary, generated.text));
        });
        const status = mismatches.length === 0 ? "reproduced" : "divergent";
        await saveNode(root, lane.id, { ...node, reproducibility: status }, nodeNarrative(node.title, node.generatedCode, `Reproducibility: ${status}`));
        nodes.push({ nodeId: node.id, status, reason: mismatches.length === 0 ? "all artifacts matched" : `${mismatches.length} artifact(s) diverged or were not regenerated` });
      } finally {
        await rm(stage, { recursive: true, force: true });
      }
    }
  }

  return {
    total: nodes.length,
    reproduced: nodes.filter((node) => node.status === "reproduced").length,
    divergent: nodes.filter((node) => node.status === "divergent").length,
    failed: nodes.filter((node) => node.status === "failed").length,
    notChecked: nodes.filter((node) => node.status === "notChecked").length,
    nodes
  };
}

async function removeRecordedArtifacts(stage: string, paths: string[]): Promise<string[]> {
  const uniquePaths = new Set([
    ...paths,
    "logs/stdout.log",
    "logs/stderr.log",
    "logs/git.diff"
  ]);
  const remaining: string[] = [];
  for (const relative of uniquePaths) {
    if (relative.split("/").some((part) => part === ".." || part.length === 0)) continue;
    const target = join(stage, relative);
    await rm(target, { recursive: true, force: true }).catch(() => undefined);
    if (existsSync(target)) remaining.push(relative);
    await rm(dirname(target), { recursive: false, force: true }).catch(() => undefined);
  }
  return remaining;
}

function nodeNarrative(title: string, code: string, detail: string): string {
  return [`# ${title}`, "", "```python", code, "```", "", detail].join("\n");
}
