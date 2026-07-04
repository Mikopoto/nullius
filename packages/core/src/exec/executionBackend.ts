import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { Worker } from "node:worker_threads";
import { existsSync } from "node:fs";
import { access, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type ExecutionBackendKind = "pyodide" | "sandboxExec" | "docker";

export interface ExecutionOptions {
  allowNetwork?: boolean;
  timeoutSec?: number;
  limits?: {
    maxGeneratedFiles?: number;
    maxGeneratedBytes?: number;
  };
  signal?: AbortSignal;
}

export interface ExecutionResult {
  backend: ExecutionBackendKind;
  exitCode: number;
  status: "succeeded" | "failed" | "timedOut" | "rejected";
  stdout: string;
  stderr: string;
  generatedFiles: Array<{
    path: string;
    sha256: string;
    bytes: number;
    text?: string;
  }>;
  error?: string;
}

export interface ExecutionBackend {
  readonly kind: ExecutionBackendKind;
  run(code: string, nodeDir: string, options?: ExecutionOptions): Promise<ExecutionResult>;
}

export class PyodideBackend implements ExecutionBackend {
  readonly kind = "pyodide" as const;

  async run(code: string, nodeDir: string, options: ExecutionOptions = {}): Promise<ExecutionResult> {
    if (options.allowNetwork) {
      return rejected(this.kind, "network is not available in the default Pyodide sandbox");
    }
    if (options.signal?.aborted) {
      return cancelled(this.kind, "execution aborted before start");
    }
    return runPyodideWorker(code, nodeDir, options);
  }
}

export class SandboxExecBackend implements ExecutionBackend {
  readonly kind = "sandboxExec" as const;
  readonly pythonPath: string;

  constructor(pythonPath = process.env.NULLIUS_PYTHON ?? "python3") {
    this.pythonPath = pythonPath;
  }

  async run(code: string, nodeDir: string, options: ExecutionOptions = {}): Promise<ExecutionResult> {
    if (process.platform !== "darwin") {
      return rejected(this.kind, "sandbox-exec backend is only available on macOS.");
    }
    if (options.allowNetwork) {
      return rejected(this.kind, "SandboxExecBackend is configured with network deny; allowNetwork is not supported.");
    }
    if (!(await commandExists("sandbox-exec"))) return rejected(this.kind, "sandbox-exec is not available.");
    await mkdir(join(nodeDir, "scripts"), { recursive: true });
    const scriptPath = join(nodeDir, "scripts", "generated.py");
    await writeFile(scriptPath, code, "utf8");
    const profile = sandboxProfile(nodeDir);
    const result = await runHostProcess(
      "sandbox-exec",
      ["-p", profile, this.pythonPath, scriptPath],
      nodeDir,
      (options.timeoutSec ?? 60) * 1000,
      options.signal
    );
    await persistLogs(nodeDir, result.stdout, result.stderr);
    const generatedFiles = result.exitCode === 0 ? await collectHostGeneratedFiles(nodeDir, options) : [];
    return {
      backend: this.kind,
      exitCode: result.exitCode,
      status: result.timedOut ? "timedOut" : result.exitCode === 0 ? "succeeded" : "failed",
      stdout: result.stdout,
      stderr: result.stderr,
      generatedFiles,
      ...(result.error ? { error: result.error } : {})
    };
  }
}

export class DockerBackend implements ExecutionBackend {
  readonly kind = "docker" as const;
  readonly image: string;

  constructor(image = "python:3.12-slim") {
    this.image = image;
  }

  async run(code: string, nodeDir: string, options: ExecutionOptions = {}): Promise<ExecutionResult> {
    if (!(await commandExists("docker"))) return rejected(this.kind, "docker is not available.");
    await mkdir(join(nodeDir, "scripts"), { recursive: true });
    const scriptPath = join(nodeDir, "scripts", "generated.py");
    await writeFile(scriptPath, code, "utf8");
    const args = [
      "run",
      "--rm",
      options.allowNetwork ? "" : "--network=none",
      "--read-only",
      "--tmpfs",
      "/tmp:rw,noexec,nosuid,size=64m",
      "-v",
      `${nodeDir}:/work:rw`,
      "-w",
      "/work",
      "--cpus",
      "1",
      "--memory",
      "512m",
      this.image,
      "python",
      "scripts/generated.py"
    ].filter(Boolean);
    const result = await runHostProcess("docker", args, nodeDir, (options.timeoutSec ?? 60) * 1000, options.signal);
    await persistLogs(nodeDir, result.stdout, result.stderr);
    const generatedFiles = result.exitCode === 0 ? await collectHostGeneratedFiles(nodeDir, options) : [];
    return {
      backend: this.kind,
      exitCode: result.exitCode,
      status: result.timedOut ? "timedOut" : result.exitCode === 0 ? "succeeded" : "failed",
      stdout: result.stdout,
      stderr: result.stderr,
      generatedFiles,
      ...(result.error ? { error: result.error } : {})
    };
  }
}

export class UnavailableBackend implements ExecutionBackend {
  readonly kind: ExecutionBackendKind;
  readonly reason: string;

  constructor(kind: ExecutionBackendKind, reason: string) {
    this.kind = kind;
    this.reason = reason;
  }

  async run(): Promise<ExecutionResult> {
    return {
      backend: this.kind,
      exitCode: 1,
      status: "rejected",
      stdout: "",
      stderr: this.reason,
      generatedFiles: [],
      error: this.reason
    };
  }
}

export function defaultExecutionBackend(): ExecutionBackend {
  return new PyodideBackend();
}

export function executionBackendFor(kind: ExecutionBackendKind | "auto"): ExecutionBackend {
  switch (kind) {
    case "auto":
    case "pyodide":
      return new PyodideBackend();
    case "sandboxExec":
      return new SandboxExecBackend();
    case "docker":
      return new DockerBackend();
  }
}

function resolvePyodideWorkerUrl(): URL {
  const builtUrl = new URL("./pyodideWorker.js", import.meta.url);
  if (existsSync(fileURLToPath(builtUrl))) return builtUrl;
  return new URL("./pyodideWorker.ts", import.meta.url);
}

function runPyodideWorker(code: string, nodeDir: string, options: ExecutionOptions): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const timeoutMs = (options.timeoutSec ?? 30) * 1000;
    const worker = new Worker(resolvePyodideWorkerUrl(), {
      workerData: {
        code,
        nodeDir,
        options: {
          timeoutSec: options.timeoutSec,
          limits: options.limits
        }
      }
    });
    let settled = false;
    const finish = async (result: ExecutionResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", onAbort);
      await worker.terminate().catch(() => undefined);
      resolve(result);
    };
    const onAbort = () => {
      void finish(cancelled("pyodide", "execution aborted"));
    };
    const timer = setTimeout(() => {
      void finish({
        backend: "pyodide",
        exitCode: 124,
        status: "timedOut",
        stdout: "",
        stderr: "execution timed out",
        generatedFiles: [],
        error: "execution timed out"
      });
    }, timeoutMs);
    options.signal?.addEventListener("abort", onAbort, { once: true });
    worker.once("message", (message: ExecutionResult) => {
      void finish(message);
    });
    worker.once("error", (error) => {
      void finish({
        backend: "pyodide",
        exitCode: 1,
        status: "failed",
        stdout: "",
        stderr: String(error),
        generatedFiles: [],
        error: String(error)
      });
    });
    worker.once("exit", (codeValue) => {
      if (!settled && codeValue !== 0) {
        void finish({
          backend: "pyodide",
          exitCode: codeValue,
          status: "failed",
          stdout: "",
          stderr: `pyodide worker exited with code ${codeValue}`,
          generatedFiles: [],
          error: `pyodide worker exited with code ${codeValue}`
        });
      }
    });
  });
}

