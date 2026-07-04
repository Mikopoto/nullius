import { existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PyodideBackend } from "./executionBackend.js";

describe("Pyodide execution backend", () => {
  it("runs Python in a virtual filesystem and collects generated files", async () => {
    const backend = new PyodideBackend();
    const nodeDir = join(tmpdir(), `nullius-pyodide-${Date.now()}`);
    rmSync(nodeDir, { recursive: true, force: true });
    const result = await backend.run(
      [
        "import os",
        "os.makedirs('artifacts', exist_ok=True)",
        "with open('artifacts/fit.csv', 'w') as f:",
        "    f.write('metric,value\\nslope,2.0\\n')",
        "print('done')"
      ].join("\n"),
      nodeDir,
      { timeoutSec: 20 }
    );
    expect(result.status).toBe("succeeded");
    expect(result.stdout).toContain("done");
    expect(result.generatedFiles.map((file) => file.path)).toContain("artifacts/fit.csv");
    expect(result.generatedFiles.find((file) => file.path === "artifacts/fit.csv")?.text).toContain("slope,2.0");
    expect(readFileSync(join(nodeDir, "artifacts", "fit.csv"), "utf8")).toContain("slope,2.0");
    expect(readFileSync(join(nodeDir, "logs", "stdout.log"), "utf8")).toContain("done");
  }, 30_000);

  it("rejects network-enabled execution for the default backend", async () => {
    const result = await new PyodideBackend().run("print('x')", "/unused", { allowNetwork: true });
    expect(result.status).toBe("rejected");
    expect(result.error).toContain("network");
  });

  it("does not write host escape paths", async () => {
    const target = join(tmpdir(), `nullius-host-escape-${Date.now()}.txt`);
    const nodeDir = join(tmpdir(), `nullius-pyodide-escape-${Date.now()}`);
    rmSync(target, { force: true });
    rmSync(nodeDir, { recursive: true, force: true });
    const result = await new PyodideBackend().run(
      `open(${JSON.stringify(target)}, 'w').write('escaped')`,
      nodeDir,
      { timeoutSec: 20 }
    );
    expect(existsSync(target)).toBe(false);
    expect(result.generatedFiles).toEqual([]);
  }, 30_000);

  it("terminates CPU-bound Pyodide code in a worker on timeout", async () => {
    const nodeDir = join(tmpdir(), `nullius-pyodide-timeout-${Date.now()}`);
    rmSync(nodeDir, { recursive: true, force: true });
    const started = Date.now();
    const result = await new PyodideBackend().run("while True:\n    pass", nodeDir, { timeoutSec: 2 });
    expect(result.status).toBe("timedOut");
    expect(result.exitCode).toBe(124);
    expect(Date.now() - started).toBeLessThan(10_000);
  }, 15_000);

  it("honors abort signals for Pyodide worker execution", async () => {
    const nodeDir = join(tmpdir(), `nullius-pyodide-abort-${Date.now()}`);
    rmSync(nodeDir, { recursive: true, force: true });
    const controller = new AbortController();
    const promise = new PyodideBackend().run("while True:\n    pass", nodeDir, { timeoutSec: 30, signal: controller.signal });
    setTimeout(() => controller.abort(), 250);
    const result = await promise;
    expect(result.status).toBe("timedOut");
    expect(result.exitCode).toBe(130);
    expect(result.error).toContain("aborted");
  }, 15_000);

});
