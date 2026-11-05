import { useRef, useState } from "react";
import {
  initialState,
  nextStages,
  publishedJobs,
  stageLabels,
  type Stage,
} from "@/features/prototype/model";
import { NButton } from "./button";
import { Frame, Portrait, ScoreTag } from "./comic";
import { StageBadge } from "./foundations";
import { ComicDialog, Field, NTextarea } from "./forms";
import { IconDoc } from "./icons";
import { BackLink } from "./nav";
import { JobCard } from "./jobcard";
import { portraitFor } from "./portraits";

/* Dane: przykładowa aplikacja z prototypu (Marek → AI Product Manager) */
const state = initialState();
const app = state.applications[0];
const company = state.companies.find((c) => c.id === app.companyId)!;
const skelJobs = publishedJobs(state).slice(0, 2);
const proof = [
  "Automatyzacja obsługi zgłoszeń",
  "Czas odpowiedzi krótszy o 25%",
  "Warsztaty z użytkownikami",
];

const dateFmt = new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" });
const happyPath: Stage[] = [
  "submitted",
  "reviewed",
  "interview_invited",
  "first_conversation_held",
  "continued",
  "hired",
];
const actionLabels: Partial<Record<Stage, string>> = {
  reviewed: "Oznacz jako przejrzane",
  interview_invited: "Zaproś na rozmowę",
  first_conversation_held: "Rozmowa odbyta",
  continued: "Kolejny etap",
  hired: "Zatrudnij",
};
type Event = { stage: Stage; at: string; note: string };

/* ------------------------------------------------------------------
   Oś czasu etapów: przeszłe z datą i notatką, bieżący wyróżniony,
   przyszłe przerywaną linią. Odrzucenie / wycofanie kończy oś.
   ------------------------------------------------------------------ */
