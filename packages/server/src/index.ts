import { spawn } from "node:child_process";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { cp, mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { WebSocketServer, type WebSocket } from "ws";
import { z } from "zod";
import {
  approvePatch,
  activityFromFullAutoEvent,
  activityFromStreamEvent,
  appendActivityEvent,
  checkProjectReproducibility,
  createProject,
  createResearchAgentsFromManifest,
  defaultExecutionBackend,
  executionBackendFor,
  exportMarkdown,
  FullAutoOrchestrator,
  listProjectDataFiles,
  loadProject,
  MockResearchAgents,
  projectGateIO,
  ProjectManifestSchema,
  readinessReport,
  rejectPatch,
  readActivityEvents,
  saveLane,
  saveLiterature,
  saveManifest,
  saveNode,
  savePlan,
  snapshotToGateProject,
  verifyLiteratureItem,
  type ActivityJournalEvent,
  type ActivityJournalInput,
  type FullAutoEvent
} from "@nullius/core";

export const ServerCommandSchema = z.object({
  schemaVersion: z.literal(1),
  command: z.enum([
    "project.open",
    "project.create",
    "plan.generate",
    "plan.adopt",
    "run.start",
    "run.stop",
    "run.resume",
    "run.steer",
    "patch.approve",
    "patch.reject",
    "gates.verify",
    "citations.verify",
    "citations.search",
    "repro.check",
    "node.rerun",
    "export.markdown",
    "keys.set",
    "keys.status",
    "data.import",
    "data.list",
    "project.configure",
    "activity.watch",
    "activity.list"
  ]),
  payload: z.unknown().optional()
});

export type ServerCommand = z.infer<typeof ServerCommandSchema>;

export interface NulliusServer {
  port: number;
  http: Server;
  ws: WebSocketServer;
  close(): Promise<void>;
  command(command: ServerCommand): Promise<unknown>;
}

const CreateProjectPayload = z.object({
  root: z.string(),
  manifest: ProjectManifestSchema
});

const RootPayload = z.object({
  root: z.string()
});

const VerifyPayload = z.object({
  root: z.string(),
  depth: z.enum(["quick", "standard", "deep"]).default("standard")
});

const PatchPayload = z.object({
  root: z.string(),
  patchId: z.string()
});

const RunPayload = z.object({
  root: z.string(),
  mock: z.boolean().default(false),
  mockFabricated: z.boolean().default(false),
  backend: z.enum(["auto", "pyodide", "sandboxExec", "docker"]).default("auto")
});

const PlanAdoptPayload = z.object({
  root: z.string(),
  planId: z.string()
});

const SteerPayload = z.object({
  root: z.string(),
  instruction: z.string()
});

const SearchCitationPayload = z.object({
  query: z.string(),
  rows: z.number().int().positive().max(20).default(5)
});

const NodePayload = z.object({
  root: z.string(),
  nodeId: z.string()
});

const DataImportPayload = z.object({
  root: z.string(),
  files: z.array(z.string()).min(1)
});

const RoleConfigSchema = z.object({
  provider: z.enum(["openrouter", "openai", "anthropic", "customOpenAICompatible"]),
  model: z.string().min(1),
  reasoningEffort: z.enum(["none", "low", "medium", "high"]).default("none")
});

const ProjectConfigurePayload = z.object({
  root: z.string(),
  roles: z.object({
    planner: RoleConfigSchema,
    executor: RoleConfigSchema,
    reviewer: RoleConfigSchema
  })
});

const KeysSetPayload = z.object({
  provider: z.enum(["openrouter", "openai", "anthropic", "customOpenAICompatible"]),
  apiKey: z.string().min(1),
  persist: z.boolean().default(true)
});

export async function startNulliusServer(options: { port?: number } = {}): Promise<NulliusServer> {
  const clients = new Set<WebSocket>();
  const activeRuns = new Map<string, AbortController>();
  const activityWatchers = new Map<string, { seen: Set<string>; timer: ReturnType<typeof setInterval> }>();
  // Keys entered through the GUI on platforms without a supported OS keychain
  // live only in this process; they are never written to disk.
  const sessionKeys = new Map<string, string>();

  const resolveAgentEnv = async (): Promise<NodeJS.ProcessEnv> => {
    const env = await envWithKeychain();
    for (const [provider, apiKey] of sessionKeys) {
      const envName = providerEnvNames()[provider];
      if (envName) env[envName] = apiKey;
    }
    return env;
  };

  const broadcast = (event: unknown) => {
    const payload = JSON.stringify(event);
    for (const client of clients) {
      if (client.readyState === client.OPEN) client.send(payload);
    }
  };

  const activityEventKey = (event: ActivityJournalEvent): string => `${event.seq}:${event.ts}:${event.source}:${event.phase}:${event.title}`;

  const markActivitySeen = (root: string, event: ActivityJournalEvent) => {
    const watcher = activityWatchers.get(root);
    if (watcher) watcher.seen.add(activityEventKey(event));
  };

  const broadcastActivity = (event: ActivityJournalEvent) => {
    markActivitySeen(event.projectRoot, event);
    broadcast({ schemaVersion: 1, type: "activity.event", event });
  };

  const recordActivity = async (root: string, input: ActivityJournalInput): Promise<ActivityJournalEvent> => {
    const event = await appendActivityEvent(root, input);
    broadcastActivity(event);
    return event;
  };

  const startActivityWatch = async (root: string): Promise<ActivityJournalEvent[]> => {
    const existing = await readActivityEvents(root, { limit: 500 });
    const active = activityWatchers.get(root);
    if (active) {
      for (const event of existing) active.seen.add(activityEventKey(event));
      return existing;
    }
    const seen = new Set(existing.map(activityEventKey));
    const watcher = {
      seen,
      timer: setInterval(() => {
        void (async () => {
          const events = await readActivityEvents(root, { limit: 1000 });
          const next = events.filter((event) => !watcher.seen.has(activityEventKey(event))).sort((a, b) => a.seq - b.seq || a.ts.localeCompare(b.ts));
          if (next.length === 0) return;
          for (const event of next) {
            watcher.seen.add(activityEventKey(event));
            broadcastActivity(event);
          }
          await broadcastStateChanged("activity.watch", root);
        })().catch(() => undefined);
      }, 500)
    };
    activityWatchers.set(root, watcher);
    return existing;
  };

  const broadcastStateChanged = async (commandName: string, root: string) => {
    let readiness;
    try {
      const snapshot = await loadProject(root);
      readiness = readinessReport(snapshotToGateProject(snapshot), snapshot.manifest.settings.depth, projectGateIO(root));
    } catch {
      readiness = undefined;
    }
    broadcast({ schemaVersion: 1, type: "state.changed", command: commandName, root, readiness });
  };

  const command = async (message: ServerCommand): Promise<unknown> => {
    const parsed = ServerCommandSchema.parse(message);
    switch (parsed.command) {
      case "project.create": {
        const payload = CreateProjectPayload.parse(parsed.payload);
        await createProject(payload.root, payload.manifest);
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "system",
          phase: "project.create.completed",
          title: "Project created",
          detail: payload.manifest.question,
          command: parsed.command
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true };
      }
      case "project.open": {
        const payload = RootPayload.parse(parsed.payload);
        return loadProject(payload.root);
      }
      case "gates.verify": {
        const payload = VerifyPayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        const readiness = readinessReport(snapshotToGateProject(snapshot), payload.depth, projectGateIO(payload.root));
        await recordActivity(payload.root, {
          source: "gate",
          actor: "gui",
          role: "system",
          phase: "gates.verify.completed",
          title: readiness.ready ? "Gates passed" : "Gates not ready",
          detail: `readiness=${Math.round(readiness.readinessScore * 100)}%`,
          severity: readiness.ready ? "ok" : "warning",
          command: parsed.command,
          exitCode: readiness.ready ? 0 : 1
        });
        return { ok: true, readiness };
      }
      case "run.start": {
        const payload = RunPayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        const controller = new AbortController();
        activeRuns.set(payload.root, controller);
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "system",
          phase: "run.start.started",
          title: "Full Auto started",
          command: parsed.command
        });
        const result = await new FullAutoOrchestrator({ backend: executionBackendFor(payload.backend) }).runOnce(
          payload.root,
          payload.mock || payload.mockFabricated
            ? new MockResearchAgents({ fabricated: payload.mockFabricated })
            : createResearchAgentsFromManifest(snapshot.manifest, { env: await resolveAgentEnv() }),
          (event: FullAutoEvent) => {
            broadcast({ schemaVersion: 1, type: "run.event", event });
            void recordActivity(payload.root, activityFromFullAutoEvent(payload.root, event, { source: "gui", actor: "gui", command: parsed.command }));
            if (event.kind === "intervention.required") broadcast({ schemaVersion: 1, type: "intervention.required", event, root: payload.root });
          },
          {
            signal: controller.signal,
            onStream: (event) => {
              broadcast({ schemaVersion: 1, type: "stream.delta", ...event, root: payload.root });
              void recordActivity(payload.root, activityFromStreamEvent(payload.root, event, { source: "gui", actor: "gui", command: parsed.command }));
            }
          }
        );
        activeRuns.delete(payload.root);
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "system",
          phase: "run.start.completed",
          title: result.ready ? "Full Auto completed" : "Full Auto completed: not ready",
          severity: result.ready ? "ok" : "warning",
          command: parsed.command,
          exitCode: result.ready ? 0 : 1,
          runId: result.runId
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return result;
      }
      case "run.resume": {
        const payload = RunPayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        const controller = new AbortController();
        activeRuns.set(payload.root, controller);
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "system",
          phase: "run.resume.started",
          title: "Full Auto resumed",
          command: parsed.command
        });
        const result = await new FullAutoOrchestrator({ backend: executionBackendFor(payload.backend) }).runOnce(
          payload.root,
          payload.mock || payload.mockFabricated
            ? new MockResearchAgents({ fabricated: payload.mockFabricated })
            : createResearchAgentsFromManifest(snapshot.manifest, { env: await resolveAgentEnv() }),
          (event: FullAutoEvent) => {
            broadcast({ schemaVersion: 1, type: "run.event", event });
            void recordActivity(payload.root, activityFromFullAutoEvent(payload.root, event, { source: "gui", actor: "gui", command: parsed.command }));
            if (event.kind === "intervention.required") broadcast({ schemaVersion: 1, type: "intervention.required", event, root: payload.root });
          },
          {
            signal: controller.signal,
            onStream: (event) => {
              broadcast({ schemaVersion: 1, type: "stream.delta", ...event, root: payload.root });
              void recordActivity(payload.root, activityFromStreamEvent(payload.root, event, { source: "gui", actor: "gui", command: parsed.command }));
            }
          }
        );
        activeRuns.delete(payload.root);
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "system",
          phase: "run.resume.completed",
          title: result.ready ? "Full Auto resumed and completed" : "Full Auto resumed: not ready",
          severity: result.ready ? "ok" : "warning",
          command: parsed.command,
          exitCode: result.ready ? 0 : 1,
          runId: result.runId
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return result;
      }
      case "run.stop": {
        const payload = RootPayload.parse(parsed.payload);
        const controller = activeRuns.get(payload.root);
        if (!controller) return { ok: true, stopped: false, reason: "No active run for this project." };
        controller.abort();
        activeRuns.delete(payload.root);
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "system",
          phase: "run.stop.completed",
          title: "Stop requested",
          command: parsed.command
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, stopped: true };
      }
      case "run.steer": {
        const payload = SteerPayload.parse(parsed.payload);
        await mkdir(join(payload.root, "runtime"), { recursive: true });
        await writeFile(join(payload.root, "runtime", "steering.txt"), `${payload.instruction}\n`, "utf8");
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "user",
          phase: "run.steer.completed",
          title: "Steering instruction saved",
          detail: payload.instruction,
          command: parsed.command
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true };
      }
      case "plan.generate": {
        const payload = RootPayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "planner",
          phase: "plan.generate.started",
          title: "Generating plan",
          command: parsed.command
        });
        const plan = await createResearchAgentsFromManifest(snapshot.manifest, { env: await resolveAgentEnv() }).createPlan(snapshot.manifest.question);
        await savePlan(payload.root, plan);
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "planner",
          phase: "plan.generate.completed",
          title: "Plan generated",
          detail: plan.title,
          command: parsed.command
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, plan };
      }
      case "plan.adopt": {
        const payload = PlanAdoptPayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        const selected = snapshot.plans.find((plan) => plan.id === payload.planId);
        if (!selected) return { ok: false, reason: `Plan not found: ${payload.planId}` };
        const adopted = { ...selected, approved: true };
        await savePlan(payload.root, adopted);
        const manifest = {
          ...snapshot.manifest,
          protocolLock: snapshot.manifest.protocolLock ?? {
            researchQuestion: snapshot.manifest.question,
            scope: adopted.purpose,
            plannedObservables: adopted.observables,
            successCriteria: adopted.successCriteria,
            falsificationCriteria: adopted.falsificationCriteria,
            requiredEvidence: ["approved evidence for every result claim"],
            exclusions: ["unsupported claims"],
            lockedAt: new Date().toISOString()
          }
        };
        await saveManifest(payload.root, manifest);
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "user",
          phase: "plan.adopt.completed",
          title: "Plan adopted",
          detail: adopted.title,
          command: parsed.command
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, plan: adopted };
      }
      case "patch.approve": {
        const payload = PatchPayload.parse(parsed.payload);
        const result = await approvePatch(payload.root, payload.patchId);
        await recordActivity(payload.root, {
          source: "gate",
          actor: "gui",
          role: "user",
          phase: "patch.approve.completed",
          title: result.applied ? "Patch applied" : "Patch approval blocked",
          detail: result.applied ? payload.patchId : result.reason ?? payload.patchId,
          severity: result.applied ? "ok" : "warning",
          command: parsed.command,
          exitCode: result.applied ? 0 : 1
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return result;
      }
      case "patch.reject": {
        const payload = PatchPayload.parse(parsed.payload);
        const patch = await rejectPatch(payload.root, payload.patchId);
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "user",
          phase: "patch.reject.completed",
          title: "Patch rejected",
          detail: patch.id,
          command: parsed.command
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, patch };
      }
      case "export.markdown": {
        const payload = RootPayload.parse(parsed.payload);
        const body = await exportMarkdown(payload.root);
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "system",
          phase: "export.markdown.completed",
          title: "Markdown exported",
          detail: `${body.length} characters`,
          command: parsed.command
        });
        return { body };
      }
      case "data.import": {
        const payload = DataImportPayload.parse(parsed.payload);
        const dataDir = join(payload.root, "data");
        await mkdir(dataDir, { recursive: true });
        const imported: string[] = [];
        for (const file of payload.files) {
          const name = basename(file);
          if (!name || name.startsWith(".")) continue;
          await cp(file, join(dataDir, name), { force: true });
          imported.push(name);
        }
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "user",
          phase: "data.import.completed",
          title: "Data files imported",
          detail: imported.join(", ") || "No files imported",
          severity: imported.length > 0 ? "ok" : "warning",
          command: parsed.command,
          exitCode: imported.length > 0 ? 0 : 1
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, imported, files: await listProjectDataFiles(payload.root) };
      }
      case "data.list": {
        const payload = RootPayload.parse(parsed.payload);
        return { ok: true, files: await listProjectDataFiles(payload.root) };
      }
      case "project.configure": {
        const payload = ProjectConfigurePayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        await saveManifest(payload.root, { ...snapshot.manifest, roles: payload.roles });
        await recordActivity(payload.root, {
          source: "gui",
          actor: "gui",
          role: "system",
          phase: "project.configure.completed",
          title: "Model settings saved",
          detail: `planner=${payload.roles.planner.model}; executor=${payload.roles.executor.model}; reviewer=${payload.roles.reviewer.model}`,
          command: parsed.command
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true };
      }
      case "keys.set": {
        const payload = KeysSetPayload.parse(parsed.payload);
        if (payload.persist && process.platform === "darwin") {
          const result = await runCapture("security", ["add-generic-password", "-a", "nullius", "-s", keychainService(payload.provider), "-w", payload.apiKey, "-U"]);
          if (result.exitCode === 0) {
            sessionKeys.delete(payload.provider);
            return { ok: true, stored: "keychain" };
          }
        }
        sessionKeys.set(payload.provider, payload.apiKey);
        return { ok: true, stored: "session" };
      }
      case "keys.status": {
        const status: Record<string, string> = {};
        for (const [provider, envName] of Object.entries(providerEnvNames())) {
          if (sessionKeys.has(provider)) {
            status[provider] = "session";
            continue;
          }
          if (process.env[envName]) {
            status[provider] = "env";
            continue;
          }
          if (process.platform === "darwin") {
            const result = await runCapture("security", ["find-generic-password", "-a", "nullius", "-s", keychainService(provider), "-w"]);
            if (result.exitCode === 0 && result.stdout.trim()) {
              status[provider] = "keychain";
              continue;
            }
          }
          status[provider] = "none";
        }
        return { ok: true, status };
      }
      case "citations.verify": {
        const payload = RootPayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        const verified = await Promise.all(snapshot.literature.map((item) => verifyLiteratureItem(item)));
        await saveLiterature(payload.root, verified);
        const rejected = verified.filter((item) => item.status === "rejected" || item.status === "retracted").length;
        await recordActivity(payload.root, {
          source: "gate",
          actor: "gui",
          role: "system",
          phase: "citations.verify.completed",
          title: rejected > 0 ? "Citation verification found issues" : "Citations verified",
          detail: `${verified.length} literature item(s), ${rejected} rejected/retracted`,
          severity: rejected > 0 ? "warning" : "ok",
          command: parsed.command,
          exitCode: rejected > 0 ? 1 : 0
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, literature: verified };
      }
      case "citations.search": {
        const payload = SearchCitationPayload.parse(parsed.payload);
        return { ok: true, results: await searchCrossref(payload.query, payload.rows) };
      }
      case "repro.check": {
        const payload = RootPayload.parse(parsed.payload);
        const result = await checkProjectReproducibility(payload.root);
        await recordActivity(payload.root, {
          source: "sandbox",
          actor: "gui",
          role: "system",
          phase: "repro.check.completed",
          title: result.failed === 0 && result.divergent === 0 ? "Reproducibility check passed" : "Reproducibility check found issues",
          detail: `failed=${result.failed}; divergent=${result.divergent}`,
          severity: result.failed === 0 && result.divergent === 0 ? "ok" : "warning",
          command: parsed.command,
          exitCode: result.failed === 0 && result.divergent === 0 ? 0 : 1
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: result.failed === 0 && result.divergent === 0, ...result };
      }
      case "node.rerun": {
        const payload = NodePayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        const lane = snapshot.lanes.find((candidate) => candidate.nodes.some((node) => node.id === payload.nodeId));
        const node = lane?.nodes.find((candidate) => candidate.id === payload.nodeId);
        if (!lane || !node) return { ok: false, reason: `Node not found: ${payload.nodeId}` };
        const started = Date.now();
        const result = await defaultExecutionBackend().run(node.generatedCode, join(payload.root, "lanes", lane.id, "nodes", node.id), { allowNetwork: false, timeoutSec: 30 });
        const updated = {
          ...node,
          status: result.status === "succeeded" ? "completed" : "error",
          reproducibility: result.status === "succeeded" ? "reproduced" : "failed",
          executionRecord: {
            exitCode: result.exitCode,
            startedAt: new Date(started).toISOString(),
            durationMs: Date.now() - started,
            backend: result.backend
          }
        } as const;
        await saveNode(payload.root, lane.id, updated, [`# ${updated.title}`, "", `Status: ${updated.status}`, "", "```python", updated.generatedCode, "```", "", result.stdout || result.stderr].join("\n"));
        await saveLane(payload.root, { id: lane.id, name: lane.name, planId: lane.planId, nodeOrder: lane.nodeOrder.includes(updated.id) ? lane.nodeOrder : [...lane.nodeOrder, updated.id] });
        await recordActivity(payload.root, {
          source: "sandbox",
          actor: "gui",
          role: "executor",
          phase: "node.rerun.completed",
          title: result.status === "succeeded" ? "Node rerun completed" : "Node rerun failed",
          detail: updated.title,
          severity: result.status === "succeeded" ? "ok" : "critical",
          command: parsed.command,
          exitCode: result.exitCode
        });
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, node: updated, execution: result };
      }
      case "activity.watch": {
        const payload = RootPayload.parse(parsed.payload);
        const events = await startActivityWatch(payload.root);
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, events };
      }
      case "activity.list": {
        const payload = RootPayload.parse(parsed.payload);
        const events = await readActivityEvents(payload.root, { limit: 500 });
        return { ok: true, events };
      }
    }
  };

  const http = createServer(async (request, response) => {
    try {
      await handleRequest(request, response, command);
    } catch (error) {
      response.statusCode = 500;
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ ok: false, error: String(error) }));
    }
  });
  const ws = new WebSocketServer({ server: http });
  ws.on("connection", (socket) => {
    clients.add(socket);
    socket.on("close", () => clients.delete(socket));
  });

  await new Promise<void>((resolve, reject) => {
    http.once("error", reject);
    http.listen(options.port ?? 0, "127.0.0.1", () => {
      http.off("error", reject);
      resolve();
    });
  });
  const address = http.address();
  const port = typeof address === "object" && address ? address.port : options.port ?? 0;
  return {
    port,
    http,
    ws,
    close: async () => {
      for (const watcher of activityWatchers.values()) clearInterval(watcher.timer);
      activityWatchers.clear();
      for (const client of clients) client.close();
      ws.close();
      await new Promise<void>((resolve, reject) => http.close((error) => (error ? reject(error) : resolve())));
    },
    command
  };
}

