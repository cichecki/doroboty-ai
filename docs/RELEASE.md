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

1. Commit everything. `git status` must show no changes to tracked files: Vercel CLI uploads the
   working tree, not the commit.
2. Run `./scripts/verify` and make sure it passes (it needs Playwright Chromium:
   `npx playwright install chromium`). Prefer pushing the branch and opening a PR so CI also
   checks it on a clean Linux checkout.
3. Deploy a preview with the commit recorded:
   `vercel deploy -m commit=$(git rev-parse HEAD)`
   and run the smoke test below on the preview while logged in to Vercel.
4. Deploy to production the same way:
   `vercel deploy --prod -m commit=$(git rev-parse HEAD)`
5. Run the smoke test on the production URL in a private browser window (no Vercel login).
6. Note the date, commit and deployment URL in the course channel or release notes.

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
