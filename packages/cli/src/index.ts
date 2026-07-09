#!/usr/bin/env node
import { Command } from "commander";
import { access, mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";
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
  buildVerifyResult,
  verifyGateStatus,
  verifyLiteratureItem,
  type ActivityJournalInput,
  type ProjectManifest
} from "@nullius/core";
import { startNulliusServer } from "@nullius/server";
import { buildListResult, formatListLines, isListKind, listKinds } from "./list.js";

const program = new Command();
const providerChoices = ["openrouter", "openai", "anthropic", "customOpenAICompatible"] as const;
const effortChoices = ["none", "low", "medium", "high"] as const;

type RoleName = "planner" | "executor" | "reviewer";
type ProviderName = typeof providerChoices[number];
type ReasoningEffort = typeof effortChoices[number];
type RoleSettings = ProjectManifest["roles"];

interface ModelOptions {
  provider?: ProviderName;
  model?: string;
  reasoningEffort?: ReasoningEffort;
  plannerProvider?: ProviderName;
  plannerModel?: string;
  plannerEffort?: ReasoningEffort;
  executorProvider?: ProviderName;
  executorModel?: string;
  executorEffort?: ReasoningEffort;
  reviewerProvider?: ProviderName;
  reviewerModel?: string;
  reviewerEffort?: ReasoningEffort;
}

interface InitOptions extends ModelOptions {
  question?: string;
}

program
  .name("nullius")
  .description("Evidence-gated AI research workspace")
  .version("0.1.0");

const initCommand = program
  .command("init")
  .description("Create a Nullius project manifest")
  .argument("[folder]", "project folder", ".")
  .option("--question <question>", "research question");

addModelOptions(initCommand)
  .action(async (folder: string, options: InitOptions) => {
    const question = options.question ?? "";
    const manifest = ProjectManifestSchema.parse({
      schemaVersion: 1,
      name: question.trim() || "Untitled Nullius Project",
      question,
      roles: applyModelOptions(defaultRoles(), options),
      settings: {
        maxLanes: 3,
        depth: "standard",
        sandboxPolicy: "required",
        selfCorrectionRounds: 2
      },
      amendments: []
    });
    await createProject(folder, manifest);
    await recordCliActivity(folder, {
      role: "system",
      phase: "init.completed",
      title: "Project initialized",
      detail: manifest.question,
      command: "init"
    });
    process.stdout.write(`Created Nullius project at ${folder}\n`);
  });

program
  .command("verify")
  .description("Run deterministic gates")
  .argument("[folder]", "project folder", ".")
  .option("--json", "print JSON")
  .option("--depth <depth>", "quick, standard, or deep")
  .option("--gate <gate>", "numbers, citations, repro, or all", "all")
  .action(async (folder: string, options: { json?: boolean; depth?: "quick" | "standard" | "deep"; gate?: "numbers" | "citations" | "repro" | "all" }) => {
    await withCliActivity(folder, "verify", "Verify gates", async () => {
      const snapshot = await loadProject(folder);
      const depth = options.depth ?? snapshot.manifest.settings.depth;
      const report = readinessReport(snapshotToGateProject(snapshot), depth, projectGateIO(folder));
      const gate = options.gate ?? "all";
      const gateStatus = verifyGateStatus(gate, report);
      // Frozen contract (docs/verify-contract.md): buildVerifyResult validates the
      // payload against VerifyResultSchema, so a drifting shape throws here in CI
      // instead of silently changing the JSON consumers pin on.
      const result = buildVerifyResult(gate, report);
      await recordCliActivity(folder, {
        source: "gate",
        role: "system",
        phase: "verify.result",
        title: gateStatus.ok ? "Gates passed" : "Gates not ready",
        detail: `${gate}; readiness=${Math.round(report.readinessScore * 100)}%; failures=${gateStatus.failures.join("; ") || "none"}`,
        severity: gateStatus.ok ? "ok" : "warning",
        command: "verify",
        exitCode: gateStatus.ok ? 0 : 1
      });
      process.stdout.write(options.json ? `${JSON.stringify(result, null, 2)}\n` : `${gateStatus.ok ? "Ready" : "Not ready"} (${gate}; ${Math.round(report.readinessScore * 100)}%)\n`);
      if (!gateStatus.ok) process.exitCode = 1;
    });
  });

