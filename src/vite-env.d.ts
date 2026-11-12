/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** PostHog project API key (public by design). Set only on the Vercel Production environment. */
  readonly VITE_POSTHOG_KEY?: string;
  /** PostHog ingestion host, e.g. https://us.i.posthog.com. */
  readonly VITE_POSTHOG_HOST?: string;
}
