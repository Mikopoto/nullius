import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { parentPort, workerData } from "node:worker_threads";
import { loadPyodide, type PyodideInterface } from "pyodide";
import type { ExecutionOptions, ExecutionResult } from "./executionBackend.js";

interface PyodideWorkerData {
  code: string;
  nodeDir: string;
  options: Pick<ExecutionOptions, "timeoutSec" | "limits">;
}

const data = workerData as PyodideWorkerData;

void run().then((result) => parentPort?.postMessage(result));

async function run(): Promise<ExecutionResult> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  let pyodide: PyodideInterface;
  try {
    pyodide = await loadPyodide();
  } catch (error) {
    await persistLogs(data.nodeDir, "", `Pyodide failed to load: ${String(error)}`);
    return {
      backend: "pyodide",
      exitCode: 1,
      status: "rejected",
      stdout: "",
      stderr: `Pyodide failed to load: ${String(error)}`,
      generatedFiles: [],
      error: `Pyodide failed to load: ${String(error)}`
    };
  }

  const runRoot = `/nullius-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const workDir = `${runRoot}/work`;
  try {
    prepareWorkDir(pyodide, runRoot, workDir);
    await copyHostFilesToPyodide(pyodide, data.nodeDir, workDir);
    const baselineFiles = snapshotPyodideFiles(pyodide, workDir);
    pyodide.setStdout({ batched: (message: string) => stdout.push(message) });
    pyodide.setStderr({ batched: (message: string) => stderr.push(message) });

    const wrappedCode = [
      "import os, sys",
      `os.chdir(${JSON.stringify(workDir)})`,
      data.code
    ].join("\n");

    await pyodide.runPythonAsync(wrappedCode);
    const generatedFiles = await collectPyodideGeneratedFiles(pyodide, workDir, data.nodeDir, data.options, baselineFiles);
    await persistLogs(data.nodeDir, stdout.join("\n"), stderr.join("\n"));
    return {
      backend: "pyodide",
      exitCode: 0,
      status: "succeeded",
      stdout: stdout.join("\n"),
      stderr: stderr.join("\n"),
      generatedFiles
    };
  } catch (error) {
    const generatedFiles = await collectPyodideGeneratedFiles(pyodide, workDir, data.nodeDir, data.options).catch(() => []);
    await persistLogs(data.nodeDir, stdout.join("\n"), stderr.concat(String(error)).join("\n"));
    return {
      backend: "pyodide",
      exitCode: 1,
      status: "failed",
      stdout: stdout.join("\n"),
      stderr: stderr.concat(String(error)).join("\n"),
      generatedFiles,
      error: String(error)
    };
  } finally {
    safeRemoveTree(pyodide, runRoot);
  }
}

function prepareWorkDir(pyodide: PyodideInterface, runRoot: string, workDir: string): void {
  const FS = pyodide.FS;
  FS.mkdirTree(runRoot);
  FS.mkdirTree(workDir);
}

async function copyHostFilesToPyodide(pyodide: PyodideInterface, nodeDir: string, workDir: string): Promise<void> {
  const FS = pyodide.FS;
  async function walk(hostDir: string, relativeDir = ""): Promise<void> {
    let entries;
    try {
      entries = await readdir(hostDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const relative = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
      if (relative.split("/").some((part) => part === ".." || part.length === 0)) continue;
      if (relative === "logs" || relative.startsWith("logs/")) continue;
      const hostPath = join(hostDir, entry.name);
      const virtualPath = `${workDir}/${relative}`;
      if (entry.isDirectory()) {
        FS.mkdirTree(virtualPath);
        await walk(hostPath, relative);
      } else if (entry.isFile()) {
        FS.mkdirTree(virtualPath.split("/").slice(0, -1).join("/"));
        FS.writeFile(virtualPath, await readFile(hostPath));
      }
    }
  }
  await walk(nodeDir);
}

function snapshotPyodideFiles(pyodide: PyodideInterface, workDir: string): Map<string, string> {
  const FS = pyodide.FS;
  const files = new Map<string, string>();
  function walk(directory: string): void {
    for (const entry of FS.readdir(directory) as string[]) {
      if (entry === "." || entry === "..") continue;
      const absolute = `${directory}/${entry}`;
      const info = FS.stat(absolute) as { mode: number };
      if (FS.isDir(info.mode)) {
        walk(absolute);
      } else {
        const bytes = FS.readFile(absolute) as Uint8Array;
        files.set(absolute.slice(workDir.length + 1), createHash("sha256").update(bytes).digest("hex"));
      }
    }
  }
  walk(workDir);
  return files;
}

async function collectPyodideGeneratedFiles(
  pyodide: PyodideInterface,
  workDir: string,
  nodeDir: string,
  options: Pick<ExecutionOptions, "limits">,
  baselineFiles: Map<string, string> = new Map()
): Promise<ExecutionResult["generatedFiles"]> {
  const maxFiles = options.limits?.maxGeneratedFiles ?? 200;
  const maxBytes = options.limits?.maxGeneratedBytes ?? 5_000_000;
  const files: ExecutionResult["generatedFiles"] = [];
  const FS = pyodide.FS;

  async function walk(directory: string): Promise<void> {
    if (files.length >= maxFiles) return;
    for (const entry of FS.readdir(directory) as string[]) {
      if (entry === "." || entry === "..") continue;
      const absolute = `${directory}/${entry}`;
      const info = FS.stat(absolute) as { mode: number; size: number };
      if (FS.isDir(info.mode)) {
        await walk(absolute);
        continue;
      }
      if (info.size > maxBytes) continue;
      const bytes = FS.readFile(absolute) as Uint8Array;
      const relative = absolute.slice(workDir.length + 1);
      const sha256 = createHash("sha256").update(bytes).digest("hex");
      if (baselineFiles.get(relative) === sha256) continue;
      await persistGeneratedFile(nodeDir, relative, bytes);
      const text = decodeTextIfLikely(bytes);
      files.push({ path: relative, sha256, bytes: bytes.byteLength, ...(text === undefined ? {} : { text }) });
    }
  }

  await walk(workDir);
  return files;
}

async function persistGeneratedFile(nodeDir: string, relativePath: string, bytes: Uint8Array): Promise<void> {
  if (relativePath.split("/").some((part) => part === ".." || part.length === 0)) return;
  const target = join(nodeDir, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, bytes);
}

async function persistLogs(nodeDir: string, stdout: string, stderr: string): Promise<void> {
  const logDir = join(nodeDir, "logs");
  await mkdir(logDir, { recursive: true });
  await writeFile(join(logDir, "stdout.log"), stdout, "utf8");
  await writeFile(join(logDir, "stderr.log"), stderr, "utf8");
}

function decodeTextIfLikely(bytes: Uint8Array): string | undefined {
  if (bytes.length > 200_000) return undefined;
  if (bytes.some((byte) => byte === 0)) return undefined;
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return undefined;
  }
}

function safeRemoveTree(pyodide: PyodideInterface | undefined, path: string): void {
  if (!pyodide) return;
  const FS = pyodide.FS;
  try {
    for (const entry of FS.readdir(path) as string[]) {
      if (entry === "." || entry === "..") continue;
      const absolute = `${path}/${entry}`;
      const info = FS.stat(absolute) as { mode: number };
      if (FS.isDir(info.mode)) safeRemoveTree(pyodide, absolute);
      else FS.unlink(absolute);
    }
    FS.rmdir(path);
  } catch {
    // best-effort cleanup
  }
}
