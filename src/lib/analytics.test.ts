import { beforeEach, describe, expect, it, vi } from "vitest";

const init = vi.fn();
vi.mock("posthog-js", () => ({ default: { init } }));
const { initAnalytics } = await import("./analytics");

const env = (values: Record<string, string>) => values as unknown as ImportMetaEnv;

describe("initAnalytics", () => {
  beforeEach(() => init.mockClear());

  it("stays off without a key (local dev, previews, tests, participant packages)", async () => {
    expect(await initAnalytics(env({}))).toBe(false);
    expect(init).not.toHaveBeenCalled();
  });

  it("starts PostHog with link/button autocapture and masked replay when a key is set", async () => {
    expect(await initAnalytics(env({ VITE_POSTHOG_KEY: "phc_test" }))).toBe(true);
    expect(init).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({
        api_host: "https://us.i.posthog.com",
        capture_pageview: "history_change",
        autocapture: { element_allowlist: ["a", "button"] },
        persistence: "localStorage",
        session_recording: expect.objectContaining({ maskAllInputs: true }),
      }),
    );
  });

  it("uses a configured host", async () => {
    await initAnalytics(
      env({ VITE_POSTHOG_KEY: "phc_test", VITE_POSTHOG_HOST: "https://eu.i.posthog.com" }),
    );
    expect(init.mock.calls[0][1].api_host).toBe("https://eu.i.posthog.com");
  });
});
