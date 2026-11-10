import type { State } from "./model";
import { multiplierScore, ownCount } from "./scope";

const COLUMNS = [
  "candidate_id",
  "job_id",
  "variant",
  "opened_at",
  "submitted_at",
  "abandoned",
  "duration_ms",
  "project",
  "answer_1",
  "answer_2",
  "answer_3",
  "evidence_1",
  "evidence_2",
  "evidence_3",
  "probe_1",
  "probe_2",
  "probe_3",
  "changed_1",
  "changed_2",
  "changed_3",
  "match_score",
  "multiplier_score",
];

function cell(value: string | number | undefined | null): string {
  const text = value === undefined || value === null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

/** Jeden wiersz na sesję badania E3; sesja wysłana łączy się z zgłoszeniem tej pary kandydat + oferta. */
export function researchCsv(state: State): string {
  const rows = state.scopeSessions.map((session) => {
    const submitted = session.submittedAt !== undefined;
    const application = submitted
      ? state.applications.find(
          (x) => x.candidateId === session.candidateId && x.jobId === session.jobId,
        )
      : undefined;
    const scope = application?.scope;
    const answers = scope?.answers ?? [];
    const at = (n: number) => answers[n - 1];
    const flag = (on: boolean | undefined) => (on === undefined ? undefined : on ? 1 : 0);
    const answerFields = [1, 2, 3].map((n) => at(n)?.answer);
    const evidenceFields = [1, 2, 3].map((n) => at(n)?.evidence);
    const probeFields = [1, 2, 3].map((n) => flag(at(n) && Boolean(at(n)?.probeQuote)));
    const changedFields = [1, 2, 3].map((n) => flag(at(n)?.changedAfterProbe));
    const hasScope = scope !== undefined;
    const fields = [
      session.candidateId,
      session.jobId,
      session.variant,
      session.openedAt,
      session.submittedAt ?? "",
      submitted ? 0 : 1,
      hasScope ? scope.durationMs : undefined,
      hasScope ? scope.project : undefined,
      ...answerFields,
      ...evidenceFields,
      ...probeFields,
      ...changedFields,
      application?.score,
      application && hasScope
        ? multiplierScore(application.score, ownCount(answers.map((a) => a.answer)))
        : undefined,
    ];
    return fields.map(cell).join(",");
  });
  return [COLUMNS.join(","), ...rows].join("\n");
}
