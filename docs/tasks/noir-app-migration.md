# Migrate the running app to the noir design system

## Intent

Kuba asked to rebuild the whole application on the DoRoboty.ai noir design system
(`design-system.html`, sources in `src/sandbox/noir/`, v0.13.1). Noir replaces Poster People as
the visual direction of the running app. Behaviour, routes, data and workflows stay unchanged.

## Approach

1. Host token layer: `tokens.css` points the existing `--gui-*` and shadcn tokens at noir roles
   (ink canvas, panel surfaces, off-white text and frames, red accent, Satoshi / Climate Crisis /
   Bangers fonts, square skewed shapes).
2. Load the noir component CSS in the app entry and add `src/app/noir-host.css` for host
   recipes (shell, panels, primitives) that the sandbox does not cover.
3. Restyle shared Base UI primitives (button, input, select, checkbox, badge, dialog) once, so
   every screen follows.
4. Rebuild the shell (header, footer, workspace sidebar), home, job card, listing, offer,
   application form, employer screens and records with noir components where they exist
   (`Frame`, `ScoreTag`, `Portrait`, stage badges, timeline).

## Acceptance criteria

- Every route renders on the dark noir canvas with noir fonts, frames and buttons; no pink
  Poster People surfaces remain.
- All existing workflows still work: choose person, publish job, apply, employer decision,
  settings export/import/reset.
- Desktop and mobile widths have no horizontal overflow; keyboard focus is visible.
- `./scripts/verify` passes; e2e assertions that encoded Poster People values are updated to
  noir values.
- FEATURES.md reviewed; GUI.md points to noir.
