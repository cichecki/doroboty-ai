import { test, expect, type Page } from "@playwright/test";
import { initialState } from "../../src/features/prototype/model";
import { STORAGE_KEY } from "../../src/features/prototype/storage";
import { barsForCategory, EVIDENCE_PROMPTS } from "../../src/features/prototype/scope";

const job = initialState().jobs.find((item) => item.slug === "ai-product-manager")!;
const bars = barsForCategory(job.category);
const answerText =
  "Zaprojektowałam proces automatyzacji i przeprowadziłam badania użytkowników. Wynik: krótszy czas obsługi o 30%.";

async function open(page: Page, variant?: "A" | "B") {
  await page.goto("/");
  if (variant) {
    const state = initialState();
    state.experiment.formVariant = variant;
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
      key: STORAGE_KEY,
      raw: JSON.stringify(state),
    });
    await page.reload();
  }
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Anna Kowalska", exact: true }).click();
  await page.goto("/#/aplikuj/ai-product-manager");
}
const group = (page: Page, index: number) =>
  page.getByRole("group", { name: bars[index].question });
const send = (page: Page) => page.getByRole("button", { name: "Wyślij aplikację", exact: true });

test("form shows the project field and one radio group per scope bar", async ({ page }) => {
  await open(page);
  await expect(page.getByLabel("Projekt, o którym opowiadasz")).toBeVisible();
  for (const [index, bar] of bars.entries()) {
    await expect(group(page, index).getByRole("radio")).toHaveCount(4);
    for (const option of bar.options)
      await expect(group(page, index).getByLabel(option.candidate, { exact: true })).toBeVisible();
  }
});

test("submitting without scope answers stays on the page and focuses the first empty group", async ({
  page,
}) => {
  await open(page);
  await page.getByLabel("Projekt, o którym opowiadasz").fill("Automatyzacja zgłoszeń");
  await page.getByLabel("Dlaczego pasujesz do tej roli?").fill(answerText);
  await group(page, 0).getByRole("radio").nth(1).check();
  await send(page).click();
  await expect(page).toHaveURL(/aplikuj\/ai-product-manager/);
  await expect(
    page.getByRole("alert").filter({ hasText: "Wybierz odpowiedź przy każdym pytaniu" }),
  ).toBeVisible();
  await expect(group(page, 1).getByRole("radio").first()).toBeFocused();
});

test("answers 3 and 4 ask for evidence with a character count", async ({ page }) => {
  await open(page);
  await page.getByLabel("Projekt, o którym opowiadasz").fill("Automatyzacja zgłoszeń");
  await page.getByLabel("Dlaczego pasujesz do tej roli?").fill("Prowadziłam badania i wdrożenie.");
  await group(page, 0).getByRole("radio").nth(2).check();
  const evidence = page.getByLabel(EVIDENCE_PROMPTS[3], { exact: true });
  await expect(evidence).toBeVisible();
  await expect(page.getByRole("button", { name: /asystent|propozycj/i })).toHaveCount(0);
  await evidence.fill("za krótko ok");
  await group(page, 1).getByRole("radio").nth(1).check();
  await group(page, 2).getByRole("radio").nth(1).check();
  await page.getByRole("checkbox").check();
  await send(page).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Dopisz co najmniej 30 znaków (obecnie: 12)." }),
  ).toBeVisible();
  await group(page, 0).getByRole("radio").nth(1).check();
  await expect(evidence).toHaveCount(0);
  await page.getByRole("checkbox").check();
  await send(page).click();
  await expect(page).toHaveURL(/#\/app\/aplikacje\?wyslano=1$/);
});

test("a vague sentence in the answer triggers a probe quote at the matching bar", async ({
  page,
}) => {
  await open(page);
  const phrase = bars[0].vaguePhrases[0];
  const sentence = `Przez rok ${phrase} nad projektem.`;
  await page
    .getByLabel("Dlaczego pasujesz do tej roli?")
    .fill(`${sentence} Inne zdanie bez śladu.`);
  await expect(page.locator(".scope-probe").first()).toHaveText(
    `Napisałeś: »${sentence}«. Którą część zrobiłeś sam?`,
  );
});

