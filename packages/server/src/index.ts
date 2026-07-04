import { spawn } from "node:child_process";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { WebSocketServer, type WebSocket } from "ws";
import { z } from "zod";
import {
  approvePatch,
  checkProjectReproducibility,
  createProject,
  createResearchAgentsFromManifest,
  defaultExecutionBackend,
  executionBackendFor,
  exportMarkdown,
  FullAutoOrchestrator,
  loadProject,
  MockResearchAgents,
  projectGateIO,
  ProjectManifestSchema,
  readinessReport,
  rejectPatch,
  saveLane,
  saveLiterature,
  saveManifest,
  saveNode,
  savePlan,
  snapshotToGateProject,
  verifyLiteratureItem,
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
    "export.markdown"
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

export async function startNulliusServer(options: { port?: number } = {}): Promise<NulliusServer> {
  const clients = new Set<WebSocket>();
  const activeRuns = new Map<string, AbortController>();

  const broadcast = (event: unknown) => {
    const payload = JSON.stringify(event);
    for (const client of clients) {
      if (client.readyState === client.OPEN) client.send(payload);
    }
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
        return { ok: true, readiness: readinessReport(snapshotToGateProject(snapshot), payload.depth, projectGateIO(payload.root)) };
      }
      case "run.start": {
        const payload = RunPayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        const controller = new AbortController();
        activeRuns.set(payload.root, controller);
        const result = await new FullAutoOrchestrator({ backend: executionBackendFor(payload.backend) }).runOnce(
          payload.root,
          payload.mock || payload.mockFabricated
            ? new MockResearchAgents({ fabricated: payload.mockFabricated })
            : createResearchAgentsFromManifest(snapshot.manifest, { env: await envWithKeychain() }),
          (event: FullAutoEvent) => {
            broadcast({ schemaVersion: 1, type: "run.event", event });
            if (event.kind === "intervention.required") broadcast({ schemaVersion: 1, type: "intervention.required", event, root: payload.root });
          },
          {
            signal: controller.signal,
            onStream: (event) => broadcast({ schemaVersion: 1, type: "stream.delta", ...event, root: payload.root })
          }
        );
        activeRuns.delete(payload.root);
        await broadcastStateChanged(parsed.command, payload.root);
        return result;
      }
      case "run.resume": {
        const payload = RunPayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        const controller = new AbortController();
        activeRuns.set(payload.root, controller);
        const result = await new FullAutoOrchestrator({ backend: executionBackendFor(payload.backend) }).runOnce(
          payload.root,
          payload.mock || payload.mockFabricated
            ? new MockResearchAgents({ fabricated: payload.mockFabricated })
            : createResearchAgentsFromManifest(snapshot.manifest, { env: await envWithKeychain() }),
          (event: FullAutoEvent) => {
            broadcast({ schemaVersion: 1, type: "run.event", event });
            if (event.kind === "intervention.required") broadcast({ schemaVersion: 1, type: "intervention.required", event, root: payload.root });
          },
          {
            signal: controller.signal,
            onStream: (event) => broadcast({ schemaVersion: 1, type: "stream.delta", ...event, root: payload.root })
          }
        );
        activeRuns.delete(payload.root);
        await broadcastStateChanged(parsed.command, payload.root);
        return result;
      }
      case "run.stop": {
        const payload = RootPayload.parse(parsed.payload);
        const controller = activeRuns.get(payload.root);
        if (!controller) return { ok: true, stopped: false, reason: "No active run for this project." };
        controller.abort();
        activeRuns.delete(payload.root);
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, stopped: true };
      }
      case "run.steer": {
        const payload = SteerPayload.parse(parsed.payload);
        await mkdir(join(payload.root, "runtime"), { recursive: true });
        await writeFile(join(payload.root, "runtime", "steering.txt"), `${payload.instruction}\n`, "utf8");
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true };
      }
      case "plan.generate": {
        const payload = RootPayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        const plan = await createResearchAgentsFromManifest(snapshot.manifest, { env: await envWithKeychain() }).createPlan(snapshot.manifest.question);
        await savePlan(payload.root, plan);
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
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, plan: adopted };
      }
      case "patch.approve": {
        const payload = PatchPayload.parse(parsed.payload);
        const result = await approvePatch(payload.root, payload.patchId);
        await broadcastStateChanged(parsed.command, payload.root);
        return result;
      }
      case "patch.reject": {
        const payload = PatchPayload.parse(parsed.payload);
        const patch = await rejectPatch(payload.root, payload.patchId);
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, patch };
      }
      case "export.markdown": {
        const payload = RootPayload.parse(parsed.payload);
        return { body: await exportMarkdown(payload.root) };
      }
      case "citations.verify": {
        const payload = RootPayload.parse(parsed.payload);
        const snapshot = await loadProject(payload.root);
        const verified = await Promise.all(snapshot.literature.map((item) => verifyLiteratureItem(item)));
        await saveLiterature(payload.root, verified);
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
        await broadcastStateChanged(parsed.command, payload.root);
        return { ok: true, node: updated, execution: result };
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
