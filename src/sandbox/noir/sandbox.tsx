import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import people from "@/features/prototype/data/people.json" with { type: "json" };
import { initialState, publishedJobs, stageLabels } from "@/features/prototype/model";
import { DecisionTile, NButton } from "./button";
import { portraitFor } from "./portraits";
import { JobCard } from "./jobcard";
import { Colors } from "./colors";
import { Foundations } from "./foundations";
import { IconBurger, IconClose, IconCross, IconTick } from "./icons";
import { Forms } from "./forms";
import { Navigation } from "./nav";
import { FiltersSection } from "./filters";
import { Recruiting } from "./recruit";
import { PortraitsSection } from "./portraits-section";
import { CursorSection } from "./cursor-section";
import { ComicCursor, Frame, PageDots, Portrait, ScoreTag, SpeechBubble } from "./comic";
import advisorImg from "./img/doradca-cut.png";

/* ------------------------------------------------------------------
   Dane: kandydaci i ogłoszenia z prototypu.
   „Co zrobił sam” nie istnieje w modelu: to szkic pod O01, wpisy z CV.
   ------------------------------------------------------------------ */
const sandboxExtras: Record<string, { gender: "f" | "m"; proof: string[]; applied: string }> = {
  "candidate-anna": {
    gender: "f",
    applied: "3 dni temu",
    proof: [
      "Badania z 18 użytkownikami",
      "Wdrożenie asystenta do zgłoszeń",
      "Czas obsługi krótszy o 30%",
    ],
  },
  "candidate-marek": {
    gender: "m",
    applied: "wczoraj",
    proof: [
      "Automatyzacja obsługi zgłoszeń",
      "Czas odpowiedzi krótszy o 25%",
      "Warsztaty z użytkownikami",
    ],
  },
};
const candidates = people
  .filter((p) => p.role === "candidate")
  .map((p) => ({ ...p, ...sandboxExtras[p.id] }));
const jobs = publishedJobs(initialState());
// Portrety: wspólny moduł portraits.ts (pliki w img/portraits/)
const portraitSrc = portraitFor;
const ADVISOR_MOUTH: [number, number] = [0.41, 0.19];

/* ------------------------------------------------------------------
   Sekcje
   ------------------------------------------------------------------ */
