import { describe, expect, it } from "vitest";
import { initialState, transition, stateSchema, type State } from "./model";
import { barsForCategory } from "./scope";
const time = "2026-11-03T10:00:00.000Z";
function as(state: State, id: string) {
  return transition(state, { type: "select_person", id });
}
function submitted() {
  const s = as(initialState(), "candidate-anna");
  return transition(
    s,
    {
      type: "submit",
      jobId: s.jobs[0].id,
      notes: "Original notes",
      generated: "Generated copy",
      answer: "Approved application with sufficient context.",
      consent: true,
    },
    time,
    "application-anna",
  );
}
describe("coherent browser scenario", () => {
  it("requires approval and prevents duplicate applications", () => {
    const s = as(initialState(), "candidate-anna");
    const input = {
      type: "submit" as const,
      jobId: s.jobs[0].id,
      notes: "",
      generated: "",
      answer: "Approved application with sufficient context.",
      consent: false,
    };
    expect(() => transition(s, input, time)).toThrow("Zatwierdź");
    expect(() => transition(submitted(), { ...input, consent: true }, time)).toThrow("już wysłana");
    expect(s.applications).toHaveLength(1);
  });
  it("preserves approved sources while profile and notes evolve", () => {
    const s = submitted();
    const app = s.applications.at(-1)!;
    const changed = transition(s, {
      type: "profile",
      value: {
        name: "Updated Name",
        headline: "Updated Headline",
        bio: "Changed",
        location: "Wrocław",
      },
    });
    expect(changed.applications.at(-1)).toEqual(app);
    expect(app.candidateName).toBe("Anna Kowalska");
    expect(app.sourceNotes).toBe("Original notes");
    expect(app.generatedAnswer).toBe("Generated copy");
  });
  it("supports employer review through conversation and continuation without skipping stages", () => {
    let s = as(submitted(), "employer-brightlabs");
    expect(() =>
      transition(
        s,
        { type: "stage", applicationId: "application-anna", stage: "continued", note: "" },
        time,
      ),
    ).toThrow();
    for (const stage of [
      "reviewed",
      "interview_invited",
      "first_conversation_held",
      "continued",
      "hired",
    ] as const)
      s = transition(
        s,
        { type: "stage", applicationId: "application-anna", stage, note: "Employer note" },
        time,
      );
    expect(s.applications.at(-1)?.stage).toBe("hired");
    expect(s.applications.at(-1)?.events).toHaveLength(6);
  });
  it("rejects another employer’s stage writes and another candidate’s withdrawal", () => {
    expect(() =>
      transition(
        as(submitted(), "employer-northstar"),
        { type: "stage", applicationId: "application-anna", stage: "reviewed", note: "" },
        time,
      ),
    ).toThrow();
    expect(() =>
      transition(
        as(submitted(), "candidate-marek"),
        { type: "withdraw", applicationId: "application-anna" },
        time,
      ),
    ).toThrow();
  });
  it("makes withdrawal terminal and keeps drafts and saved jobs person-specific", () => {
    let s = submitted();
    s = transition(s, { type: "withdraw", applicationId: "application-anna" }, time);
    expect(() =>
      transition(
        as(s, "employer-brightlabs"),
        { type: "stage", applicationId: "application-anna", stage: "reviewed", note: "" },
        time,
      ),
    ).toThrow();
    s = transition(s, {
      type: "draft",
      jobId: s.jobs[1].id,
      notes: "Notes",
      generated: "Output",
      answer: "Edited",
    });
    s = transition(s, { type: "toggle_saved", jobId: s.jobs[1].id });
    expect(s.drafts[0].candidateId).toBe("candidate-anna");
    expect(s.saved[0].candidateId).toBe("candidate-anna");
  });
  it("validates broken references, duplicate submissions and invalid histories on import", () => {
    const s = submitted();
    s.applications.push({ ...s.applications.at(-1)!, id: "another-id" });
    expect(stateSchema.safeParse(s).success).toBe(false);
    const broken = submitted();
    broken.applications.at(-1)!.events.push({ stage: "hired", at: time, note: "" });
    broken.applications.at(-1)!.stage = "hired";
    expect(stateSchema.safeParse(broken).success).toBe(false);
    const unknown = initialState();
    unknown.jobs[0].companyId = "missing";
    expect(stateSchema.safeParse(unknown).success).toBe(false);
  });
  it("only publishes own-company jobs and keeps submitted job snapshots unchanged", () => {
    const state = as(submitted(), "employer-brightlabs");
    const updated = { ...state.jobs[0], title: "Updated public role" };
    const result = transition(state, { type: "publish", job: updated });
    expect(result.jobs[0].title).toBe("Updated public role");
    expect(result.applications.at(-1)?.jobTitle).toBe("AI Product Manager");
    expect(() =>
      transition(as(state, "employer-northstar"), { type: "publish", job: updated }),
    ).toThrow();
    expect(() =>
      transition(state, { type: "publish", job: { ...updated, salaryMin: 500, salaryMax: 1 } }),
    ).toThrow();
  });
});