program
  .command("run")
  .description("Run one Full Auto pass")
  .argument("[folder]", "project folder", ".")
  .option("--lanes <count>", "number of lane passes to run")
  .option("--depth <depth>", "quick, standard, or deep")
  .option("--backend <backend>", "auto, pyodide, sandboxExec, or docker", "auto")
  .option("--mock", "use deterministic local mock agents instead of configured models")
  .option("--fabricated", "test mode: make the synthesizer fabricate a result")
  .action(async (folder: string, options: { fabricated?: boolean; mock?: boolean; lanes?: string; depth?: "quick" | "standard" | "deep"; backend?: "auto" | "pyodide" | "sandboxExec" | "docker" }) => {
    await withCliActivity(folder, "run", "Full Auto run", async () => {
      const snapshot = await loadProject(folder);
      if (options.depth && snapshot.manifest.settings.depth !== options.depth) {
        snapshot.manifest.settings.depth = options.depth;
        await saveManifest(folder, snapshot.manifest);
      }
      const lanes = Math.max(1, Number(options.lanes ?? snapshot.manifest.settings.maxLanes ?? 1));
      let ready = false;
      let lastRunId = "";
      for (let index = 0; index < lanes; index += 1) {
        const result = await new FullAutoOrchestrator({ backend: executionBackendFor(options.backend ?? "auto") }).runOnce(
          folder,
          options.mock || options.fabricated
            ? new MockResearchAgents({ fabricated: Boolean(options.fabricated) })
            : createResearchAgentsFromManifest(snapshot.manifest, { env: await envWithKeychain() }),
          (event) => {
            process.stdout.write(`#${event.seq} ${event.role} ${event.kind}: ${event.title}\n`);
            void appendActivityEvent(folder, activityFromFullAutoEvent(folder, event, { source: "cli", actor: "external-agent", command: "run" }));
          },
          {
            onStream: (event) => {
              void appendActivityEvent(folder, activityFromStreamEvent(folder, event, { source: "cli", actor: "external-agent", command: "run" }));
            }
          }
        );
        ready = result.ready;
        lastRunId = result.runId;
        if (ready) break;
      }
      await recordCliActivity(folder, {
        role: "system",
        phase: "run.result",
        title: ready ? "Full Auto completed" : "Full Auto completed: not ready",
        detail: `runId=${lastRunId}`,
        severity: ready ? "ok" : "warning",
        command: "run",
        exitCode: ready ? 0 : 1
      });
      process.stdout.write(`Run ${lastRunId} completed: ${ready ? "ready" : "not ready"}\n`);
      if (!ready) process.exitCode = 1;
    });
  });

program
  .command("status")
  .description("Print project readiness status")
  .argument("[folder]", "project folder", ".")
  .action(async (folder: string) => {
    const snapshot = await loadProject(folder);
    const report = readinessReport(snapshotToGateProject(snapshot), snapshot.manifest.settings.depth, projectGateIO(folder));
    process.stdout.write(`${report.ready ? "Ready" : "Not ready"} · ${Math.round(report.readinessScore * 100)}% · claims ${report.supportedClaims} · patches ${snapshot.patches.length}\n`);
  });

program
  .command("list")
  .description("List ids for plans, patches, nodes, claims, or evidence")
  .argument("<kind>", `item kind: ${listKinds.join(", ")}`)
  .argument("[folder]", "project folder", ".")
  .option("--json", "print JSON")
  .action(async (kind: string, folder: string, options: { json?: boolean }) => {
    if (!isListKind(kind)) {
      process.stderr.write(`Unknown kind: ${kind}. Expected one of: ${listKinds.join(", ")}\n`);
      process.exitCode = 2;
      return;
    }
    const snapshot = await loadProject(folder);
    if (options.json) {
      process.stdout.write(`${JSON.stringify(buildListResult(snapshot, kind), null, 2)}\n`);
      return;
    }
    const lines = formatListLines(snapshot, kind);
    process.stdout.write(lines.length > 0 ? `${lines.join("\n")}\n` : `No ${kind} found\n`);
  });

