import { useState, type ReactNode } from "react";
import { categoryLabels } from "@/features/jobs/presentation";
import { initialState, publishedJobs } from "@/features/prototype/model";
import { Frame } from "./comic";

const jobs = publishedJobs(initialState());

/* ------------------------------------------------------------------
   Zakładki kategorii z licznikiem.
   Obrys skośny przez .n-outline (biała warstwa + wnętrze w kolorze tła),
   nigdy border + clip-path: przycięcie ucina ramkę na skośnych rogach.
   ------------------------------------------------------------------ */
const catSub: Record<string, string> = {
  build: "Twórz AI",
  apply: "Wdrażaj AI",
  lead: "Wyznaczaj kierunek",
};

export function CategoryTabs() {
  const [cat, setCat] = useState("");
  const tabs: [string, string, number][] = [
    ["", "Wszystkie oferty", jobs.length],
    ...Object.entries(categoryLabels).map(
      ([k, l]) => [k, l, jobs.filter((j) => j.category === k).length] as [string, string, number],
    ),
  ];
  return (
    <div className="ncats" role="group" aria-label="Kategorie ofert">
      {tabs.map(([k, label, n], i) => (
        <button
          key={k || "all"}
          type="button"
          className={`ncat n-outline${cat === k ? " is-on" : ""}`}
          style={{ ["--shape" as string]: catShapes[i % catShapes.length] }}
          aria-pressed={cat === k}
          onClick={() => setCat(k)}
        >
          <b>{label}</b>
          {k ? <span className="ncat__sub">{catSub[k]}</span> : null}
          <span className="ncat__n">{n}</span>
        </button>
      ))}
    </div>
  );
}
const catShapes = [
  "polygon(0 0, 100% 4%, 98% 100%, 1% 94%)",
  "polygon(1% 5%, 100% 0, 99% 95%, 0 100%)",
  "polygon(0 3%, 99% 0, 100% 100%, 2% 96%)",
  "polygon(2% 0, 100% 6%, 98% 97%, 0 100%)",
];

/* ------------------------------------------------------------------
   Logo firmy: skośny obrys + wnętrze; obraz albo inicjały
   ------------------------------------------------------------------ */
export function CompanyLogo({
  name,
  src,
  size = 56,
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  const init = name
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2);
  return (
    <span
      className="nlogo-box n-outline"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {src ? <img src={src} alt="" /> : init}
    </span>
  );
}

/* ------------------------------------------------------------------
   Kafelek treści: numer na ramie, tytuł, tekst (np. Metodologia, korzyści)
   ------------------------------------------------------------------ */
export function ContentTile({
  n,
  title,
  children,
  seed,
}: {
  n: number;
  title: string;
  children: ReactNode;
  seed: number;
}) {
  return (
    <Frame as="article" seed={seed} skew={10 + ((seed * 5) % 7)} className="ctile">
      <span className="ctile__n">{String(n).padStart(2, "0")}</span>
      <h3 className="ctile__title" lang="pl">
        {title}
      </h3>
      <p className="ctile__text">{children}</p>
    </Frame>
  );
}

const criteria: [string, string][] = [
  ["AI zmienia pracę", "Technologia wpływa na odpowiedzialność, decyzje lub rezultat stanowiska."],
  [
    "Wynik da się zobaczyć",
    "Opis roli wskazuje problem, odbiorcę i efekt, a nie samą listę narzędzi.",
  ],
  [
    "Człowiek zachowuje odpowiedzialność",
    "Automatyzacja wspiera decyzję; nie ukrywa jej autora ani konsekwencji.",
  ],
  [
    "Oferta daje konkret",
    "Pokazuje tryb pracy, poziom, formę współpracy i, kiedy to możliwe, wynagrodzenie.",
  ],
];

export function ContentTilesDemo() {
  return (
    <div className="ctiles">
      {criteria.map(([t, b], i) => (
        <ContentTile key={t} n={i + 1} title={t} seed={600 + i}>
          {b}
        </ContentTile>
      ))}
    </div>
  );
}

export function LogosDemo() {
  return (
    <div className="sb-row" style={{ alignItems: "flex-end" }}>
      <CompanyLogo name="BrightLabs" size={80} />
      <CompanyLogo name="Northstar Health" size={56} />
      <CompanyLogo name="Plain Sight" size={40} />
    </div>
  );
}
