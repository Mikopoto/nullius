import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkProjectReproducibility } from "./reproCheck.js";
import { canonicallyEqualText } from "./reproducibility.js";
import { PyodideBackend } from "./executionBackend.js";

describe("reproducibility canonical text comparison", () => {
  it("absorbs line ending and float formatting differences", () => {
    expect(canonicallyEqualText("slope,2.0000\r\nintercept,0.5", "slope,2.0\nintercept,5e-1")).toBe(true);
  });

  it("rejects changed values or changed skeletons", () => {
    expect(canonicallyEqualText("slope,2.0000", "slope,2.1000")).toBe(false);
    expect(canonicallyEqualText("slope,2.0", "totally different label,2.0")).toBe(false);
  });
});
  it("copies node inputs into the staging directory before removing recorded artifacts", async () => {
    const { createProject, savePlan, saveLane, saveNode, saveEvidence } = await import("../store/projectStore.js");
    const root = join(tmpdir(), `nullius-repro-input-${Date.now()}`);
    rmSync(root, { recursive: true, force: true });
    await createProject(root, {
      schemaVersion: 1,
      name: "Repro Input Test",
      question: "Can repro read node-local input data?",
      roles: {
        planner: { provider: "openrouter", model: "mock", reasoningEffort: "none" },
        executor: { provider: "openrouter", model: "mock", reasoningEffort: "none" },
        reviewer: { provider: "openrouter", model: "mock", reasoningEffort: "none" }
      },
      settings: { maxLanes: 1, depth: "quick", sandboxPolicy: "required", selfCorrectionRounds: 1 },
      amendments: []
    });
    const plan = { id: "plan-input", title: "Input lane", purpose: "Use input", method: "Read data/input.txt", observables: ["value"], successCriteria: ["value exists"], falsificationCriteria: [], approved: true };
    const lane = { id: "lane-input", name: "Input lane", planId: plan.id, nodeOrder: ["node-input"] };
    const code = [
      "import os",
      "os.makedirs('artifacts', exist_ok=True)",
      "value = open('data/input.txt').read().strip()",
      "open('artifacts/result.csv', 'w').write('metric,value\\ninput,' + value + '\\n')"
    ].join("\n");
    await savePlan(root, plan);
    await saveLane(root, lane);
    await saveNode(root, lane.id, { id: "node-input", title: "Read node data", status: "completed", prerequisiteNodeIds: [], generatedCode: code, reproducibility: "notChecked" }, "# Read node data");
    const nodeDir = join(root, "lanes", lane.id, "nodes", "node-input");
    await import("node:fs/promises").then(async ({ mkdir, writeFile }) => {
      await mkdir(join(nodeDir, "data"), { recursive: true });
      await mkdir(join(nodeDir, "artifacts"), { recursive: true });
      await writeFile(join(nodeDir, "data", "input.txt"), "42", "utf8");
      await writeFile(join(nodeDir, "artifacts", "result.csv"), "metric,value\ninput,42\n", "utf8");
    });
    await saveEvidence(root, [{
      id: "ev-input",
      type: "execution",
      laneId: lane.id,
      nodeId: "node-input",
      title: "result.csv",
      summary: "metric,value\ninput,42\n",
      path: "artifacts/result.csv",
      sha256: "",
      createdAt: new Date(0).toISOString(),
      sourceActivityId: "activity-input",
      sourceActivityType: "execution",
      validation: "valid",
      review: "approved",
      execution: {
        producingCommand: "python",
        exitCode: 0,
        stdoutPath: "logs/stdout.log",
        stderrPath: "logs/stderr.log",
        artifactPaths: ["artifacts/result.csv"],
        sha256ByPath: {},
        environmentSummary: "test"
      }
    }]);
    const result = await checkProjectReproducibility(root, new PyodideBackend());
    expect(result.reproduced).toBe(1);
    expect(result.failed + result.divergent).toBe(0);
    rmSync(root, { recursive: true, force: true });
  }, 30_000);