const modelsCommand = program
  .command("models")
  .description("Show or update planner/executor/reviewer provider and model settings")
  .argument("[folder]", "project folder", ".");

addModelOptions(modelsCommand)
  .action(async (folder: string, options: ModelOptions) => {
    await withCliActivity(folder, "models", "Model settings", async () => {
      const snapshot = await loadProject(folder);
      const updatedRoles = applyModelOptions(snapshot.manifest.roles, options);
      if (hasModelOptions(options)) {
        await saveManifest(folder, { ...snapshot.manifest, roles: updatedRoles });
        await recordCliActivity(folder, {
          role: "system",
          phase: "models.updated",
          title: "Model settings updated",
          detail: `planner=${updatedRoles.planner.model}; executor=${updatedRoles.executor.model}; reviewer=${updatedRoles.reviewer.model}`,
          command: "models"
        });
        process.stdout.write(`Updated model settings in ${folder}/nullius.json\n`);
      }
      printRoles(updatedRoles);
    });
  });

program
  .command("watch")
  .description("Print recent transcript paths and current status")
  .argument("[folder]", "project folder", ".")
  .action(async (folder: string) => {
    const snapshot = await loadProject(folder);
    const report = readinessReport(snapshotToGateProject(snapshot), snapshot.manifest.settings.depth, projectGateIO(folder));
    process.stdout.write(`Mission Console\n`);
    process.stdout.write(`Status: ${report.ready ? "Ready" : "Not ready"} (${Math.round(report.readinessScore * 100)}%)\n`);
    process.stdout.write(`Transcripts: ${join(folder, "runtime", "transcripts")}\n`);
  });

program
  .command("approve")
  .description("Approve and apply a staged manuscript patch")
  .argument("<patchId>", "patch id")
  .argument("[folder]", "project folder", ".")
  .action(async (patchId: string, folder: string) => {
    await withCliActivity(folder, "approve", "Approve patch", async () => {
      const result = await approvePatch(folder, patchId);
      await recordCliActivity(folder, {
        source: "gate",
        role: "user",
        phase: "patch.approve.result",
        title: result.applied ? "Patch applied" : "Patch approval blocked",
        detail: result.applied ? patchId : result.reason ?? patchId,
        severity: result.applied ? "ok" : "warning",
        command: "approve",
        exitCode: result.applied ? 0 : 1
      });
      process.stdout.write(result.applied ? `Applied patch ${patchId}\n` : `Patch ${patchId} not applied: ${result.reason ?? "blocked"}\n`);
      if (!result.applied) process.exitCode = 1;
    });
  });

program
  .command("reject")
  .description("Reject a staged manuscript patch")
  .argument("<patchId>", "patch id")
  .argument("[folder]", "project folder", ".")
  .action(async (patchId: string, folder: string) => {
    await withCliActivity(folder, "reject", "Reject patch", async () => {
      await rejectPatch(folder, patchId);
      process.stdout.write(`Rejected patch ${patchId}\n`);
    });
  });

program
  .command("steer")
  .description("Save a steering instruction for the next run")
  .argument("<instruction>", "instruction text")
  .argument("[folder]", "project folder", ".")
  .action(async (instruction: string, folder: string) => {
    await withCliActivity(folder, "steer", "Steering instruction", async () => {
      const runtime = join(folder, "runtime");
      await mkdir(runtime, { recursive: true });
      await writeFile(join(runtime, "steering.txt"), `${instruction}\n`, "utf8");
      await recordCliActivity(folder, {
        role: "user",
        phase: "steer.saved",
        title: "Steering instruction saved",
        detail: instruction,
        command: "steer"
      });
      process.stdout.write("Saved steering instruction\n");
    });
  });

