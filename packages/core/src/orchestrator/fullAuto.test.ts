import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
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

  it("rejects a second run when a live project run lock exists", async () => {
    const root = await makeProject();
    try {
      await mkdir(join(root, "runtime"), { recursive: true });
      await writeFile(join(root, "runtime", "run.lock"), JSON.stringify({ id: "other", pid: process.pid, startedAt: new Date().toISOString() }), "utf8");
      await expect(new FullAutoOrchestrator().runOnce(root, new MockResearchAgents())).rejects.toThrow(/already active/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("takes over a stale project run lock from a dead pid", async () => {
    const root = await makeProject();
    try {
      await mkdir(join(root, "runtime"), { recursive: true });
      await writeFile(join(root, "runtime", "run.lock"), JSON.stringify({ id: "stale", pid: 999999999, startedAt: new Date().toISOString() }), "utf8");
      const result = await new FullAutoOrchestrator().runOnce(root, new MockResearchAgents());
      expect(result.events.map((event) => event.kind)).toContain("plan.created");
      expect(existsSync(join(root, "runtime", "run.lock"))).toBe(false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("releases the project run lock after an aborted execution path", async () => {
    const root = await makeProject();
    try {
      await adoptMockPlan(root);
      const controller = new AbortController();
      controller.abort();
      await new FullAutoOrchestrator().runOnce(root, new MockResearchAgents(), undefined, { signal: controller.signal });
      expect(existsSync(join(root, "runtime", "run.lock"))).toBe(false);
      await expect(new FullAutoOrchestrator().runOnce(root, new MockResearchAgents())).resolves.toBeTruthy();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }, 30_000);

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


  it("self-corrects a reviewed execution failure before pausing", async () => {
    class SelfCorrectingAgents extends MockResearchAgents {
      async createExecutorDraft() {
        return {
          title: "Broken slope fit",
          code: "raise RuntimeError('missing artifact')",
          claimText: "The fit slope is 2.0."
        };
      }

      async reviseExecutorDraft() {
        return super.createExecutorDraft();
      }
    }

    const root = await makeProject();
    try {
      await adoptMockPlan(root);
      const result = await new FullAutoOrchestrator().runOnce(root, new SelfCorrectingAgents());
      expect(result.events.map((event) => event.kind)).toContain("selfCorrection.started");
      expect(result.events.map((event) => event.kind)).toContain("selfCorrection.completed");
      expect(result.events.map((event) => event.kind)).toContain("patch.applied");
      const snapshot = await loadProject(root);
      expect(snapshot.lanes[0]?.nodes[0]?.review?.severity).toBe("clear");
      expect(snapshot.manuscriptBody).toContain("The fit slope is 2.0.");
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
