# Paski zakresu pracy w zgłoszeniu – plan wdrożenia

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kandydat odpowiada w formularzu aplikacji na 3 paski zakresu własnej pracy (4 opisowe odpowiedzi, dowód przy 3–4, dopytanie z cytatem z tekstu). Rekruter widzi blok „Rola w projekcie” i listę ułożoną od osób, które zrobiły coś same. Do tego warianty A/B do E3, przełącznik mnożnika Match Score (E6), eksport danych badania i osobny widok badania E2.

**Architecture:** Czysta logika (bank pasków, liczenie, sortowanie, wykrywanie ogólników, mnożnik, eksport CSV) siedzi w `src/features/prototype/scope*.ts` i ma testy jednostkowe. Model stanu (`model.ts`, Zod) dostaje opcjonalne pola, żeby stare zapisy i istniejące testy dalej działały. UI w React reużywa komponentów noir (`NRadioGroup`, `Frame`, `Button`, `MatchScore`).

**Tech Stack:** React 19, TypeScript, Zod 4, react-router 7 (HashRouter), Vitest, Playwright, CSS noir.

**Spec:** `docs/tasks/scope-bars-spec.md` (kopia z `brain/.../prototyp-paski/specyfikacja.md`). Bank pasków, teksty odpowiedzi i wzór mnożnika są tam i trzeba je przepisać **dosłownie**.

## Global Constraints

- Cały tekst UI po polsku. Teksty pasków i odpowiedzi dosłownie ze specyfikacji, sekcja „Bank pasków i odpowiedzi”.
- Styl noir: reużyj `NRadioGroup` z `src/sandbox/noir/forms.tsx`, `Frame`/`Portrait` z `src/sandbox/noir/comic.tsx`, `Button` z `src/components/ui/button.tsx`, istniejące klasy CSS. Nowe style dopisuj do `src/app/application.css` (formularz) albo `src/app/records.css` (widoki rekrutera). Bez nowych zależności npm.
- Rekruter i kandydat nie widzą żadnych liczb ani pasków postępu przy paskach. Jedyna liczba to istniejący Match Score (albo wynik z mnożnikiem, gdy przełącznik jest włączony).
- Kandydat nigdy nie widzi przełącznika mnożnika, wyniku z mnożnikiem ani informacji, że paski wpływają na wynik.
- Pole dowodu nie ma przycisku asystenta.
- Stare zapisy w localStorage muszą się dalej wczytywać: wszystkie nowe pola stanu są opcjonalne albo mają `.default(...)`. `version` zostaje `1`.
- Nie psujemy istniejących ścieżek ani testów. Po każdym zadaniu: `npm run typecheck`, `npm run lint`, `npm test` przechodzą. Pełne `./scripts/verify` (z e2e) na końcu.
- Każde zadanie kończy się commitem na gałęzi `noir-migracja` z wiadomością zakończoną linią `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. Stary zapis w localStorage (bez `experiment`, `scopeSessions`, `scope`) – aplikacja startuje bez błędu „Nie udało się odczytać zapisu”. Test w Task 2.
2. Kandydat wybiera 3, wpisuje dowód, zmienia na 2 – dowód przestaje być wymagany i nie blokuje wysyłki; dowód wpisany przy 2 nie trafia do zgłoszenia. Test w Task 2 (model odrzuca/ignoruje) i Task 3 (e2e).
3. Zgłoszenia bez pasków (przykładowe `application-example` sprzed zmiany w czyimś zapisie, zgłoszenia z importu) na liście rekrutera – nie wywalają widoku, lądują na końcu, bez bloku albo z napisem „Brak odpowiedzi o roli w projekcie”. Test w Task 1 (sortowanie) i Task 4.
4. Tekst kandydata bez kropek albo z frazą w środku długiego zdania – `findVagueSentence` zwraca całe zdanie (albo cały tekst), nigdy pusty string; wielkość liter i polskie znaki nie mają znaczenia. Test w Task 1.
5. Wariant A (bez dowodu) – formularz nie pokazuje pól dowodu i wysyła się bez nich, model nie wymaga dowodu. Test w Task 2 i Task 3.

---

### Task 1: Bank pasków i czysta logika

**Files:**

- Create: `src/features/prototype/scope.ts`
- Test: `src/features/prototype/scope.test.ts`

**Interfaces:**

- Produces:

  ```ts
  export type ScopeCategory = "build" | "apply" | "lead";
  export type ScopeAnswer = 1 | 2 | 3 | 4;
  export type FormVariant = "A" | "B";
  export interface ScopeOption {
    candidate: string;
    recruiter: string;
  }
  export interface ScopeBar {
    id: "B1" | "B2" | "B3" | "A1" | "A2" | "A3" | "L1" | "L2" | "L3";
    category: ScopeCategory;
    title: string; // np. "Własny komponent (kod, moduł, pipeline)"
    question: string; // np. "Jaka była Twoja rola w budowie rozwiązania?"
    options: [ScopeOption, ScopeOption, ScopeOption, ScopeOption]; // odpowiedzi 1..4
    vaguePhrases: string[]; // małymi literami
  }
  export const SCOPE_BARS: readonly ScopeBar[];
  export const EVIDENCE_PROMPTS: Record<3 | 4, string>;
  export const MIN_EVIDENCE_LENGTH = 30;
  export const SCOPE_PROMPT = "Jaka była Twoja rola w tym projekcie?";
  export function barsForCategory(category: ScopeCategory): ScopeBar[];
  export function barById(id: string): ScopeBar | undefined;
  export function ownCount(answers: readonly number[]): number; // liczba odpowiedzi >= 3
  export function fullCount(answers: readonly number[]): number; // liczba odpowiedzi === 4
  export function multiplierScore(score: number, own: number): number; // Math.round(score * (1 + own / 3) / 2)
  export function evidenceRequired(variant: FormVariant, answer: number | undefined): boolean; // variant B i answer >= 3
  export function findVagueSentence(text: string, bar: ScopeBar): string | null;
  export function ownLabel(own: number, total?: number): string; // `Sam: ${own} z ${total ?? 3} obszarów`
  export interface Rankable {
    answers: readonly number[];
    submittedAt: string;
    score: number;
  }
  export function compareByScope(a: Rankable, b: Rankable): number; // own desc, full desc, submittedAt asc
  export function compareByMultiplier(a: Rankable, b: Rankable): number; // multiplierScore desc, submittedAt asc
  ```

- [ ] **Step 1: Write the failing tests** in `scope.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  SCOPE_BARS,
  barsForCategory,
  barById,
  ownCount,
  fullCount,
  multiplierScore,
  evidenceRequired,
  findVagueSentence,
  ownLabel,
  compareByScope,
  compareByMultiplier,
  EVIDENCE_PROMPTS,
  MIN_EVIDENCE_LENGTH,
} from "./scope";

