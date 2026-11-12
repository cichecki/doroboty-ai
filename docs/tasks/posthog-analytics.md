# PostHog analytics on the production URL

Slug: `posthog-analytics`
Created: 2026-11-12

## Goal

Course quest: see a pageview and an autocaptured click from the production URL
(https://doroboty-design-system.vercel.app/app) in PostHog (project “DoRoboty”, US cloud).

## Approach

- `posthog-js` (pinned 1.441.2) initialised in `src/lib/analytics.ts`, called from `src/main.tsx`.
  It is imported dynamically, so it is a separate chunk loaded only when the key is present (main
  bundle stays ~336 kB instead of ~667 kB).
- Starts only when `VITE_POSTHOG_KEY` is present at build time. The key is set on the Vercel
  **Production** environment only, so local dev, previews, Playwright and participant packages keep making no external
  requests (the e2e "no external requests" checks stay valid).
- First test (2026-11-12): only the first Pageview of each load reached PostHog (`…/app`, no
  `#/route`, no Autocapture). Two causes: PostHog's `history_change` ignores hash-only changes,
  and batched events (`/i/v0/e/`, `/s/`) were most likely cut by a browser blocker while the
  instant first pageview (`/e/`) passed. A local capture with a regular-browser profile showed the
  app sending `$autocapture` correctly. Fix: `PageviewTracker` in `app.tsx` records one pageview
  per screen (`capture_pageview: false`), and events go through `/ingest` (vercel.json rewrites to
  `us.i.posthog.com` / `us-assets.i.posthog.com`, `ui_host` us.posthog.com).
- Page leave, autocapture
  limited to `a` and `button`, anonymous `identified_only` profiles, `localStorage` persistence
  (no cookies).
- Privacy: PostHog never captures typed values; session replay masks all inputs; elements showing
  text written by people (`application-record` answer and stage notes, scope evidence) carry
  `ph-no-capture` (ignored by autocapture, blocked in replay).
- PostHog project settings (read from `/flags?config=true`): autocapture on, session replay on,
  console log recording on, web vitals on.

## Acceptance criteria

- [x] `./scripts/verify` passes; unit tests cover "off without key" and the init options.
- [x] Production build contains the PostHog key; previews/local do not.
- [x] PostHog Activity shows a Pageview and an Autocapture click ("clicked link with text "Oferty"")
      from the production URL (Kuba, 2026-11-12, after the /ingest fix in 36245f7).

## Register

FEATURES.md SYS-03 updated; SECURITY.md, architecture.md and RELEASE.md describe the boundary.
