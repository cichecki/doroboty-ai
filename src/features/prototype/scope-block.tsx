import { barById, ownCount, ownLabel } from "./scope";

type BlockAnswer = { barId: string; answer: number; evidence?: string };

export function OwnTag({ answers }: { answers: readonly number[] }) {
  return <span className="own-tag">{ownLabel(ownCount(answers))}</span>;
}

export function ScopeBlock({
  answers,
  heading = "Rola w projekcie",
}: {
  answers: BlockAnswer[];
  heading?: string;
}) {
  const rows = answers.flatMap((item) => {
    const bar = barById(item.barId);
    const option = bar?.options[item.answer - 1];
    return bar && option ? [{ bar, option, evidence: item.evidence?.trim() }] : [];
  });
  return (
    <div className="scope-block">
      <h4 className="scope-block__heading">{heading}</h4>
      {rows.length ? (
        <dl className="scope-block__rows">
          {rows.map(({ bar, option, evidence }) => (
            <div key={bar.id} className="scope-block__row">
              <dt>{bar.title}</dt>
              <dd>
                <span className="scope-block__short">{option.recruiter}</span>
                {evidence ? <q className="scope-block__evidence">{evidence}</q> : null}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p>Brak odpowiedzi o roli w projekcie.</p>
      )}
    </div>
  );
}