export function createEventServer(port = 0): WebSocketServer {
  return new WebSocketServer({ port });
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  command: (message: ServerCommand) => Promise<unknown>
): Promise<void> {
  setCors(response, request);
  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }
  if (request.method === "GET" && request.url === "/health") {
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ ok: true }));
    return;
  }
  if (request.method !== "POST" || request.url !== "/command") {
    response.statusCode = 404;
    response.end("not found");
    return;
  }
  const body = await readBody(request);
  const result = await command(ServerCommandSchema.parse(JSON.parse(body)));
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify({ ok: true, result }));
}

function setCors(response: ServerResponse, request?: IncomingMessage): void {
  const origin = request?.headers.origin;
  const allowedOrigin = allowedCorsOrigin(origin);
  if (allowedOrigin) response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function allowedCorsOrigin(origin: string | undefined): string | undefined {
  if (!origin) return "http://127.0.0.1";
  if (origin === "tauri://localhost" || origin === "http://tauri.localhost") return origin;
  if (/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin)) return origin;
  return undefined;
}

async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

async function searchCrossref(query: string, rows: number): Promise<unknown[]> {
  const response = await fetch(`https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(query)}&rows=${rows}`);
  if (!response.ok) return [];
  const body = (await response.json()) as { message?: { items?: Array<Record<string, unknown>> } };
  return (body.message?.items ?? []).map((item) => ({
    id: randomUUID(),
    title: Array.isArray(item.title) ? item.title[0] : "",
    authors: Array.isArray(item.author) ? item.author.map((author) => typeof author === "object" && author && "family" in author ? String(author.family) : "").filter(Boolean).join(", ") : "",
    year: String(readCrossrefYear(item) ?? ""),
    doi: typeof item.DOI === "string" ? item.DOI : undefined,
    url: typeof item.URL === "string" ? item.URL : undefined,
    citationKey: makeCitationKey(item),
    status: "unverified",
    notes: ""
  }));
}

