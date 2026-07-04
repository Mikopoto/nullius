# Design

## Theme

Single light theme everywhere ("paper and ink"). No dark surfaces: the former dark console is replaced by a light Activity pane on a second neutral layer. Scene: a researcher at a daylight desk supervising a run, reading for long stretches.

## Color (OKLCH, restrained strategy)

- `--bg` oklch(0.977 0.002 260) — content surface, cool-neutral off-white (not cream)
- `--bg-2` oklch(0.955 0.004 260) — second neutral layer: sidebar, activity pane, wells
- `--surface` white — cards, inputs
- `--ink` oklch(0.22 0.012 260) — primary text
- `--ink-2` oklch(0.45 0.012 260) — secondary text (≥4.5:1 on bg)
- `--line` oklch(0.90 0.004 260) / `--line-2` oklch(0.85 0.006 260) — borders
- `--accent` oklch(0.42 0.10 265) indigo-ink — primary actions, selection, focus rings only
- Semantic: `--ok` oklch(0.52 0.11 150) · `--warn` oklch(0.55 0.12 70) · `--bad` oklch(0.52 0.16 25), each with a `-bg` tint at L≈0.96
- Role markers (Activity pane, small chips only): planner=indigo, executor=teal oklch(0.50 0.09 200), reviewer=amber, synthesizer=violet oklch(0.48 0.10 300)

## Typography

- UI: Inter / system-ui, fixed rem scale ×1.2 → 12 / 13 / 15.5 / 19 / 23 / 28px, weights 450/550/650
- Data (ids, paths, numbers, stream text, usage badges): ui-monospace stack, 12–13px
- The manuscript (`.paper`) only: 'Iowan Old Style', Palatino, Georgia serif, 16.5px/1.7, measure ≤68ch — the produced artifact looks like a paper
- `text-wrap: balance` on headings

## Components

- Buttons: primary = solid accent; secondary = 1px `--line-2` outline on white; ghost = borderless. All: hover raise (bg shift), focus-visible 2px accent ring +2px offset, disabled 55% opacity
- Inputs/selects/textareas: white, 1px `--line-2`, radius 8px, accent focus ring
- Badges: pill, tinted semantic bg + dark semantic text (never full-saturation fills)
- Status dot: 8px circle, `--ok`/`--warn`/`--bad`
- Cards: white, 1px `--line`, radius 12px, padding 18–20px, no shadows except sticky headers (shadow only when floating)
- Empty states: one sentence of guidance + the action that fixes it (never bare "nothing here")

## Layout

- Workbench grid: 232px sidebar / 1fr main / 400px activity pane; activity collapses under 1080px
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32
- Radius scale: 8 (controls) / 12 (cards) / 999 (pills)
- Z-scale: sticky 10 / toast 30

## Motion

- 160ms ease-out on hover/focus/panel state; no page-load choreography
- Live stream caret blinks 1s step; under `prefers-reduced-motion` all transitions and the caret become static