async function collectHostGeneratedFiles(nodeDir: string, options: ExecutionOptions): Promise<ExecutionResult["generatedFiles"]> {
  const maxFiles = options.limits?.maxGeneratedFiles ?? 200;
  const maxBytes = options.limits?.maxGeneratedBytes ?? 5_000_000;
  const files: ExecutionResult["generatedFiles"] = [];
  const ignored = new Set(["logs/stdout.log", "logs/stderr.log", "logs/git.diff", "scripts/generated.py"]);

  async function walk(directory: string, prefix = ""): Promise<void> {
    if (files.length >= maxFiles) return;
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (ignored.has(relative)) continue;
      const absolute = join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(absolute, relative);
        continue;
      }
      if (!entry.isFile()) continue;
      const info = await stat(absolute);
      if (info.size > maxBytes) continue;
      const data = await readFile(absolute);
      const text = decodeTextIfLikely(data);
      files.push({
        path: relative,
        sha256: createHash("sha256").update(data).digest("hex"),
        bytes: data.byteLength,
        ...(text === undefined ? {} : { text })
      });
    }
  }

  await walk(nodeDir);
  return files;
}

async function persistLogs(nodeDir: string, stdout: string, stderr: string): Promise<void> {
  const logDir = join(nodeDir, "logs");
  await mkdir(logDir, { recursive: true });
  await writeFile(join(logDir, "stdout.log"), stdout, "utf8");
  await writeFile(join(logDir, "stderr.log"), stderr, "utf8");
}