program
  .command("export")
  .description("Export manuscript")
  .argument("<format>", "md or pdf")
  .argument("[folder]", "project folder", ".")
  .action(async (format: string, folder: string) => {
    await withCliActivity(folder, "export", `Export ${format}`, async () => {
      if (format !== "md" && format !== "pdf") {
        process.stderr.write("Only md is implemented; pdf requires a later Quarto/Pandoc integration.\n");
        process.exitCode = 2;
        return;
      }
      if (format === "pdf") {
        const out = join(folder, "manuscript", "report.pdf");
        const exitCode = await runProcess("quarto", ["render", join(folder, "manuscript", "report.md"), "--to", "pdf", "--output", "report.pdf"], folder);
        if (exitCode !== 0) {
          process.stderr.write("PDF export requires Quarto/Pandoc and a valid LaTeX environment.\n");
          process.exitCode = exitCode || 2;
          return;
        }
        await access(out);
        process.stdout.write(`${out}\n`);
        return;
      }
      const body = await exportMarkdown(folder);
      await recordCliActivity(folder, {
        role: "system",
        phase: "export.markdown.result",
        title: "Markdown exported",
        detail: `${body.length} characters`,
        command: "export"
      });
      process.stdout.write(body);
    });
  });

program
  .command("plan")
  .description("Create a plan using configured planner")
  .argument("[folder]", "project folder", ".")
  .option("--mock", "use deterministic local mock planner")
  .action(async (folder: string, options: { mock?: boolean }) => {
    await withCliActivity(folder, "plan", "Generate plan", async () => {
      const snapshot = await loadProject(folder);
      const plan = await (options.mock ? new MockResearchAgents() : createResearchAgentsFromManifest(snapshot.manifest, { env: await envWithKeychain() })).createPlan(snapshot.manifest.question);
      await savePlan(folder, plan);
      await recordCliActivity(folder, {
        role: "planner",
        phase: "plan.generated",
        title: "Plan generated",
        detail: plan.title,
        command: "plan"
      });
      process.stdout.write(`${plan.id}\t${plan.title}\n`);
    });
  });

program
  .command("adopt")
  .description("Approve a generated plan and lock the protocol if needed")
  .argument("<planId>", "plan id")
  .argument("[folder]", "project folder", ".")
  .action(async (planId: string, folder: string) => {
    await withCliActivity(folder, "adopt", "Adopt plan", async () => {
      const snapshot = await loadProject(folder);
      const plan = snapshot.plans.find((candidate) => candidate.id === planId);
      if (!plan) {
        process.stderr.write(`Plan not found: ${planId}\n`);
        process.exitCode = 1;
        return;
      }
      const adopted = { ...plan, approved: true };
      await savePlan(folder, adopted);
      if (!snapshot.manifest.protocolLock) {
        snapshot.manifest.protocolLock = {
          researchQuestion: snapshot.manifest.question,
          scope: adopted.purpose,
          plannedObservables: adopted.observables,
          successCriteria: adopted.successCriteria,
          falsificationCriteria: adopted.falsificationCriteria,
          requiredEvidence: ["approved evidence for every result claim"],
          exclusions: ["unsupported claims"],
          lockedAt: new Date().toISOString()
        };
        await saveManifest(folder, snapshot.manifest);
      }
      await recordCliActivity(folder, {
        role: "user",
        phase: "plan.adopted",
        title: "Plan adopted",
        detail: adopted.title,
        command: "adopt"
      });
      process.stdout.write(`Adopted plan ${planId}\n`);
    });
  });

const citations = program.command("citations").description("Manage literature verification");

citations
  .command("verify")
  .description("Verify project literature records")
  .argument("[folder]", "project folder", ".")
  .action(async (folder: string) => {
    await withCliActivity(folder, "citations.verify", "Verify citations", async () => {
      const snapshot = await loadProject(folder);
      const literature = await Promise.all(snapshot.literature.map((item) => verifyLiteratureItem(item)));
      await saveLiterature(folder, literature);
      const rejected = literature.filter((item) => item.status === "rejected" || item.status === "retracted").length;
      await recordCliActivity(folder, {
        source: "gate",
        role: "system",
        phase: "citations.verify.result",
        title: rejected > 0 ? "Citation verification found issues" : "Citations verified",
        detail: `${literature.length} literature item(s), ${rejected} rejected/retracted`,
        severity: rejected > 0 ? "warning" : "ok",
        command: "citations.verify",
        exitCode: rejected > 0 ? 1 : 0
      });
      process.stdout.write(`${JSON.stringify({ ok: true, literature }, null, 2)}\n`);
    });
  });

