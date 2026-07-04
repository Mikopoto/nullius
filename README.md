# Nullius

**Evidence-gated AI research on your own machine.** Nullius lets AI models plan research, write and execute analysis code, and draft a manuscript, while deterministic gates make sure that **no number and no citation enters the report unless it can be traced to real evidence**. The name is from the Royal Society's motto, *nullius in verba*: take nobody's word for it.

- Every quantitative claim must match a value in an artifact produced by locally executed, sandboxed code (value matching, not substring matching).
- Every citation must resolve on Crossref and survive title/author/year/retraction checks.
- Manuscript patches with any blocking warning are rejected **before** they are written, even in fully autonomous runs.
- Three model roles (planner / executor / reviewer), independently configurable, watch each other; a live console streams every token and reasoning trace.

Does it matter? In the bundled case study, the same `gpt-4o-mini` asked directly about a 40-point dataset reported a regression slope of **1.9450** (truth: 3.0, a 35% error) with a confident R². Through Nullius, the same model produced a sandbox-executed slope of **3.0007**, and its one attempt to embellish the manuscript with statistics it never computed was blocked at the write boundary. See the paper: [`docs/paper/nullius.pdf`](docs/paper/nullius.pdf) and raw logs in [`docs/paper/evaluation/`](docs/paper/evaluation/).

## Install

### Option A: macOS app (Apple Silicon)

Download `Nullius.dmg` from [Releases](../../releases), open it, and drag Nullius to Applications. The app is not notarized yet; on first launch, right-click the app → Open (or run `xattr -dr com.apple.quarantine /Applications/Nullius.app`).

