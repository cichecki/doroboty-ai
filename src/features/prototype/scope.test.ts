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
  it("dzieli tekst także po nowych liniach", () => {
    const text = "Lubię dane\nWdrażałem rozwiązanie w organizacji\nCoś jeszcze";
    expect(findVagueSentence(text, a1)).toBe("Wdrażałem rozwiązanie w organizacji");
  });
  it("skraca bardzo długie zdanie do 240 znaków i dodaje wielokropek", () => {
    const text = `wdrażałem ${"rozwiązanie ".repeat(60)}`;
    const result = findVagueSentence(text, a1)!;
    expect(text.trim().length).toBeGreaterThan(600);
    expect(result.length).toBeLessThanOrEqual(241);
    expect(result.endsWith("…")).toBe(true);
  });
  it("łapie formy żeńskie", () => {
    expect(findVagueSentence("Wdrażałam rozwiązanie w organizacji.", a1)).not.toBeNull();
    expect(findVagueSentence("Koordynowałam zespół.", barById("L1")!)).not.toBeNull();
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