function readCrossrefYear(item: Record<string, unknown>): number | undefined {
  const issued = item.issued as { "date-parts"?: number[][] } | undefined;
  return issued?.["date-parts"]?.[0]?.[0];
}

function makeCitationKey(item: Record<string, unknown>): string {
  const firstAuthor = Array.isArray(item.author) && typeof item.author[0] === "object" && item.author[0] && "family" in item.author[0] ? String(item.author[0].family) : "source";
  const year = readCrossrefYear(item) ?? "nd";
  return `${firstAuthor.toLowerCase().replace(/[^a-z0-9]+/g, "")}${year}`;
}


async function envWithKeychain(): Promise<NodeJS.ProcessEnv> {
  const env = { ...process.env };
  if (process.platform !== "darwin") return env;
  for (const [provider, envName] of Object.entries(providerEnvNames())) {
    if (env[envName]) continue;
    const result = await runCapture("security", ["find-generic-password", "-a", "nullius", "-s", keychainService(provider), "-w"]);
    if (result.exitCode === 0 && result.stdout.trim()) env[envName] = result.stdout.trim();
  }
  return env;
}

function providerEnvNames(): Record<string, string> {
  return {
    openrouter: "OPENROUTER_API_KEY",
    openai: "OPENAI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    customOpenAICompatible: "CUSTOM_OPENAI_API_KEY"
  };
}

function keychainService(provider: string): string {
  return `nullius:${provider}`;
}

function runCapture(command: string, args: string[]): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
    child.on("error", (error) => resolve({ exitCode: 127, stdout: Buffer.concat(stdout).toString("utf8"), stderr: String(error) }));
    child.on("close", (code) => resolve({ exitCode: code ?? 1, stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8") }));
  });
}
