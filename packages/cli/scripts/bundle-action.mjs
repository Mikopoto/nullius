// Bundles the Nullius CLI into a single self-contained file for the GitHub Action.
// Output: <repo>/action/dist/nullius.cjs, runnable with a bare `node nullius.cjs`.
//
// Run via the root script: pnpm build:action
// (core and server must be built first; the root script does that.)
import { build } from "esbuild";
import { chmodSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outfile = resolve(here, "../../../action/dist/nullius.cjs");

await build({
  entryPoints: [resolve(here, "../src/index.ts")],
  outfile,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  sourcemap: false,
  legalComments: "none",
  logLevel: "info",
  // The source is ESM and uses import.meta.url (worker URL resolution).
  // In the CJS bundle we rebuild it from __filename.
  define: { "import.meta.url": "__nullius_import_meta_url" },
  banner: {
    js: "var __nullius_import_meta_url = require('node:url').pathToFileURL(__filename).href;"
  },
  // The only externals are ws's OPTIONAL native accelerators, which ws
  // require()s inside try/catch and runs fine without. Everything needed at
  // runtime (commander, zod, ws, @nullius/core, @nullius/server) is inlined,
  // so the file runs standalone outside the workspace.
  external: ["bufferutil", "utf-8-validate"]
});

chmodSync(outfile, 0o755);
console.log(`Bundled action CLI -> ${outfile}`);
