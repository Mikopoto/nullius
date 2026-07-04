import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { createProject, loadProject, snapshotToGateProject } from "./projectStore.js";

describe("project store", () => {
  it("creates and loads the new storage layout", async () => {
    const root = await mkdtemp(join(tmpdir(), "nullius-store-"));
    try {
      await createProject(root, {
        schemaVersion: 1,
        name: "Test",
        question: "Does it work?",
        roles: {
          planner: { provider: "openrouter", model: "planner", reasoningEffort: "none" },
          executor: { provider: "openrouter", model: "executor", reasoningEffort: "none" },
          reviewer: { provider: "openrouter", model: "reviewer", reasoningEffort: "none" }
        },
        settings: {
          maxLanes: 3,
          depth: "standard",
          sandboxPolicy: "required",
          selfCorrectionRounds: 2
        },
        amendments: []
      });
      await writeFile(join(root, "manuscript", "report.md"), "# Abstract\n", "utf8");
      const snapshot = await loadProject(root);
      expect(snapshot.manifest.name).toBe("Test");
      expect(snapshot.manuscriptBody).toBe("# Abstract\n");
      expect(snapshot.evidence).toEqual([]);
      expect(snapshotToGateProject(snapshot).manuscriptBody).toContain("Abstract");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