function Section({
  id,
  kicker,
  title,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="sb-section" id={id} aria-labelledby={`${id}-h`}>
      <p className="sb-kicker">{kicker}</p>
      <h2 className="sb-h2" id={`${id}-h`}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Buttons() {
  const [busy, setBusy] = useState(false);
  const [stripes, setStripes] = useState<3 | 5>(3);
  return (
    <Section id="przyciski" kicker="Komponenty" title="Rodzina przycisków">
      <div className="sb-row" style={{ margin: "18px 0 8px", gap: 20 }}>
        <label className="sb-toggle">
          <input
            type="checkbox"
            checked={stripes === 5}
            onChange={(e) => setStripes(e.target.checked ? 5 : 3)}
          />
          5 pasków zamiast 4
        </label>
      </div>
      <div className="sb-grid sb-grid--3">
        <div className="sb-stage">
          <NButton variant="master" size="lg" stripes={stripes}>
            Dodaj ogłoszenie
          </NButton>
          <p className="sb-label">Master · fala 720 ms raz na najechanie · bliki tylko na hover</p>
        </div>
        <div className="sb-stage">
          <NButton variant="primary" size="lg">
            Zaproś na rozmowę
          </NButton>
          <p className="sb-label">Primary · czerwień zalewa od lewej, obrót −2,5°</p>
        </div>
        <div className="sb-stage">
          <NButton variant="secondary" size="lg">
            Odrzuć
          </NButton>
          <p className="sb-label">Secondary · obrys, biel zalewa od prawej</p>
        </div>
      </div>

      <h3 className="sb-h3">Stany</h3>
      <div className="sb-stage">
        <div
          className="sb-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "36px 24px",
            alignItems: "end",
          }}
        >
          {(["master", "primary", "secondary"] as const).map((v) => (
            <div key={v} style={{ display: "grid", gap: 26, justifyItems: "start" }}>
              <span className="sb-mono">{v}</span>
              <NButton variant={v} stripes={stripes}>
                Spoczynek
              </NButton>
              <NButton variant={v} demo="hover" stripes={stripes}>
                Hover
              </NButton>
              <NButton variant={v} demo="active" stripes={stripes}>
                Wciśnięty
              </NButton>
              <NButton variant={v} busy stripes={stripes}>
                x
              </NButton>
              <NButton variant={v} disabled>
                Wyłączony
              </NButton>
            </div>
          ))}
        </div>
        <p className="sb-label">
          Zamrożony hover nie odtwarza fali, bo fala gra raz przy wejściu kursora. Fokus z
          klawiatury pokazuje przerywaną ramę i odpala falę.
        </p>
      </div>

      <h3 className="sb-h3">Ładowanie na żywo</h3>
      <div className="sb-row">
        <NButton
          variant="master"
          busy={busy}
          stripes={stripes}
          onClick={() => {
            setBusy(true);
            window.setTimeout(() => setBusy(false), 2200);
          }}
        >
          Opublikuj ogłoszenie
        </NButton>
      </div>

      <h3 className="sb-h3">Ruch: trzy czasy</h3>
      <table className="role-table">
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col">Wartość</th>
            <th scope="col">Gdzie</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="sb-mono">--t-press</td>
            <td className="sb-mono">40ms linear</td>
            <td>wciśnięcie: przycisk wjeżdża w cień od razu</td>
          </tr>
          <tr>
            <td className="sb-mono">--t-hover</td>
            <td className="sb-mono">240ms cubic-bezier(.3,.7,.4,1.5)</td>
            <td>najechanie: sprężyna z lekkim przestrzeleniem</td>
          </tr>
          <tr>
            <td className="sb-mono">--t-release</td>
            <td className="sb-mono">520ms cubic-bezier(.3,.7,.4,1)</td>
            <td>powrót: miękko, bez odbicia</td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}

/* ------------------------------------------------------------------
   Karty
   ------------------------------------------------------------------ */
function CandidateCard({ c, seed }: { c: (typeof candidates)[number]; seed: number }) {
  const [stage, setStage] = useState<keyof typeof stageLabels>("reviewed");
  const decided = stage !== "reviewed";
  return (
    <Frame as="article" seed={seed} hoverMorph className="ccard" aria-labelledby={`${c.id}-name`}>
      <ScoreTag score={c.exampleScore} size="lg" />
      <div className="ccard__head">
        <Portrait gender={c.gender} src={portraitSrc(c.id)} seed={seed + 40} />
        <div className="ccard__id">
          <h3 className="ccard__name" id={`${c.id}-name`}>
            {c.name}
          </h3>
          <p className="ccard__stage">
            <span className="stage-dot" aria-hidden="true" />
            <span>
              {stageLabels[stage]} · <span className="nowrap">aplikacja {c.applied}</span>
            </span>
          </p>
        </div>
      </div>
      <div className="ccard__proof">
        <h4>Samodzielne zadania</h4>
        <ul>
          {c.proof.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <small>Z CV, niezweryfikowane. Do sprawdzenia w rozmowie.</small>
      </div>
      <div className="ccard__actions">
        <NButton variant="primary" size="sm">
          Zobacz całe zgłoszenie
        </NButton>
        <div className="ccard__decide">
          {decided ? (
            <button type="button" className="nlink" onClick={() => setStage("reviewed")}>
              Cofnij
            </button>
          ) : (
            <>
              <DecisionTile
                kind="yes"
                label="Zaproś kandydata na rozmowę"
                icon={<IconTick />}
                onClick={() => setStage("interview_invited")}
              />
              <DecisionTile
                kind="no"
                label="Odrzuć kandydata"
                icon={<IconCross />}
                onClick={() => setStage("rejected")}
              />
            </>
          )}
        </div>
      </div>
    </Frame>
  );
}

function Cards() {
  return (
    <Section id="karty" kicker="Komponenty" title="Ogłoszenie i kandydat">
      <h3 className="sb-h3">Karta ogłoszenia</h3>
      <div className="jstack">
        {jobs.slice(0, 3).map((j, i) => (
          <JobCard key={j.id} job={j} seed={i + 11} />
        ))}
      </div>

      <h3 className="sb-h3" style={{ marginTop: 44 }}>
        Karta kandydata
      </h3>
      <div className="cgrid-cand">
        {candidates.map((c, i) => (
          <CandidateCard key={c.id} c={c} seed={i + 3} />
        ))}
      </div>

      <h3 className="sb-h3" style={{ marginTop: 44 }}>
        Lista kandydatów
      </h3>
      <div className="dlist" role="table" aria-label="Lista kandydatów">
        <div className="drow drow--head" role="row">
          <span role="columnheader">Kandydat</span>
          <span role="columnheader">Match</span>
          <span role="columnheader">Samodzielne zadania</span>
          <span role="columnheader">Etap</span>
          <span role="columnheader">
            <span className="sr-only">Akcje</span>
          </span>
        </div>
        {candidates.map((c) => (
          <div className="drow" role="row" key={c.id}>
            <span role="cell" className="drow__person">
              <Portrait gender={c.gender} src={portraitSrc(c.id)} size={40} seed={c.name.length} />
              <span className="drow__name">{c.name}</span>
            </span>
            <span role="cell">
              <ScoreTag score={c.exampleScore} size="sm" />
            </span>
            <span role="cell" className="drow__stage">
              {c.proof[0]}
            </span>
            <span role="cell" className="drow__stage">
              {stageLabels.reviewed}
            </span>
            <span role="cell">
              <button type="button" className="nlink">
                Otwórz
              </button>
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------
   Moment: odsłonięcie wyniku
   ------------------------------------------------------------------ */
function tornHalves(seed = 7) {
  let s = seed;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const pts: [number, number][] = [];
  for (let y = 0; y <= 100; y += 5) pts.push([46 + rnd() * 10 + (y % 10 === 0 ? 2 : -2), y]);
  const edge = pts.map(([x, y]) => `${x.toFixed(1)}% ${y}%`);
  return {
    left: `polygon(0 0, ${edge.join(", ")}, 0 100%)`,
    right: `polygon(100% 0, ${edge.join(", ")}, 100% 100%)`,
  };
}

function Burst() {
  // czerwona eksplozja za wynikiem: kolce o różnej długości
  const n = 18;
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 48 - ((i * 7) % 9) : 30 + ((i * 5) % 4);
    return `${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r * 0.78).toFixed(1)}`;
  }).join(" ");
  return (
    <svg
      className="moment__burst"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon points={pts} />
    </svg>
  );
}

function Rays() {
  const lines = Array.from({ length: 44 }, (_, i) => {
    const a = (i / 44) * Math.PI * 2 + (i % 3) * 0.03;
    const inner = 26 + (i % 4) * 4;
    return (
      <polygon
        key={i}
        points={`${50 + Math.cos(a - 0.012) * inner},${50 + Math.sin(a - 0.012) * inner} ${50 + Math.cos(a) * 90},${50 + Math.sin(a) * 90} ${50 + Math.cos(a + 0.012) * inner},${50 + Math.sin(a + 0.012) * inner}`}
      />
    );
  });
  return (
    <svg
      className="moment__rays"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {lines}
    </svg>
  );
}

function Moment() {
  const c = candidates[0];
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(0);
  const [settled, setSettled] = useState(0);
  const { left, right } = tornHalves();
  const raf = useRef(0);
  const advisorRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!open) {
      setN(0);
      return;
    }
    const reduce =
      document.documentElement.classList.contains("reduce-motion") ||
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(c.exampleScore);
      return;
    }
    const start = performance.now() + 420;
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - start) / 650));
      setN(Math.round(c.exampleScore * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    const id = window.setTimeout(() => setSettled((x) => x + 1), 2300);
    return () => {
      cancelAnimationFrame(raf.current);
      window.clearTimeout(id);
    };
  }, [open, c.exampleScore]);

  return (
    <Section id="moment" kicker="Wzorce" title="Odsłonięcie Match Score">
      <Frame
        seed={21}
        skew={16}
        className={`moment${open ? " is-open" : ""}`}
        style={{ marginTop: 24 }}
        aria-live="polite"
      >
        <div className="moment__stage">
          <Rays />
          <Burst />
          <div className="moment__panel" role="group" aria-label="Wynik">
            <p className="moment__name">{c.name}</p>
            <div className="moment__score">
              <span className="moment__num">{n}</span>
              <span className="moment__of">/100</span>
            </div>
            <p className="moment__parts">
              umiejętności 35% · zadania 30% · doświadczenie 20% · warunki 15%
            </p>
            <div className="moment__cta">
              <NButton variant="primary" size="sm">
                Zobacz profil kandydata
              </NButton>
            </div>
          </div>
          <span className="sfx moment__sfx" aria-hidden="true">
            BAM!
          </span>
          <img ref={advisorRef} className="moment__advisor" src={advisorImg} alt="" />
          <SpeechBubble
            variant="burst"
            className="moment__bubble"
            gap={52}
            tailWidth={13}
            target={advisorRef}
            aim={ADVISOR_MOUTH}
            recalc={`${open}-${settled}`}
          >
            {c.exampleSummary.split(".")[0]}!
          </SpeechBubble>

          <div className="paper" aria-hidden={open}>
            <div className="paper__half paper__half--l" style={{ clipPath: left }} />
            <div className="paper__half paper__half--r" style={{ clipPath: right }} />
          </div>
          <div className="paper__hint">
            <p>Ktoś pasuje do ogłoszenia. Zobaczysz, jak bardzo?</p>
            <NButton variant="master" onClick={() => setOpen(true)}>
              Odsłoń wynik
            </NButton>
          </div>
        </div>
      </Frame>
      <div className="sb-row" style={{ marginTop: 22 }}>
        <NButton variant="secondary" size="sm" onClick={() => setOpen(false)}>
          Zasłoń ponownie
        </NButton>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------
   Doradca
   ------------------------------------------------------------------ */
function Advisor() {
  const [title, setTitle] = useState("");
  const [tried, setTried] = useState(false);
  const [toast, setToast] = useState(false);
  const formRef = useRef<HTMLImageElement>(null);
  const error = tried && !title.trim();
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(false), 4200);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <Section id="doradca" kicker="Wzorce" title="Pusty stan, błąd i sukces">
      <h3 className="sb-h3">Pusty stan</h3>
      <div className="adv-row">
        <img src={advisorImg} alt="" className="adv-row__figure" />
        <Frame seed={31} className="adv-tile">
          <span className="kadr__caption">Twoje ogłoszenie · dzień 1</span>
          <p className="adv-tile__title">Cisza w eterze</p>
          <p className="adv-tile__text">
            Nikt jeszcze nie aplikował. Pierwsze zgłoszenia zwykle wpadają w ciągu 2 dni.
          </p>
          <NButton variant="primary" size="sm">
            Udostępnij ogłoszenie
          </NButton>
        </Frame>
      </div>

      <h3 className="sb-h3" style={{ marginTop: 48 }}>
        Błąd i sukces
      </h3>
      <div className="adv-row adv-row--right">
        <Frame
          as="form"
          seed={41}
          className="adv-tile adv-tile--form"
          noValidate
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            setTried(true);
            if (title.trim()) setToast(true);
          }}
        >
          <span className="kadr__caption">Nowe ogłoszenie</span>
          <div className={`field${error ? " is-error" : ""}`}>
            <label htmlFor="job-title">Stanowisko</label>
            <input
              id="job-title"
              className="ninput"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="np. AI Product Manager"
              aria-invalid={error || undefined}
              aria-describedby={error ? "job-title-err" : undefined}
            />
            {error ? (
              <div className="field__error" id="job-title-err" role="alert">
                <span className="field__error-icon" aria-hidden="true">
                  !
                </span>
                Wpisz stanowisko, inaczej nikt nie znajdzie ogłoszenia.
              </div>
            ) : null}
          </div>
          <div>
            <NButton variant="master" type="submit">
              Opublikuj
            </NButton>
          </div>
        </Frame>
        <div className="adv-row__side">
          {error ? (
            <SpeechBubble
              className="adv-row__bubble"
              target={formRef}
              aim={ADVISOR_MOUTH}
              recalc={error}
              gap={22}
              tailWidth={14}
            >
              Bez tytułu to ogłoszenie jest jak bohater bez peleryny.
            </SpeechBubble>
          ) : null}
          <img
            ref={formRef}
            src={advisorImg}
            alt=""
            className={`adv-row__figure${error ? " is-up" : ""}`}
          />
        </div>
      </div>
      {toast ? (
        <div className="toast" role="status">
          <span className="sfx">GOTOWE!</span>
          <p>
            <b>„{title}”</b> jest opublikowane na 30 dni.
          </p>
        </div>
      ) : null}
    </Section>
  );
}

