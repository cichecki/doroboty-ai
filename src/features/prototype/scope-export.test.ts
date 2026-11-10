import { describe, expect, it } from "vitest";
import { initialState, transition, type State } from "./model";
import { barsForCategory, multiplierScore, ownCount } from "./scope";
import { researchCsv } from "./scope-export";

const openedAt = "2026-11-03T09:00:00.000Z";
const submittedAt = "2026-11-03T09:10:00.000Z";
const header =
  "candidate_id,job_id,variant,opened_at,submitted_at,abandoned,duration_ms,project,answer_1,answer_2,answer_3,evidence_1,evidence_2,evidence_3,probe_1,probe_2,probe_3,changed_1,changed_2,changed_3,match_score,multiplier_score";

const evidenceOne = "Napisałem wydzieloną część kodu i sprawdziłem, że działa na danych.";
const evidenceThree = "Sprawdziłem wynik na próbce danych z zespołem i zapisałem wnioski.";

function submittedState(): State {
  const s0 = transition(initialState(), { type: "select_person", id: "candidate-anna" });
  const job = s0.jobs[0];
  const bars = barsForCategory(job.category);
  const s1 = transition(s0, { type: "scope_open", jobId: job.id }, openedAt);
  return transition(
    s1,
    {
      type: "submit",
      jobId: job.id,
      notes: "",
      generated: "",
      answer: "Approved application with sufficient context.",
      consent: true,
      scope: {
        project: 'Automatyzacja, "raport"\nzespołu',
        durationMs: 1234,
        answers: [
          {
            barId: bars[0].id,
            answer: 3,
            evidence: evidenceOne,
            probeQuote: "Jak to działało?",
            changedAfterProbe: true,
          },
          { barId: bars[1].id, answer: 2, changedAfterProbe: false },
          {
            barId: bars[2].id,
            answer: 4,
            evidence: evidenceThree,
            changedAfterProbe: false,
          },
        ],
      },
    },
    submittedAt,
    "application-anna",
  );
}

describe("researchCsv", () => {
  it("returns only the header for a state without sessions", () => {
    expect(researchCsv(initialState())).toBe(header);
  });

  it("writes an abandoned session with empty application fields", () => {
    const s0 = initialState();
    const s1 = transition(s0, { type: "select_person", id: "candidate-marek" });
    const s2 = transition(s1, { type: "scope_open", jobId: s1.jobs[0].id }, openedAt);
    const lines = researchCsv(s2).split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(header);
    expect(lines[1].split(",")).toEqual([
      "candidate-marek",
      s1.jobs[0].id,
      "B",
      openedAt,
      "",
      "1",
      ...Array(16).fill(""),
    ]);
  });

  it("joins a submitted session with its application and computes scores", () => {
    const s = submittedState();
    const app = s.applications.at(-1)!;
    expect(researchCsv(s)).toBe(
      [
        header,
        [
          "candidate-anna",
          app.jobId,
          "B",
          openedAt,
          submittedAt,
          "0",
          "1234",
          '"Automatyzacja, ""raport""\nzespołu"',
          "3",
          "2",
          "4",
          `"${evidenceOne}"`,
          "",
          evidenceThree,
          "1",
          "0",
          "0",
          "1",
          "0",
          "0",
          String(app.score),
          String(multiplierScore(app.score, ownCount([3, 2, 4]))),
        ].join(","),
      ].join("\n"),
    );
  });

  it("writes multiplier_score regardless of the experiment toggle", () => {
    const s = submittedState();
    const toggled = transition(s, { type: "experiment", formVariant: "A", multiplier: true });
    expect(researchCsv(toggled)).toBe(researchCsv(s));
    const app = s.applications.at(-1)!;
    expect(researchCsv(s)).toContain(`,${multiplierScore(app.score, ownCount([3, 2, 4]))}`);
  });
});
