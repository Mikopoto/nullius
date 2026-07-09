# AGENTS.md

Nullius is the referee, not the author. Do your research THROUGH it: it plans, writes and runs analysis code in a sandbox, and deterministic gates (numeric grounding, citation verification, reproducibility, write boundary) block any unverified claim from the report. Never edit `<project>/manuscript/report.md` (or any manuscript file) directly. The only write path into the report is a gated patch that you approve. If you hand-edit the report, you have defeated the entire tool.

## The loop (copy-pastable)

The CLI binary is `nullius`. Inside this repo before publish, use a shim:

```bash
nullius() { node packages/cli/dist/index.js "$@"; }   # after: pnpm --filter @nullius/cli build
```

```bash
# 1. Create the project, then put any input files in <project>/data/
nullius init proj --question "Is y linear in x in data/measurements.csv?"
cp measurements.csv proj/data/

# 2. First pass drafts a plan and pauses for adoption
nullius run proj

# 3. Read the drafted plan, then adopt it (this freezes the protocol)
nullius list plans --json proj      # copy the id you want
nullius adopt <planId> proj

# 4. Run again. If it pauses, it prints an `intervention.required` event.
#    Read the event detail, give one steering instruction, run again.
nullius run proj
nullius steer "the CSV path is data/measurements.csv" proj
nullius run proj

# 5. Review staged patches and approve or reject each one
nullius list patches --json proj    # copy the id, check blockingMarkers
nullius approve <patchId> proj      # or: nullius reject <patchId> proj

# 6. Verify. Repeat steps 4 to 6 until verify exits 0, then export.
nullius verify proj --json
nullius export md proj
```

`nullius list <kind> [folder] [--json]` discovers ids for `plans`, `patches`, `nodes`, `claims`, or `evidence`. Use `--json` when scripting; the payload is `{ schemaVersion, kind, items }` with the raw records.

## Exit-code contract

`nullius verify proj --json [--gate numbers|citations|repro|all]` is the test suite for facts.

- Exit 0: every number and citation in the report traces to sandbox evidence. You are done.
- Nonzero exit: read the `failures[]` array in the JSON. Each entry names an untraceable number, an unverified citation, or an irreproducible node. Fix it by steering the next run (`nullius steer "..." proj`) or by rerunning a node (`nullius rerun <nodeId> proj`), then verify again. Never fix a failure by editing the report; that only hides it and the gate will reopen it.

The shape of `verify --json` is a frozen contract (see `docs/verify-contract.md`).

## Mock mode and keys

- For tests and dry runs with no API key and no network model calls, add `--mock` to `run` (and `plan`): `nullius run proj --mock`. It uses deterministic local agents.
- API keys live in the OS keychain (`nullius keys set <provider> <key>`, macOS) or in environment variables (`nullius keys env` prints the names). Never write keys into project files, commits, or this repo.