function Motifs() {
  const torn = `polygon(0 0, 100% 0, 100% 88%, ${Array.from({ length: 24 }, (_, i) => {
    const x = 100 - (i + 1) * (100 / 24);
    const y = 88 + ((i * 37) % 11);
    return `${x.toFixed(1)}% ${y}%`;
  }).join(", ")})`;
  return (
    <Section id="motywy" kicker="Wzorce" title="Raster, rozerwana kartka, podpis kadru">
      <div className="sb-grid sb-grid--3" style={{ marginTop: 24 }}>
        <div>
          <Frame seed={51} className="motif-halftone">
            <span className="sfx" style={{ ["--sfx-size" as string]: "46px" }}>
              ZZZIP!
            </span>
          </Frame>
          <p className="sb-label">Raster biały 10 px, wygaszony gradientem.</p>
        </div>
        <div>
          <div className="motif-torn" style={{ clipPath: torn }}>
            <span className="caption-box">Tymczasem w BrightLabs…</span>
            <p style={{ margin: "14px 0 0", fontSize: 15 }}>
              Rozerwany dół kartki jako przejście między sekcjami albo krawędź toastu.
            </p>
          </div>
          <p className="sb-label">Rozerwana krawędź, losowana raz i stała.</p>
        </div>
        <div>
          <Frame seed={61} className="motif-caption">
            <span className="kadr__caption">Wtorek, 9:15</span>
            <p style={{ margin: 0 }}>
              Podpis kadru tylko przy zmianie sceny: nowy etap, nowa osoba, nowy dzień.
            </p>
          </Frame>
          <p className="sb-label">Podpis kadru: Bangers na białym pasku, wychodzi na ramę.</p>
        </div>
      </div>
    </Section>
  );
}

