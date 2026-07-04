# Case-study evaluation artifacts (paper Section 8)

## Files

- `generate-dataset.py` / `measurements.csv` — the exact 40-point dataset (seed 7, y = 3.0x + 1.5 + N(0, 0.35)). The committed CSV is byte-identical to the one used in the recorded runs.
- `mock-run.txt` — deterministic mock end-to-end CLI transcript (init → run → adopt → run → verify → export).
- `fabricated-run.txt` — adversarial control: the mock synthesizer injects 9.4142; the write boundary blocks the patch and the manuscript stays empty.
- `real-run.txt` — the gated arm: gpt-4o-mini driving all three roles over `measurements.csv` (plan → adopt → run with self-correction → blocked embellished draft → steered rerun → reject → verify ready at score 1.0).
- `raw-baseline.md` — the ungated arm: the same model, same CSV inline, one direct chat completion (slope 1.9450 vs truth 3.0).
- `raw-audit.txt` — the raw report audited by `nullius verify --gate numbers` against an empty evidence bank.

## How the logs were captured

All Nullius-side results come from real CLI invocations (`node packages/cli/dist/index.js ...`). Two presentation filters were applied at capture time and are disclosed here:

1. Some `verify --json` outputs in `real-run.txt` and `raw-audit.txt` were piped through a small `python3 -c "json.load(...)"` selector to print only the relevant readiness fields instead of the full report. The underlying full reports are regenerable with the commands shown in the transcripts.
2. `raw-baseline.md` is the assistant message content extracted from the OpenRouter chat-completions JSON response (model `openai/gpt-4o-mini`).

## Reproducing

```bash
python3 generate-dataset.py > /tmp/proj/data/measurements.csv   # after nullius init /tmp/proj
```

Then follow the commands in `real-run.txt` top to bottom. Model outputs are stochastic, so the slope/R² digits will differ run to run; the gate behavior (artifact-grounded numbers pass, uncomputed statistics are blocked) is the reproducible claim.

The `codex-*` files are additional third-party-agent experiments (a coding agent driving the CLI, with and without Nullius) recorded after the paper runs; they are kept as-is.
