import { NRadioGroup } from "@/sandbox/noir/forms";
import { Textarea } from "@/components/ui/textarea";
import {
  EVIDENCE_PROMPTS,
  MIN_EVIDENCE_LENGTH,
  SCOPE_PROMPT,
  evidenceRequired,
  findVagueSentence,
  type FormVariant,
  type ScopeAnswer,
  type ScopeBar,
} from "./scope";

export type ScopeDraftItem = { answer?: ScopeAnswer; firstAnswer?: ScopeAnswer; evidence: string };
export type ScopeDraft = Record<string, ScopeDraftItem>;

export const SCOPE_ERROR =
  "Wybierz odpowiedź przy każdym pytaniu o rolę i uzupełnij wymagane pola.";

export function scopeProblems(bars: ScopeBar[], variant: FormVariant, value: ScopeDraft): string[] {
  return bars
    .filter((bar) => {
      const item = value[bar.id];
      if (!item?.answer) return true;
      return (
        evidenceRequired(variant, item.answer) && item.evidence.trim().length < MIN_EVIDENCE_LENGTH
      );
    })
    .map((bar) => bar.id);
}

export function ScopeQuestions({
  bars,
  variant,
  answerText,
  value,
  onChange,
  disabled,
  attempted,
}: {
  bars: ScopeBar[];
  variant: FormVariant;
  answerText: string;
  value: ScopeDraft;
  onChange: (next: ScopeDraft) => void;
  disabled?: boolean;
  attempted: boolean;
}) {
  const problems = scopeProblems(bars, variant, value);
  const patch = (id: string, change: (item: ScopeDraftItem) => ScopeDraftItem) =>
    onChange({ ...value, [id]: change(value[id] ?? { evidence: "" }) });
  return (
    <div className="scope-questions">
      <h3 id="scope-questions-title">{SCOPE_PROMPT}</h3>
      {bars.map((bar) => {
        const item = value[bar.id] ?? { evidence: "" };
        const probe = findVagueSentence(answerText, bar);
        const needsEvidence = item.answer !== undefined && evidenceRequired(variant, item.answer);
        const length = item.evidence.trim().length;
        const short = attempted && needsEvidence && length < MIN_EVIDENCE_LENGTH;
        const evidenceId = `scope-evidence-${bar.id}`;
        return (
          <div key={bar.id} className="scope-bar">
            {probe ? (
              <p className="scope-probe">{`Napisałeś: »${probe}«. Którą część zrobiłeś sam?`}</p>
            ) : null}
            <NRadioGroup
              legend={bar.question}
              name={`scope-${bar.id}`}
              value={item.answer ? String(item.answer) : ""}
              disabled={disabled}
              onChange={(v) => {
                const answer = Number(v) as ScopeAnswer;
                patch(bar.id, (current) => ({
                  ...current,
                  answer,
                  firstAnswer: current.firstAnswer ?? answer,
                }));
              }}
              options={bar.options.map((option, i): [string, string] => [
                String(i + 1),
                option.candidate,
              ])}
            />
            {needsEvidence && item.answer ? (
              <div className="scope-evidence">
                <label htmlFor={evidenceId}>{EVIDENCE_PROMPTS[item.answer as 3 | 4]}</label>
                <Textarea
                  id={evidenceId}
                  disabled={disabled}
                  maxLength={600}
                  aria-invalid={short || undefined}
                  aria-describedby={`${evidenceId}-help`}
                  value={item.evidence}
                  onChange={(e) =>
                    patch(bar.id, (current) => ({ ...current, evidence: e.target.value }))
                  }
                />
                <p
                  id={`${evidenceId}-help`}
                  role={short ? "alert" : undefined}
                  className={short ? "error-message" : "text-sm text-muted-foreground"}
                >
                  {short
                    ? `Dopisz co najmniej ${MIN_EVIDENCE_LENGTH} znaków (obecnie: ${length}).`
                    : `Minimum ${MIN_EVIDENCE_LENGTH} znaków. Obecnie: ${length}.`}
                </p>
              </div>
            ) : null}
          </div>
        );
      })}
      {attempted && problems.length ? (
        <p className="error-message" role="alert">
          {SCOPE_ERROR}
        </p>
      ) : null}
    </div>
  );
}