describe("paski zakresu", () => {
  const longEvidence = "Zaproponowałem kolejność wdrożenia i uzgodniłem ją ze sponsorem.";
  function scopeFor(s: State, answers: number[], evidence: (string | undefined)[] = []) {
    const job = s.jobs[0];
    return {
      project: "Projekt testowy",
      durationMs: 1000,
      answers: barsForCategory(job.category).map((bar, i) => ({
        barId: bar.id,
        answer: answers[i] as 1 | 2 | 3 | 4,
        evidence: evidence[i],
        changedAfterProbe: false,
      })),
    };
  }
  function submitWith(s: State, scope: ReturnType<typeof scopeFor>) {
    return transition(
      s,
      {
        type: "submit",
        jobId: s.jobs[0].id,
        notes: "",
        generated: "",
        answer: "Approved application with sufficient context.",
        consent: true,
        scope,
      },
      time,
      "application-anna",
    );
  }
  const err = "Uzupełnij odpowiedzi o swojej roli w projekcie.";

  it("has defaults and experiment works without a person", () => {
    const s = initialState();
    expect(s.experiment).toEqual({ formVariant: "B", multiplier: false });
    expect(s.scopeSessions).toEqual([]);
    const next = transition(s, { type: "experiment", formVariant: "A", multiplier: true });
    expect(next.experiment).toEqual({ formVariant: "A", multiplier: true });
  });
  it("opens a scope session for a candidate only", () => {
    const s = as(initialState(), "candidate-anna");
    const next = transition(s, { type: "scope_open", jobId: s.jobs[0].id }, time);
    expect(next.scopeSessions).toEqual([
      { candidateId: "candidate-anna", jobId: s.jobs[0].id, variant: "B", openedAt: time },
    ]);
    const employer = as(initialState(), "employer-northstar");
    expect(() => transition(employer, { type: "scope_open", jobId: s.jobs[0].id }, time)).toThrow(
      "Wybierz profil kandydata.",
    );
  });
  it("stores scope and closes the session on submit", () => {
    const s0 = as(initialState(), "candidate-anna");
    const s1 = transition(
      s0,
      { type: "scope_open", jobId: s0.jobs[0].id },
      "2026-11-03T09:00:00.000Z",
    );
    const s2 = submitWith(s1, scopeFor(s1, [3, 2, 1], [longEvidence]));
    const app = s2.applications.at(-1)!;
    expect(app.scope?.variant).toBe("B");
    expect(app.scope?.answers.map((a) => a.answer)).toEqual([3, 2, 1]);
    expect(s2.scopeSessions[0].submittedAt).toBe(time);
  });
  it("rejects missing or short evidence in variant B", () => {
    const s = as(initialState(), "candidate-anna");
    expect(() => submitWith(s, scopeFor(s, [3, 2, 1], ["za krótko     "]))).toThrow(err);
    expect(() => submitWith(s, scopeFor(s, [3, 2, 1]))).toThrow(err);
  });
  it("rejects wrong bars or wrong number of answers", () => {
    const s = as(initialState(), "candidate-anna");
    const good = scopeFor(s, [1, 1, 1]);
    const other = barsForCategory(s.jobs[0].category === "lead" ? "build" : "lead")[0].id;
    expect(() =>
      submitWith(s, {
        ...good,
        answers: [{ ...good.answers[0], barId: other }, ...good.answers.slice(1)],
      }),
    ).toThrow(err);
    expect(() => submitWith(s, { ...good, answers: good.answers.slice(0, 2) })).toThrow(err);
  });
  it("drops evidence when it is not required", () => {
    const s = as(initialState(), "candidate-anna");
    const app = submitWith(s, scopeFor(s, [2, 1, 1], [longEvidence])).applications.at(-1)!;
    expect(app.scope!.answers[0]).not.toHaveProperty("evidence");
  });
  it("variant A needs no evidence and drops it", () => {
    const s = transition(as(initialState(), "candidate-anna"), {
      type: "experiment",
      formVariant: "A",
      multiplier: false,
    });
    const app = submitWith(s, scopeFor(s, [4, 1, 1])).applications.at(-1)!;
    expect(app.scope!.variant).toBe("A");
    const app2 = submitWith(s, scopeFor(s, [4, 1, 1], [longEvidence])).applications.at(-1)!;
    expect(app2.scope!.answers[0]).not.toHaveProperty("evidence");
  });
  it("submit without scope still works", () => {
    expect(submitted().applications.at(-1)!.scope).toBeUndefined();
  });
  it("example application carries scope", () => {
    const s = initialState();
    const scope = s.applications[0].scope!;
    expect(scope.answers.map((a) => a.barId)).toEqual(
      barsForCategory(s.jobs[0].category).map((b) => b.id),
    );
  });
});
