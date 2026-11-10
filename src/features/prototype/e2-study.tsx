import { useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Frame, Portrait } from "@/sandbox/noir/comic";
import { portraitFor } from "@/sandbox/noir/portraits";
import data from "./data/e2-applications.json";
import { MatchScore } from "./match-score";
import { OwnTag, ScopeBlock } from "./scope-block";
import {
  barsForCategory,
  compareByMultiplier,
  compareByScope,
  multiplierScore,
  ownCount,
} from "./scope";
import { downloadText } from "./settings";
import { usePrototype } from "./store";

export const E2_RESULTS_KEY = "doroboty.e2.results";
export type E2View = "obecny" | "paski";
export type E2Application = (typeof data.applications)[number];
export type E2Result = {
  at: string;
  view: E2View;
  multiplier: boolean;
  chosenIds: string[];
  hits: number;
  reason: string;
  durationMs: number;
};

const TASK = "Masz czas na 3 rozmowy w tym tygodniu. Kogo zapraszasz i dlaczego?";
const MAX_PICKS = 3;
const PREVIEW_LENGTH = 240;

export function e2Order(view: E2View, multiplier: boolean): E2Application[] {
  const list = [...data.applications];
  if (view === "obecny")
    return list.sort((a, b) => Date.parse(a.submittedAt) - Date.parse(b.submittedAt));
  return list.sort(multiplier ? compareByMultiplier : compareByScope);
}

const CSV_HEADER = "at,view,multiplier,chosen_ids,hits,reason,duration_ms";

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function e2ResultsCsv(results: E2Result[]): string {
  const rows = results.map((r) =>
    [r.at, r.view, r.multiplier ? 1 : 0, r.chosenIds.join("|"), r.hits, r.reason, r.durationMs]
      .map(csvCell)
      .join(","),
  );
  return [CSV_HEADER, ...rows].join("\n") + "\n";
}

function readResults(): E2Result[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(E2_RESULTS_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as E2Result[]) : [];
  } catch {
    return [];
  }
}

function saveResult(result: E2Result) {
  try {
    localStorage.setItem(E2_RESULTS_KEY, JSON.stringify([...readResults(), result]));
  } catch {
    /* storage unavailable: the study still works, the result is just not kept */
  }
}

function AnswerText({ text }: { text: string }) {
  if (text.length <= PREVIEW_LENGTH) return <p className="e2-card__answer">{text}</p>;
  const cut = text.slice(0, PREVIEW_LENGTH).replace(/\s+\S*$/, "");
  return (
    <>
      <p className="e2-card__answer">{cut}…</p>
      <details className="e2-card__more">
        <summary>Pokaż całość</summary>
        <p className="e2-card__answer">{text}</p>
      </details>
    </>
  );
}

export function E2StudyPage() {
  const { state } = usePrototype();
  const [params] = useSearchParams();
  const view: E2View = params.get("widok") === "paski" ? "paski" : "obecny";
  const multiplier = view === "paski" && state.experiment.multiplier;
  const applications = useMemo(() => e2Order(view, multiplier), [view, multiplier]);
  const bars = barsForCategory("apply");
  const [picked, setPicked] = useState<string[]>([]);
  const [why, setWhy] = useState("");
  const [done, setDone] = useState(false);
  const startedAt = useRef(Date.now());

  const toggle = (id: string, on: boolean) =>
    setPicked((current) =>
      on
        ? current.length < MAX_PICKS
          ? [...current, id]
          : current
        : current.filter((x) => x !== id),
    );
  const submit = () => {
    const hits = applications.filter(
      (x) => picked.includes(x.id) && x.outcome === "continued",
    ).length;
    saveResult({
      at: new Date().toISOString(),
      view,
      multiplier,
      chosenIds: picked,
      hits,
      reason: why.trim(),
      durationMs: Date.now() - startedAt.current,
    });
    setDone(true);
  };
  const restart = () => {
    setPicked([]);
    setWhy("");
    setDone(false);
    startedAt.current = Date.now();
  };

  return (
    <section className="pp-container e2-study">
      <p className="n-kicker">Badanie E2 · prototyp</p>
      <h1>{data.jobTitle}</h1>
      <p className="n-lead e2-study__task">{TASK}</p>
      <nav className="e2-study__views" aria-label="Widok dla prowadzącego badanie">
        <span className="e2-study__views-label">Widok dla prowadzącego badanie:</span>
        <Link to="?widok=obecny" aria-current={view === "obecny" ? "page" : undefined}>
          Obecny
        </Link>
        <Link to="?widok=paski" aria-current={view === "paski" ? "page" : undefined}>
          Z paskami zakresu
        </Link>
      </nav>

      {done ? (
        <div className="e2-study__thanks" role="status">
          <p>Dziękujemy, wybór zapisany.</p>
          <Button variant="secondary" onClick={restart}>
            Zacznij od nowa
          </Button>
        </div>
      ) : (
        <>
          <div className="app-list">
            {applications.map((a, index) => {
              const full = !picked.includes(a.id) && picked.length >= MAX_PICKS;
              return (
                <Frame
                  as="article"
                  key={a.id}
                  seed={60 + index * 9}
                  hoverMorph
                  className="ccard app-card"
                  aria-labelledby={`e2-${a.id}`}
                >
                  <MatchScore
                    score={multiplier ? multiplierScore(a.score, ownCount(a.answers)) : a.score}
                  />
                  <div className="ccard__head">
                    <Portrait
                      gender={a.candidateName.split(" ")[0].endsWith("a") ? "f" : "m"}
                      src={portraitFor(a.id)}
                      seed={index + 40}
                      size={72}
                    />
                    <div className="ccard__id">
                      <h2 className="ccard__name" id={`e2-${a.id}`}>
                        {a.candidateName}
                      </h2>
                      {view === "paski" && (
                        <p className="app-card__own">
                          <OwnTag answers={a.answers} />
                        </p>
                      )}
                    </div>
                  </div>
                  <AnswerText text={a.answer} />
                  {view === "paski" && (
                    <ScopeBlock
                      answers={a.answers.map((answer, i) => ({
                        barId: bars[i].id,
                        answer,
                        evidence: a.evidence[i] ?? undefined,
                      }))}
                    />
                  )}
                  <label className="e2-card__pick">
                    <Checkbox
                      checked={picked.includes(a.id)}
                      disabled={full}
                      onCheckedChange={(on) => toggle(a.id, on)}
                      aria-label={`Zaproś na rozmowę: ${a.candidateName}`}
                    />
                    <span>Zaproś na rozmowę</span>
                  </label>
                </Frame>
              );
            })}
          </div>
          <label className="field e2-study__why">
            <span>Dlaczego ci kandydaci?</span>
            <Textarea value={why} onChange={(e) => setWhy(e.target.value)} rows={4} />
          </label>
          <p className="e2-study__count">
            Wybrano {picked.length} z {MAX_PICKS}
          </p>
          <Button variant="master" disabled={picked.length !== MAX_PICKS} onClick={submit}>
            Zatwierdź wybór
          </Button>
        </>
      )}
      <p className="e2-study__export">
        <Button
          variant="outline"
          onClick={() =>
            downloadText("doroboty-badanie-e2.csv", e2ResultsCsv(readResults()), "text/csv")
          }
        >
          Eksportuj wyniki E2 (CSV)
        </Button>
      </p>
    </section>
  );
}
