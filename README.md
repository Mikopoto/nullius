# Nullius

Nullius is an evidence-gated AI research workspace. The core rule is simple:
no model output enters the manuscript on its own authority.

This TypeScript migration splits the product into:

- `packages/core`: deterministic gates, storage schemas, provider utilities, and orchestration primitives
- `packages/conformance`: JSON test vectors ported from the Swift reference implementation
- `packages/cli`: the future `nullius` automation and research-CI command
- `packages/server`: the shared HTTP/WebSocket protocol surface for CLI and GUI
- `apps/desktop`: the Tauri + React desktop application

Current implementation status:

- M0 monorepo scaffold and CI
- M1 zod storage schemas and conformance-vector runner
- M2 deterministic gates: numeric grounding, citation-key extraction, citation verification helpers, claim/readiness gates, patch write boundary, and canonical reproducibility text comparison
- M3 provider utilities: retry policy, SSE stream parsing, defensive JSON parsing, usage/cost helpers, OpenAI/OpenRouter/Anthropic/custom-compatible request construction
- M4 default Docker-free execution backend via Pyodide; generated artifacts and stdout/stderr logs are persisted into node folders
- M5 Full Auto orchestration: explicit plan adoption before protocol lock, lane/node budget handling, execution, review, evidence normalization, claim creation, manuscript patch staging/apply, transcript events
- M6 HTTP/WebSocket server and CLI commands for `init`, `plan`, `adopt`, `run`, `verify`, `watch`, `approve`, `reject`, `steer`, `citations`, `repro`, `rerun`, `export`, `keys`, and `serve`
- M7 Tauri + React GUI with Setup, Mission Console, intervention/status controls, manuscript/patch preview, readiness gates, DAG canvas, evidence inspector, and citation manager
- Role-separated real agent adapter for OpenRouter, OpenAI, Anthropic, custom OpenAI-compatible endpoints, Codex CLI, Claude Code, and OpenCode
- Execution backend selection for Pyodide, macOS `sandbox-exec`, and Docker
- Project-local macOS run entrypoint at `script/build_and_run.sh` and Codex Run action metadata

Run:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Quick CLI smoke test:

```bash
node packages/cli/dist/index.js init /tmp/nullius-demo --question "Does it work?"
node packages/cli/dist/index.js run /tmp/nullius-demo --mock --lanes 3
PLAN_ID=$(basename /tmp/nullius-demo/plans/*.json .json)
node packages/cli/dist/index.js adopt "$PLAN_ID" /tmp/nullius-demo
node packages/cli/dist/index.js run /tmp/nullius-demo --mock --lanes 3 --depth quick
node packages/cli/dist/index.js verify /tmp/nullius-demo --json
node packages/cli/dist/index.js verify /tmp/nullius-demo --json --gate numbers
node packages/cli/dist/index.js export md /tmp/nullius-demo
```

Run with real model roles:

```bash
export OPENROUTER_API_KEY=...
node packages/cli/dist/index.js plan /tmp/nullius-demo
# inspect the generated plan, then adopt it:
PLAN_ID=$(basename /tmp/nullius-demo/plans/*.json .json)
node packages/cli/dist/index.js adopt "$PLAN_ID" /tmp/nullius-demo
node packages/cli/dist/index.js run /tmp/nullius-demo --lanes 3
```

For API keys:

```bash
# macOS Keychain
node packages/cli/dist/index.js keys set openrouter sk-or-v1-...

# Windows/Linux or CI: use environment variables
export OPENROUTER_API_KEY=...
export OPENAI_API_KEY=...
export ANTHROPIC_API_KEY=...
```

On Windows/Linux, OS-native encrypted key storage is release work. Until then, use environment variables or your CI secret store.

Run the desktop app:

```bash
./script/build_and_run.sh
```

The script builds the monorepo, builds `Nullius.app`, starts the local command server on `127.0.0.1:8787`, and opens the app.

Known remaining release work:

- DMG/notarized distribution is not enabled; the checked target is the `.app` bundle.
- PDF export delegates to installed Quarto/Pandoc/LaTeX; no document toolchain is bundled.
- The GUI currently talks to the local server at `127.0.0.1:8787`; release-grade embedded sidecar packaging can replace this dev-local server launch.
