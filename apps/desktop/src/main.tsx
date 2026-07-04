import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { create } from "zustand";
import "./styles.css";

type Role = "planner" | "executor" | "reviewer" | "synthesizer" | "system" | "user";
type Panel = "setup" | "tutorial" | "manuscript" | "readiness" | "graph" | "evidence" | "citations";
type KeyProvider = "openrouter" | "openai" | "anthropic" | "customOpenAICompatible";
type RoleName = "planner" | "executor" | "reviewer";
interface RoleConfig { provider: KeyProvider; model: string; reasoningEffort: "none" | "low" | "medium" | "high" }
const isTauri = () => "__TAURI_INTERNALS__" in window;
const defaultRoles = (): Record<RoleName, RoleConfig> => ({
  planner: { provider: "openrouter", model: "openrouter/auto", reasoningEffort: "none" },
  executor: { provider: "openrouter", model: "openrouter/auto", reasoningEffort: "none" },
  reviewer: { provider: "openrouter", model: "openrouter/auto", reasoningEffort: "none" }
});

interface StreamLine {
  key: string;
  role: Role;
  purpose: string;
  content: string;
  reasoning: string;
  usage?: { promptTokens?: number; completionTokens?: number; reasoningTokens?: number };
  startedAt: number;
  updatedAt: number;
  latencyMs: number;
  costLabel: string;
}

interface TimelineEvent {
  id: number;
  role: Role;
  title: string;
  detail: string;
  phase: string;
  severity?: "ok" | "warning" | "critical";
}

interface LocalServerResult {
  port: number;
  url: string;
  message: string;
}

interface Readiness {
  ready: boolean;
  readinessScore: number;
  foundSections: number;
  requiredSections: number;
  supportedClaims: number;
  totalNodeCount: number;
  criticalCount: number;
  executableErrorCount: number;
  staleSupportRefCount: number;
  orphanResultClaimCount: number;
  missingArtifactCount: number;
  ungroundedResultNumbers: string[];
  internalLeakTerms: string[];
}

interface ProjectSnapshot {
  manifest: { name: string; question: string };
  manuscriptBody: string;
  evidence: Array<{ id: string; title: string; path?: string; summary?: string; validation: string; review: string }>;
  claims: Array<{ id: string; text: string; validation: string; review: string }>;
  literature: Array<{ id: string; title: string; citationKey: string; status: string; doi?: string; url?: string }>;
  patches: Array<{ id: string; status: string; targetSection: string; operation: string; newBody: string; appliedAt?: string; warnings: Array<{ message: string; blocking: boolean }> }>;
  lanes: Array<{ id: string; name: string; nodes: Array<{ id: string; title: string; status: string }> }>;
  plans: Array<{ id: string; title: string; purpose: string; approved: boolean }>;
}

interface AppState {
  serverUrl: string;
  projectRoot: string;
  question: string;
  useMock: boolean;
  activePanel: Panel;
  busy: boolean;
  status: string;
  events: TimelineEvent[];
  streamLines: StreamLine[];
  consoleQuery: string;
  consoleRoleFilter: "all" | Role;
  intervention: { title: string; detail: string } | undefined;
  snapshot?: ProjectSnapshot;
  readiness: Readiness | undefined;
  keyProvider: KeyProvider;
  keyValue: string;
  keyStatus: Record<string, string>;
  tutorialLang: "en" | "ja";
  dataFiles: string[];
  roles: Record<RoleName, RoleConfig>;
  setPanel: (panel: Panel) => void;
  setField: <K extends "serverUrl" | "projectRoot" | "question">(key: K, value: string) => void;
  setUseMock: (value: boolean) => void;
  setKeyProvider: (value: KeyProvider) => void;
  setKeyValue: (value: string) => void;
  setTutorialLang: (value: "en" | "ja") => void;
  saveKey: () => Promise<void>;
  refreshKeys: () => Promise<void>;
  setRole: (role: RoleName, patch: Partial<RoleConfig>) => void;
  saveModels: () => Promise<void>;
  browseProjectFolder: () => Promise<void>;
  addDataFiles: () => Promise<void>;
  refreshData: () => Promise<void>;
  generatePlan: () => Promise<void>;
  adoptPlan: (planId: string) => Promise<void>;
  setConsoleQuery: (value: string) => void;
  setConsoleRoleFilter: (value: "all" | Role) => void;
  appendEvent: (event: TimelineEvent) => void;
  appendStreamDelta: (event: { runId: string; role: Role; purpose: string; kind: string; text?: string; usage?: StreamLine["usage"] }) => void;
  refreshSnapshot: () => Promise<void>;
  stopRun: () => Promise<void>;
  resumeRun: () => Promise<void>;
  steer: (instruction: string) => Promise<void>;
  approvePatch: (patchId: string) => Promise<void>;
  rejectPatch: (patchId: string) => Promise<void>;
  command: (command: string, payload?: unknown) => Promise<unknown>;
  connect: () => Promise<void>;
  createProject: () => Promise<void>;
  run: () => Promise<void>;
  verify: () => Promise<void>;
  exportMarkdown: () => Promise<void>;
}

