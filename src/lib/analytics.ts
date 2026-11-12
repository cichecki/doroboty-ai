/**
 * Product analytics (PostHog) for the hosted course URL only.
 *
 * It starts only when VITE_POSTHOG_KEY is set at build time, which happens on the Vercel
 * Production environment. Local dev, previews, tests and participant packages build without the
 * key and make no external requests. The library is a separate chunk loaded only with a key, so
 * it does not weigh down the app bundle.
 *
 * Privacy: autocapture records clicks on links and buttons only. PostHog never records what is
 * typed into fields, and session replay (if enabled in the PostHog project) masks every input and
 * blocks any element marked with `ph-no-capture`.
 */
export async function initAnalytics(env: ImportMetaEnv = import.meta.env): Promise<boolean> {
  const key = env.VITE_POSTHOG_KEY;
  if (!key) return false;
  const { default: posthog } = await import("posthog-js");
  posthog.init(key, {
    api_host: env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
    // Hash routes change the URL through the History API, so each screen counts as a pageview.
    capture_pageview: "history_change",
    capture_pageleave: true,
    autocapture: { element_allowlist: ["a", "button"] },
    // Anonymous visitors only; no cookies, the id lives in this browser's localStorage.
    person_profiles: "identified_only",
    persistence: "localStorage",
    session_recording: { maskAllInputs: true, blockClass: "ph-no-capture" },
  });
  return true;
}
