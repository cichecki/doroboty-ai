# Prototype data boundary

This static frontend has no trusted server or real authentication. Role-specific UI and local transition checks organize the scenario; anyone using the browser can inspect all stored data. Use synthetic data only.

No API keys, credentials, real CVs or private material belong in frontend source, JSON, localStorage or exports. The one exception is the PostHog project key (`phc_…`), which is public by design and only injected as `VITE_POSTHOG_KEY` on the Vercel Production environment; personal PostHog API keys (`phx_…`) never belong in the repository or the frontend. Exports include private-in-the-UI source/recruiter notes.

Render imported text through React text nodes, validate imports with shared Zod schemas, reject unsupported versions, duplicate IDs, broken references and oversized files. Never overwrite an unreadable save automatically.

## Product analytics

The hosted production build sends anonymous pageviews and link/button clicks to PostHog (US cloud). Typed values are never captured. Elements showing text written by people (submitted answer, scope evidence, recruiter stage notes) carry `ph-no-capture`, so autocapture ignores them and session replay blocks them; replay also masks every input. Local, preview, test and participant builds have no key and send nothing.