The desktop app needs [Node.js 20+](https://nodejs.org) installed (it runs the local research server with it).

### Option B: from source (Windows / Linux / macOS)

Requirements: Node.js 20+, pnpm, and for the desktop app Rust + the [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/).

```bash
git clone https://github.com/Mikopoto/nullius.git
cd nullius
pnpm install
pnpm build              # builds core, CLI, server, and the web UI
pnpm test               # 88 tests should pass

# CLI is ready now:
node packages/cli/dist/index.js --help

# Desktop app (dev):
pnpm --filter @nullius/desktop tauri:dev
# Desktop app (macOS build + launch):
./script/build_and_run.sh
```

## Quick start (GUI)

The app ships a built-in **Tutorial tab (English / 日本語)** with the full beginner flow. In short:

1. **API key** — Setup → API Keys. Easiest: an [OpenRouter](https://openrouter.ai) key (one key, many models). macOS stores it in the system Keychain; Windows/Linux keep it in memory for the session (use an environment variable to persist). Keys are never written to project files.
2. **Project** — Setup → Project: Browse… to pick an empty folder and write your research question.
3. **Data (optional)** — press "Add data files…". Files land in the project's `data/` folder; **every Full Auto run automatically copies them into the analysis working directory and instructs the AI to base the research on them.** No files = the AI generates the data its plan requires.
4. **Models (optional)** — per-role provider + model id (default `openrouter/auto`).
5. **Plan** — Generate Plan, read it, **Adopt** (this locks the success criteria; the run will not proceed without it).
6. **Run Full Auto** — watch the live console; if it pauses, read the intervention card, optionally type a steering instruction, Resume.
7. **Review & export** — approve/reject staged patches in Manuscript, check the Readiness lights, Export. The result is `<project>/manuscript/report.md`.

## Quick start (CLI)

```bash
nullius() { node packages/cli/dist/index.js "$@"; }

nullius keys set openrouter sk-or-v1-...          # macOS Keychain
# Windows/Linux, or CI:
export OPENROUTER_API_KEY=sk-or-v1-...

nullius init myproject \
  --question "Is y linear in x in data/measurements.csv?" \
  --provider openrouter \
  --model openrouter/auto
cp measurements.csv myproject/data/               # optional: your input data
nullius run myproject                             # pass 1: drafts a plan, pauses
nullius adopt <planId> myproject                  # human approval locks the protocol
nullius run myproject                             # full pass: generate, execute, review, gate
nullius verify myproject --json                   # exit 0 only if every gate is green
nullius export md myproject                       # final report
```

### CLI AI provider and model setup

Nullius has three AI roles: `planner`, `executor`, and `reviewer`. By default all three use:

```text
provider: openrouter
model:    openrouter/auto
```

Supported API providers in the current CLI are:

```text
openrouter | openai | anthropic | customOpenAICompatible
```

API keys can be supplied either through the macOS Keychain or environment variables:

```bash
nullius keys set openrouter sk-or-v1-...   # macOS only
nullius keys env                           # prints the expected env var names

export OPENROUTER_API_KEY=sk-or-v1-...
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
export CUSTOM_OPENAI_API_KEY=...
export CUSTOM_OPENAI_BASE_URL=https://your-openai-compatible-endpoint/v1
```

Set one model for all roles at project creation:

```bash
nullius init myproject \
  --question "..." \
  --provider openrouter \
  --model anthropic/claude-sonnet-4.5
```

Or split roles explicitly:

```bash
nullius init myproject \
  --question "..." \
  --planner-provider openrouter --planner-model openai/gpt-4o-mini \
  --executor-provider openrouter --executor-model google/gemini-2.5-flash \
  --reviewer-provider openrouter --reviewer-model anthropic/claude-sonnet-4.5
```

Change models later:

```bash
nullius models myproject
nullius models myproject --executor-model openai/gpt-4o-mini
nullius models myproject --provider openrouter --model openrouter/auto
```

The settings are written to `<project>/nullius.json`; API keys are not written to project files.

`nullius verify --json [--gate numbers|citations|repro|all]` is a stable contract for **research CI**: wire it into your pipeline so no ungrounded number can merge, the same way tests gate code.

## Intended usage patterns

**1. Supervised research (GUI).** You bring a question and optionally a dataset; the app plans, executes, and drafts while you watch the live console, adopt the plan, steer when it pauses, and approve patches. Best for exploratory work where your judgment matters at every step.

**2. Research CI (CLI).** A repository of analyses where `nullius verify --json` runs in the pipeline: any commit whose manuscript contains an ungrounded number, an unverified citation, or an irreproducible node fails the build. Reports become artifacts that a script can certify, the same way tests certify code.

**3. An AI coding agent drives the CLI.** This is a first-class use case: tell Codex, Claude Code, or any terminal agent to run research *through* Nullius instead of writing conclusions itself. The agent runs the loop and reacts to exit codes and gate reports, which are exactly the external verification signals LLM self-correction needs:

```text
Instructions for your agent:
1. nullius init proj --question "..." ; put input files in proj/data/
2. nullius run proj            # pauses with a drafted plan
3. Read the plan. nullius adopt <planId> proj
4. nullius run proj            # if it pauses: read the intervention,
                               #   nullius steer "..." proj, then run again
5. nullius verify proj --json  # exit 0 = every number/citation is traceable
6. Repeat 4-5 until exit 0, then nullius export md proj
```

The agent never needs your API keys (they stay in the OS keychain), cannot write to the manuscript directly (only gated patches can), and the human approval step (`adopt`) stays yours if you want it to.

## How it is built

TypeScript monorepo: `packages/core` (gates + orchestrator, UI-independent), `packages/conformance` (language-independent JSON test vectors — the spec), `packages/cli`, `packages/server` (HTTP/WebSocket), `apps/desktop` (Tauri v2 + React). Generated Python runs by default in a **WebAssembly sandbox** (Pyodide) where network access is structurally absent — no Docker required, identical on all three OSes; macOS `sandbox-exec` and Docker backends are available for full CPython. If no sandbox can be established, execution is refused, never downgraded.

Architecture, gate algorithms, threat model, and the case study are documented in the paper: [`docs/paper/nullius.pdf`](docs/paper/nullius.pdf).

## Safety notes

- API keys: OS keychain / env vars / process memory only.
- Generated code is treated as untrusted: deny-by-default sandboxes, resource limits, refusal over downgrade.
- Attached file content is fenced as untrusted data in prompts (prompt-injection boundary).
- The gates enforce *traceability*, not *truth*: read the manuscript, you stay the reviewer of record.

## 日本語クイックガイド

アプリ内の **Tutorial タブ**に日本語の完全な手順があります(キー取得 → 保存 → プロジェクト作成 → データ追加 → 計画採択 → Full Auto → レビュー → 書き出し)。データは `data/` フォルダに置くだけで、実行のたびに自動で解析環境へコピーされ、AIに「このデータに基づいて研究せよ」と指示されます。

## License

MIT © Studio Uchu
