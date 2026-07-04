import { appendFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import type { FullAutoEvent, FullAutoStreamEvent } from "../orchestrator/fullAuto.js";

export const ActivitySourceSchema = z.enum(["gui", "cli", "server", "core", "externalAgent", "gate", "sandbox", "reviewer"]);
export const ActivityRoleSchema = z.enum(["planner", "executor", "reviewer", "synthesizer", "system", "user"]);
export const ActivitySeveritySchema = z.enum(["ok", "warning", "critical"]);

export const ActivityJournalEventSchema = z.object({
  seq: z.number().int().positive(),
  ts: z.string(),
  source: ActivitySourceSchema,
  actor: z.string(),
  role: ActivityRoleSchema,
  phase: z.string(),
  title: z.string(),
  detail: z.string().optional(),
  severity: ActivitySeveritySchema.default("ok"),
  command: z.string().optional(),
  exitCode: z.number().int().nullable().optional(),
  projectRoot: z.string(),
  runId: z.string().optional()
});

export type ActivityJournalEvent = z.infer<typeof ActivityJournalEventSchema>;
export type ActivityJournalInput = Omit<ActivityJournalEvent, "seq" | "ts" | "projectRoot" | "severity"> & {
  seq?: number;
  ts?: string;
  severity?: ActivityJournalEvent["severity"];
  projectRoot?: string;
};

export function activityJournalPath(root: string): string {
  return join(root, "runtime", "events.jsonl");
}

export async function appendActivityEvent(root: string, input: ActivityJournalInput): Promise<ActivityJournalEvent> {
  await mkdir(join(root, "runtime"), { recursive: true });
  const event = ActivityJournalEventSchema.parse({
    seq: input.seq ?? await nextActivitySeq(root),
    ts: input.ts ?? new Date().toISOString(),
    source: input.source,
    actor: input.actor,
    role: input.role,
    phase: input.phase,
    title: input.title,
    ...(input.detail === undefined ? {} : { detail: input.detail }),
    severity: input.severity ?? "ok",
    ...(input.command === undefined ? {} : { command: input.command }),
    ...(input.exitCode === undefined ? {} : { exitCode: input.exitCode }),
    projectRoot: input.projectRoot ?? root,
    ...(input.runId === undefined ? {} : { runId: input.runId })
  });
  const path = activityJournalPath(root);
  const prefix = await needsLeadingNewline(path);
  await appendFile(path, `${prefix}${JSON.stringify(event)}\n`, "utf8");
  return event;
}

export async function readActivityEvents(root: string, options: { limit?: number } = {}): Promise<ActivityJournalEvent[]> {
  let text = "";
  try {
    text = await readFile(activityJournalPath(root), "utf8");
  } catch {
    return [];
  }
  const events: ActivityJournalEvent[] = [];
  for (const line of text.split(/\n/)) {
    if (!line.trim()) continue;
    try {
      events.push(ActivityJournalEventSchema.parse(JSON.parse(line)));
    } catch {
      // Ignore corrupt or partial JSONL lines. A later completed line can still be read.
    }
  }
  return options.limit && events.length > options.limit ? events.slice(-options.limit) : events;
}

export async function nextActivitySeq(root: string): Promise<number> {
  const events = await readActivityEvents(root);
  return events.reduce((max, event) => Math.max(max, event.seq), 0) + 1;
}

async function needsLeadingNewline(path: string): Promise<string> {
  try {
    const text = await readFile(path, "utf8");
    return text.length > 0 && !text.endsWith("\n") ? "\n" : "";
  } catch {
    return "";
  }
}

export function activityFromFullAutoEvent(
  root: string,
  event: FullAutoEvent,
  context: { source: ActivityJournalEvent["source"]; actor: string; command?: string; runId?: string }
): ActivityJournalInput {
  return {
    source: sourceForFullAutoEvent(context.source, event),
    actor: context.actor,
    role: event.role,
    phase: event.kind,
    title: event.title,
    ...(event.detail === undefined ? {} : { detail: event.detail }),
    severity: severityForFullAutoEvent(event),
    ...(context.command === undefined ? {} : { command: context.command }),
    projectRoot: root,
    ...(context.runId === undefined ? {} : { runId: context.runId })
  };
}

export function activityFromStreamEvent(
  root: string,
  event: FullAutoStreamEvent,
  context: { source: ActivityJournalEvent["source"]; actor: string; command?: string }
): ActivityJournalInput {
  return {
    source: event.role === "reviewer" ? "reviewer" : context.source,
    actor: context.actor,
    role: event.role,
    phase: `stream.${event.kind}`,
    title: `${event.role} ${event.purpose}`,
    detail: event.text ?? (event.usage ? JSON.stringify(event.usage) : event.kind),
    severity: "ok",
    ...(context.command === undefined ? {} : { command: context.command }),
    projectRoot: root,
    runId: event.runId
  };
}

function severityForFullAutoEvent(event: FullAutoEvent): ActivityJournalEvent["severity"] {
  if (event.kind === "intervention.required") return "warning";
  if (event.kind === "node.executed" && /failed|error/i.test(`${event.title}\n${event.detail ?? ""}`)) return "critical";
  if (event.kind === "run.completed" && /not ready/i.test(event.detail ?? "")) return "warning";
  return "ok";
}

function sourceForFullAutoEvent(source: ActivityJournalEvent["source"], event: FullAutoEvent): ActivityJournalEvent["source"] {
  if (event.role === "reviewer") return "reviewer";
  if (event.kind === "node.executed") return "sandbox";
  if (event.kind === "patch.applied" || event.kind === "patch.staged") return "gate";
  return source;
}
