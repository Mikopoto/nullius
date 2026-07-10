import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { completeJSON, type AIProviderConfig } from "../providers/aiProvider.js";
import { parseJSONFromResponse } from "../providers/responseParser.js";
import {
  AgentRoleSchema,
  NodeReviewSchema,
  PlanSchema,
  type EvidenceItem,
  type ProjectManifest
} from "../model/schemas.js";
import type { Claim } from "../model/schemas.js";
import type { AgentCallOptions, ExecutorDraft, ResearchAgents, SynthesisDraft } from "./fullAuto.js";

type AgentRole = z.infer<typeof AgentRoleSchema>;

const ExecutorDraftSchema = z.object({
  title: z.string().min(1),
  code: z.string().min(1),
  claimText: z.string().min(1)
});

const SynthesisDraftSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1)
});

export interface AgentFactoryOptions {
  env?: NodeJS.ProcessEnv;
  terminalTimeoutMs?: number;
}

export function createResearchAgentsFromManifest(manifest: ProjectManifest, options: AgentFactoryOptions = {}): ResearchAgents {
  const env = options.env ?? process.env;
  return new RoleSeparatedResearchAgents(manifest, env, options.terminalTimeoutMs ?? 180_000);
}

export class RoleSeparatedResearchAgents implements ResearchAgents {
  private readonly manifest: ProjectManifest;
  private readonly env: NodeJS.ProcessEnv;
  private readonly terminalTimeoutMs: number;

  constructor(manifest: ProjectManifest, env: NodeJS.ProcessEnv, terminalTimeoutMs: number) {
    this.manifest = manifest;
    this.env = env;
    this.terminalTimeoutMs = terminalTimeoutMs;
  }

  async createPlan(question: string, options?: AgentCallOptions) {
    const json = await this.completeStructured(
      this.manifest.roles.planner,
      "planner",
      [
        "You are the initial research planner for Nullius.",
        "Return only JSON matching this shape:",
        '{"id":"string","title":"string","purpose":"string","method":"string","observables":["string"],"successCriteria":["string"],"falsificationCriteria":["string"],"approved":false}',
        "Do not include expected results. Plan observables, evidence requirements, and falsification criteria."
      ].join("\n"),
      `Research question:\n${question}`
    );
    const parsed = PlanSchema.parse({ id: randomUUID(), ...asRecord(json), approved: false });
    return parsed;
  }

  async createExecutorDraft(plan: z.infer<typeof PlanSchema>, options?: AgentCallOptions): Promise<ExecutorDraft> {
    const json = await this.completeStructured(
      this.manifest.roles.executor,
      "executor",
      [
        "You are the main executor for Nullius.",
        "Return only JSON matching this shape:",
        '{"title":"string","code":"python code string","claimText":"one result claim that the generated code can actually support"}',
        "The code must be self-contained, deterministic, network-free, and write at least one small artifact under artifacts/.",
        "If input data files are listed, read them from the relative path ./data/<name> and base the analysis on them instead of generating synthetic data.",
        "Do not fabricate results in claimText; it must be a claim that can be checked from the generated artifact."
      ].join("\n"),
      [
        `Approved protocol/plan:\n${JSON.stringify(plan, null, 2)}`,
        options?.dataFiles?.length
          ? `Input data files available in the working directory: ${options.dataFiles.map((name) => `./data/${name}`).join(", ")}`
          : "No user-supplied data files; generate the data the plan requires."
      ].join("\n\n")
    );
    return ExecutorDraftSchema.parse(json);
  }

  async reviseExecutorDraft(context: { plan: z.infer<typeof PlanSchema>; draft: ExecutorDraft; review: z.infer<typeof NodeReviewSchema>; execution: { exitCode: number; stdout: string; stderr: string } }, options?: AgentCallOptions): Promise<ExecutorDraft> {
    const json = await this.completeStructured(
      this.manifest.roles.executor,
      "selfCorrection",
      [
        "You are the main executor repairing a Nullius node after independent review.",
        "Return only JSON matching this shape:",
        '{"title":"string","code":"python code string","claimText":"one result claim that the generated code can actually support"}',
        "Fix the code or claim so the next execution can pass review. Do not fabricate outputs."
      ].join("\n"),
      `Approved plan, previous draft, execution result, and reviewer concerns:\n${JSON.stringify(context, null, 2)}`,
      options
    );
    return ExecutorDraftSchema.parse(json);
  }

  async reviewNode(context: { draft: ExecutorDraft; exitCode: number; stdout: string; stderr: string }, options?: AgentCallOptions) {
    const json = await this.completeStructured(
      this.manifest.roles.reviewer,
      "reviewer",
      [
        "You are the independent critical reviewer for Nullius.",
        "Return only JSON matching this shape:",
        '{"severity":"clear|info|warning|critical","findings":["string"],"concerns":["string"],"summary":"string"}',
        "Mark severity critical if execution failed, artifacts are missing, or the claim is unsupported."
      ].join("\n"),
      `Executor draft and execution result:\n${JSON.stringify(context, null, 2)}`
    );
    return NodeReviewSchema.parse(json);
  }