citations
  .command("search")
  .description("Search Crossref")
  .argument("<query>", "bibliographic query")
  .option("--rows <count>", "max rows", "5")
  .action(async (query: string, options: { rows?: string }) => {
    const result = await searchCrossref(query, Number(options.rows ?? 5));
    process.stdout.write(`${JSON.stringify({ ok: true, results: result }, null, 2)}\n`);
  });

program
  .command("repro")
  .description("Summarize reproducibility status")
  .argument("[folder]", "project folder", ".")
  .action(async (folder: string) => {
    await withCliActivity(folder, "repro", "Check reproducibility", async () => {
      const result = await checkProjectReproducibility(folder);
      await recordCliActivity(folder, {
        source: "sandbox",
        role: "system",
        phase: "repro.result",
        title: result.failed === 0 && result.divergent === 0 ? "Reproducibility check passed" : "Reproducibility check found issues",
        detail: `failed=${result.failed}; divergent=${result.divergent}`,
        severity: result.failed === 0 && result.divergent === 0 ? "ok" : "warning",
        command: "repro",
        exitCode: result.failed === 0 && result.divergent === 0 ? 0 : 1
      });
      process.stdout.write(`${JSON.stringify({ ok: result.failed === 0 && result.divergent === 0, ...result }, null, 2)}\n`);
      if (result.failed > 0 || result.divergent > 0) process.exitCode = 1;
    });
  });

program
  .command("rerun")
  .description("Rerun a generated node by id")
  .argument("<nodeId>", "node id")
  .argument("[folder]", "project folder", ".")
  .action(async (nodeId: string, folder: string) => {
    await withCliActivity(folder, "rerun", "Rerun node", async () => {
      const result = await rerunNode(folder, nodeId);
      const ok = typeof result === "object" && result !== null && "ok" in result ? Boolean((result as { ok?: boolean }).ok) : false;
      await recordCliActivity(folder, {
        source: "sandbox",
        role: "executor",
        phase: "rerun.result",
        title: ok ? "Node rerun completed" : "Node rerun failed",
        detail: nodeId,
        severity: ok ? "ok" : "critical",
        command: "rerun",
        exitCode: ok ? 0 : 1
      });
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      if (!ok) process.exitCode = 1;
    });
  });

program
  .command("serve")
  .description("Start the HTTP/WebSocket command server")
  .option("--port <port>", "port, 0 for an ephemeral port", "0")
  .action(async (options: { port?: string }) => {
    const server = await startNulliusServer({ port: Number(options.port ?? 0) });
    process.stdout.write(`Nullius server listening on ${server.port}\n`);
    const close = async () => {
      await server.close();
      process.exit(0);
    };
    process.on("SIGINT", close);
    process.on("SIGTERM", close);
  });

const keys = program.command("keys").description("Manage provider API keys");

keys
  .command("set")
  .description("Store a provider API key in the macOS Keychain")
  .argument("<provider>", "openrouter, openai, anthropic, or customOpenAICompatible")
  .argument("<apiKey>", "API key")
  .action(async (provider: string, apiKey: string) => {
    if (process.platform !== "darwin") {
      process.stderr.write("Keychain storage is currently implemented for macOS. Use environment variables on this platform.\n");
      process.exitCode = 2;
      return;
    }
    const exitCode = await runCapture("security", ["add-generic-password", "-a", "nullius", "-s", keychainService(provider), "-w", apiKey, "-U"]);
    if (exitCode.exitCode !== 0) {
      process.stderr.write(exitCode.stderr);
      process.exitCode = exitCode.exitCode;
      return;
    }
    process.stdout.write(`Stored key for ${provider}\n`);
  });

