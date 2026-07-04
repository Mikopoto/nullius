import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { RunTranscriptStore } from "./runTranscript.js";

describe("RunTranscriptStore", () => {
  it("appends and reloads JSONL transcript records", async () => {
    const root = await mkdtemp(join(tmpdir(), "nullius-transcript-"));
    try {
      const store = new RunTranscriptStore();
      await store.append(root, "run-1", { kind: "systemPrompt", role: "system", text: "system" });
      await store.append(root, "run-1", { kind: "response", role: "executor", text: "done" });
      const records = await store.load(root, "run-1");
      expect(records.map((record) => record.seq)).toEqual([1, 2]);
      expect(records[1]?.text).toBe("done");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

