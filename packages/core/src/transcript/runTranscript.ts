import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { z } from "zod";

export const TranscriptRecordSchema = z.object({
  seq: z.number().int().positive(),
  ts: z.string(),
  runId: z.string(),
  kind: z.enum(["systemPrompt", "userPrompt", "delta", "reasoning", "response", "usage", "error", "event"]),
  role: z.enum(["planner", "executor", "reviewer", "synthesizer", "system", "user"]).default("system"),
  text: z.string()
});

export type TranscriptRecord = z.infer<typeof TranscriptRecordSchema>;

export class RunTranscriptStore {
  private readonly counters = new Map<string, number>();

  async append(root: string, runId: string, record: Omit<TranscriptRecord, "seq" | "ts" | "runId">): Promise<TranscriptRecord> {
    const seq = (this.counters.get(runId) ?? (await this.currentSeq(root, runId))) + 1;
    this.counters.set(runId, seq);
    const fullRecord = TranscriptRecordSchema.parse({
      ...record,
      seq,
      ts: new Date().toISOString(),
      runId
    });
    const path = transcriptPath(root, runId);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${JSON.stringify(fullRecord)}\n`, { encoding: "utf8", flag: "a" });
    return fullRecord;
  }

  async load(root: string, runId: string): Promise<TranscriptRecord[]> {
    const path = transcriptPath(root, runId);
    if (!existsSync(path)) return [];
    return (await readFile(path, "utf8"))
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => TranscriptRecordSchema.parse(JSON.parse(line)));
  }

  private async currentSeq(root: string, runId: string): Promise<number> {
    const records = await this.load(root, runId);
    return records.at(-1)?.seq ?? 0;
  }
}

export function transcriptPath(root: string, runId: string): string {
  return join(root, "runtime", "transcripts", `${runId}.jsonl`);
}

