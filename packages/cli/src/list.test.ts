import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createProject,
  loadProject,
  savePlan,
  PlanSchema,
  ProjectManifestSchema,
  type ProjectManifest
} from "@nullius/core";
import { buildListResult, formatListLines } from "./list.js";

const created: string[] = [];

async function tempProject(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "nullius-list-"));
  created.push(dir);
  const manifest: ProjectManifest = ProjectManifestSchema.parse({
    name: "list test",
    question: "Is y linear in x?",
    roles: {
      planner: { provider: "openrouter", model: "openrouter/auto" },
      executor: { provider: "openrouter", model: "openrouter/auto" },
      reviewer: { provider: "openrouter", model: "openrouter/auto" }
    },
    settings: { maxLanes: 1, depth: "quick", sandboxPolicy: "disabled", selfCorrectionRounds: 1 }
  });
  await createProject(dir, manifest);
  return dir;
}

afterEach(async () => {
  while (created.length > 0) {
    const dir = created.pop();
    if (dir) await rm(dir, { recursive: true, force: true });
  }
});

describe("buildListResult", () => {
  it("returns a versioned, kinded, zod-validated array of plans", async () => {
    const dir = await tempProject();
    await savePlan(dir, PlanSchema.parse({ id: "plan-alpha-0001", title: "Linear fit", purpose: "p", method: "m" }));
    const snapshot = await loadProject(dir);

    const result = buildListResult(snapshot, "plans");

    expect(result.schemaVersion).toBe(1);
    expect(result.kind).toBe("plans");
    expect(result.items).toHaveLength(1);
    const plan = result.items[0] as { id: string; title: string; approved: boolean };
    expect(plan.id).toBe("plan-alpha-0001");
    expect(plan.title).toBe("Linear fit");
    expect(plan.approved).toBe(false);
  });

  it("returns an empty array for a kind with no items", async () => {
    const dir = await tempProject();
    const snapshot = await loadProject(dir);

    const result = buildListResult(snapshot, "patches");

    expect(result).toEqual({ schemaVersion: 1, kind: "patches", items: [] });
  });
});

describe("formatListLines", () => {
  it("renders one line per plan with a short id and pending status", async () => {
    const dir = await tempProject();
    await savePlan(dir, PlanSchema.parse({ id: "plan-alpha-0001", title: "Linear fit", purpose: "p", method: "m" }));
    const snapshot = await loadProject(dir);

    const lines = formatListLines(snapshot, "plans");

    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("plan-alp");
    expect(lines[0]).toContain("pending");
    expect(lines[0]).toContain("Linear fit");
  });
});
