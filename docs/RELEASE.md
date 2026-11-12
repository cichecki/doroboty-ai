# Releasing the participant URL

The course app is a static build hosted on the Vercel project `doroboty-design-system`.
`vercel.json` serves the noir design-system page at `/` and the app at `/app`
(`index.html` is renamed to `app.html` during the Vercel build). There are no environment
variables, servers or databases: every participant's data lives in their own browser.

Production URL: https://doroboty-design-system.vercel.app (app: `/app`).
Preview URLs (`doroboty-design-system-<id>.vercel.app`) sit behind Vercel login, so never send
them to participants.

Owner and first responder: Kuba (project owner, Vercel account that deploys).

## 1. Release a specific commit

The Vercel project is connected to `github.com/cichecki/doroboty-ai` and its **production branch
is `noir-migracja`** (changed from `main` on 2026-11-12). Every push to `noir-migracja` builds
and goes live on the production URL automatically; pushes to other branches, including `main`,
create login-protected previews. Each deployment records its Git commit (`vercel inspect` or the
dashboard shows it).

1. Work on another branch, or make sure the change is ready before pushing: a push to
   `noir-migracja` is a release.
2. Run `./scripts/verify` and make sure it passes (it needs Playwright Chromium:
   `npx playwright install chromium`). For larger changes open a PR into `noir-migracja` so CI
   checks it on a clean Linux checkout and Vercel builds a preview first.
3. Push or merge to `noir-migracja`. Vercel builds and aliases the production URL.
4. Run the smoke test below on the production URL in a private browser window (no Vercel login).
5. Note the date and commit in the course channel or release notes.

To release without a new commit, rebuild an existing deployment:
`vercel redeploy <deployment-url> --target=production`.
When `noir` is merged into `main`, switch the production branch back to `main` in the Vercel
dashboard (project → Settings → Environments → Production → Branch Tracking).

## 2. Smoke test after every deployment (about 5 minutes)

Do it in a private window, so you start with an empty local save.

1. `/` shows the noir design-system page; `/app` loads the app without a Vercel login screen.
2. Choose Karolina (employer) and publish a job.
3. Switch to Anna (candidate), open that job, fill the application including the scope
   questions and submit it.
4. Switch back to the employer, open the application and record a decision.
5. Reload the page: the job, application and decision are still there. The browser console shows
   no red errors.

**Roll back** (section 3) if step 1 fails, or if the main flow (steps 2–5) cannot be completed
and the cause is not obvious within 15 minutes.

## 3. Roll back to the previous version

1. Find the previous production deployment: `vercel ls doroboty-design-system` (Environment =
   Production), or Vercel dashboard → project → Deployments.
2. Restore it: `vercel rollback <deployment-url>` (or **Instant Rollback** on that deployment in
   the dashboard).
3. Repeat smoke-test step 1 on the production URL.
4. After a rollback Vercel stops pointing new pushes at the production URL. When the fix is
   ready, push it and promote its deployment: `vercel promote <deployment-url>` (or **Promote**
   in the dashboard).

Data effect: older versions do not know the newer save fields (scope answers, research settings,
scope sessions). Zod drops unknown fields, so after a rollback those fields disappear from a
participant's browser save the next time it is written. Before rolling back during a session,
ask participants who need that data to export it from Settings first.

Forward compatibility: saves written by `main` (without scope fields) load in the noir version
with defaults; covered by `loads an old save without scope fields using defaults` in
`src/features/prototype/storage.test.ts`. The save format is still `version: 1`.

## 4. When something breaks during the course

1. **Site down or blank page:** roll back (section 3). Tell participants in the course channel
   that they can keep working locally with `npm ci` and `npm run dev` (http://127.0.0.1:3001).
2. **One participant's data is broken:** Settings → download the original save, then import a
   valid file or reset. The app never overwrites an unreadable save automatically.
3. **Bug in a new version:** roll back first, fix on a branch, release again with sections 1–2.

There is no automatic error reporting: the app deliberately makes no external requests.
Participants report problems in the course channel with a screenshot and the steps they took,
without pasting personal data.