const useAppState = create<AppState>((set, get) => ({
  serverUrl: "http://127.0.0.1:8787",
  projectRoot: "/tmp/nullius-gui-demo",
  question: "Does the synthetic slope equal 2.0?",
  useMock: true,
  activePanel: "setup",
  busy: false,
  status: "Desktop starts the local server automatically. In a browser, start `nullius serve` and connect.",
  events: [],
  streamLines: [],
  consoleQuery: "",
  consoleRoleFilter: "all",
  intervention: undefined,
  readiness: undefined,
  keyProvider: "openrouter",
  keyValue: "",
  keyStatus: {},
  tutorialLang: "en",
  dataFiles: [],
  roles: defaultRoles(),
  setPanel: (panel) => set({ activePanel: panel }),
  setField: (key, value) => set({ [key]: value }),
  setUseMock: (value) => set({ useMock: value }),
  setKeyProvider: (value) => set({ keyProvider: value }),
  setKeyValue: (value) => set({ keyValue: value }),
  setTutorialLang: (value) => set({ tutorialLang: value }),
  saveKey: async () => {
    const { keyProvider, keyValue } = get();
    if (!keyValue.trim()) return;
    try {
      const result = await get().command("keys.set", { provider: keyProvider, apiKey: keyValue.trim(), persist: true }) as { stored: string };
      set({
        keyValue: "",
        status: result.stored === "keychain"
          ? `${keyProvider} key saved to the OS keychain`
          : `${keyProvider} key kept in memory for this session (set an environment variable to persist it)`
      });
      await get().refreshKeys();
    } catch (error) {
      set({ status: `Key save failed: ${String(error)}` });
    }
  },
  setRole: (role, patch) => set((state) => ({ roles: { ...state.roles, [role]: { ...state.roles[role], ...patch } } })),
  saveModels: async () => {
    try {
      await get().command("project.configure", { root: get().projectRoot, roles: get().roles });
      set({ status: "Models saved to the project" });
    } catch (error) {
      set({ status: `Model save failed: ${String(error)}` });
    }
  },
  browseProjectFolder: async () => {
    if (!isTauri()) return;
    const picked = await openDialog({ directory: true, multiple: false, title: "Choose the project folder" });
    if (typeof picked === "string") set({ projectRoot: picked });
  },
  addDataFiles: async () => {
    if (!isTauri()) return;
    const picked = await openDialog({ multiple: true, title: "Choose input data files" });
    const files = Array.isArray(picked) ? picked : typeof picked === "string" ? [picked] : [];
    if (files.length === 0) return;
    try {
      const result = await get().command("data.import", { root: get().projectRoot, files }) as { files: string[] };
      set({ dataFiles: result.files, status: `${files.length} data file(s) added; Full Auto will read them from ./data` });
    } catch (error) {
      set({ status: `Data import failed: ${String(error)}` });
    }
  },
  refreshData: async () => {
    try {
      const result = await get().command("data.list", { root: get().projectRoot }) as { files: string[] };
      set({ dataFiles: result.files });
    } catch {
      set({ dataFiles: [] });
    }
  },
  refreshKeys: async () => {
    try {
      const result = await get().command("keys.status") as { status: Record<string, string> };
      set({ keyStatus: result.status });
    } catch {
      // Server not reachable yet; the Setup panel will retry on connect.
    }
  },
  generatePlan: async () => {
    set({ busy: true, status: "Generating plan..." });
    try {
      await get().command("plan.generate", { root: get().projectRoot });
      await get().refreshSnapshot();
      set({ status: "Plan generated: read it, then adopt it" });
    } catch (error) {
      set({ status: `Plan generation failed: ${String(error)}` });
    } finally {
      set({ busy: false });
    }
  },
  adoptPlan: async (planId) => {
    try {
      await get().command("plan.adopt", { root: get().projectRoot, planId });
      await get().refreshSnapshot();
      set({ status: "Plan adopted: protocol locked" });
    } catch (error) {
      set({ status: `Adopt failed: ${String(error)}` });
    }
  },
  setConsoleQuery: (value) => set({ consoleQuery: value }),
  setConsoleRoleFilter: (value) => set({ consoleRoleFilter: value }),
  appendEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  appendStreamDelta: (event) => set((state) => {
    const key = `${event.runId}:${event.role}:${event.purpose}`;
    const now = Date.now();
    const existing = state.streamLines.find((line) => line.key === key);
    const line: StreamLine = existing ?? { key, role: event.role, purpose: event.purpose, content: "", reasoning: "", startedAt: now, updatedAt: now, latencyMs: 0, costLabel: "$—" };
    const nextUsage = event.kind === "usage" ? event.usage : line.usage;
    const updated: StreamLine = {
      ...line,
      content: line.content + (event.kind === "content" ? event.text ?? "" : ""),
      reasoning: line.reasoning + (event.kind === "reasoning" ? event.text ?? "" : ""),
      updatedAt: now,
      latencyMs: now - line.startedAt,
      costLabel: nextUsage ? "$—" : line.costLabel,
      ...(nextUsage ? { usage: nextUsage } : {})
    };
    return { streamLines: existing ? state.streamLines.map((item) => item.key === key ? updated : item) : [...state.streamLines, updated] };
  }),
  command: async (command, payload) => {
    const response = await fetch(`${get().serverUrl}/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schemaVersion: 1, command, payload })
    });
    const json = await response.json() as { ok: boolean; result?: unknown; error?: string };
    if (!response.ok || !json.ok) throw new Error(json.error ?? `Command failed: ${command}`);
    return json.result;
  },
  refreshSnapshot: async () => {
    const snapshot = await get().command("project.open", { root: get().projectRoot }) as ProjectSnapshot;
    set({ snapshot, question: snapshot.manifest.question });
  },
  stopRun: async () => {
    try {
      await get().command("run.stop", { root: get().projectRoot });
      set({ busy: false, status: "Stop requested" });
    } catch (error) {
      set({ status: `Stop failed: ${String(error)}` });
    }
  },
  resumeRun: async () => {
    set({ busy: true, status: "Resuming...", intervention: undefined });
    try {
      await get().command("run.resume", { root: get().projectRoot, mock: get().useMock, backend: "auto" });
      await get().refreshSnapshot();
      await get().verify();
      set({ status: "Run resumed" });
    } catch (error) {
      set({ status: `Resume failed: ${String(error)}` });
    } finally {
      set({ busy: false });
    }
  },
  steer: async (instruction) => {
    if (!instruction.trim()) return;
    try {
      await get().command("run.steer", { root: get().projectRoot, instruction });
      set({ status: "Steering instruction saved" });
    } catch (error) {
      set({ status: `Steering failed: ${String(error)}` });
    }
  },
  approvePatch: async (patchId) => {
    try {
      await get().command("patch.approve", { root: get().projectRoot, patchId });
      await get().refreshSnapshot();
      await get().verify();
      set({ status: "Patch approved" });
    } catch (error) {
      set({ status: `Approve failed: ${String(error)}` });
    }
  },
  rejectPatch: async (patchId) => {
    try {
      await get().command("patch.reject", { root: get().projectRoot, patchId });
      await get().refreshSnapshot();
      await get().verify();
      set({ status: "Patch rejected" });
    } catch (error) {
      set({ status: `Reject failed: ${String(error)}` });
    }
  },
  connect: async () => {
    set({ busy: true, status: "Connecting..." });
    try {
      const snapshot = await get().command("project.open", { root: get().projectRoot }) as ProjectSnapshot;
      set({ snapshot, question: snapshot.manifest.question, status: "Connected", activePanel: "manuscript" });
      await get().refreshKeys();
      await get().refreshData();
      await get().verify();
    } catch (error) {
      set({ status: `Connect failed: ${String(error)}` });
    } finally {
      set({ busy: false });
    }
  },
  createProject: async () => {
    set({ busy: true, status: "Creating project..." });
    const question = get().question;
    try {
      await get().command("project.create", {
        root: get().projectRoot,
        manifest: {
          schemaVersion: 1,
          name: question.trim() || "Untitled Nullius Project",
          question,
          roles: get().roles,
          settings: { maxLanes: 3, depth: "standard", sandboxPolicy: "required", selfCorrectionRounds: 2 },
          amendments: []
        }
      });
      set({ status: "Project created" });
      await get().connect();
    } catch (error) {
      set({ status: `Create failed: ${String(error)}` });
    } finally {
      set({ busy: false });
    }
  },
  run: async () => {
    set({ busy: true, status: "Running Full Auto..." });
    try {
      await get().command("run.start", { root: get().projectRoot, mock: get().useMock, backend: "auto" });
      await get().refreshSnapshot();
      set({ status: "Run completed", activePanel: "manuscript" });
      await get().verify();
    } catch (error) {
      set({ status: `Run failed: ${String(error)}` });
    } finally {
      set({ busy: false });
    }
  },
  verify: async () => {
    try {
      const result = await get().command("gates.verify", { root: get().projectRoot, depth: "standard" }) as { readiness: Readiness };
      set({ readiness: result.readiness, status: result.readiness.ready ? "Ready" : "Not ready" });
    } catch (error) {
      set({ status: `Verify failed: ${String(error)}` });
    }
  },
  exportMarkdown: async () => {
    try {
      const result = await get().command("export.markdown", { root: get().projectRoot }) as { body: string };
      set((state) => state.snapshot
        ? { snapshot: { ...state.snapshot, manuscriptBody: result.body }, status: "Markdown loaded" }
        : { status: "Markdown loaded" });
    } catch (error) {
      set({ status: `Export failed: ${String(error)}` });
    }
  }
}));

function App() {
  const activePanel = useAppState((state) => state.activePanel);
  const setPanel = useAppState((state) => state.setPanel);
  const serverUrl = useAppState((state) => state.serverUrl);
  const appendEvent = useAppState((state) => state.appendEvent);

  useEffect(() => {
    if (!("__TAURI_INTERNALS__" in window)) return;
    let cancelled = false;
    useAppState.setState({ status: "Starting local server..." });
    void invoke<LocalServerResult>("ensure_local_server", { port: 0 })
      .then((result) => {
        if (cancelled) return;
        useAppState.setState({ serverUrl: result.url, status: result.message });
        void useAppState.getState().refreshKeys();
      })
      .catch((error) => {
        if (cancelled) return;
        useAppState.setState({ status: `Local server failed to start: ${String(error)}` });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const url = serverUrl.replace(/^http/, "ws");
    let socket: WebSocket | undefined;
    const pendingStream: Array<{ runId: string; role: Role; purpose: string; kind: string; text?: string; usage?: StreamLine["usage"] }> = [];
    const flush = () => {
      if (pendingStream.length === 0) return;
      const batch = pendingStream.splice(0);
      const appendStreamDelta = useAppState.getState().appendStreamDelta;
      for (const item of batch) appendStreamDelta(item);
    };
    const interval = window.setInterval(flush, 67);
    try {
      socket = new WebSocket(url);
      socket.onmessage = (message) => {
        const payload = JSON.parse(message.data as string) as {
          type?: string;
          readiness?: Readiness;
          runId?: string;
          role?: Role;
          purpose?: string;
          kind?: string;
          text?: string;
          usage?: StreamLine["usage"];
          event?: { seq: number; role: Role; kind: string; title: string; detail?: string };
        };
        if (payload.type === "state.changed") {
          useAppState.setState({ readiness: payload.readiness });
        }
        if (payload.type === "stream.delta" && payload.runId && payload.role && payload.purpose && payload.kind) {
          pendingStream.push({ runId: payload.runId, role: payload.role, purpose: payload.purpose, kind: payload.kind, ...(payload.text ? { text: payload.text } : {}), ...(payload.usage ? { usage: payload.usage } : {}) });
        }
        if (payload.type === "intervention.required" && payload.event) {
          useAppState.setState({ intervention: { title: payload.event.title, detail: payload.event.detail ?? "" }, status: payload.event.title });
        }
        if ((payload.type === "run.event" || payload.type === "intervention.required") && payload.event) {
          appendEvent({
            id: payload.event.seq,
            role: payload.event.role,
            phase: payload.event.kind,
            title: payload.event.title,
            detail: payload.event.detail ?? "",
            severity: payload.event.kind.includes("required") ? "warning" : "ok"
          });
        }
      };
    } catch {
      // HTTP-only usage is acceptable; the console will stay static until a run emits events.
    }
    return () => {
      window.clearInterval(interval);
      flush();
      socket?.close();
    };
  }, [serverUrl, appendEvent]);

  return (
    <main className="workbench">
      <Sidebar activePanel={activePanel} setPanel={setPanel} />
      <section className="main-pane">
        <Header />
        <Panel panel={activePanel} />
      </section>
      <MissionConsole />
    </main>
  );
}

function Sidebar(props: { activePanel: Panel; setPanel: (panel: Panel) => void }) {
  const snapshot = useAppState((state) => state.snapshot);
  const items: Array<[Panel, string]> = [
    ["setup", "Setup"],
    ["tutorial", "Tutorial"],
    ["manuscript", "Manuscript"],
    ["readiness", "Readiness"],
    ["graph", "DAG"],
    ["evidence", "Evidence"],
    ["citations", "Citations"]
  ];
  return (
    <aside className="sidebar">
      <div className="brand">Nullius</div>
      <div className="tagline">No model output enters the manuscript on its own authority.</div>
      <nav>
        {items.map(([id, label]) => (
          <button key={id} className={props.activePanel === id ? "active" : ""} onClick={() => props.setPanel(id)}>
            {label}
          </button>
        ))}
      </nav>
      <div className="sidebar-metrics">
        <span>Claims {snapshot?.claims.length ?? 0}</span>
        <span>Evidence {snapshot?.evidence.length ?? 0}</span>
        <span>Patches {snapshot?.patches.length ?? 0}</span>
      </div>
    </aside>
  );
}

function Header() {
  const question = useAppState((state) => state.question);
  const run = useAppState((state) => state.run);
  const verify = useAppState((state) => state.verify);
  const exportMarkdown = useAppState((state) => state.exportMarkdown);
  const busy = useAppState((state) => state.busy);
  return (
    <header className="header">
      <div>
        <p className="eyebrow">Evidence-gated research</p>
        <h1>{question}</h1>
      </div>
      <div className="header-actions">
        <button className="primary" disabled={busy} onClick={() => void run()}>{busy ? "Running…" : "Run Full Auto"}</button>
        <button disabled={busy} onClick={() => void verify()}>Verify gates</button>
        <button disabled={busy} onClick={() => void exportMarkdown()}>Export report</button>
      </div>
    </header>
  );
}

function Panel({ panel }: { panel: Panel }) {
  switch (panel) {
    case "setup": return <SetupPanel />;
    case "tutorial": return <TutorialPanel />;
    case "readiness": return <ReadinessPanel />;
    case "graph": return <DAGPanel />;
    case "evidence": return <EvidencePanel />;
    case "citations": return <CitationPanel />;
    case "manuscript": return <ManuscriptPanel />;
  }
}

function SetupPanel() {
  const state = useAppState();
  return (
    <div className="panel two-column">
      <section className="card">
        <h2><span className="step-chip">1</span>API Keys</h2>
        <p className="muted">On macOS the key is saved to the system Keychain. On Windows/Linux it is kept in memory until you close the app. Keys are never written to project files.</p>
        <label>Provider</label>
        <select value={state.keyProvider} onChange={(event) => state.setKeyProvider(event.currentTarget.value as KeyProvider)}>
          <option value="openrouter">OpenRouter (recommended: one key, many models)</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="customOpenAICompatible">Custom OpenAI-compatible</option>
        </select>
        <label>API key</label>
        <input
          type="password"
          value={state.keyValue}
          placeholder="sk-..."
          autoComplete="off"
          onChange={(event) => state.setKeyValue(event.currentTarget.value)}
        />
        <div className="button-stack">
          <button className="primary" disabled={!state.keyValue.trim()} onClick={() => void state.saveKey()}>Save key</button>
          <button onClick={() => void state.refreshKeys()}>Refresh status</button>
        </div>
        <div className="key-status">
          {Object.entries(state.keyStatus).map(([provider, source]) => (
            <span key={provider} className={`key-badge ${source === "none" ? "missing" : "present"}`}>
              {provider}: {source === "none" ? "not set" : source}
            </span>
          ))}
        </div>
      </section>
      <section className="card">
        <h2><span className="step-chip">2</span>Project</h2>
        <label>Project folder</label>
        <div className="input-row">
          <input value={state.projectRoot} onChange={(event) => state.setField("projectRoot", event.currentTarget.value)} />
          {isTauri() ? <button onClick={() => void state.browseProjectFolder()}>Browse…</button> : null}
        </div>
        <label>Research question</label>
        <textarea value={state.question} onChange={(event) => state.setField("question", event.currentTarget.value)} />
        <label className="check-row">
          <input type="checkbox" checked={state.useMock} onChange={(event) => state.setUseMock(event.currentTarget.checked)} />
          Use deterministic mock agents (free demo, no API key)
        </label>
        <div className="button-stack">
          <button className="primary" onClick={() => void state.createProject()}>Create project</button>
          <button onClick={() => void state.connect()}>Open existing</button>
        </div>
        <label>Input data files</label>
        <p className="muted">Files added here land in the project's data/ folder. Every Full Auto run copies them into the analysis working directory, tells the executor to read them from ./data/, and bases the research on them. No files = the plan generates its own data.</p>
        <div className="key-status">
          {state.dataFiles.length === 0 ? <span className="key-badge">no data files</span> : state.dataFiles.map((name) => <span className="key-badge present" key={name}>{name}</span>)}
        </div>
        <div className="button-stack">
          {isTauri() ? <button onClick={() => void state.addDataFiles()}>Add data files…</button> : <span className="muted">In a browser, copy files into &lt;project&gt;/data/ manually.</span>}
        </div>
        <label>AI models (per role)</label>
        {(["planner", "executor", "reviewer"] as RoleName[]).map((role) => (
          <div className="role-row" key={role}>
            <span className="role-name">{role}</span>
            <select value={state.roles[role].provider} onChange={(event) => state.setRole(role, { provider: event.currentTarget.value as KeyProvider })}>
              <option value="openrouter">OpenRouter</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="customOpenAICompatible">Custom</option>
            </select>
            <input value={state.roles[role].model} placeholder="openrouter/auto" onChange={(event) => state.setRole(role, { model: event.currentTarget.value })} />
          </div>
        ))}
        <div className="button-stack">
          <button onClick={() => void state.saveModels()}>Save models</button>
        </div>
        <label>Server URL</label>
        <input value={state.serverUrl} onChange={(event) => state.setField("serverUrl", event.currentTarget.value)} />
        <p className="muted">The desktop app starts the local server automatically. In a browser, run `node packages/cli/dist/index.js serve --port 8787`, then open the project.</p>
      </section>
      <section className="card">
        <h2><span className="step-chip">3</span>Plans</h2>
        <p className="muted">Generate a plan, read it, then adopt it. Adoption locks the success criteria; Full Auto pauses until a plan is adopted.</p>
        <div className="button-stack">
          <button disabled={state.busy} onClick={() => void state.generatePlan()}>Generate Plan</button>
        </div>
        {(state.snapshot?.plans ?? []).length === 0 ? <p className="muted">No plans yet. Create a project first, or press Run once; it drafts a plan and pauses for adoption.</p> : state.snapshot?.plans.map((plan) => (
          <div className="plan-row" key={plan.id}>
            <div>
              <strong>{plan.title}</strong>
              <p className="muted">{plan.purpose}</p>
            </div>
            {plan.approved ? <span className="key-badge present">adopted</span> : <button className="primary" onClick={() => void state.adoptPlan(plan.id)}>Adopt</button>}
          </div>
        ))}
      </section>
    </div>
  );
}

const tutorialSteps: Array<{ en: { title: string; body: string }; ja: { title: string; body: string } }> = [
  {
    en: { title: "What is Nullius?", body: "Nullius runs AI research without trusting the AI. Models plan and write analysis code, the code runs in a sandbox, and deterministic gates verify every number and citation before anything can enter the report. You supervise and approve." },
    ja: { title: "Nulliusとは?", body: "NulliusはAIに研究をさせつつ、AIの言葉を一切信用しないアプリです。モデルが計画と解析コードを作り、コードはサンドボックスで実行され、数値と引用は決定論的なゲートが検証してからしかレポートに入りません。あなたは監督と承認をします。" }
  },
  {
    en: { title: "Step 1: Get an API key", body: "Easiest: OpenRouter: go to openrouter.ai, sign up, open the Keys page, and create a key (starts with sk-or-). One key gives access to many models. OpenAI or Anthropic keys also work." },
    ja: { title: "手順1: APIキーを入手", body: "一番簡単なのはOpenRouterです。openrouter.ai でアカウントを作り、Keysページでキーを作成します(sk-or- で始まります)。1つのキーで多くのモデルが使えます。OpenAIやAnthropicのキーでもOKです。" }
  },
  {
    en: { title: "Step 2: Save the key", body: "Open Setup → API Keys, choose the provider, paste the key, and press Save. macOS: stored securely in the system Keychain (persists). Windows/Linux: kept only while the app is open. To make it permanent, set an environment variable before launching (Windows PowerShell: setx OPENROUTER_API_KEY \"sk-or-...\" then restart; Linux: add export OPENROUTER_API_KEY=sk-or-... to ~/.bashrc)." },
    ja: { title: "手順2: キーを保存", body: "Setup → API Keys でプロバイダを選び、キーを貼り付けてSaveを押します。macOS: システムのキーチェーンに安全に保存され、次回も使えます。Windows/Linux: アプリを閉じるまでの一時保存です。恒久化するには起動前に環境変数を設定してください(Windows PowerShell: setx OPENROUTER_API_KEY \"sk-or-...\" のあと再起動 / Linux: ~/.bashrc に export OPENROUTER_API_KEY=sk-or-... を追記)。" }
  },
  {
    en: { title: "Step 3: Create a project", body: "In Setup → Project, press Browse… to pick an empty folder, write your research question in plain language, and press Create project. Untick \"Use deterministic mock agents\" for real research (leave it ON to try the app for free without any API key)." },
    ja: { title: "手順3: プロジェクト作成", body: "Setup → Project で Browse… を押して空のフォルダを選び、研究の問いを普通の言葉で書いて Create project を押します。本番の研究では「Use deterministic mock agents」のチェックを外してください(ONのままだとAPIキー不要の無料お試しモードです)。" }
  },
  {
    en: { title: "Step 4: Add your data (optional)", body: "Press \"Add data files…\" and pick your CSV, JSON, or text files. They are copied into the project's data/ folder, and every Full Auto run automatically places them at ./data/ in the analysis working directory and instructs the AI to base the research on them. With no files, the AI generates the data the plan requires." },
    ja: { title: "手順4: データを追加(任意)", body: "「Add data files…」を押してCSV・JSON・テキストなどを選ぶだけです。ファイルはプロジェクトの data/ フォルダに入り、Full Auto実行のたびに自動で解析作業ディレクトリの ./data/ に配置され、AIには「このデータに基づいて研究せよ」と指示されます。ファイルがなければAIが計画に必要なデータを自分で生成します。" }
  },
  {
    en: { title: "Step 5: Choose AI models (optional)", body: "In Setup → Project → AI models, each of the three roles (planner / executor / reviewer) has its own provider and model. The default openrouter/auto works out of the box; type any model id (for example anthropic/claude-sonnet-4.5 or openai/gpt-4o-mini) and press Save models." },
    ja: { title: "手順5: AIモデルを選ぶ(任意)", body: "Setup → Project → AI models で、3つの役割(planner / executor / reviewer)ごとにプロバイダとモデルを設定できます。既定の openrouter/auto のままでも動きます。好きなモデルID(例: anthropic/claude-sonnet-4.5、openai/gpt-4o-mini)を入力して Save models を押してください。" }
  },
  {
    en: { title: "Step 6: Generate and adopt a plan", body: "In Setup → Plans, press Generate Plan, read the proposal, then press Adopt. Adoption freezes the success criteria so the AI cannot move the goalposts later. Full Auto will not proceed without an adopted plan." },
    ja: { title: "手順6: 計画を生成して採択", body: "Setup → Plans で Generate Plan を押し、提案を読んでから Adopt を押します。採択すると成功基準が凍結され、AIが後からゴールを動かせなくなります。採択された計画がないと Full Auto は先に進みません。" }
  },
  {
    en: { title: "Step 7: Run Full Auto", body: "Press Run (top right). Watch the Mission Console on the right: live model output, reasoning (collapsible), code execution, and reviews stream in real time. If the run pauses with \"Intervention required\", read the card, optionally type a steering instruction, and press Resume. Stop aborts immediately." },
    ja: { title: "手順7: Full Autoを実行", body: "右上のRunを押します。右側のMission Consoleに、モデルの出力・推論(折りたたみ)・コード実行・レビューがリアルタイムで流れます。「Intervention required」で止まったらカードを読み、必要なら指示を書いて Resume を押します。Stopで即中断できます。" }
  },
  {
    en: { title: "Step 8: Review the manuscript", body: "Open the Manuscript tab. Each staged patch shows its gate warnings; a patch with blocking warnings (fabricated numbers, unverified citations) cannot be applied at all. Approve or Reject the rest yourself." },
    ja: { title: "手順8: 原稿をレビュー", body: "Manuscriptタブを開きます。各パッチにはゲートの警告が表示され、ブロッキング警告(捏造数値・未検証引用など)のあるパッチはそもそも適用できません。それ以外はあなたがApprove / Rejectします。" }
  },
  {
    en: { title: "Step 9: Check readiness and export", body: "The Readiness tab shows a traffic light per gate. When everything is green, press Export. The final report is at <project folder>/manuscript/report.md, a plain Markdown file you can open anywhere." },
    ja: { title: "手順9: Readiness確認とエクスポート", body: "Readinessタブでゲートごとの信号を確認します。全部グリーンになったらExportを押してください。最終レポートは <プロジェクトフォルダ>/manuscript/report.md にあり、どこでも開ける普通のMarkdownファイルです。" }
  },
  {
    en: { title: "Troubleshooting", body: "Run fails immediately with an auth error → the key is missing or wrong (check Setup → API Keys). \"No eligible lane\" or a plan-approval pause → adopt a plan in Setup → Plans. Nothing costs money while the mock checkbox is ON." },
    ja: { title: "困ったとき", body: "実行が認証エラーで即失敗 → キー未設定か間違いです(Setup → API Keysを確認)。「No eligible lane」や計画承認待ちで停止 → Setup → Plans で計画をAdoptしてください。mockチェックがONの間は一切課金されません。" }
  }
];

function TutorialPanel() {
  const lang = useAppState((state) => state.tutorialLang);
  const setLang = useAppState((state) => state.setTutorialLang);
  return (
    <div className="panel">
      <div className="lang-toggle">
        <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>English</button>
        <button className={lang === "ja" ? "active" : ""} onClick={() => setLang("ja")}>日本語</button>
      </div>
      <div className="tutorial-list">
        {tutorialSteps.map((step, index) => (
          <section className="tutorial-step" key={step.en.title}>
            <span className="step-num">{index === 0 ? "◎" : index}</span>
            <div>
              <h2>{step[lang].title}</h2>
              <p>{step[lang].body}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ManuscriptPanel() {
  const snapshot = useAppState((state) => state.snapshot);
  const approvePatch = useAppState((state) => state.approvePatch);
  const rejectPatch = useAppState((state) => state.rejectPatch);
  const body = snapshot?.manuscriptBody.trim() || "No manuscript yet. Create a project and run Full Auto.";
  return (
    <div className="panel manuscript-grid">
      <article className="paper">
        {renderMarkdownLike(body)}
      </article>
      <aside className="patch-card">
        <h2>Staged Patches</h2>
        {(snapshot?.patches ?? []).length === 0 ? <p className="muted">No staged patches.</p> : snapshot?.patches.map((patch) => {
          const canApprove = patch.status === "draft" || patch.status === "needsRevision" || patch.status === "approved";
          const hasBlockingWarnings = patch.warnings.some((warning) => warning.blocking);
          return (
            <div className="patch-entry" key={patch.id}>
              <div className="patch-head">
                <strong>{patch.status}</strong>
                <em>{patch.operation} · {patch.targetSection}</em>
              </div>
              <span>{patch.id}</span>
              <pre className="patch-preview">{patch.newBody.slice(0, 900)}</pre>
              {patch.warnings.map((warning) => <div className={warning.blocking ? "gate-bad" : "gate-ok"} key={warning.message}>{warning.message}</div>)}
              <div className="patch-actions">
                <button disabled={!canApprove || hasBlockingWarnings || Boolean(patch.appliedAt)} onClick={() => void approvePatch(patch.id)}>Approve</button>
                <button disabled={patch.status === "rejected" || Boolean(patch.appliedAt)} onClick={() => void rejectPatch(patch.id)}>Reject</button>
              </div>
            </div>
          );
        })}
      </aside>
    </div>
  );
}

function ReadinessPanel() {
  const readiness = useAppState((state) => state.readiness);
  const gates = readiness
    ? [
        ["Required sections", readiness.foundSections >= Math.min(readiness.requiredSections, 6), `${readiness.foundSections}/${readiness.requiredSections}`],
        ["Supported claims", readiness.supportedClaims > 0, String(readiness.supportedClaims)],
        ["No critical reviews", readiness.criticalCount === 0, String(readiness.criticalCount)],
        ["No execution errors", readiness.executableErrorCount === 0, String(readiness.executableErrorCount)],
        ["No stale refs", readiness.staleSupportRefCount === 0, String(readiness.staleSupportRefCount)],
        ["No missing artifacts", readiness.missingArtifactCount === 0, String(readiness.missingArtifactCount)]
      ] as const
    : [];
  if (!readiness) {
    return (
      <div className="panel">
        <p className="empty-state">No gate report yet. Press "Verify gates" in the header, or run Full Auto; the six readiness gates will light up here.</p>
      </div>
    );
  }
  return (
    <div className="panel">
      <section className="readiness-score">
        <span>{Math.round(readiness.readinessScore * 100)}%</span>
        <p>{readiness.ready ? "Ready for export" : "Not ready"}</p>
      </section>
      <div className="gate-list">
        {gates.map(([label, ok, value]) => (
          <div className="gate" key={label}>
            <span className={`dot ${ok ? "ok" : "bad"}`} />
            {label}
            <em>{value}</em>
          </div>
        ))}
      </div>
      {readiness.ungroundedResultNumbers.length > 0 ? (
        <p className="gate-bad block-reason">Ungrounded numbers in the manuscript: {readiness.ungroundedResultNumbers.join(", ")}</p>
      ) : null}
      {readiness.internalLeakTerms.length > 0 ? (
        <p className="gate-bad block-reason">Internal terms leaked into prose: {readiness.internalLeakTerms.join(", ")}</p>
      ) : null}
    </div>
  );
}

function DAGPanel() {
  const snapshot = useAppState((state) => state.snapshot);
  const graphNodes: Node[] = snapshot?.lanes.flatMap((lane, laneIndex) =>
    lane.nodes.map((node, nodeIndex) => ({
      id: node.id,
      position: { x: 240 * nodeIndex, y: 120 * laneIndex },
      data: { label: `${node.title}\n${node.status}` },
      type: "default"
    }))
  ) ?? [];
  const graphEdges: Edge[] = snapshot?.lanes.flatMap((lane) =>
    lane.nodes.slice(1).flatMap((node, index) => {
      const previous = lane.nodes[index];
      return previous ? [{ id: `${previous.id}-${node.id}`, source: previous.id, target: node.id }] : [];
    })
  ) ?? [];
  if (graphNodes.length === 0) {
    return (
      <div className="panel">
        <p className="empty-state">No research nodes yet. Each lane's generated-and-executed analysis steps appear here as a graph once Full Auto runs.</p>
      </div>
    );
  }
  return (
    <div className="panel graph-panel">
      <ReactFlow nodes={graphNodes} edges={graphEdges} fitView>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

function EvidencePanel() {
  const snapshot = useAppState((state) => state.snapshot);
  return (
    <div className="panel">
      <section className="trace">
        <h2>Evidence</h2>
        {(snapshot?.evidence ?? []).length === 0 ? <p className="empty-state">No evidence yet. Every artifact produced by a sandboxed run lands here with its hash and review status. Run Full Auto to collect some.</p> : null}
        {(snapshot?.evidence ?? []).map((item) => (
          <div className="trace-row" key={item.id}>
            <strong>{item.title}</strong>
            <span>{item.path ?? "inline"} · {item.validation}/{item.review}</span>
          </div>
        ))}
      </section>
    </div>
  );
}

function CitationPanel() {
  const snapshot = useAppState((state) => state.snapshot);
  return (
    <div className="panel">
      <section className="card">
        <h2>Literature</h2>
        {(snapshot?.literature ?? []).length === 0 ? <div className="empty-state">No citations yet. Literature cited in the manuscript appears here with its verification status; only Crossref-verified entries can enter the report.</div> : snapshot?.literature.map((item) => (
          <div className="trace-row" key={item.id}>
            <strong>{item.citationKey}</strong>
            <span>{item.title} · {item.status}</span>
          </div>
        ))}
      </section>
    </div>
  );
}

function MissionConsole() {
  const events = useAppState((state) => state.events);
  const streamLines = useAppState((state) => state.streamLines);
  const status = useAppState((state) => state.status);
  const query = useAppState((state) => state.consoleQuery);
  const roleFilter = useAppState((state) => state.consoleRoleFilter);
  const setQuery = useAppState((state) => state.setConsoleQuery);
  const setRoleFilter = useAppState((state) => state.setConsoleRoleFilter);
  const timelineEnd = useRef<HTMLSpanElement>(null);
  const filteredEvents = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return events.filter((event) => {
      if (roleFilter !== "all" && event.role !== roleFilter) return false;
      if (!needle) return true;
      return `${event.role} ${event.phase} ${event.title} ${event.detail}`.toLowerCase().includes(needle);
    });
  }, [events, query, roleFilter]);

  useEffect(() => {
    timelineEnd.current?.scrollIntoView({ block: "end" });
  }, [filteredEvents.length]);

  return (
    <aside className="console">
      <div className="console-header">
        <span>Mission Console</span>
        <button onClick={() => timelineEnd.current?.scrollIntoView()}>Jump latest</button>
      </div>
      <InterventionCard status={status} />
      <div className="console-tools">
        <input value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search events" />
        <select value={roleFilter} onChange={(event) => setRoleFilter(event.currentTarget.value as "all" | Role)}>
          <option value="all">All roles</option>
          <option value="planner">Planner</option>
          <option value="executor">Executor</option>
          <option value="reviewer">Reviewer</option>
          <option value="synthesizer">Synthesizer</option>
          <option value="system">System</option>
          <option value="user">User</option>
        </select>
      </div>
      <div className="stream-stack">
        {streamLines.map((line) => (
          <section className={`stream-card ${line.role}`} key={line.key}>
            <div className="event-top">
              <strong>{line.role}</strong>
              <em>{line.purpose}</em>
              <span className="live-caret">▍</span>
            </div>
            {line.content ? <p>{line.content}</p> : null}
            {line.reasoning ? <details className="reasoning"><summary>Reasoning</summary><p>{line.reasoning}</p></details> : null}
            <div className="usage-badges">
              {line.usage ? <><span>prompt {line.usage.promptTokens ?? 0}</span><span>completion {line.usage.completionTokens ?? 0}</span><span>reasoning {line.usage.reasoningTokens ?? 0}</span></> : <span>tokens pending</span>}
              <span>latency {formatLatency(line.latencyMs)}</span>
              <span>cost {line.costLabel}</span>
            </div>
          </section>
        ))}
      </div>
      <div className="timeline">
        {filteredEvents.length === 0 ? <p className="muted-console">Quiet for now. Events from planning, execution, review, and gating stream here during a run.</p> : filteredEvents.map((event) => (
          <div className={`event ${event.role}`} key={`${event.id}-${event.phase}-${event.title}`}>
            <div className="event-top">
              <span>#{event.id}</span>
              <strong>{event.role}</strong>
              <em>{event.phase}</em>
            </div>
            <h3>{event.title}</h3>
            <p>{event.detail}</p>
          </div>
        ))}
        <span className="timeline-end" ref={timelineEnd} />
      </div>
    </aside>
  );
}

function InterventionCard({ status }: { status: string }) {
  const [instruction, setInstruction] = useState("");
  const intervention = useAppState((state) => state.intervention);
  const busy = useAppState((state) => state.busy);
  const stopRun = useAppState((state) => state.stopRun);
  const resumeRun = useAppState((state) => state.resumeRun);
  const steer = useAppState((state) => state.steer);
  const saveInstruction = async () => {
    await steer(instruction);
    setInstruction("");
  };
  return (
    <section className={`intervention ${intervention ? "needs-action" : ""}`}>
      <h2>{intervention?.title ?? "Status"}</h2>
      <p>{intervention?.detail || status}</p>
      <textarea value={instruction} onChange={(event) => setInstruction(event.currentTarget.value)} placeholder="Steering instruction for the next step" />
      <div className="intervention-actions">
        <button disabled={busy} onClick={() => void resumeRun()}>Resume</button>
        <button disabled={!busy} onClick={() => void stopRun()}>Stop</button>
        <button disabled={!instruction.trim()} onClick={() => void saveInstruction()}>Save instruction</button>
      </div>
    </section>
  );
}

function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function renderMarkdownLike(markdown: string): React.ReactNode[] {
  return markdown.split(/\n+/).map((line, index) => {
    if (line.startsWith("# ")) return <h2 key={index}>{line.slice(2)}</h2>;
    if (line.startsWith("## ")) return <h3 key={index}>{line.slice(3)}</h3>;
    if (line.trim().length === 0) return null;
    return <p key={index}>{line}</p>;
  });
}

createRoot(document.getElementById("root")!).render(<App />);
