import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { createProject, loadProject, savePlan, snapshotToGateProject } from "../store/projectStore.js";
import { readinessReport } from "../gates/evidence.js";
import { checkProjectReproducibility } from "../exec/reproCheck.js";
import { FullAutoOrchestrator, MockResearchAgents } from "./fullAuto.js";

async function makeProject(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "nullius-full-auto-"));
  await createProject(root, {
    schemaVersion: 1,
    name: "Full Auto Test",
    question: "Does the synthetic slope equal 2.0?",
    roles: {
      planner: { provider: "openrouter", model: "mock", reasoningEffort: "none" },
      executor: { provider: "openrouter", model: "mock", reasoningEffort: "none" },
      reviewer: { provider: "openrouter", model: "mock", reasoningEffort: "none" }
    },
    settings: {
      maxLanes: 1,
      depth: "quick",
      sandboxPolicy: "required",
      selfCorrectionRounds: 1
    },
    amendments: []
  });
  return root;
}

async function adoptMockPlan(root: string): Promise<void> {
  const plan = await new MockResearchAgents().createPlan("Does the synthetic slope equal 2.0?");
  await savePlan(root, { ...plan, approved: true });
}

describe("FullAutoOrchestrator", () => {
  it("creates a plan candidate and stops when no plan has been adopted", async () => {
    const root = await makeProject();
    try {
      const result = await new FullAutoOrchestrator().runOnce(root, new MockResearchAgents());
      expect(result.events.map((event) => event.kind)).toContain("plan.created");
      expect(result.events.map((event) => event.kind)).toContain("intervention.required");
      const snapshot = await loadProject(root);
      expect(snapshot.plans[0]?.approved).toBe(false);
      expect(snapshot.manifest.protocolLock).toBeUndefined();
      expect(snapshot.lanes.length).toBe(0);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("runs one adopted lane and applies an evidence-backed manuscript patch", async () => {
    const root = await makeProject();
    try {
      await adoptMockPlan(root);
      const result = await new FullAutoOrchestrator().runOnce(root, new MockResearchAgents());
      expect(result.events.map((event) => event.kind)).toContain("patch.applied");
      const snapshot = await loadProject(root);
      expect(snapshot.manuscriptBody).toContain("The fit slope is 2.0.");
      expect(snapshot.evidence.length).toBeGreaterThan(0);
      expect(snapshot.claims.length).toBe(1);
      expect(readinessReport(snapshotToGateProject(snapshot), "quick", { artifactText: (e) => e.summary }).ready).toBe(true);
      const repro = await checkProjectReproducibility(root);
      expect(repro.reproduced).toBe(1);
      expect(repro.divergent + repro.failed).toBe(0);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }, 30_000);

  it("stops fabricated manuscript values at the patch gate", async () => {
    const root = await makeProject();
    try {
      await adoptMockPlan(root);
      const result = await new FullAutoOrchestrator().runOnce(root, new MockResearchAgents({ fabricated: true }));
      expect(result.patch?.status).toBe("needsRevision");
      expect(result.events.map((event) => event.kind)).toContain("intervention.required");
      const snapshot = await loadProject(root);
      expect(snapshot.manuscriptBody).not.toContain("9.4142");
      expect(snapshot.patches[0]?.warnings.some((warning) => warning.blocking && warning.message.includes("9.4142"))).toBe(true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }, 30_000);
});