function Roles() {
  return (
    <Section id="role" kicker="Wzorce" title="Kiedy który przycisk">
      <table className="role-table">
        <thead>
          <tr>
            <th scope="col">Wariant</th>
            <th scope="col">Kiedy</th>
            <th scope="col">Przykłady</th>
            <th scope="col">Limit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Master (czerwony)</td>
            <td>akcja, która zarabia albo zamyka ścieżkę</td>
            <td>Dodaj ogłoszenie, Opublikuj, Kup pakiet, Odsłoń wynik</td>
            <td>1 na widok</td>
          </tr>
          <tr>
            <td>Primary (biały)</td>
            <td>główna akcja w karcie albo sekcji</td>
            <td>Zaproś na rozmowę, Zobacz rolę, Udostępnij</td>
            <td>1 na kartę</td>
          </tr>
          <tr>
            <td>Secondary (obrys)</td>
            <td>alternatywa obok primary</td>
            <td>Odrzuć, Anuluj, Wróć</td>
            <td>bez limitu</td>
          </tr>
          <tr>
            <td>Link tekstowy</td>
            <td>gęste listy i tabele</td>
            <td>Otwórz, Pokaż CV</td>
            <td>bez limitu</td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}

const navGroups: { label: string; items: [string, string][] }[] = [
  {
    label: "Fundamenty",
    items: [
      ["kolory", "Kolory"],
      ["fd-typo", "Typografia"],
      ["fd-icons", "Ikony"],
      ["fd-space", "Odstępy"],
      ["fd-layout", "Siatka"],
      ["fd-shape", "Kształty"],
      ["fd-status", "Statusy"],
      ["fd-z", "Warstwy"],
      ["fd-a11y", "Dostępność"],
      ["fd-map", "Tokeny aplikacji"],
    ],
  },
  {
    label: "Komponenty",
    items: [
      ["przyciski", "Przyciski"],
      ["karty", "Karty"],
      ["formularze", "Formularze"],
      ["nawigacja", "Nawigacja"],
      ["filtry", "Filtry"],
      ["rekrutacja", "Rekrutacja"],
      ["portrety", "Portrety"],
    ],
  },
  {
    label: "Wzorce",
    items: [
      ["moment", "Odsłonięcie wyniku"],
      ["doradca", "Doradca"],
      ["motywy", "Motywy"],
      ["role", "Reguły przycisków"],
      ["kursor", "Kursor"],
    ],
  },
];

function DsNav({
  open,
  onToggle,
  reduce,
  onReduce,
}: {
  open: boolean;
  onToggle: () => void;
  reduce: boolean;
  onReduce: (v: boolean) => void;
}) {
  const [active, setActive] = useState("kolory");
  useEffect(() => {
    const ids = navGroups.flatMap((g) => g.items.map(([id]) => id));
    const els = ids.map((id) => document.getElementById(id)).filter((x): x is HTMLElement => !!x);
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-10% 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <aside className={`dsnav${open ? " is-open" : ""}`} aria-label="Spis design systemu">
      <div className="dsnav__top">
        <span className="dsnav__logo">
          DOROBOTY<b>.AI</b>
          <small>design system</small>
        </span>
        <button
          type="button"
          className="nicon-btn dsnav__toggle"
          aria-expanded={open}
          aria-controls="dsnav-list"
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
          onClick={onToggle}
        >
          {open ? <IconClose /> : <IconBurger />}
        </button>
      </div>
      <nav className="dsnav__list" id="dsnav-list">
        {navGroups.map((g) => (
          <div key={g.label} className="dsnav__group">
            <span className="dsnav__caption">{g.label}</span>
            {g.items.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className={`dsnav__link${active === id ? " is-active" : ""}`}
                aria-current={active === id ? "true" : undefined}
                onClick={() => open && onToggle()}
              >
                <span>{label}</span>
              </a>
            ))}
          </div>
        ))}
        <label className="sb-toggle dsnav__reduce">
          <input type="checkbox" checked={reduce} onChange={(e) => onReduce(e.target.checked)} />
          Mniej ruchu
        </label>
      </nav>
    </aside>
  );
}

export function Sandbox() {
  const [reduce, setReduce] = useState(false);
  const [open, setOpen] = useState(false); // dotyczy tylko telefonu/tabletu; na desktopie panel jest zawsze otwarty
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduce);
  }, [reduce]);
  return (
    <>
      <PageDots />
      <ComicCursor />
      <div className="ds ds--open">
        <DsNav
          open={open}
          onToggle={() => setOpen((o) => !o)}
          reduce={reduce}
          onReduce={setReduce}
        />
        <main className="sb-main">
          <header className="ds-hero">
            <p className="sb-kicker">DoRoboty.ai · v0.13 · 05.11.2026</p>
            <h1 className="sb-h1">
              Design <em>system</em>
            </h1>
          </header>
          <Colors />
          <Foundations />
          <Buttons />
          <Cards />
          <Forms />
          <Navigation />
          <FiltersSection />
          <Recruiting />
          <PortraitsSection />
          <Moment />
          <Advisor />
          <Motifs />
          <Roles />
          <CursorSection />
        </main>
      </div>
    </>
  );
}
