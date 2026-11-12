import { beforeEach, describe, expect, it, vi } from "vitest";

const init = vi.fn();
const capture = vi.fn();
vi.mock("posthog-js", () => ({ default: { init, capture } }));

const env = (values: Record<string, string>) => values as unknown as ImportMetaEnv;
// Fresh module per test: the analytics client is module state.
async function load() {
  vi.resetModules();
  return import("./analytics");
}

describe("analytics", () => {
  beforeEach(() => {
    init.mockClear();
    capture.mockClear();
  });

  it("stays off without a key (local dev, previews, tests, participant packages)", async () => {
    const { initAnalytics, trackPageview } = await load();
    trackPageview();
    expect(await initAnalytics(env({}))).toBe(false);
    expect(init).not.toHaveBeenCalled();
    expect(capture).not.toHaveBeenCalled();
  });

  it("starts PostHog through the /ingest proxy with link/button autocapture and masked replay", async () => {
    const { initAnalytics } = await load();
    expect(await initAnalytics(env({ VITE_POSTHOG_KEY: "phc_test" }))).toBe(true);
    expect(init).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({
        api_host: "/ingest",
        ui_host: "https://us.posthog.com",
        capture_pageview: false,
        autocapture: { element_allowlist: ["a", "button"] },
        persistence: "localStorage",
        session_recording: expect.objectContaining({ maskAllInputs: true }),
      }),
    );
  });

  it("records the first screen once PostHog has loaded, then every later screen", async () => {
    const { initAnalytics, trackPageview } = await load();
    trackPageview();
    expect(capture).not.toHaveBeenCalled();
    await initAnalytics(env({ VITE_POSTHOG_KEY: "phc_test" }));
    expect(capture).toHaveBeenCalledTimes(1);
    trackPageview();
    expect(capture).toHaveBeenCalledTimes(2);
    expect(capture).toHaveBeenLastCalledWith("$pageview");
  });

  it("uses a configured host", async () => {
    const { initAnalytics } = await load();
    await initAnalytics(
      env({ VITE_POSTHOG_KEY: "phc_test", VITE_POSTHOG_HOST: "https://eu.i.posthog.com" }),
    );
    expect(init.mock.calls[0][1].api_host).toBe("https://eu.i.posthog.com");
  });
});
