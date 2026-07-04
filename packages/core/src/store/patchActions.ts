import { join } from "node:path";
import { PatchSchema, type Patch } from "../model/schemas.js";
import { applyPatchIfValid } from "../gates/evidence.js";
import { loadProject, saveManuscript, savePatch } from "./projectStore.js";

export async function approvePatch(root: string, patchId: string): Promise<{ applied: boolean; patch: Patch; reason?: string }> {
  const snapshot = await loadProject(root);
  const patch = snapshot.patches.find((item) => item.id === patchId);
  if (!patch) throw new Error(`Patch not found: ${patchId}`);
  const approved = PatchSchema.parse({ ...patch, status: "approved" });
  const result = applyPatchIfValid(snapshot.manuscriptBody, approved);
  if (!result.applied) {
    await savePatch(root, { ...approved, status: "needsRevision" });
    return {
      applied: false,
      patch: { ...approved, status: "needsRevision" },
      ...(result.reason === undefined ? {} : { reason: result.reason })
    };
  }
  const appliedPatch = PatchSchema.parse({ ...approved, appliedAt: new Date().toISOString() });
  await saveManuscript(root, result.body);
  await savePatch(root, appliedPatch);
  return { applied: true, patch: appliedPatch };
}

export async function rejectPatch(root: string, patchId: string): Promise<Patch> {
  const snapshot = await loadProject(root);
  const patch = snapshot.patches.find((item) => item.id === patchId);
  if (!patch) throw new Error(`Patch not found: ${patchId}`);
  const rejected = PatchSchema.parse({ ...patch, status: "rejected" });
  await savePatch(root, rejected);
  return rejected;
}

export async function exportMarkdown(root: string): Promise<string> {
  return (await loadProject(root)).manuscriptBody;
}

export function patchPath(root: string, patchId: string): string {
  return join(root, "manuscript", "patches", `${patchId}.json`);
}
