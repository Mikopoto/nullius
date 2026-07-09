// Bundles the Nullius CLI into a single self-contained CJS file for npm publish.
// Output: packages/cli/dist-publish/nullius.cjs, runnable directly via its shebang
// (#!/usr/bin/env node) so a published `npx` install resolves to a standalone file
// with no workspace dependencies.
//
// Run via: pnpm --filter @nullius/cli bundle:publish
// (invoked automatically by `prepublishOnly`).
// core and server must be built first (their dist/ is what esbuild inlines).
import { build } from "esbuild";
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outfile = resolve(here, "../dist-publish/nullius.cjs");
const shebang = "#!/usr/bin/env node";

mkdirSync(dirname(outfile), { recursive: true });

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

// Guarantee exactly one shebang on the first line, then make it executable so a
// published `npx nullius` (bin) can exec it directly.
const bundled = readFileSync(outfile, "utf8").replace(/^#![^\n]*\n/, "");
writeFileSync(outfile, `${shebang}\n${bundled}`);
chmodSync(outfile, 0o755);
console.log(`Bundled publish CLI -> ${outfile}`);
