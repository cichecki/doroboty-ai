import { useState, type ReactNode } from "react";
import people from "@/features/prototype/data/people.json" with { type: "json" };
import { NButton } from "./button";
import { Frame, Portrait } from "./comic";
import { IconBack, IconBurger, IconClose } from "./icons";
import { portraitFor } from "./portraits";

/* ------------------------------------------------------------------
   Drobne elementy wspólne
   ------------------------------------------------------------------ */
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <a
      className="nlogo"
      href="#nawigacja"
      style={{ fontSize: size }}
      aria-label="DoRoboty.ai, strona główna"
    >
      DOROBOTY<b>.AI</b>
    </a>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const init = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
  return (
    <span
      className="navatar"
      style={{ width: size, height: size, fontSize: size * 0.48 }}
      aria-hidden="true"
    >
      {init}
    </span>
  );
}

export function BackLink({ children }: { children: ReactNode }) {
  return (
    <a className="nback" href="#nawigacja">
      <IconBack />
      <span>{children}</span>
    </a>
  );
}

/** Przełącznik segmentowy: biały skośny wskaźnik przesuwa się pod wybraną opcją */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: ReactNode }[];
  label: string;
}) {
  const i = options.findIndex((o) => o.value === value);
  return (
    <div
      className="nseg"
      role="radiogroup"
      aria-label={label}
      style={{ ["--n" as string]: options.length, ["--i" as string]: i }}
    >
      <span className="nseg__thumb" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className={`nseg__opt${o.value === value ? " is-on" : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   Górny pasek publiczny
   ------------------------------------------------------------------ */
const publicLinks = ["Oferty", "Metodologia", "Dla firm"];

function TopBar({
  active,
  onBurger,
  compact,
}: {
  active: string;
  onBurger?: () => void;
  compact?: boolean;
}) {
  return (
    <header className={`ntop${compact ? " ntop--compact" : ""}`}>
      <Logo />
      {!compact ? (
        <nav className="ntop__nav" aria-label="Główna nawigacja">
          {publicLinks.map((l) => (
            <a
              key={l}
              href="#nawigacja"
              className={`ntop__link${l === active ? " is-active" : ""}`}
              aria-current={l === active ? "page" : undefined}
            >
              {l}
            </a>
          ))}
        </nav>
      ) : null}
      <div className="ntop__right">
        {!compact ? (
          <>
            <a href="#nawigacja" className="ntop__link">
              Zaloguj
            </a>
            <NButton variant="primary" size="sm">
              Dodaj ogłoszenie
            </NButton>
          </>
        ) : (
          <button type="button" className="nicon-btn" aria-label="Otwórz menu" onClick={onBurger}>
            <IconBurger />
          </button>
        )}
      </div>
    </header>
  );
}

/* Menu mobilne: wjeżdża z prawej, dolna krawędź rozerwana */
function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div className={`nmenu${open ? " is-open" : ""}`} aria-hidden={!open} inert={!open}>
      <div className="nmenu__top">
        <Logo />
        <button type="button" className="nicon-btn" aria-label="Zamknij menu" onClick={onClose}>
          <IconClose />
        </button>
      </div>
      <nav className="nmenu__nav" aria-label="Menu">
        {[...publicLinks, "Zaloguj"].map((l, i) => (
          <a
            key={l}
            href="#nawigacja"
            className="nmenu__link"
            style={{ ["--d" as string]: `${i * 50}ms` }}
            onClick={onClose}
          >
            {l}
          </a>
        ))}
      </nav>
      <div className="nmenu__cta">
        <NButton variant="master">Dodaj ogłoszenie</NButton>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Menu panelu (pracodawca / kandydat) z prawdziwymi pozycjami z shell.tsx
   ------------------------------------------------------------------ */
const panelNav = {
  employer: [
    ["Przegląd", 0],
    ["Moje oferty", 3],
    ["Kandydaci", 12],
    ["Organizacja", 0],
  ],
  candidate: [
    ["Przegląd", 0],
    ["Profil", 0],
    ["Zapisane oferty", 4],
    ["Moje aplikacje", 2],
  ],
} as const;

function PanelNav({ role }: { role: "employer" | "candidate" }) {
  const person =
    role === "employer"
      ? people.find((p) => p.id === "employer-brightlabs")!
      : people.find((p) => p.id === "candidate-anna")!;
  const items = panelNav[role];
  const [active, setActive] = useState<string>(items[2][0]);
  return (
    <aside className="npanel" aria-label="Panel użytkownika">
      <div className="npanel__person">
        <Avatar name={person.name} size={44} />
        <div>
          <b>{person.name}</b>
          <span>{person.headline}</span>
        </div>
      </div>
      <a href="#nawigacja" className="npanel__switch">
        Zmień osobę
      </a>
      <nav className="npanel__nav">
        {items.map(([label, count]) => (
          <a
            key={label}
            href="#nawigacja"
            className={`npanel__item${label === active ? " is-active" : ""}`}
            aria-current={label === active ? "page" : undefined}
            onClick={(e) => {
              e.preventDefault();
              setActive(label);
            }}
          >
            <span>{label}</span>
            {count ? <span className="npanel__count">{count}</span> : null}
          </a>
        ))}
      </nav>
      <a href="#nawigacja" className="npanel__foot">
        Ustawienia i dane
      </a>
    </aside>
  );
}

/* ------------------------------------------------------------------
   Wybór persony (auth/:mode)
   ------------------------------------------------------------------ */
function PersonaPicker() {
  const list = people.filter((p) => p.role !== "operator");
  return (
    <div className="npersona">
      {list.map((p, i) => (
        <Frame key={p.id} seed={120 + i} hoverMorph className="npersona__card">
          <div className="npersona__head">
            <Portrait
              gender={p.name.split(" ")[0].endsWith("a") ? "f" : "m"}
              size={64}
              seed={i + 30}
              src={portraitFor(p.id)}
            />
            <div>
              <span className="tag-cat tag-cat--sm tag-cat--grey">
                {p.role === "employer" ? "Firma" : "Kandydat"}
              </span>
              <h4 className="npersona__name">{p.name}</h4>
              <p className="npersona__line">{p.headline}</p>
            </div>
          </div>
          <NButton variant="primary" size="sm">
            Wejdź jako {p.name.split(" ")[0]}
          </NButton>
        </Frame>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <footer className="nfoot">
      <div className="nfoot__row">
        <Logo size={20} />
        <nav aria-label="Stopka" className="nfoot__nav">
          <a href="#nawigacja">Oferty</a>
          <a href="#nawigacja">Metodologia</a>
          <a href="#nawigacja">Prywatność</a>
          <a href="#nawigacja">Zmień osobę</a>
        </nav>
      </div>
      <p className="nfoot__note">
        Prototyp do testów z użytkownikami. Dane w przeglądarce, bez kont.
      </p>
    </footer>
  );
}

export function Navigation() {
  const [menu, setMenu] = useState(false);
  const [role, setRole] = useState<"employer" | "candidate">("employer");
  return (
    <section className="sb-section" id="nawigacja" aria-labelledby="nawigacja-h">
      <p className="sb-kicker">Komponenty</p>
      <h2 className="sb-h2" id="nawigacja-h">
        Nawigacja
      </h2>

      <h3 className="sb-h3">Górny pasek</h3>
      <div className="nav-demo">
        <TopBar active="Oferty" />
      </div>

      <div className="sb-grid sb-grid--2" style={{ marginTop: 32, alignItems: "start" }}>
        <div>
          <h3 className="sb-h3">Menu mobilne</h3>
          <div className="phone">
            <TopBar active="Oferty" compact onBurger={() => setMenu(true)} />
            <div className="phone__body">
              <BackLink>Wróć do ofert</BackLink>
            </div>
            <MobileMenu open={menu} onClose={() => setMenu(false)} />
          </div>
        </div>
        <div>
          <h3 className="sb-h3">Menu panelu</h3>
          <Segmented
            label="Rola w panelu"
            value={role}
            onChange={setRole}
            options={[
              { value: "employer", label: "Pracodawca" },
              { value: "candidate", label: "Kandydat" },
            ]}
          />
          <div style={{ marginTop: 18 }}>
            <PanelNav key={role} role={role} />
          </div>
        </div>
      </div>

      <h3 className="sb-h3" style={{ marginTop: 40 }}>
        Link „wróć” i awatary
      </h3>
      <div className="sb-row">
        <BackLink>Wróć do kandydatów</BackLink>
        <Avatar name="Anna Kowalska" />
        <Avatar name="Karolina Wiśniewska" size={44} />
        <Avatar name="Tomasz Zieliński" size={56} />
      </div>

      <h3 className="sb-h3" style={{ marginTop: 40 }}>
        Wybór persony
      </h3>
      <PersonaPicker />

      <h3 className="sb-h3" style={{ marginTop: 40 }}>
        Stopka
      </h3>
      <Footer />
    </section>
  );
}
