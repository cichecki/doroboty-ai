import { useMemo, useRef, useState, type ReactNode } from "react";
import { categoryLabels, remoteLabels, seniorityLabels } from "@/features/jobs/presentation";
import type { JobWithCompany } from "@/features/jobs/types";
import { initialState, publishedJobs } from "@/features/prototype/model";
import { NButton } from "./button";
import { ComicDialog, NSelect } from "./forms";
import { IconClose, IconFilter, IconList, IconMap, IconSearch } from "./icons";
import { JobCard } from "./jobcard";
import { Segmented } from "./nav";
import { CategoryTabs } from "./tiles";

const allJobs = publishedJobs(initialState());
type Key = "cat" | "mode" | "lvl";
type Filters = Record<Key, string[]>;
const groups: { key: Key; label: string; options: Record<string, string> }[] = [
  { key: "cat", label: "Kategoria", options: categoryLabels },
  { key: "mode", label: "Tryb pracy", options: remoteLabels },
  { key: "lvl", label: "Poziom", options: seniorityLabels },
];
const jobValue = (j: JobWithCompany, k: Key) =>
  k === "cat" ? j.category : k === "mode" ? j.remoteStatus : j.seniority;

/* Pole wyszukiwania z lupą i czyszczeniem */
export function SearchField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="nsearch" role="search">
      <IconSearch />
      <label htmlFor="q" className="sr-only">
        Szukaj ofert
      </label>
      <input
        id="q"
        ref={ref}
        className="ninput nsearch__input"
        type="search"
        placeholder="Stanowisko, firma, umiejętność"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value ? (
        <button
          type="button"
          className="nicon-btn nsearch__clear"
          aria-label="Wyczyść wyszukiwanie"
          onClick={() => {
            onChange("");
            ref.current?.focus();
          }}
        >
          <IconClose />
        </button>
      ) : null}
    </div>
  );
}

/* Chip wyboru (przełącznik) */
function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`nchip${on ? " is-on" : ""}`}
      aria-pressed={on}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ChipGroups({ f, toggle }: { f: Filters; toggle: (k: Key, v: string) => void }) {
  return (
    <>
      {groups.map((g) => (
        <fieldset key={g.key} className="nchips">
          <legend>{g.label}</legend>
          <div className="nchips__row">
            {Object.entries(g.options).map(([v, l]) => (
              <Chip key={v} on={f[g.key].includes(v)} onClick={() => toggle(g.key, v)}>
                {l}
              </Chip>
            ))}
          </div>
        </fieldset>
      ))}
    </>
  );
}

