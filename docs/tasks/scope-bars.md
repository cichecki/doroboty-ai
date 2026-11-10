# Paski zakresu pracy w prototypie

Slug: `scope-bars`
Created: 2026-11-10

## Goal

Dodać do prototypu paski zakresu pracy (specyfikacja: `scope-bars-spec.md`) jako rozbudowę formularza zgłoszenia oraz materiał do testów E3 (kandydat), E2 (rekruter) i E6 (mnożnik Match Score).

## Context

Frontend-only, bez backendu (`frontend-only.md`). Zachowanie opisują wpisy CAN-19, CAN-20, EMP-11, EMP-12, OPS-12, OPS-13 w `FEATURES.md`.

## Plan

- [x] Bank 9 pasków, ranking i mnożnik (`src/features/prototype/scope.ts`)
- [x] Model: zakres w zgłoszeniu, `experiment` {formVariant, multiplier}, `scopeSessions` (`model.ts`)
- [x] Formularz kandydata `/#/aplikuj/:slug`: projekt, 3 paski, dowód (wariant B), cytat-dopytanie, podsumowanie
- [x] Lista i szczegół rekrutera: blok „Rola w projekcie”, tag, kolejność
- [x] Edytor ogłoszenia: panel podglądu pasków
- [x] Ustawienia: sekcja „Badanie (E3, E6)”, eksport CSV
- [x] Strona E2 `/#/badanie/e2`
- [x] Dokumentacja i weryfikacja

## Acceptance Criteria

- [x] Kandydat odpowiada na 3 paski bez liczb; asystent nie zaznacza odpowiedzi
- [x] Rekruter widzi zakres i dowód; lista zaczyna się od osób, które zrobiły coś same
- [x] Dane E3 i E2 eksportują się do CSV
- [ ] `./scripts/verify` w pełni zielone (4 znane testy e2e padają także przed zmianą, patrz Risks)

## Files / Areas

- `src/features/prototype/scope.ts`, `model.ts`, `e2-study.tsx`, `data/e2-applications.json`
- Formularz, widoki rekrutera, edytor ogłoszenia i ustawienia w `src/features/prototype/`
- Testy: `*.test.ts` obok kodu, `tests/e2e/prototype.spec.ts`

## How to use

- Wariant formularza A/B i mnożnik: `/#/app/settings`, sekcja „Badanie (E3, E6)” (domyślnie wariant B, mnożnik wyłączony).
- Eksport danych E3: przycisk „Eksportuj dane badania (CSV)” w tej samej sekcji.
- E2: `/#/badanie/e2?widok=obecny` (wg daty) lub `?widok=paski` (wg zakresu). Wyniki w localStorage, eksport CSV ze strony.

## Risks

- Cztery testy e2e padają także przed zmianą: kontrast axe na czerwieni #d3202a, linki sekcji oferty (y<50), edytowalny szkic przy 1280 i 390 px.
- Nie sprawdzono z prawdziwymi kandydatami i rekruterami (E3/E2 jeszcze nie przeprowadzone); AI symulowane.
- Playwright z repo nie ma przeglądarki; e2e uruchamiano lokalną konfiguracją.

## Handoff Notes

Wyniki E3/E2 zostaną zebrane przez Kubę z eksportów CSV. Mnożnik (E6) jest tylko przełącznikiem badawczym, domyślnie wyłączonym.