keys
  .command("env")
  .description("Print expected environment variable names")
  .action(() => {
    process.stdout.write([
      "OPENROUTER_API_KEY",
      "OPENAI_API_KEY",
      "ANTHROPIC_API_KEY",
      "CUSTOM_OPENAI_API_KEY",
      "CUSTOM_OPENAI_BASE_URL"
    ].join("\n") + "\n");
  });

program.parse();

type CliActivityInput = Omit<ActivityJournalInput, "source" | "actor"> & Partial<Pick<ActivityJournalInput, "source" | "actor">>;

async function recordCliActivity(folder: string, input: CliActivityInput): Promise<void> {
  const { source, actor, ...rest } = input;
  await appendActivityEvent(folder, {
    ...rest,
    source: source ?? "cli",
    actor: actor ?? "external-agent"
  });
}

async function withCliActivity(folder: string, command: string, title: string, work: () => Promise<void>): Promise<void> {
  await recordCliActivity(folder, {
    role: "system",
    phase: `${command}.started`,
    title,
    command
  });
  try {
    await work();
    const exitCode = numericExitCode();
    await recordCliActivity(folder, {
      role: "system",
      phase: `${command}.completed`,
      title: exitCode === 0 ? `${title} completed` : `${title} completed with issues`,
      severity: exitCode === 0 ? "ok" : "warning",
      command,
      exitCode
    });
  } catch (error) {
    await recordCliActivity(folder, {
      role: "system",
      phase: `${command}.failed`,
      title: `${title} failed`,
      detail: error instanceof Error ? error.message : String(error),
      severity: "critical",
      command,
      exitCode: 1
    });
    throw error;
  }
}

function numericExitCode(): number {
  if (typeof process.exitCode === "number") return process.exitCode;
  if (typeof process.exitCode === "string") {
    const parsed = Number(process.exitCode);
    return Number.isFinite(parsed) ? parsed : 1;
  }
  return 0;
}

function addModelOptions(command: Command): Command {
  return command
    .option("--provider <provider>", "provider for all roles", (value) => parseChoice(value, providerChoices, "provider"))
    .option("--model <model>", "model id for all roles")
    .option("--reasoning-effort <effort>", "reasoning effort for all roles", (value) => parseChoice(value, effortChoices, "reasoning effort"))
    .option("--planner-provider <provider>", "planner provider", (value) => parseChoice(value, providerChoices, "planner provider"))
    .option("--planner-model <model>", "planner model id")
    .option("--planner-effort <effort>", "planner reasoning effort", (value) => parseChoice(value, effortChoices, "planner effort"))
    .option("--executor-provider <provider>", "executor provider", (value) => parseChoice(value, providerChoices, "executor provider"))
    .option("--executor-model <model>", "executor model id")
    .option("--executor-effort <effort>", "executor reasoning effort", (value) => parseChoice(value, effortChoices, "executor effort"))
    .option("--reviewer-provider <provider>", "reviewer provider", (value) => parseChoice(value, providerChoices, "reviewer provider"))
    .option("--reviewer-model <model>", "reviewer model id")
    .option("--reviewer-effort <effort>", "reviewer reasoning effort", (value) => parseChoice(value, effortChoices, "reviewer effort"));
}

function parseChoice<T extends string>(value: string, choices: readonly T[], label: string): T {
  if ((choices as readonly string[]).includes(value)) return value as T;
  throw new Error(`Invalid ${label}: ${value}. Expected one of: ${choices.join(", ")}`);
}

function defaultRoles(): RoleSettings {
  return {
    planner: { provider: "openrouter", model: "openrouter/auto", reasoningEffort: "none" },
    executor: { provider: "openrouter", model: "openrouter/auto", reasoningEffort: "none" },
    reviewer: { provider: "openrouter", model: "openrouter/auto", reasoningEffort: "none" }
  };
}

