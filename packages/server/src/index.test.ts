import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import WebSocket from "ws";
import { loadProject } from "@nullius/core";
import { startNulliusServer } from "./index.js";

function manifest(question = "Does it work?") {
  return {
    schemaVersion: 1,
    name: "Server Test",
    question,
    roles: {
      planner: { provider: "openrouter", model: "mock", reasoningEffort: "none" },
      executor: { provider: "openrouter", model: "mock", reasoningEffort: "none" },
      reviewer: { provider: "openrouter", model: "mock", reasoningEffort: "none" }
    },
    settings: {
      maxLanes: 1,
      depth: "quick",
      sandboxPolicy: "required",
      selfCorrectionRounds: 1
    },
    amendments: []
  } as const;
}

describe("Nullius server", () => {
  it("handles project create, run.start, and gates.verify commands", async () => {
    const root = await mkdtemp(join(tmpdir(), "nullius-server-"));
    const server = await startNulliusServer();
    try {
      await server.command({ schemaVersion: 1, command: "project.create", payload: { root, manifest: manifest() } });
      const firstRun = await server.command({ schemaVersion: 1, command: "run.start", payload: { root, mock: true } });
      expect(firstRun).toMatchObject({ ready: false });
      const snapshot = await loadProject(root);
      const planId = snapshot.plans[0]?.id;
      expect(planId).toBeTruthy();
      await server.command({ schemaVersion: 1, command: "plan.adopt", payload: { root, planId } });
      const run = await server.command({ schemaVersion: 1, command: "run.start", payload: { root, mock: true } });
      expect(run).toMatchObject({ ready: true });
      const verify = await server.command({ schemaVersion: 1, command: "gates.verify", payload: { root, depth: "quick" } });
      expect(verify).toMatchObject({ readiness: { ready: true } });
    } finally {
      await server.close();
      await rm(root, { recursive: true, force: true });
    }
  }, 30_000);
  it("restricts CORS to local app origins", async () => {
    const server = await startNulliusServer();
    try {
      const allowed = await fetch(`http://127.0.0.1:${server.port}/health`, { headers: { Origin: "http://localhost:5173" } });
      expect(allowed.headers.get("access-control-allow-origin")).toBe("http://localhost:5173");
      const denied = await fetch(`http://127.0.0.1:${server.port}/health`, { headers: { Origin: "https://example.com" } });
      expect(denied.headers.get("access-control-allow-origin")).toBeNull();
    } finally {
      await server.close();
    }
  });

  it("broadcasts readiness on state changes and reports inactive stop", async () => {
    const root = await mkdtemp(join(tmpdir(), "nullius-server-ws-"));
    const server = await startNulliusServer();
    const socket = new WebSocket(`ws://127.0.0.1:${server.port}`);
    try {
      await new Promise<void>((resolve, reject) => {
        socket.once("open", resolve);
        socket.once("error", reject);
      });
      const messagePromise = new Promise<Record<string, unknown>>((resolve) => {
        socket.once("message", (data) => resolve(JSON.parse(String(data)) as Record<string, unknown>));
      });
      await server.command({ schemaVersion: 1, command: "project.create", payload: { root, manifest: manifest() } });
      const message = await messagePromise;
      expect(message).toMatchObject({ type: "state.changed", command: "project.create", root });
      expect(message.readiness).toBeTruthy();
      const stop = await server.command({ schemaVersion: 1, command: "run.stop", payload: { root } });
      expect(stop).toMatchObject({ ok: true, stopped: false });
    } finally {
      socket.close();
      await server.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