/* Paginacja: skośne pola, bieżąca strona biała */
export function Pagination({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <nav className="npag" aria-label="Strony wyników">
      <NButton variant="secondary" size="sm" disabled={page === 1} onClick={() => onPage(page - 1)}>
        Wstecz
      </NButton>
      <ol className="npag__list">
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <li key={p}>
            <button
              type="button"
              className={`npag__n${p === page ? " is-on" : ""}`}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Strona ${p}`}
              onClick={() => onPage(p)}
            >
              {p}
            </button>
          </li>
        ))}
      </ol>
      <NButton
        variant="secondary"
        size="sm"
        disabled={page === pages}
        onClick={() => onPage(page + 1)}
      >
        Dalej
      </NButton>
    </nav>
  );
}

/* Mapa: stylizowana plansza z pinezkami (dane: coordinates z ogłoszeń albo pozycja zastępcza) */
function MapView({ jobs }: { jobs: JobWithCompany[] }) {
  const [sel, setSel] = useState<string | null>(jobs[0]?.id ?? null);
  const pts = jobs.map((j, i) => {
    const c = j.coordinates;
    // Polska mniej więcej: lon 14–24, lat 49–55
    const x = c ? ((c.longitude - 14) / 10) * 100 : 20 + ((i * 37) % 60);
    const y = c ? ((55 - c.latitude) / 6) * 100 : 25 + ((i * 23) % 50);
    return { j, x: Math.min(92, Math.max(8, x)), y: Math.min(88, Math.max(12, y)) };
  });
  const current = jobs.find((j) => j.id === sel);
  return (
    <div className="nmap">
      <svg
        className="nmap__board"
        viewBox="0 0 100 70"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 22 C20 18 30 30 52 24 S84 16 100 26" />
        <path d="M0 48 C24 44 40 56 62 50 S88 42 100 50" />
        <path d="M30 0 C26 20 38 40 32 70" />
        <path d="M70 0 C74 22 62 46 70 70" />
      </svg>
      {pts.map(({ j, x, y }) => (
        <button
          key={j.id}
          type="button"
          className={`npin${j.id === sel ? " is-on" : ""}`}
          style={{ left: `${x}%`, top: `${y}%` }}
          aria-pressed={j.id === sel}
          aria-label={`${j.title}, ${j.company.name}, ${j.locations.join(", ")}`}
          onClick={() => setSel(j.id)}
        >
          <svg viewBox="0 0 24 30" aria-hidden="true">
            <path d="M12.3 1.4C6.2 1.2 1.8 5.6 2 11.4c.2 5.2 5 10.6 9.8 17.4 4.8-6.8 9.8-12.1 10-17.6.2-5.6-3.7-9.6-9.5-9.8z" />
            <circle cx="12" cy="11.2" r="3.6" />
          </svg>
        </button>
      ))}
      {current ? (
        <div className="nmap__card" role="status">
          <b>{current.title}</b>
          <span>
            {current.company.name} · {current.locations.join(" / ")}
          </span>
          <NButton variant="primary" size="sm">
            Zobacz rolę
          </NButton>
        </div>
      ) : null}
    </div>
  );
}

export function FiltersDemo() {
  const [q, setQ] = useState("");
  const [f, setF] = useState<Filters>({ cat: [], mode: [], lvl: [] });
  const [sort, setSort] = useState("new");
  const [view, setView] = useState<"list" | "map">("list");
  const [page, setPage] = useState(1);
  const [sheet, setSheet] = useState(false);
  const activeRef = useRef<HTMLDivElement>(null);
  const searchFocus = () => (document.getElementById("q") as HTMLInputElement | null)?.focus();

  const toggle = (k: Key, v: string) => {
    setF((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));
    setPage(1);
  };
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = allJobs.filter(
      (j) =>
        (!needle || `${j.title} ${j.company.name} ${j.summary}`.toLowerCase().includes(needle)) &&
        (Object.keys(f) as Key[]).every((k) => !f[k].length || f[k].includes(jobValue(j, k))),
    );
    return [...list].sort((a, b) =>
      sort === "salary"
        ? (b.salaryMax ?? 0) - (a.salaryMax ?? 0)
        : b.publishedAt.localeCompare(a.publishedAt),
    );
  }, [q, f, sort]);
  const per = 2;
  const pages = Math.max(1, Math.ceil(results.length / per));
  const shown = results.slice((page - 1) * per, page * per);
  const active = (Object.keys(f) as Key[]).flatMap((k) =>
    f[k].map((v) => ({ k, v, label: groups.find((g) => g.key === k)!.options[v] })),
  );

  // usunięcie chipa: fokus na następny chip, a jeśli nie ma, na „Wyczyść” albo wyszukiwarkę
  const removeActive = (k: Key, v: string, idx: number) => {
    toggle(k, v);
    window.setTimeout(() => {
      const btns = activeRef.current?.querySelectorAll<HTMLButtonElement>(".nchip-x");
      if (btns && btns.length) btns[Math.min(idx, btns.length - 1)].focus();
      else searchFocus();
    }, 0);
  };

  return (
    <div className="nfilters">
      <div className="nfilters__bar">
        <SearchField value={q} onChange={(v) => (setQ(v), setPage(1))} />
        <button type="button" className="nfilters__mobile-btn" onClick={() => setSheet(true)}>
          <IconFilter /> Filtry{active.length ? ` (${active.length})` : ""}
        </button>
      </div>

      <div className="nfilters__layout">
        <aside className="nfilters__side" aria-label="Filtry">
          <ChipGroups f={f} toggle={toggle} />
        </aside>

        <div className="nfilters__main">
          {active.length ? (
            <div className="nactive" ref={activeRef} aria-label="Aktywne filtry">
              {active.map((a, i) => (
                <button
                  key={a.k + a.v}
                  type="button"
                  className="nchip-x"
                  onClick={() => removeActive(a.k, a.v, i)}
                  aria-label={`Usuń filtr: ${a.label}`}
                >
                  {a.label}
                  <IconClose />
                </button>
              ))}
              <button
                type="button"
                className="nlink"
                onClick={() => {
                  setF({ cat: [], mode: [], lvl: [] });
                  searchFocus();
                }}
              >
                Wyczyść wszystko
              </button>
            </div>
          ) : null}

          <div className="nresults__head">
            <p className="nresults__count" aria-live="polite">
              <b>{results.length}</b>{" "}
              {results.length === 1
                ? "oferta"
                : results.length >= 2 && results.length <= 4
                  ? "oferty"
                  : "ofert"}
            </p>
            <div className="nresults__tools">
              <span className="nresults__sort">
                <label htmlFor="sort" className="sr-only">
                  Sortuj
                </label>
                <NSelect
                  id="sort"
                  value={sort}
                  onChange={setSort}
                  options={[
                    ["new", "Najnowsze"],
                    ["salary", "Najwyższe widełki"],
                  ]}
                />
              </span>
              <Segmented
                label="Widok"
                value={view}
                onChange={setView}
                options={[
                  { value: "list", label: "Lista", icon: <IconList /> },
                  { value: "map", label: "Mapa", icon: <IconMap /> },
                ]}
              />
            </div>
          </div>

          {results.length === 0 ? (
            <p className="nresults__empty">
              Nic nie pasuje. Usuń któryś filtr albo zmień wyszukiwanie.
            </p>
          ) : view === "list" ? (
            <>
              <div className="jstack">
                {shown.map((j, i) => (
                  <JobCard key={j.id} job={j} seed={i + 200 + page * 3} />
                ))}
              </div>
              <Pagination page={page} pages={pages} onPage={setPage} />
            </>
          ) : (
            <MapView jobs={results} />
          )}
        </div>
      </div>

      <ComicDialog
        open={sheet}
        onClose={() => setSheet(false)}
        title="Filtry"
        actions={
          <>
            <button
              type="button"
              className="nlink"
              onClick={() => setF({ cat: [], mode: [], lvl: [] })}
            >
              Wyczyść
            </button>
            <NButton variant="primary" size="sm" onClick={() => setSheet(false)}>
              Pokaż {results.length} ofert
            </NButton>
          </>
        }
      >
        <div className="nsheet">
          <ChipGroups f={f} toggle={toggle} />
        </div>
      </ComicDialog>
    </div>
  );
}

export function FiltersSection() {
  return (
    <section className="sb-section" id="filtry" aria-labelledby="filtry-h">
      <p className="sb-kicker">Komponenty</p>
      <h2 className="sb-h2" id="filtry-h">
        Filtry i wyniki
      </h2>
      <h3 className="sb-h3">Zakładki kategorii</h3>
      <CategoryTabs />
      <h3 className="sb-h3" style={{ marginTop: 44 }}>
        Wyszukiwanie i wyniki
      </h3>
      <FiltersDemo />
    </section>
  );
}
