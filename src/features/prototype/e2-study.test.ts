import { describe, expect, it } from "vitest";
import data from "./data/e2-applications.json";
import { e2Order, e2ResultsCsv, type E2Result } from "./e2-study";
import { multiplierScore, ownCount } from "./scope";

describe("E2 study data", () => {
  it("has 10 applications with 3 answers (1-4) and 3 evidence slots", () => {
    expect(data.applications).toHaveLength(10);
    for (const x of data.applications) {
      expect(x.answers).toHaveLength(3);
      for (const a of x.answers) expect([1, 2, 3, 4]).toContain(a);
      expect(x.evidence).toHaveLength(3);
    }
  });
});

describe("e2Order", () => {
  it("orders the current view by submittedAt ascending", () => {
    const times = e2Order("obecny", false).map((x) => Date.parse(x.submittedAt));
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });
  it("puts applications with ownCount >= 2 first in the bars view", () => {
    const own = e2Order("paski", false).map((x) => ownCount(x.answers) >= 2);
    const firstFalse = own.indexOf(false);
    expect(own.some(Boolean)).toBe(true);
    if (firstFalse !== -1) expect(own.slice(firstFalse).every((v) => !v)).toBe(true);
  });
  it("sorts by multiplier score descending with the multiplier on", () => {
    const scores = e2Order("paski", true).map((x) => multiplierScore(x.score, ownCount(x.answers)));
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });
});

describe("e2ResultsCsv", () => {
  it("writes the header and joins chosen ids with |", () => {
    const result: E2Result = {
      at: "2026-11-10T10:00:00.000Z",
      view: "paski",
      multiplier: false,
      chosenIds: ["e2-01", "e2-02", "e2-03"],
      hits: 2,
      reason: 'Ma "własny" kod, a to ważne,\nbo działa',
      durationMs: 4500,
    };
    const csv = e2ResultsCsv([result]);
    expect(csv.split("\n")[0]).toBe("at,view,multiplier,chosen_ids,hits,reason,duration_ms");
    expect(csv).toContain(
      '2026-11-10T10:00:00.000Z,paski,0,e2-01|e2-02|e2-03,2,"Ma ""własny"" kod, a to ważne,\nbo działa",4500',
    );
  });
  it("writes an empty reason for results saved before the field existed", () => {
    const legacy = {
      at: "2026-11-10T10:00:00.000Z",
      view: "obecny",
      multiplier: false,
      chosenIds: ["e2-01"],
      hits: 1,
      durationMs: 1000,
    } as unknown as E2Result;
    expect(e2ResultsCsv([legacy])).not.toContain("undefined");
    expect(e2ResultsCsv([legacy])).toContain("e2-01,1,,1000");
  });
});
