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

for (const width of [1440, 375]) {
  test(`scope form screenshot at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await open(page);
    await group(page, 0).getByRole("radio").nth(2).check();
    await group(page, 1).getByRole("radio").nth(1).check();
    await group(page, 2).getByRole("radio").nth(1).check();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `artifacts/scope-form-${width}.png`, fullPage: true });
  });
}