export function StageTimeline({ events, stage }: { events: Event[]; stage: Stage }) {
  const done = new Set(events.map((e) => e.stage));
  const ended = stage === "rejected" || stage === "withdrawn" || stage === "hired";
  const future = ended ? [] : happyPath.filter((s) => !done.has(s));
  return (
    <ol className="tline">
      {events.map((e, i) => (
        <li
          key={i}
          className={`tline__item${i === events.length - 1 ? " is-current" : ""}`}
          aria-current={i === events.length - 1 ? "step" : undefined}
        >
          <StageBadge stage={e.stage} />
          <time dateTime={e.at}>{dateFmt.format(new Date(e.at))}</time>
          {e.note ? <p className="tline__note">„{e.note}”</p> : null}
        </li>
      ))}
      {future.map((s) => (
        <li key={s} className="tline__item is-future">
          <span className="stage stage--empty">
            <span className="stage__mark" aria-hidden="true" />
            {stageLabels[s]}
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------
   Pełne zgłoszenie (widok pracodawcy)
   ------------------------------------------------------------------ */
function ApplicationRecord() {
  const [stage, setStage] = useState<Stage>(app.stage);
  const [events, setEvents] = useState<Event[]>(
    app.events.map((e) => ({ ...e, note: e.note ?? "" })),
  );
  const [note, setNote] = useState("");
  const [cvOpen, setCvOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState("");
  const statusRef = useRef<HTMLSpanElement>(null);

  const move = (to: Stage) => {
    setEvents((list) => [...list, { stage: to, at: new Date().toISOString(), note: note.trim() }]);
    setStage(to);
    setNote("");
    setMsg(`Zapisano etap: ${stageLabels[to]}.`);
    window.setTimeout(() => statusRef.current?.focus(), 0);
  };
  const reset = () => {
    setStage(app.stage);
    setEvents(app.events.map((e) => ({ ...e, note: e.note ?? "" })));
    setMsg("");
  };
  const actions = nextStages[stage];
  const forward = actions.filter((s) => s !== "rejected");

  return (
    <div className="record">
      <nav className="record__crumbs" aria-label="Ścieżka nawigacji">
        <BackLink>Kandydaci</BackLink>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{app.candidateName}</span>
      </nav>

      <div className="record__layout">
        <div className="record__main">
          <Frame seed={301} className="record__head">
            <ScoreTag score={app.score} />
            <div className="record__who">
              <Portrait gender="m" size={104} seed={33} src={portraitFor(app.candidateId)} />
              <div>
                <h3 className="record__name">{app.candidateName}</h3>
                <p className="record__job">
                  {app.jobTitle} · {company.name}
                </p>
                <p className="record__status">
                  <span ref={statusRef} tabIndex={-1} className="record__stage">
                    <StageBadge stage={stage} />
                  </span>
                  <span className="record__date">
                    aplikacja {dateFmt.format(new Date(events[0].at))}
                  </span>
                </p>
              </div>
            </div>
            <div className="ccard__proof">
              <h4>Samodzielne zadania</h4>
              <ul>
                {proof.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <small>Z CV i odpowiedzi, niezweryfikowane. Do sprawdzenia w rozmowie.</small>
            </div>
          </Frame>

          <Frame seed={302} className="record__block">
            <h4 className="record__h">Odpowiedź kandydata</h4>
            <div className="prose">
              <p>{app.answer}</p>
            </div>
          </Frame>

          <Frame seed={303} className="record__block">
            <h4 className="record__h">CV</h4>
            <div className="cvfile">
              <IconDoc />
              <div className="cvfile__meta">
                <b>CV · {app.candidateName}</b>
                <span>Plik dołączony przy aplikacji, nie zmienia się po wysłaniu</span>
              </div>
              <button
                type="button"
                className="nlink"
                aria-expanded={cvOpen}
                aria-controls="cv-text"
                onClick={() => setCvOpen((o) => !o)}
              >
                {cvOpen ? "Zwiń" : "Pokaż CV"}
              </button>
            </div>
            {cvOpen ? (
              <pre className="record__cv" id="cv-text">
                {app.cv}
              </pre>
            ) : null}
          </Frame>

          <Frame seed={304} className="record__block record__block--quiet">
            <h4 className="record__h">Podsumowanie modelu</h4>
            <p className="record__summary">{app.summary}</p>
            <p className="record__fine">
              Match Score i podsumowanie porównują teksty. To nie jest ocena szans zatrudnienia.
            </p>
          </Frame>
        </div>

        <aside className="record__side" aria-label="Decyzja i historia">
          <Frame seed={305} className="record__decide">
            <h4 className="record__h">Decyzja</h4>
            {actions.length ? (
              <>
                <Field
                  label="Notatka do etapu"
                  hint="Zapisze się w historii razem ze zmianą etapu."
                  optional
                >
                  {(f) => (
                    <NTextarea
                      {...f}
                      value={note}
                      onChange={setNote}
                      max={1200}
                      rows={3}
                      placeholder="Co warto sprawdzić w rozmowie?"
                    />
                  )}
                </Field>
                <div className="record__actions">
                  {forward.map((s) => (
                    <NButton key={s} variant="primary" size="sm" onClick={() => move(s)}>
                      {actionLabels[s] ?? stageLabels[s]}
                    </NButton>
                  ))}
                  {actions.includes("rejected") ? (
                    <NButton variant="secondary" size="sm" onClick={() => setConfirm(true)}>
                      Odrzuć
                    </NButton>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="sb-note">
                {stageLabels[stage]}. Brak kolejnych działań w tym procesie.
              </p>
            )}
            <p role="status" className="sr-only">
              {msg}
            </p>
            {stage !== app.stage ? (
              <button type="button" className="nlink record__reset" onClick={reset}>
                Cofnij wszystko (piaskownica)
              </button>
            ) : null}
          </Frame>

          <Frame seed={306} className="record__history">
            <h4 className="record__h">Historia</h4>
            <StageTimeline events={events} stage={stage} />
          </Frame>
        </aside>
      </div>

      <ComicDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Zakończyć proces?"
        actions={
          <>
            <NButton variant="secondary" size="sm" onClick={() => setConfirm(false)}>
              Wróć
            </NButton>
            <NButton
              variant="primary"
              size="sm"
              onClick={() => {
                setConfirm(false);
                move("rejected");
              }}
            >
              Zakończ proces
            </NButton>
          </>
        }
      >
        <p>
          {app.candidateName} dostanie status „{stageLabels.rejected}”. Notatka
          {note.trim() ? " z pola Decyzja" : ""} zapisze się w historii. Tego nie da się cofnąć w
          aplikacji.
        </p>
      </ComicDialog>
    </div>
  );
}

/* ------------------------------------------------------------------
   Szkielety ładowania: kształt treści + pasy jak w przycisku master
   ------------------------------------------------------------------ */
function SkeletonJob({ seed }: { seed: number }) {
  return (
    <Frame seed={seed} className="jcard skel-card" aria-hidden="true">
      <div className="skel-col">
        <span className="skel skel--tag" />
        <span className="skel skel--title" />
        <span className="skel skel--line" />
      </div>
      <div className="skel-col skel-col--side">
        <span className="skel skel--price" />
        <span className="skel skel--btn" />
      </div>
    </Frame>
  );
}

function SkeletonDemo() {
  const [loading, setLoading] = useState(true);
  return (
    <div>
      <div className="sb-row" style={{ marginBottom: 22 }}>
        <NButton variant="secondary" size="sm" onClick={() => setLoading((l) => !l)}>
          {loading ? "Pokaż treść" : "Pokaż ładowanie"}
        </NButton>
      </div>
      <div aria-busy={loading} aria-live="polite">
        {loading ? (
          <div className="jstack">
            <SkeletonJob seed={401} />
            <SkeletonJob seed={402} />
          </div>
        ) : (
          <div className="jstack">
            {skelJobs.map((j, i) => (
              <JobCard key={j.id} job={j} seed={410 + i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Recruiting() {
  return (
    <section className="sb-section" id="rekrutacja" aria-labelledby="rekrutacja-h">
      <p className="sb-kicker">Komponenty</p>
      <h2 className="sb-h2" id="rekrutacja-h">
        Pełne zgłoszenie i oś czasu
      </h2>
      <ApplicationRecord />
      <h3 className="sb-h3" style={{ marginTop: 56 }}>
        Szkielety ładowania
      </h3>
      <SkeletonDemo />
    </section>
  );
}