function decodeTextIfLikely(data: Uint8Array): string | undefined {
  if (data.length > 200_000) return undefined;
  if (data.some((byte) => byte === 0)) return undefined;
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(data);
  } catch {
    return undefined;
  }
}

async function commandExists(command: string): Promise<boolean> {
  const candidates = process.env.PATH?.split(":").map((dir) => join(dir, command)) ?? [];
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return true;
    } catch {
      // continue
    }
  }
  return false;
}

function cancelled(kind: ExecutionBackendKind, reason: string): ExecutionResult {
  return {
    backend: kind,
    exitCode: 130,
    status: "timedOut",
    stdout: "",
    stderr: reason,
    generatedFiles: [],
    error: reason
  };
}

function rejected(kind: ExecutionBackendKind, reason: string): ExecutionResult {
  return {
    backend: kind,
    exitCode: 1,
    status: "rejected",
    stdout: "",
    stderr: reason,
    generatedFiles: [],
    error: reason
  };
}

export function sandboxProfile(nodeDir: string): string {
  const escapedNodeDir = nodeDir.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
  return [
    "(version 1)",
    "(deny default)",
    "(allow process*)",
    "(allow sysctl-read)",
    "(allow file-read* (subpath \"/System\") (subpath \"/usr\") (subpath \"/bin\") (subpath \"/sbin\") (subpath \"/Library\") (subpath \"/private/var/db\"))",
    `(allow file-read* (subpath "${escapedNodeDir}"))`,
    `(allow file-write* (subpath "${escapedNodeDir}"))`,
    "(deny network*)"
  ].join("\n");
}

function runHostProcess(
  cmd: string,
  args: string[],
  cwd: string,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<{ exitCode: number; stdout: string; stderr: string; timedOut: boolean; error?: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let settled = false;
    const finish = (value: { exitCode: number; stdout: string; stderr: string; timedOut: boolean; error?: string }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      resolve(value);
    };
    const onAbort = () => {
      child.kill("SIGKILL");
      finish({ exitCode: 130, stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8"), timedOut: false, error: "execution aborted" });
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    if (signal?.aborted) onAbort();
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      finish({ exitCode: 124, stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8"), timedOut: true, error: "execution timed out" });
    }, timeoutMs);
    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
    child.on("error", (error) => {
      finish({ exitCode: 127, stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8"), timedOut: false, error: String(error) });
    });
    child.on("close", (code) => {
      finish({ exitCode: code ?? 1, stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8"), timedOut: false });
    });
  });
}