function applyModelOptions(current: RoleSettings, options: ModelOptions): RoleSettings {
  const next: RoleSettings = {
    planner: { ...current.planner },
    executor: { ...current.executor },
    reviewer: { ...current.reviewer }
  };
  for (const role of ["planner", "executor", "reviewer"] as const) {
    const override = roleOverrides(role, options);
    next[role] = {
      ...next[role],
      ...(options.provider ? { provider: options.provider } : {}),
      ...(options.model ? { model: options.model } : {}),
      ...(options.reasoningEffort ? { reasoningEffort: options.reasoningEffort } : {}),
      ...(override.provider ? { provider: override.provider } : {}),
      ...(override.model ? { model: override.model } : {}),
      ...(override.reasoningEffort ? { reasoningEffort: override.reasoningEffort } : {})
    };
  }
  return ProjectManifestSchema.shape.roles.parse(next);
}

function roleOverrides(role: RoleName, options: ModelOptions): { provider?: ProviderName; model?: string; reasoningEffort?: ReasoningEffort } {
  const result: { provider?: ProviderName; model?: string; reasoningEffort?: ReasoningEffort } = {};
  switch (role) {
    case "planner":
      if (options.plannerProvider) result.provider = options.plannerProvider;
      if (options.plannerModel) result.model = options.plannerModel;
      if (options.plannerEffort) result.reasoningEffort = options.plannerEffort;
      return result;
    case "executor":
      if (options.executorProvider) result.provider = options.executorProvider;
      if (options.executorModel) result.model = options.executorModel;
      if (options.executorEffort) result.reasoningEffort = options.executorEffort;
      return result;
    case "reviewer":
      if (options.reviewerProvider) result.provider = options.reviewerProvider;
      if (options.reviewerModel) result.model = options.reviewerModel;
      if (options.reviewerEffort) result.reasoningEffort = options.reviewerEffort;
      return result;
  }
}

function hasModelOptions(options: ModelOptions): boolean {
  return Boolean(
    options.provider ||
    options.model ||
    options.reasoningEffort ||
    options.plannerProvider ||
    options.plannerModel ||
    options.plannerEffort ||
    options.executorProvider ||
    options.executorModel ||
    options.executorEffort ||
    options.reviewerProvider ||
    options.reviewerModel ||
    options.reviewerEffort
  );
}

function printRoles(roles: RoleSettings): void {
  for (const role of ["planner", "executor", "reviewer"] as const) {
    const config = roles[role];
    process.stdout.write(`${role}\t${config.provider}\t${config.model}\treasoning=${config.reasoningEffort}\n`);
  }
}

function runProcess(command: string, args: string[], cwd: string): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });
    child.on("error", () => resolve(127));
    child.on("close", (code) => resolve(code ?? 1));
  });
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

async function rerunNode(folder: string, nodeId: string): Promise<unknown> {
  const snapshot = await loadProject(folder);
  const lane = snapshot.lanes.find((candidate) => candidate.nodes.some((node) => node.id === nodeId));
  const node = lane?.nodes.find((candidate) => candidate.id === nodeId);
  if (!lane || !node) return { ok: false, reason: `Node not found: ${nodeId}` };
  const started = Date.now();
  const result = await defaultExecutionBackend().run(node.generatedCode, join(folder, "lanes", lane.id, "nodes", node.id), { allowNetwork: false, timeoutSec: 30 });
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
  await saveNode(folder, lane.id, updated, [`# ${updated.title}`, "", `Status: ${updated.status}`, "", "```python", updated.generatedCode, "```", "", result.stdout || result.stderr].join("\n"));
  await saveLane(folder, { id: lane.id, name: lane.name, planId: lane.planId, nodeOrder: lane.nodeOrder.includes(updated.id) ? lane.nodeOrder : [...lane.nodeOrder, updated.id] });
  return { ok: true, node: updated, execution: result };
}

async function searchCrossref(query: string, rows: number): Promise<unknown[]> {
  const response = await fetch(`https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(query)}&rows=${rows}`);
  if (!response.ok) return [];
  const body = (await response.json()) as { message?: { items?: Array<Record<string, unknown>> } };
  return (body.message?.items ?? []).map((item) => ({
    title: Array.isArray(item.title) ? item.title[0] : "",
    doi: typeof item.DOI === "string" ? item.DOI : undefined,
    url: typeof item.URL === "string" ? item.URL : undefined,
    year: String(readCrossrefYear(item) ?? ""),
    citationKey: makeCitationKey(item)
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
