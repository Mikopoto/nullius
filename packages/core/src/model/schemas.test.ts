import { describe, expect, it } from "vitest";
import { AgentRunResultSchema, EvidenceItemSchema, ProjectManifestSchema } from "./schemas.js";

describe("storage schemas", () => {
  it("round-trips the project manifest and defensively falls back unknown enums", () => {
    const parsed = ProjectManifestSchema.parse({
      schemaVersion: 1,
      name: "Nullius",
      question: "Can this run?",
      roles: {
        planner: { provider: "futureProvider", model: "model-a", reasoningEffort: "huge" },
        executor: { provider: "openrouter", model: "model-b" },
        reviewer: { provider: "anthropic", model: "model-c", reasoningEffort: "high" }
      },
      settings: {
        maxLanes: 3,
        depth: "unknown",
        sandboxPolicy: "required",
        selfCorrectionRounds: 2
      }
    });
    expect(parsed.roles.planner.provider).toBe("openrouter");
    expect(parsed.roles.planner.reasoningEffort).toBe("none");
    expect(parsed.settings.depth).toBe("standard");
  });

  it("requires execution payloads only for execution evidence", () => {
    expect(() =>
      EvidenceItemSchema.parse({
        id: "e1",
        type: "execution",
        title: "run",
        createdAt: new Date(0).toISOString(),
        sourceActivityId: "a1"
      })
    ).toThrow();

    expect(
      EvidenceItemSchema.parse({
        id: "e2",
        type: "humanInput",
        title: "note",
        createdAt: new Date(0).toISOString(),
        sourceActivityId: "a1"
      }).type
    ).toBe("humanInput");
  });

  it("stores agent runs even when structured JSON is missing", () => {
    const run = AgentRunResultSchema.parse({
      id: "r1",
      runStatus: "failed",
      exitCode: 1,
      schemaValidationStatus: "missing",
      stdoutPath: "runtime/r1.stdout.log",
      stderrPath: "runtime/r1.stderr.log",
      gitDiffPath: "runtime/r1.diff",
      artifactManifestStatus: "missing",
      startedAt: new Date(0).toISOString(),
      finishedAt: new Date(1).toISOString()
    });
    expect(run.createdFiles).toEqual([]);
    expect(run.structuredResultPath).toBeUndefined();
  });
});

