import { appendFile, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { activityJournalPath, appendActivityEvent, readActivityEvents } from "./activityJournal.js";

describe("Activity Journal", () => {
  it("appends ordered events and ignores corrupt or partial JSONL lines", async () => {
    const root = await mkdtemp(join(tmpdir(), "nullius-activity-"));
    try {
      const first = await appendActivityEvent(root, {
        source: "cli",
        actor: "external-agent",
        role: "system",
        phase: "verify.started",
        title: "Verify started",
        command: "verify"
      });
      expect(first.seq).toBe(1);
      await appendFile(activityJournalPath(root), "{not-json}\n{\"partial\":", "utf8");
      const second = await appendActivityEvent(root, {
        source: "gate",
        actor: "external-agent",
        role: "system",
        phase: "verify.completed",
        title: "Verify completed",
        command: "verify",
        exitCode: 0
      });
      const events = await readActivityEvents(root);
      expect(second.seq).toBe(2);
      expect(events.map((event) => event.title)).toEqual(["Verify started", "Verify completed"]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
