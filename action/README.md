# nullius-verify GitHub Action

Runs the Nullius deterministic research gates against a Nullius project inside your workflow and fails the job when the selected gate does not pass. This is "research CI": no ungrounded number, unverified citation, or irreproducible node can merge, the same way tests gate code.

The action is composite and self-contained: it ships a single-file bundle of the Nullius CLI (`dist/nullius.cjs`, built by `pnpm build:action` at the repo root) and needs only Node 20, which it sets up itself via `actions/setup-node`. No pnpm install, no workspace checkout of Nullius, no API keys. The gates are pure value comparisons over the project state; nothing calls a model.

## Usage

```yaml
name: Research CI
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Mikopoto/nullius/action@v0
        with:
          project-path: myproject
          gate: all
          depth: standard
```

The `@v0` reference resolves once the repository is tagged; until then pin a commit SHA (`Mikopoto/nullius/action@<sha>`).

## Inputs

| Input | Default | Meaning |
| --- | --- | --- |
| `project-path` | `.` | Path to the Nullius project folder (the one containing `nullius.json`), relative to the workspace. |
| `gate` | `all` | Which gate to enforce: `numbers` (every result value traces to an execution artifact), `citations` (every citation reference is verified), `repro` (no divergent or failed reruns), or `all` (full readiness). |
| `depth` | `standard` | Readiness strictness: `quick`, `standard`, or `deep`. Controls the minimum evidence count and target readiness score. |

## Behavior

- Runs `nullius verify <project-path> --json --gate <gate> --depth <depth>` using the bundled CLI.
- Prints the full JSON report (the frozen contract described in [`docs/verify-contract.md`](../docs/verify-contract.md)) to the step log, so downstream steps can capture it.
- Writes a markdown table of all four gate results to the job summary (`$GITHUB_STEP_SUMMARY`), regardless of which single gate was enforced.
- Exits nonzero exactly when the selected gate fails, failing the job.

## Rebuilding the bundle

Maintainers: after changing `packages/cli`, `packages/core`, or `packages/server`, regenerate and commit the bundle (committing built action code is the GitHub Actions convention):

```bash
pnpm build:action
git add action/dist/nullius.cjs
```
