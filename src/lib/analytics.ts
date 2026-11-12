import type { PostHog } from "posthog-js";

/**
 * Product analytics (PostHog) for the hosted course URL only.
 *
 * It starts only when VITE_POSTHOG_KEY is set at build time, which happens on the Vercel
 * Production environment. Local dev, previews, tests and participant packages build without the
 * key and make no external requests. The library is a separate chunk loaded only with a key, so
 * it does not weigh down the app bundle.
 *
 * Events go to `/ingest` on the app's own domain; vercel.json rewrites it to PostHog (US cloud).
 * Browser blockers that cut requests to posthog.com therefore do not drop clicks and screens.
 *
 * Privacy: autocapture records clicks on links and buttons only. PostHog never records what is
 * typed into fields, and session replay (if enabled in the PostHog project) masks every input and
 * blocks any element marked with `ph-no-capture`.
 */
let client: PostHog | null = null;
let pendingPageview = false;

export async function initAnalytics(env: ImportMetaEnv = import.meta.env): Promise<boolean> {
  const key = env.VITE_POSTHOG_KEY;
  if (!key) return false;
  const { default: posthog } = await import("posthog-js");
  posthog.init(key, {
    api_host: env.VITE_POSTHOG_HOST || "/ingest",
    ui_host: "https://us.posthog.com",
    // Screens are hash routes; trackPageview() records each one (PostHog ignores hash changes).
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: { element_allowlist: ["a", "button"] },
    // Anonymous visitors only; no cookies, the id lives in this browser's localStorage.
    person_profiles: "identified_only",
    persistence: "localStorage",
    session_recording: { maskAllInputs: true, blockClass: "ph-no-capture" },
  });
  client = posthog;
  if (pendingPageview) trackPageview();
  return true;
}

/** Records a pageview for the current screen (full URL including `#/route`). No-op without a key. */
export function trackPageview() {
  if (!client) {
    pendingPageview = true;
    return;
  }
  pendingPageview = false;
  client.capture("$pageview");
}