test("the recruiter summary shows the short versions before consent", async ({ page }) => {
  await open(page);
  await page.getByLabel("Projekt, o którym opowiadasz").fill("Automatyzacja zgłoszeń");
  for (let i = 0; i < 3; i++) await group(page, i).getByRole("radio").nth(1).check();
  const summary = page.getByRole("region", { name: "Tak zobaczy to rekruter" });
  await expect(summary).toBeVisible();
  await expect(summary.getByText("Rola w projekcie", { exact: true })).toBeVisible();
  for (const bar of bars) await expect(summary).toContainText(bar.options[1].recruiter);
});

test("variant A never asks for evidence", async ({ page }) => {
  await open(page, "A");
  await group(page, 0).getByRole("radio").nth(3).check();
  await expect(page.getByLabel(EVIDENCE_PROMPTS[4], { exact: true })).toHaveCount(0);
  await expect(page.locator("textarea")).toHaveCount(1);
});

type Stored = {
  scopeSessions: { candidateId: string; jobId: string; variant: string; submittedAt?: string }[];
  applications: {
    candidateId: string;
    jobId: string;
    scope?: {
      project: string;
      durationMs: number;
      variant: string;
      answers: {
        barId: string;
        answer: number;
        evidence?: string;
        probeQuote?: string;
        changedAfterProbe: boolean;
      }[];
    };
  }[];
};
const stored = (page: Page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY) as Promise<Stored>;
const sessionsFor = (state: Stored) =>
  state.scopeSessions.filter((x) => x.candidateId === "candidate-anna" && x.jobId === job.id);

test("submit stores the scope payload and closes exactly one session", async ({ page }) => {
  await open(page);
  await expect(group(page, 0)).toBeVisible();
  expect(sessionsFor(await stored(page))).toHaveLength(1);
  await page.reload();
  await expect(group(page, 0)).toBeVisible();
  expect(sessionsFor(await stored(page))).toHaveLength(2);

  const sentence = `Przez rok ${bars[0].vaguePhrases[0]} nad projektem.`;
  await page.getByLabel("Projekt, o którym opowiadasz").fill("Automatyzacja zgłoszeń");
  await page
    .getByLabel("Dlaczego pasujesz do tej roli?")
    .fill(`${sentence} Inne zdanie bez śladu.`);
  await group(page, 0).getByRole("radio").nth(2).check();
  await page
    .getByLabel(EVIDENCE_PROMPTS[3], { exact: true })
    .fill("Napisałam integrację i sprawdziłam ją na danych.");
  await group(page, 0).getByRole("radio").nth(1).check();
  await group(page, 1).getByRole("radio").nth(1).check();
  await group(page, 2).getByRole("radio").nth(1).check();
  await page.getByRole("checkbox").check();
  await send(page).click();
  await expect(page).toHaveURL(/#\/app\/aplikacje\?wyslano=1$/);

  const state = await stored(page);
  const application = state.applications.find(
    (x) => x.candidateId === "candidate-anna" && x.jobId === job.id,
  )!;
  expect(application.scope).toMatchObject({ project: "Automatyzacja zgłoszeń", variant: "B" });
  expect(application.scope!.durationMs).toBeGreaterThanOrEqual(0);
  const [first, second, third] = application.scope!.answers;
  expect(first).toMatchObject({
    barId: bars[0].id,
    answer: 2,
    probeQuote: sentence,
    changedAfterProbe: true,
  });
  for (const item of [first, second, third]) expect(item.evidence).toBeUndefined();
  expect(second.changedAfterProbe).toBe(false);
  const sessions = sessionsFor(state);
  expect(sessions).toHaveLength(2);
  expect(sessions.filter((x) => x.submittedAt)).toHaveLength(1);
  expect(sessions.at(-1)!.submittedAt).toBeTruthy();
});

test("visiting an already submitted job does not open a scope session", async ({ page }) => {
  await open(page);
  await expect(group(page, 0)).toBeVisible();
  await page.getByLabel("Projekt, o którym opowiadasz").fill("Automatyzacja zgłoszeń");
  await page.getByLabel("Dlaczego pasujesz do tej roli?").fill(answerText);
  for (let i = 0; i < 3; i++) await group(page, i).getByRole("radio").nth(1).check();
  await page.getByRole("checkbox").check();
  await send(page).click();
  await expect(page).toHaveURL(/wyslano=1$/);
  const before = (await stored(page)).scopeSessions.length;
  await page.goto("/#/aplikuj/ai-product-manager");
  await page.reload();
  await expect(page.getByText("Aplikacja na tę ofertę została już wysłana.")).toBeVisible();
  expect((await stored(page)).scopeSessions).toHaveLength(before);
});