  async synthesize(context: { plan: z.infer<typeof PlanSchema>; claim: Claim; evidence: EvidenceItem[] }, options?: AgentCallOptions): Promise<SynthesisDraft> {
    const json = await this.completeStructured(
      this.manifest.roles.executor,
      "synthesizer",
      [
        "You are the manuscript synthesizer for Nullius.",
        "Return only JSON matching this shape:",
        '{"title":"string","body":"markdown manuscript string"}',
        "The manuscript must contain Abstract, Introduction, Methods, Results, Discussion, Limitations, and References sections.",
        "Only report numbers and claims that are present in the supplied evidence. Do not mention internal words such as node, lane, agent, patch, supportref, evidence_id, or claim_id."
      ].join("\n"),
      `Plan, approved claim, and evidence:\n${JSON.stringify(context, null, 2)}`
    );
    return SynthesisDraftSchema.parse(json);
  }

  private async completeStructured(role: AgentRole, purpose: string, systemPrompt: string, userPrompt: string, options?: AgentCallOptions): Promise<unknown> {
    if (role.provider === "codexCli" || role.provider === "claudeCode" || role.provider === "opencode") {
      options?.onCall?.({ systemPrompt, userPrompt });
      const result = await runTerminalJSONAgent(role, purpose, systemPrompt, userPrompt, this.env, this.terminalTimeoutMs, options);
      options?.onResponse?.(JSON.stringify(result));
      return result;
    }
    const config = providerConfigFromRole(role, this.env);
    options?.onCall?.({ systemPrompt, userPrompt });
    const parsed = await completeJSON(systemPrompt, userPrompt, config, options?.onStream ? { stream: options.onStream } : {});
    options?.onResponse?.(typeof parsed === "string" ? parsed : JSON.stringify(parsed));
    return parsed;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) return value as Record<string, unknown>;
  throw new Error("Agent returned a non-object JSON value.");
}

export function providerConfigFromRole(role: AgentRole, env: NodeJS.ProcessEnv = process.env): AIProviderConfig {
  switch (role.provider) {
    case "openrouter":
      return {
        kind: "openrouter",
        model: role.model,
        apiKey: requireEnv(env, "OPENROUTER_API_KEY"),
        reasoningEffort: role.reasoningEffort
      };
    case "openai":
      return {
        kind: "openai",
        model: role.model,
        apiKey: requireEnv(env, "OPENAI_API_KEY"),
        reasoningEffort: role.reasoningEffort
      };
    case "anthropic":
      return {
        kind: "anthropic",
        model: role.model,
        apiKey: requireEnv(env, "ANTHROPIC_API_KEY"),
        reasoningEffort: role.reasoningEffort
      };
    case "customOpenAICompatible":
      return {
        kind: "customOpenAICompatible",
        model: role.model,
        apiKey: requireEnv(env, "CUSTOM_OPENAI_API_KEY"),
        baseURL: requireEnv(env, "CUSTOM_OPENAI_BASE_URL"),
        reasoningEffort: role.reasoningEffort
      };
    case "codexCli":
    case "claudeCode":
    case "opencode":
      throw new Error(`${role.provider} is a terminal agent, not an API provider.`);
  }
}

function requireEnv(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];
  if (!value) throw new Error(`${name} is required for this provider.`);
  return value;
}

async function runTerminalJSONAgent(
  role: AgentRole,
  purpose: string,
  systemPrompt: string,
  userPrompt: string,
  env: NodeJS.ProcessEnv,
  timeoutMs: number,
  options?: AgentCallOptions
): Promise<unknown> {
  const prompt = [
    systemPrompt,
    "",
    "Return a single JSON object. No Markdown fences. No commentary.",
    "",
    userPrompt
  ].join("\n");
  const command = terminalCommand(role, purpose, prompt);
  const result = await runProcess(command.cmd, command.args, env, timeoutMs, options);
  if (result.exitCode !== 0) {
    throw new Error(`${role.provider} failed with exit code ${result.exitCode}: ${result.stderr || result.stdout}`);
  }
  return parseJSONFromResponse(result.stdout || result.stderr);
}

function terminalCommand(role: AgentRole, purpose: string, prompt: string): { cmd: string; args: string[] } {
  switch (role.provider) {
    case "codexCli":
      return {
        cmd: "codex",
        args: ["exec", "--json", "--model", role.model, prompt]
      };
    case "claudeCode":
      return {
        cmd: "claude",
        args: ["-p", prompt, "--model", role.model, "--output-format", "text"]
      };
    case "opencode":
      return {
        cmd: "opencode",
        args: ["run", "--model", role.model, "--prompt", prompt]
      };
    default:
      throw new Error(`Unsupported terminal provider for ${purpose}: ${role.provider}`);
  }
}

function runProcess(cmd: string, args: string[], env: NodeJS.ProcessEnv, timeoutMs: number, options?: AgentCallOptions): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { env: { ...env }, stdio: ["ignore", "pipe", "pipe"] });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve({ exitCode: 124, stdout: Buffer.concat(stdout).toString("utf8"), stderr: `${Buffer.concat(stderr).toString("utf8")}\nterminal agent timed out` });
    }, timeoutMs);
    child.stdout.on("data", (chunk: Buffer) => {
      stdout.push(chunk);
      options?.onStream?.({ type: "content", text: chunk.toString("utf8") });
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr.push(chunk);
      options?.onStream?.({ type: "reasoning", text: chunk.toString("utf8") });
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ exitCode: 127, stdout: Buffer.concat(stdout).toString("utf8"), stderr: String(error) });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ exitCode: code ?? 1, stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8") });
    });
  });
}
