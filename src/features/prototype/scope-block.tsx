import { barById, ownCount, ownLabel } from "./scope";

type BlockAnswer = { barId: string; answer: number; evidence?: string };

export const SCOPE_HEADING = "Poziom samodzielności w projekcie";
const LEVELS = 4;

export function OwnTag({ answers }: { answers: readonly number[] }) {
  return <span className="own-tag">{ownLabel(ownCount(answers))}</span>;
}

/** Comic meter: four skewed segments, the first `level` filled red. Recruiter views only. */
function ScopeMeter({ level, label }: { level: number; label: string }) {
  return (
    <span
      className="scope-meter"
      role="img"
      aria-label={`${label}: poziom ${level} z ${LEVELS}`}
      data-level={level}
    >
      <span className="scope-meter__in">
        {Array.from({ length: LEVELS }, (_, i) => (
          <span key={i} className="scope-meter__seg" data-on={i < level ? "" : undefined} />
        ))}
      </span>
    </span>
  );
}

export function ScopeBlock({
  answers,
  heading = SCOPE_HEADING,
  subtitle,
  meters = false,
}: {
  answers: BlockAnswer[];
  /** Pass null when a surrounding element (e.g. a summary) already names the block. */
  heading?: string | null;
  subtitle?: string;
  /** Recruiter views show filled bars; candidate views keep the plain list. */
  meters?: boolean;
}) {
  const rows = answers.flatMap((item) => {
    const bar = barById(item.barId);
    const option = bar?.options[item.answer - 1];
    return bar && option
      ? [{ bar, option, level: item.answer, evidence: item.evidence?.trim() }]
      : [];
  });
  return (
    <div className={`scope-block${meters ? " scope-block--meters" : ""}`}>
      {heading !== null && <h4 className="scope-block__heading">{heading}</h4>}
      {subtitle ? <p className="scope-block__subtitle">{subtitle}</p> : null}
      {rows.length ? (
        <dl className="scope-block__rows">
          {rows.map(({ bar, option, level, evidence }) => (
            <div key={bar.id} className="scope-block__row">
              <dt>{bar.title}</dt>
              <dd>
                {meters ? <ScopeMeter level={level} label={option.recruiter} /> : null}
                <span className="scope-block__short">{option.recruiter}</span>
                {evidence ? (
                  <q className="scope-block__evidence ph-no-capture">{evidence}</q>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p>Brak odpowiedzi o samodzielności w projekcie.</p>
      )}
    </div>
  );
}