describe("bank pasków", () => {
  it("ma po 3 paski na kategorię, każdy z 4 odpowiedziami", () => {
    expect(SCOPE_BARS).toHaveLength(9);
    expect(barsForCategory("build").map((b) => b.id)).toEqual(["B1", "B2", "B3"]);
    expect(barsForCategory("apply").map((b) => b.id)).toEqual(["A1", "A2", "A3"]);
    expect(barsForCategory("lead").map((b) => b.id)).toEqual(["L1", "L2", "L3"]);
    for (const bar of SCOPE_BARS) {
      expect(bar.options).toHaveLength(4);
      expect(bar.vaguePhrases.length).toBeGreaterThan(0);
    }
  });
  it("przepisuje teksty ze specyfikacji", () => {
    const b1 = barById("B1")!;
    expect(b1.question).toBe("Jaka była Twoja rola w budowie rozwiązania?");
    expect(b1.options[3]).toEqual({
      candidate: "Sam zbudowałem komponent i sprawdziłem, że działa na danych",
      recruiter: "Sam zbudował komponent",
    });
    expect(barById("L3")!.options[0].recruiter).toBe("Bez kryteriów");
    expect(EVIDENCE_PROMPTS[3]).toBe("Która część była Twoja, a kto robił resztę?");
    expect(EVIDENCE_PROMPTS[4]).toBe("Po czym poznaliście, że zadziałało?");
    expect(MIN_EVIDENCE_LENGTH).toBe(30);
  });
});
describe("liczenie", () => {
  it("liczy obszary zrobione samemu i w pełni", () => {
    expect(ownCount([2, 3, 4])).toBe(2);
    expect(fullCount([2, 3, 4])).toBe(1);
    expect(ownCount([])).toBe(0);
  });
  it("mnożnik ze specyfikacji", () => {
    expect(multiplierScore(80, 2)).toBe(67);
    expect(multiplierScore(80, 3)).toBe(80);
    expect(multiplierScore(80, 0)).toBe(40);
  });
  it("dowód tylko w wariancie B przy 3 i 4", () => {
    expect(evidenceRequired("B", 3)).toBe(true);
    expect(evidenceRequired("B", 4)).toBe(true);
    expect(evidenceRequired("B", 2)).toBe(false);
    expect(evidenceRequired("A", 4)).toBe(false);
    expect(evidenceRequired("B", undefined)).toBe(false);
  });
  it("etykieta znacznika", () => {
    expect(ownLabel(2)).toBe("Sam: 2 z 3 obszarów");
  });
});
describe("wykrywanie ogólników", () => {
  const a1 = barById("A1")!;
  it("zwraca pierwsze zdanie z frazą, bez względu na wielkość liter", () => {
    const text = "Lubię dane. WDRAŻAŁEM rozwiązanie w organizacji. Wdrażałem też drugie.";
    expect(findVagueSentence(text, a1)).toBe("WDRAŻAŁEM rozwiązanie w organizacji.");
  });
  it("zwraca cały tekst, gdy nie ma kropek", () => {
    expect(findVagueSentence("wdrażałem rozwiązanie w organizacji", a1)).toBe(
      "wdrażałem rozwiązanie w organizacji",
    );
  });
  it("zwraca null bez frazy i dla pustego tekstu", () => {
    expect(findVagueSentence("Napisałem moduł wyszukiwania.", a1)).toBeNull();
    expect(findVagueSentence("   ", a1)).toBeNull();
  });
});
describe("kolejność listy rekrutera", () => {
  const app = (answers: number[], submittedAt: string, score = 50) => ({
    answers,
    submittedAt,
    score,
  });
  it("najpierw liczba 3–4, potem liczba 4, potem najstarsze", () => {
    const list = [
      app([2, 2, 2], "2026-11-01T00:00:00.000Z"),
      app([3, 3, 1], "2026-11-03T00:00:00.000Z"),
      app([4, 3, 1], "2026-11-04T00:00:00.000Z"),
      app([3, 3, 1], "2026-11-02T00:00:00.000Z"),
      app([], "2026-10-01T00:00:00.000Z"),
    ].sort(compareByScope);
    expect(list.map((x) => x.submittedAt.slice(8, 10))).toEqual(["04", "02", "03", "01", "01"]);
    expect(list.at(-1)!.answers).toEqual([]);
  });
  it("z mnożnikiem po wyniku, remis – najstarsze", () => {
    const list = [
      app([1, 1, 1], "2026-11-01T00:00:00.000Z", 90), // 45
      app([3, 3, 3], "2026-11-02T00:00:00.000Z", 60), // 60
      app([3, 3, 3], "2026-11-01T12:00:00.000Z", 60), // 60
    ].sort(compareByMultiplier);
    expect(list.map((x) => x.submittedAt)).toEqual([
      "2026-11-01T12:00:00.000Z",
      "2026-11-02T00:00:00.000Z",
      "2026-11-01T00:00:00.000Z",
    ]);
  });
});
```

- [ ] **Step 2:** Run `npx vitest run src/features/prototype/scope.test.ts` – FAIL (moduł nie istnieje).
- [ ] **Step 3: Implement `scope.ts`.** `SCOPE_BARS` w kolejności B1, B2, B3, A1, A2, A3, L1, L2, L3; tytuły (część pogrubiona przed „—”), pytania i obie kolumny odpowiedzi przepisane dosłownie ze specyfikacji. `findVagueSentence`: dziel tekst wyrażeniem `/(?<=[.!?])\s+/`, porównuj `toLocaleLowerCase("pl")`, zwracaj przycięte zdanie. `vaguePhrases` (małe litery):
  - B1: `budowałem`, `tworzyłem rozwiązanie`, `odpowiadałem za`, `byłem zaangażowany`, `uczestniczyłem`, `rozwijałem`
  - B2: `dbałem o jakość`, `testowałem`, `sprawdzałem`, `weryfikowałem`, `sprawdzania efektów`
  - B3: `utrzymywałem`, `wspierałem`, `odpowiadałem za działanie`, `po wdrożeniu`
  - A1: `wdrażałem`, `w organizacji`, `w dwóch działach`, `prowadziłem projekt`, `uczestniczyłem`, `zmieniałem proces`
  - A2: `mierzyłem`, `sprawdzania efektów`, `efekty`, `wyniki`, `adopcj`
  - A3: `potrzeby użytkowników`, `z użytkownikami`, `szkoliłem`, `współpracować z osobami`
  - L1: `koordynowałem`, `priorytet`, `ustalałem kierunek`, `prowadziłem projekt`
  - L2: `budżet`, `uzgodniony zakres`, `decydowałem`, `odpowiadałem za`
  - L3: `kryteri`, `decyzj`, `byłem zaangażowany`
- [ ] **Step 4:** Run the same test – PASS. Run `npm run typecheck && npm run lint`.
- [ ] **Step 5: Commit** `feat: scope bars bank and ranking logic`.

---

### Task 2: Model stanu – paski w zgłoszeniu, ustawienia badania, sesje formularza

**Files:**

- Modify: `src/features/prototype/model.ts`
- Test: `src/features/prototype/model.test.ts` (dopisz `describe("paski zakresu", ...)`), `src/features/prototype/storage.test.ts` (dopisz test starego zapisu)

**Interfaces:**

- Consumes: z Task 1 `barsForCategory`, `evidenceRequired`, `MIN_EVIDENCE_LENGTH`, `FormVariant`.
- Produces (eksporty z `model.ts`):

  ```ts
  export type ScopeAnswerInput = {
    barId: string;
    answer: 1 | 2 | 3 | 4;
    evidence?: string;
    probeQuote?: string;
    changedAfterProbe: boolean;
  };
  export type ApplicationScope = {
    project: string;
    variant: "A" | "B";
    answers: ScopeAnswerInput[];
    durationMs: number;
  };
  // Application.scope?: ApplicationScope
  // State.experiment: { formVariant: "A"|"B"; multiplier: boolean }   (default { formVariant: "B", multiplier: false })
  // State.scopeSessions: { candidateId: string; jobId: string; variant: "A"|"B"; openedAt: string; submittedAt?: string }[]  (default [])
  // Action dodatkowo:
  //   submit: { ...; scope?: { project: string; answers: ScopeAnswerInput[]; durationMs: number } }
  //   | { type: "experiment"; formVariant: "A"|"B"; multiplier: boolean }
  //   | { type: "scope_open"; jobId: string }
  ```

- [ ] **Step 1: Write the failing tests** (w `model.test.ts`, korzystając z istniejących `as()` i `time`):
  - `experiment` działa bez wybranej osoby i zmienia `state.experiment`; domyślnie `initialState().experiment` to `{ formVariant: "B", multiplier: false }`, a `scopeSessions` to `[]`.
  - `scope_open` jako `candidate-anna` dla `s.jobs[0].id` dopisuje sesję z `variant` z `state.experiment.formVariant` i `openedAt === time`, bez `submittedAt`. Jako pracodawca rzuca błąd „Wybierz profil kandydata.”.
  - `submit` z `scope` (paski z `barsForCategory(job.category)`, odpowiedzi `[3, 2, 1]`, dowód ≥ 30 znaków przy pierwszym) zapisuje `application.scope` z `variant: "B"`, a ostatnia otwarta sesja tej pary dostaje `submittedAt === time`.
  - `submit` w wariancie B z odpowiedzią 3 i dowodem krótszym niż 30 znaków (po `trim`) rzuca „Uzupełnij odpowiedzi o swojej roli w projekcie.”.
  - `submit` z `barId` spoza kategorii ogłoszenia albo z 2 odpowiedziami rzuca ten sam błąd.
  - `submit` z odpowiedzią 2 i wpisanym dowodem zapisuje odpowiedź **bez** pola `evidence`.
  - Po `experiment` z `formVariant: "A"`: `submit` z odpowiedzią 4 bez dowodu przechodzi, `scope.variant === "A"`, a dowód przy 4 w wariancie A też jest usuwany.
  - `submit` bez `scope` dalej działa (istniejące testy bez zmian).
  - `initialState().applications[0].scope` istnieje, ma 3 odpowiedzi dla pasków kategorii `initialState().jobs[0].category`.
  - W `storage.test.ts`: `parseState` na JSON-ie `initialState()` z usuniętymi kluczami `experiment`, `scopeSessions` i `applications[*].scope` zwraca stan z domyślnymi wartościami.
- [ ] **Step 2:** `npx vitest run src/features/prototype` – nowe testy FAIL.
- [ ] **Step 3: Implement w `model.ts`.** Schematy:
  ```ts
  const scopeAnswerSchema = z.object({
    barId: id,
    answer: z.number().int().min(1).max(4),
    evidence: text.max(600).optional(),
    probeQuote: text.max(600).optional(),
    changedAfterProbe: z.boolean(),
  });
  const scopeSchema = z.object({
    project: shortText,
    variant: z.enum(["A", "B"]),
    answers: z.array(scopeAnswerSchema).length(3),
    durationMs: z.number().int().nonnegative(),
  });
  ```
  `applicationSchema` dostaje `scope: scopeSchema.optional()`. `stateSchema` dostaje `experiment: z.object({ formVariant: z.enum(["A","B"]), multiplier: z.boolean() }).default({ formVariant: "B", multiplier: false })` i `scopeSessions: z.array(z.object({ candidateId: id, jobId: id, variant: z.enum(["A","B"]), openedAt: z.iso.datetime(), submittedAt: z.iso.datetime().optional() })).max(5000).default([])`. W `submit`: jeśli `action.scope` jest, sprawdź, że `barId` są dokładnie `barsForCategory(job.category)` w tej kolejności, każdy `evidenceRequired(variant, answer)` ma `evidence.trim().length >= MIN_EVIDENCE_LENGTH`; w przeciwnym razie `fail("Uzupełnij odpowiedzi o swojej roli w projekcie.")`. Usuń `evidence`, gdy `!evidenceRequired(...)`. `variant` bierz z `s.experiment.formVariant`. Potem ustaw `submittedAt = now` w ostatniej sesji tej pary bez `submittedAt` (jeśli jest). Przykładowe zgłoszenie w `initialState()` dostaje `scope`: `project: "Automatyzacja obsługi zgłoszeń"`, `variant: "B"`, odpowiedzi `[3, 2, 1]` dla pasków kategorii `jobs[0]`, dowód przy pierwszej: `"Zaproponowałem kolejność wdrożenia i uzgodniłem ją ze sponsorem projektu."`, `changedAfterProbe: false`, `durationMs: 240000`.
- [ ] **Step 4:** `npm test && npm run typecheck && npm run lint` – PASS.
- [ ] **Step 5: Commit** `feat: scope answers, experiment settings and form sessions in state`.

---

### Task 3: Formularz kandydata z paskami

**Files:**

- Create: `src/features/prototype/scope-questions.tsx`, `src/features/prototype/scope-block.tsx`
- Modify: `src/features/prototype/workspace.tsx` (`ApplyPage`), `src/app/application.css`, `src/app/records.css`
- Test: `tests/e2e/prototype.spec.ts` (helper + nowe testy), `tests/e2e/scope.spec.ts` (nowy)

**Interfaces:**

- Consumes: Task 1 (`barsForCategory`, `findVagueSentence`, `evidenceRequired`, `EVIDENCE_PROMPTS`, `MIN_EVIDENCE_LENGTH`, `SCOPE_PROMPT`), Task 2 (`scope_open`, `submit.scope`, `state.experiment.formVariant`).
- Produces:

  ```ts
  // scope-questions.tsx
  export type ScopeDraftItem = {
    answer?: 1 | 2 | 3 | 4;
    firstAnswer?: 1 | 2 | 3 | 4;
    evidence: string;
  };
  export type ScopeDraft = Record<string, ScopeDraftItem>; // klucz: barId
  export function ScopeQuestions(props: {
    bars: ScopeBar[];
    variant: FormVariant;
    answerText: string;
    value: ScopeDraft;
    onChange: (next: ScopeDraft) => void;
    disabled?: boolean;
    attempted: boolean;
  }): JSX.Element;
  export function scopeProblems(
    bars: ScopeBar[],
    variant: FormVariant,
    value: ScopeDraft,
  ): string[]; // barId-y z brakami
  // scope-block.tsx (używane też w Task 4 i 7)
  export function ScopeBlock(props: {
    answers: { barId: string; answer: number; evidence?: string }[];
    heading?: string;
  }): JSX.Element;
  // heading domyślnie "Rola w projekcie"; wiersz = tytuł paska, krótka wersja dla rekrutera, dowód w cudzysłowie „…”.
  // Puste answers → <p>Brak odpowiedzi o roli w projekcie.</p>
  export function OwnTag(props: { answers: readonly number[] }): JSX.Element; // tekst ownLabel(ownCount(answers))
  ```

- [ ] **Step 1: Write failing e2e** w `tests/e2e/scope.spec.ts` (wzoruj się na helperach z `prototype.spec.ts`; ogłoszenie `ai-product-manager`, Anna Kowalska):
  - Formularz pokazuje pole „Projekt, o którym opowiadasz” i 3 grupy radio z legendą = pytanie paska, każda z 4 odpowiedziami kandydata.
  - Wysłanie bez wyboru pasków: zostajemy na stronie, widać komunikat błędu przy paskach, fokus na pierwszej grupie bez odpowiedzi.
  - Wybór odpowiedzi 3 przy pierwszym pasku pokazuje pole z etykietą `"Która część była Twoja, a kto robił resztę?"`; wpisanie 10 znaków i wysyłka – błąd z liczbą znaków; po zmianie na odpowiedź 2 pole znika i wysyłka przechodzi.
  - Tekst odpowiedzi z frazą z `vaguePhrases` pierwszego paska kategorii ogłoszenia pokazuje przy tym pasku cytat w formie `Napisałeś: »…«. Którą część zrobiłeś sam?`.
  - Przed zgodą widać podsumowanie „Tak zobaczy to rekruter” z blokiem „Rola w projekcie” (krótkie wersje odpowiedzi).
  - Po ustawieniu w localStorage stanu z `experiment.formVariant = "A"` pole dowodu nie pojawia się przy odpowiedzi 4.
- [ ] **Step 2: Napraw istniejące e2e.** W `prototype.spec.ts` dodaj helper `fillScope(page, answer = 2)`: wypełnia „Projekt, o którym opowiadasz” tekstem `"Automatyzacja zgłoszeń"` i w każdej z 3 grup radio zaznacza odpowiedź o indeksie `answer`. Wywołaj go przed zaznaczeniem zgody w każdym teście, który wysyła aplikację (helper `application()` i miejsca z `"Wyślij aplikację"`). Testy sprawdzające kolejność fokusu przy błędach dopasuj tak, żeby nadal sprawdzały to samo zachowanie.
- [ ] **Step 3:** `npm run build && npx playwright test tests/e2e/scope.spec.ts` – FAIL.
- [ ] **Step 4: Implement.** W `ApplyPage`: `bars = barsForCategory(job.category)`, `variant = state.experiment.formVariant`; przy pierwszym renderze z kandydatem i ogłoszeniem `run({ type: "scope_open", jobId })` raz (`useRef`-strażnik) i zapamiętaj `openedAt = Date.now()`. Kolejność sekcji: CV → pole „Projekt, o którym opowiadasz” (`Input`, `maxLength={200}`) → „Dlaczego pasujesz do tej roli?” → `ScopeQuestions` (nagłówek `SCOPE_PROMPT`) → podsumowanie „Tak zobaczy to rekruter” (`ScopeBlock` z wybranych odpowiedzi; tylko gdy wszystkie 3 wybrane) → zgoda i przyciski. `ScopeQuestions`: dla każdego paska `NRadioGroup` (legenda = `bar.question`, opcje = `bar.options[i].candidate`, wartości `"1".."4"`); nad grupą, gdy `findVagueSentence(answerText, bar)` nie jest null, cytat `Napisałeś: »{zdanie}«. Którą część zrobiłeś sam?`; pod grupą, gdy `evidenceRequired`, `Textarea` z etykietą `EVIDENCE_PROMPTS[answer]`, licznik znaków i komunikat przy `attempted` i długości < 30: `Dopisz co najmniej 30 znaków (obecnie: N).` Bez przycisku asystenta. Przy submit: kolejno walidacja odpowiedzi tekstowej (jak dziś) → projekt niepusty (`Wpisz, o którym projekcie opowiadasz.`) → `scopeProblems` (fokus na pierwszym radio paska z problemem; komunikat `Wybierz odpowiedź przy każdym pytaniu o rolę i uzupełnij wymagane pola.`) → zgoda. Do `submit` przekaż `scope: { project, answers, durationMs: Date.now() - openedAt }`, gdzie `answers[i] = { barId, answer, evidence, probeQuote: findVagueSentence(...) ?? undefined, changedAfterProbe: Boolean(probeQuote) && firstAnswer !== answer }`. `firstAnswer` ustawiaj przy pierwszym wyborze w danym pasku. Zmiana pasków, podobnie jak zmiana tekstu, odznacza zgodę. Paski nie zapisują się w szkicu.
- [ ] **Step 5:** `npm run build && npx playwright test` – PASS (wszystkie e2e). `npm run lint && npm run typecheck`.
- [ ] **Step 6: Commit** `feat: scope questions in candidate application form`.

---

### Task 4: Widoki rekrutera – blok, znacznik, kolejność, przełącznik mnożnika

**Files:**

- Modify: `src/features/prototype/workspace.tsx` (`ApplicationsPage`), `src/features/prototype/application-record.tsx`, `src/app/records.css`
- Test: `tests/e2e/scope.spec.ts` (dopisz)

**Interfaces:**

- Consumes: Task 1 (`compareByScope`, `compareByMultiplier`, `multiplierScore`, `ownCount`), Task 3 (`ScopeBlock`, `OwnTag`), Task 2 (`application.scope`, `state.experiment.multiplier`).
- Produces: `ApplicationRecord` przyjmuje w `application` także pole `scope` (opcjonalne) i renderuje `ScopeBlock` pod przesłaną odpowiedzią dla obu ról.

- [ ] **Step 1: Write failing e2e:**
  - Jako `employer-brightlabs` lista „Kandydaci”: przy przykładowym zgłoszeniu widać `"Sam: 1 z 3 obszarów"` i rozwijany podgląd „Rola w projekcie” z krótkimi odpowiedziami.
  - Po wysłaniu przez Annę zgłoszenia z odpowiedziami `[4, 3, 3]` (dowody ≥ 30 znaków) na ofertę tej samej firmy co zgłoszenie przykładowe, Anna jest na liście przed Markiem.
  - Szczegóły zgłoszenia pokazują blok „Rola w projekcie” z dowodem w cudzysłowie.
  - Ze stanem `experiment.multiplier = true` (localStorage) karta pokazuje `Match Score: {multiplierScore(score, own)}%` i lista jest ułożona według tego wyniku; przy `false` Match Score jest bez zmian.
  - Kandydat w „Moje aplikacje” nie widzi znacznika „Sam: …” ani wyniku z mnożnikiem nawet przy `multiplier = true`.
- [ ] **Step 2:** `npm run build && npx playwright test tests/e2e/scope.spec.ts` – FAIL.
- [ ] **Step 3: Implement.** W `ApplicationsPage` tylko dla `employer`: mapuj zgłoszenie na `Rankable` (`answers = scope?.answers.map(a => a.answer) ?? []`, `submittedAt = events[0].at`, `score`), sortuj `compareByMultiplier` gdy `state.experiment.multiplier`, inaczej `compareByScope`; pokaż `OwnTag` pod etapem i `<details>` z `<summary>Rola w projekcie</summary>` oraz `ScopeBlock`; `MatchScore` dostaje `multiplierScore(...)` tylko gdy przełącznik włączony. Widok kandydata bez zmian. W `ApplicationRecord` dodaj `ScopeBlock` (z projektem jako podtytułem `Projekt: {project}`) w sekcji „Odpowiedź”, gdy `scope` istnieje; dla pracodawcy przy włączonym mnożniku `MatchScore` w nagłówku też pokazuje wynik z mnożnikiem.
- [ ] **Step 4:** `npm run build && npx playwright test` – PASS; `npm run lint && npm run typecheck && npm test`.
- [ ] **Step 5: Commit** `feat: scope block, own tag and scope ordering for recruiters`.

---

### Task 5: Podgląd pasków przy publikacji ogłoszenia

**Files:**

- Modify: `src/features/prototype/employer.tsx` (`EmployerJobEditor`)
- Test: `tests/e2e/scope.spec.ts` (dopisz)

**Interfaces:**

- Consumes: Task 1 `barsForCategory`.

- [ ] **Step 1: Write failing e2e:** jako pracodawca w edytorze oferty widać panel z tekstem `"Kandydaci odpowiedzą, jak duża była ich rola w tych obszarach"` i 3 tytułami pasków kategorii; po zmianie kategorii na „Lead” (lub odpowiednią etykietę z `categoryLabels`) widać tytuły L1–L3. Brak przycisku podmiany paska.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3: Implement.** Śledź wybraną kategorię w stanie komponentu (start: `existing?.category ?? "build"`), pod polem kategorii panel `prototype-panel` z nagłówkiem jak w teście i listą `bar.title`. Wartość kategorii nadal trafia do formularza tak jak dziś.
- [ ] **Step 4:** `npm run build && npx playwright test && npm run lint && npm run typecheck` – PASS.
- [ ] **Step 5: Commit** `feat: show scope bars when publishing a job`.

---

### Task 6: Ustawienia badania i eksport danych E3

**Files:**

- Create: `src/features/prototype/scope-export.ts`, `src/features/prototype/scope-export.test.ts`
- Modify: `src/features/prototype/settings.tsx`

**Interfaces:**

- Consumes: Task 1 (`multiplierScore`, `ownCount`), Task 2 (`State`, `experiment` action), `downloadText` z `settings.tsx`.
- Produces: `export function researchCsv(state: State): string;`

- [ ] **Step 1: Write failing unit test** `scope-export.test.ts`:
  - Nagłówek CSV dokładnie: `candidate_id,job_id,variant,opened_at,submitted_at,abandoned,duration_ms,project,answer_1,answer_2,answer_3,evidence_1,evidence_2,evidence_3,probe_1,probe_2,probe_3,changed_1,changed_2,changed_3,match_score,multiplier_score`.
  - Jeden wiersz na sesję z `state.scopeSessions`; sesja bez `submittedAt` ma `abandoned` = `1` i puste pola zgłoszenia; sesja wysłana łączy się ze zgłoszeniem tej pary (`candidateId`, `jobId`) i ma `abandoned` = `0`, odpowiedzi, `probe_N` = `1`/`0`, `changed_N` = `1`/`0`, `match_score`, `multiplier_score` = `multiplierScore(score, ownCount(answers))` (także przy wyłączonym przełączniku).
  - Pola z przecinkiem, cudzysłowem albo nową linią są w cudzysłowach, a cudzysłów jest podwojony.
  - Stan bez sesji daje sam nagłówek.
- [ ] **Step 2:** `npx vitest run src/features/prototype/scope-export.test.ts` – FAIL.
- [ ] **Step 3: Implement** `researchCsv` (wiersze łączone `\n`).
- [ ] **Step 4: UI w `SettingsPage`.** Nowa sekcja `prototype-panel prototype-form` „Badanie (E3, E6)” między „Dane scenariusza” a „O prototypie”: `NRadioGroup` „Wariant formularza kandydata (E3)” z opcjami `A` – „A: paski bez pól dowodu”, `B` – „B: paski z polami dowodu”; checkbox (istniejący `Checkbox`) „Match Score z mnożnikiem z pasków (E6), widoczny tylko dla rekrutera”; oba wysyłają `run({ type: "experiment", formVariant, multiplier })`. Przycisk „Eksportuj dane badania (CSV)” → `downloadText("doroboty-badanie-e3.csv", researchCsv(state), "text/csv")`.
- [ ] **Step 5:** `npm test && npm run typecheck && npm run lint` – PASS.
- [ ] **Step 6: Commit** `feat: research settings and E3 data export`.

---

### Task 7: Widok badania E2

**Files:**

- Create: `src/features/prototype/e2-study.tsx`, `src/features/prototype/e2-study.test.ts`
- Use (już w repo): `src/features/prototype/data/e2-applications.json` – `{ jobTitle, category: "apply", note, applications: [{ id, candidateName, submittedAt, score, answer, answers: [n,n,n], evidence: (string|null)[], outcome: "continued"|"rejected", sourceApplicationId }] }`, 10 zgłoszeń.
- Modify: `src/features/prototype/app.tsx` (trasa `badanie/e2` bez `RequireRole`), `src/app/records.css`
- Test: `tests/e2e/scope.spec.ts` (dopisz)

**Interfaces:**

- Consumes: Task 1 (`compareByScope`, `compareByMultiplier`, `multiplierScore`, `ownCount`, `barsForCategory`), Task 3 (`ScopeBlock`, `OwnTag`), `MatchScore`, `downloadText`, `state.experiment.multiplier`.
- Produces:

  ```ts
  export const E2_RESULTS_KEY = "doroboty.e2.results";
  export type E2View = "obecny" | "paski";
  export function e2Order(view: E2View, multiplier: boolean): E2Application[]; // obecny: po submittedAt rosnąco
  export function e2ResultsCsv(results: E2Result[]): string;
  // E2Result = { at: string; view: E2View; multiplier: boolean; chosenIds: string[]; hits: number; durationMs: number }
  ```

- [ ] **Step 1: Write failing unit tests** `e2-study.test.ts`: dane mają 10 zgłoszeń z 3 odpowiedziami 1–4 i `evidence` długości 3; `e2Order("obecny", false)` jest po `submittedAt` rosnąco; `e2Order("paski", false)` ma pierwsze zgłoszenia z `ownCount >= 2`; `e2Order("paski", true)` jest malejąco po `multiplierScore`; `e2ResultsCsv` ma nagłówek `at,view,multiplier,chosen_ids,hits,duration_ms` i `chosen_ids` łączone `|`.
- [ ] **Step 2: Write failing e2e:** `/#/badanie/e2` pokazuje tytuł ogłoszenia, zadanie `"Masz czas na 3 rozmowy w tym tygodniu. Kogo zapraszasz i dlaczego?"`, 10 kart z Match Score i bez bloku „Rola w projekcie”; `/#/badanie/e2?widok=paski` pokazuje na kartach blok i znacznik „Sam: …”; zaznaczenie 3 kart blokuje czwartą, „Zatwierdź wybór” pokazuje podziękowanie i **nie** pokazuje wyniku rozmowy; w kodzie strony nigdzie nie renderuje się `outcome`.
- [ ] **Step 3:** FAIL.
- [ ] **Step 4: Implement.** Strona w `pp-container`: kicker „Badanie E2 · prototyp”, tytuł ogłoszenia, zadanie, przełącznik widoku jako dwa linki (`?widok=obecny`, `?widok=paski`) – mały, opisany „Widok dla prowadzącego badanie”. Karty (`Frame`, jak `app-card` w `ApplicationsPage`): imię, `MatchScore` (w widoku `paski` z włączonym przełącznikiem: wynik z mnożnikiem), tekst `answer` (pierwsze ~240 znaków + `<details>` „Pokaż całość”), w widoku `paski` `OwnTag` i `ScopeBlock` (`answers` z `barsForCategory("apply")[i].id`, `evidence` bez `null`). Checkbox „Zaproś na rozmowę” na karcie, maks. 3 (pozostałe `disabled` po 3). Pole „Dlaczego ci kandydaci?” (`Textarea`, opcjonalne). „Zatwierdź wybór” (`variant="master"`, aktywny przy 3) zapisuje `E2Result` do `localStorage[E2_RESULTS_KEY]` (tablica JSON, `try/catch`; `hits` = ile wybranych ma `outcome === "continued"`, `durationMs` od wejścia na stronę) i pokazuje „Dziękujemy, wybór zapisany.” z przyciskiem „Zacznij od nowa”. Na dole „Eksportuj wyniki E2 (CSV)” → `downloadText("doroboty-badanie-e2.csv", e2ResultsCsv(results), "text/csv")`. Wynik rozmowy nigdy nie trafia do UI. Trasa `<Route path="badanie/e2" element={<E2StudyPage />} />` w `Shell`.
- [ ] **Step 5:** `npm test && npm run build && npx playwright test && npm run lint && npm run typecheck` – PASS.
- [ ] **Step 6: Commit** `feat: E2 recruiter study view`.

---

### Task 8: Dokumentacja i pełna weryfikacja

**Files:**

- Modify: `FEATURES.md`, `docs/tasks/scope-bars-spec.md` (nagłówek statusu), Create: `docs/tasks/scope-bars.md`

- [ ] **Step 1:** W `FEATURES.md` dopisz wpisy o nowym zachowaniu w stylu istniejących wpisów (nowe stabilne ID w odpowiednich sekcjach): paski w formularzu kandydata, blok i kolejność u rekrutera, podgląd pasków przy publikacji, ustawienia badania i eksport CSV, widok `#/badanie/e2`.
- [ ] **Step 2:** `docs/tasks/scope-bars.md`: krótka notatka zadania (co zbudowano, gdzie są pliki, jak przełączać warianty i widoki, jak eksportować dane, czego nie sprawdzono) według `docs/templates/TASK.md`.
- [ ] **Step 3:** `./scripts/verify` – całość PASS (format, design-system check, lint, typecheck, unit, packet, build, e2e). Jeśli `format:check` zgłasza pliki, uruchom `npm run format` i powtórz.
- [ ] **Step 4: Commit** `docs: scope bars behavior and task note`.
