import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { create } from "zustand";
import "./styles.css";

type Role = "planner" | "executor" | "reviewer" | "synthesizer" | "system" | "user";
type Panel = "setup" | "manuscript" | "readiness" | "graph" | "evidence" | "citations";

interface TimelineEvent {
  id: number;
  role: Role;
  title: string;
  detail: string;
  phase: string;
  severity?: "ok" | "warning" | "critical";
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
  consoleQuery: string;
  consoleRoleFilter: "all" | Role;
  intervention: { title: string; detail: string } | undefined;
  snapshot?: ProjectSnapshot;
  readiness: Readiness | undefined;
  setPanel: (panel: Panel) => void;
  setField: <K extends "serverUrl" | "projectRoot" | "question">(key: K, value: string) => void;
  setUseMock: (value: boolean) => void;
  setConsoleQuery: (value: string) => void;
  setConsoleRoleFilter: (value: "all" | Role) => void;
  appendEvent: (event: TimelineEvent) => void;
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
  status: "Start `node packages/cli/dist/index.js serve --port 8787`, then connect.",
  events: [],
  consoleQuery: "",
  consoleRoleFilter: "all",
  intervention: undefined,
  readiness: undefined,
  setPanel: (panel) => set({ activePanel: panel }),
  setField: (key, value) => set({ [key]: value }),
  setUseMock: (value) => set({ useMock: value }),
  setConsoleQuery: (value) => set({ consoleQuery: value }),
  setConsoleRoleFilter: (value) => set({ consoleRoleFilter: value }),
  appendEvent: (event) => set((state) => ({ events: [...state.events, event] })),
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
          roles: {
            planner: { provider: "openrouter", model: "openrouter/auto", reasoningEffort: "none" },
            executor: { provider: "openrouter", model: "openrouter/auto", reasoningEffort: "none" },
            reviewer: { provider: "openrouter", model: "openrouter/auto", reasoningEffort: "none" }
          },
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
    const url = serverUrl.replace(/^http/, "ws");
    let socket: WebSocket | undefined;
    try {
      socket = new WebSocket(url);
      socket.onmessage = (message) => {
        const payload = JSON.parse(message.data as string) as {
          type?: string;
          readiness?: Readiness;
          event?: { seq: number; role: Role; kind: string; title: string; detail?: string };
        };
        if (payload.type === "state.changed") {
          useAppState.setState({ readiness: payload.readiness });
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
    return () => socket?.close();
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
        <p className="eyebrow">Evidence-gated research OS</p>
        <h1>{question}</h1>
      </div>
      <div className="header-actions">
        <button className="primary" disabled={busy} onClick={() => void run()}>Run</button>
        <button disabled={busy} onClick={() => void verify()}>Verify</button>
        <button disabled={busy} onClick={() => void exportMarkdown()}>Export</button>
      </div>
    </header>
  );
}

function Panel({ panel }: { panel: Panel }) {
  switch (panel) {
    case "setup": return <SetupPanel />;
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
        <h2>Project</h2>
        <label>Server URL</label>
        <input value={state.serverUrl} onChange={(event) => state.setField("serverUrl", event.currentTarget.value)} />
        <label>Project folder</label>
        <input value={state.projectRoot} onChange={(event) => state.setField("projectRoot", event.currentTarget.value)} />
        <label>Question</label>
        <textarea value={state.question} onChange={(event) => state.setField("question", event.currentTarget.value)} />
        <label className="check-row">
          <input type="checkbox" checked={state.useMock} onChange={(event) => state.setUseMock(event.currentTarget.checked)} />
          Use deterministic mock agents
        </label>
      </section>
      <section className="card">
        <h2>Controls</h2>
        <p className="muted">Run `node packages/cli/dist/index.js serve --port 8787` before using the GUI against the local server.</p>
        <div className="button-stack">
          <button onClick={() => void state.connect()}>Connect</button>
          <button className="primary" onClick={() => void state.createProject()}>Create Project</button>
          <button onClick={() => void state.run()}>Run Full Auto</button>
          <button onClick={() => void state.verify()}>Verify Gates</button>
        </div>
      </section>
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
  return (
    <div className="panel">
      <section className="readiness-score">
        <span>{Math.round((readiness?.readinessScore ?? 0) * 100)}%</span>
        <p>{readiness?.ready ? "Ready for export" : "Not ready"}</p>
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
        {(snapshot?.literature ?? []).length === 0 ? <div className="empty-table">No citations yet</div> : snapshot?.literature.map((item) => (
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
      <div className="timeline">
        {filteredEvents.length === 0 ? <p className="muted-console">No matching live events.</p> : filteredEvents.map((event) => (
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

function renderMarkdownLike(markdown: string): React.ReactNode[] {
  return markdown.split(/\n+/).map((line, index) => {
    if (line.startsWith("# ")) return <h2 key={index}>{line.slice(2)}</h2>;
    if (line.startsWith("## ")) return <h3 key={index}>{line.slice(3)}</h3>;
    if (line.trim().length === 0) return null;
    return <p key={index}>{line}</p>;
  });
}

createRoot(document.getElementById("root")!).render(<App />);
