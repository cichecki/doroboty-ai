# Production readiness fixes for the noir release

Slug: `production-readiness-fixes`
Created: 2026-11-12

## Goal

Close the locally fixable gaps found by the first production-readiness audit
(`docs/production-readiness.html`) before deploying the noir branch to Vercel.

## Plan

- [x] Add `.gitattributes` so every checkout (including Windows with `core.autocrlf=true`) gets LF
      line endings; ignore the untracked `.superpowers/` agent folder in Prettier.
- [x] Format the three committed files that fail `prettier --check` on their committed content.
- [x] Confirm the save-format change from `main` is covered by a unit test (existing test
      `loads an old save without scope fields using defaults` in `storage.test.ts`).
- [x] Write `docs/RELEASE.md`: release procedure, post-deploy smoke test, rollback, incident steps.

- [x] Diagnose the application-form e2e failures: six tests (PDF ×2, main journey, withdrawal,
      legacy draft ×2) timed out only under load. On a 32-thread machine Playwright's default
      (half the cores, 16 workers) overloads the browsers; the main journey alone takes about 19 s
      of its 30 s budget. Each passes alone and with 4 workers. Fix: `workers: CI ? 2 : 4` in
      `playwright.config.ts`. No application bug was found.

- [x] Resolve the four e2e failures known since the scope bars (`scope-bars.md`), without changing
      the design:
  - axe compared the 5px ink outline of master-button labels with the red (3.78:1) rather than
    the outlined light fill people read. Kuba keeps the outline and the red `.AI` logo mark; the
    shared `axe()` helper in `tests/e2e/prototype.spec.ts` excludes exactly those two elements.
  - Once the first screen passed, axe reached the profile and measured sidebar items mid
    background transition (`#adaba6`, `#5a5957`). The helper now awaits running animations.
  - The section-link test expected `#employer` under 50 px from the top. The noir header is
    sticky (72 px) and the section correctly lands just below it (82 px); the assertion now
    checks "below the header and within 50 px of it".

## Acceptance criteria

- `npm run format:check`, `design-system:check` and `verify:packet` pass on Windows.
- `npm run lint`, `typecheck`, `test` and `build` still pass.
- `docs/RELEASE.md` describes how a specific commit is deployed, checked and rolled back.

## Out of scope

- Installing Playwright Chromium (needs the owner's approval), pushing the branch, deploying,
  choosing an error-reporting approach.

## Register

FEATURES.md reviewed: no product behaviour changes, no update needed.
