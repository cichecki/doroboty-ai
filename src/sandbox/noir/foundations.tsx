import type { ReactNode } from "react";
import { publicationStatusLabels } from "@/features/jobs/presentation";
import { stageLabels, type Stage } from "@/features/prototype/model";
import { IconArrow, IconBookmark, IconLevel, IconPin, IconWorkMode } from "./icons";

/* ------------------------------------------------------------------
   Plakietki statusów: bez czerwieni (czerwień = talent + master).
   Różnią się wypełnieniem, obrysem i znacznikiem, nie kolorem.
   ------------------------------------------------------------------ */
type PubStatus = keyof typeof publicationStatusLabels;
const pubStyle: Record<PubStatus, string> = {
  published: "solid",
  review: "grey",
  draft: "dashed",
  hidden: "muted",
  expired: "dark",
  archived: "dark",
};
export function PublicationBadge({ status }: { status: PubStatus }) {
  return (
    <span className={`sbadge sbadge--${pubStyle[status]}`}>{publicationStatusLabels[status]}</span>
  );
}

const stageMark: Record<Stage, "empty" | "dot" | "half" | "full" | "star" | "cross" | "out"> = {
  submitted: "empty",
  reviewed: "dot",
  interview_invited: "half",
  first_conversation_held: "full",
  continued: "full",
  hired: "star",
  rejected: "cross",
  withdrawn: "out",
};
export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className={`stage stage--${stageMark[stage]}`}>
      <span className="stage__mark" aria-hidden="true" />
      {stageLabels[stage]}
    </span>
  );
}

function Block({
  id,
  title,
  children,
  sub,
}: {
  id: string;
  title: string;
  children: ReactNode;
  sub?: boolean;
}) {
  if (sub)
    return (
      <div className="fd-sub-block" id={id}>
        <h3 className="sb-h3">{title}</h3>
        {children}
      </div>
    );
  return (
    <section className="sb-section" id={id} aria-labelledby={`${id}-h`}>
      <p className="sb-kicker">Fundamenty</p>
      <h2 className="sb-h2" id={`${id}-h`}>
        {title}
      </h2>
      {children}
    </section>
  );
}

const typeScale = [
  {
    token: "--t-display-xl",
    use: "H1 strony, hero",
    spec: "Climate Crisis · clamp(40–74 px) / 0.95 · wersaliki",
    cls: "fd-t-dxl",
    sample: "Znajdź bohatera",
  },
  {
    token: "--t-display-l",
    use: "H2 sekcji",
    spec: "Climate Crisis · clamp(26–38 px) / 1.0 · wersaliki",
    cls: "fd-t-dl",
    sample: "Jak to działa",
  },
  {
    token: "--t-display-m",
    use: "Tytuł karty, imię",
    spec: "Climate Crisis · 24 px / 1.05 · wersaliki · minimum dla kroju",
    cls: "fd-t-dm",
    sample: "AI Product Manager",
  },
  {
    token: "--t-title",
    use: "H3–H4 w treści, nagłówki formularzy",
    spec: "Satoshi 700 · 20 px / 1.3",
    cls: "fd-t-title",
    sample: "Co będzie na Twoim biurku",
  },
  {
    token: "--t-body-l",
    use: "Lead, wstęp sekcji",
    spec: "Satoshi 400 · 18 px / 1.55",
    cls: "fd-t-bodyl",
    sample: "Poprowadź produkt od problemu do wdrożenia.",
  },
  {
    token: "--t-body",
    use: "Tekst, opis oferty, formularze",
    spec: "Satoshi 400 · 16 px / 1.6 · maks. 68 znaków",
    cls: "fd-t-body",
    sample: "Szukamy osoby, która poprowadzi discovery i wdrożenie.",
  },
  {
    token: "--t-small",
    use: "Fakty, metadane, podpowiedzi",
    spec: "Satoshi 400 · 14 px / 1.45",
    cls: "fd-t-small",
    sample: "Warszawa · Hybrydowo · Senior",
  },
  {
    token: "--t-caption",
    use: "Nadtytuły, nagłówki tabel",
    spec: "Satoshi 700 · 12.5 px · wersaliki · tracking 0.14em",
    cls: "fd-t-caption",
    sample: "Kandydaci · 12 zgłoszeń",
  },
  {
    token: "--t-action",
    use: "Przyciski, etykiety, podpisy kadrów",
    spec: "Bangers · 18 / 22 / 28 px · tracking 0.05em",
    cls: "fd-t-action",
    sample: "Zaproś na rozmowę",
  },
  {
    token: "--t-figure",
    use: "Liczby: Match Score, widełki, statystyki",
    spec: "Bangers · 28–38 px · czarny obrys na czerwieni",
    cls: "fd-t-figure",
    sample: "22 000–29 000 zł",
  },
  {
    token: "--t-letter",
    use: "Wyłącznie dymki",
    spec: "Kalam · 15.5 px / 1.2 · wersaliki",
    cls: "fd-t-letter",
    sample: "Cisza w eterze.",
  },
];

const space = [
  ["--s-1", 4],
  ["--s-2", 8],
  ["--s-3", 12],
  ["--s-4", 16],
  ["--s-5", 24],
  ["--s-6", 32],
  ["--s-7", 48],
  ["--s-8", 64],
  ["--s-9", 96],
] as const;

const contrast = [
  ["Biel na tuszu", "#f2efe8", "#0a0a0a", "17,2", "każdy tekst"],
  ["Biel na panelu", "#f2efe8", "#151515", "15,9", "każdy tekst"],
  ["Szarość na tuszu", "#a8a49b", "#0a0a0a", "8,0", "tekst drugorzędny"],
  ["Szarość na panelu", "#a8a49b", "#151515", "7,3", "tekst drugorzędny"],
  ["Tusz na szarej etykiecie", "#0a0a0a", "#b9b5ac", "9,7", "etykiety"],
  [
    "Biel na czerwieni",
    "#f2efe8",
    "#d3202a",
    "4,6",
    "tekst ≥ 14 px pogrubiony; w masterze z obrysem",
  ],
  ["Czerwień na tuszu", "#d3202a", "#0a0a0a", "3,8", "tylko duży tekst (≥ 24 px) i grafika"],
  [
    "Placeholder #77736b",
    "#77736b",
    "#0a0a0a",
    "4,2",
    "za mało na tekst: do podniesienia na #8a867e",
  ],
] as const;

const mapping = [
  ["--background", "--ink", "#0a0a0a"],
  ["--foreground", "--white", "#f2efe8"],
  ["--card / --popover", "--panel", "#151515"],
  ["--muted-foreground / --gui-text-muted", "--muted", "#a8a49b"],
  ["--border / --input / --gui-edge", "--line", "#3a3835"],
  ["--primary / --primary-foreground", "--white / --ink", "przycisk primary"],
  ["--accent / --gui-accent", "--red", "#d3202a (talent + master)"],
  ["--destructive / --gui-error / --gui-danger", "--white (odwrócenie)", "błąd bez czerwieni"],
  ["--gui-match-green/yellow/orange/red", "--red (jeden kolor)", "pasma Match Score do decyzji"],
  ["--ring / --gui-focus", "--white", "przerywana rama 3 px"],
  ["--radius / --gui-radius-*", "0", "kształt dają skosy, nie zaokrąglenia"],
  ["--gui-shadow-*", "twardy cień bez rozmycia", "5 px biały tylko w masterze"],
  ["--font-display / --font-brand", "--f-display", "Climate Crisis"],
  ["--font-ui / --font-body", "--f-ui", "Satoshi"],
  ["--gui-space-xxs…xxl / --space-*", "--s-1…--s-9", "skala 4–96 px"],
  ["--motion-duration / --dur-short", "--t-hover / --t-press / --t-release", "240 / 40 / 520 ms"],
] as const;

export function Foundations() {
  return (
    <>
      <Block id="fd-typo" title="Typografia">
        <div className="fd-type">
          {typeScale.map((t) => (
            <div className="fd-type__row" key={t.token}>
              <div className="fd-type__meta">
                <span className="sb-mono">{t.token}</span>
                <span>{t.use}</span>
                <span className="fd-type__spec">{t.spec}</span>
              </div>
              <div className={t.cls}>{t.sample}</div>
            </div>
          ))}
        </div>
        <ul className="fd-rules">
          <li>Climate Crisis od 24 px w górę.</li>
          <li>Kalam tylko w dymkach, wersalikami.</li>
          <li>Liczby-fakty (widełki, Match Score) w Bangers.</li>
        </ul>
        <Block sub id="fd-prose" title="Długi tekst">
          <div className="prose">
            <h3>Co będzie na Twoim biurku</h3>
            <p>
              Procesy naszych klientów nadal opierają się na arkuszach i ręcznym sprawdzaniu
              dokumentów. Twoim zadaniem będzie ustalić, które pomysły warto sprawdzić i jaki zakres
              ma sens na początek. <a href="#fd-prose">Zobacz, jak pracujemy</a>.
            </p>
            <ul>
              <li>Poprowadzisz discovery i zbierzesz dane o obecnym sposobie pracy.</li>
              <li>Z zespołem wybierzesz rozwiązanie i ustalisz kryteria odbioru.</li>
              <li>Po wdrożeniu wrócisz do użytkowników z pytaniami o wynik.</li>
            </ul>
            <h4>Na początek: jeden proces</h4>
            <p>
              W pierwszym kwartale poznasz klientów i wybierzesz ograniczony scenariusz do pilota.
            </p>
          </div>
        </Block>

        <Block id="fd-icons" title="Ikony">
          <div className="fd-icons">
            {[
              ["Lokalizacja", <IconPin key="p" />],
              ["Stacjonarnie", <IconWorkMode key="o" mode="onsite" />],
              ["Hybrydowo", <IconWorkMode key="h" mode="hybrid" />],
              ["Zdalnie", <IconWorkMode key="r" mode="remote" />],
              ["Junior", <IconLevel key="j" level="junior" />],
              ["Mid", <IconLevel key="m" level="mid" />],
              ["Senior", <IconLevel key="s" level="senior" />],
              ["Lead", <IconLevel key="l" level="lead" />],
              ["Zapisz", <IconBookmark key="b" />],
              ["Zapisane", <IconBookmark key="bo" on />],
              ["Strzałka", <IconArrow key="a" />],
            ].map(([label, icon]) => (
              <div className="fd-icon" key={label as string}>
                {icon}
                <span>{label}</span>
              </div>
            ))}
          </div>
        </Block>
      </Block>

      <Block id="fd-space" title="Odstępy">
        <div className="fd-space">
          {space.map(([token, px]) => (
            <div className="fd-space__row" key={token}>
              <span className="sb-mono">{token}</span>
              <span className="fd-space__bar" style={{ width: px * 2 }} />
              <span className="fd-space__px">{px} px</span>
            </div>
          ))}
        </div>
        <p className="sb-note fd-note">
          W kaflach: margines boczny ≥ 40 px (narożniki się ruszają i nie mogą wejść na tekst),
          góra-dół ≥ 32 px. Między sekcjami strony --s-9. Kafle w stosie nachodzą na siebie o 26 px.
        </p>
      </Block>

      <Block id="fd-layout" title="Siatka">
        <div className="fd-grid-demo" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        <table className="role-table">
          <thead>
            <tr>
              <th scope="col">Element</th>
              <th scope="col">Wartość</th>
              <th scope="col">Użycie</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Kontener wąski</td>
              <td className="sb-mono">720 px</td>
              <td>formularze, długi tekst, aplikacja</td>
            </tr>
            <tr>
              <td>Kontener główny</td>
              <td className="sb-mono">1180 px</td>
              <td>listy, panel pracodawcy</td>
            </tr>
            <tr>
              <td>Kontener szeroki</td>
              <td className="sb-mono">1320 px</td>
              <td>oferta z mapą, landing</td>
            </tr>
            <tr>
              <td>Siatka</td>
              <td className="sb-mono">12 kolumn · odstęp 24 px (mobile 16 px)</td>
              <td>margines strony clamp(16–48 px)</td>
            </tr>
            <tr>
              <td>Punkty łamania</td>
              <td className="sb-mono">560 · 760 · 980 · 1280</td>
              <td>telefon · duży telefon · tablet · desktop</td>
            </tr>
          </tbody>
        </table>
      </Block>

      <Block id="fd-shape" title="Kształty">
        <table className="role-table">
          <thead>
            <tr>
              <th scope="col">Element</th>
              <th scope="col">Rama</th>
              <th scope="col">Skos</th>
              <th scope="col">Cień</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Kafel (Frame)</td>
              <td>biała, 5–11 px, zmienna na każdym boku</td>
              <td>rogi do 14 px, hover: narożniki 5–11 px w poziomie</td>
              <td>brak</td>
            </tr>
            <tr>
              <td>Portret</td>
              <td>biała, 2–4,5 px</td>
              <td>~9% boku</td>
              <td>brak</td>
            </tr>
            <tr>
              <td>Przycisk</td>
              <td>secondary: 2,5 px</td>
              <td>3–6% (clip-path)</td>
              <td>master: 5 px biały, hover 8 px</td>
            </tr>
            <tr>
              <td>Etykieta, plakietka</td>
              <td>brak</td>
              <td>4–8%</td>
              <td>brak</td>
            </tr>
            <tr>
              <td>Dymek</td>
              <td>czarna, 2,5 px</td>
              <td>falujący albo wybuch</td>
              <td>brak</td>
            </tr>
          </tbody>
        </table>
        <p className="sb-note fd-note">
          Zaokrąglenia: 0 wszędzie poza dymkami. Cienie zawsze twarde, bez rozmycia.
        </p>
        <ul className="fd-rules">
          <li>
            Skośny obrys małego elementu (zakładka, chip, logo): biała warstwa + wnętrze w kolorze
            tła (.n-outline). Nigdy border + clip-path, bo przycięcie ucina ramkę na rogach.
          </li>
          <li>Duże kafle: ramka SVG (Frame) o zmiennej grubości.</li>
        </ul>
      </Block>

      <Block id="fd-status" title="Statusy">
        <h4 className="fd-sub">Ogłoszenie</h4>
        <div className="sb-row" style={{ gap: 14 }}>
          {(Object.keys(publicationStatusLabels) as PubStatus[]).map((s) => (
            <PublicationBadge key={s} status={s} />
          ))}
        </div>
        <h4 className="fd-sub">Etap rekrutacji</h4>
        <div className="sb-row" style={{ gap: "12px 26px" }}>
          {(Object.keys(stageLabels) as Stage[]).map((s) => (
            <StageBadge key={s} stage={s} />
          ))}
        </div>
      </Block>

      <Block id="fd-z" title="Warstwy">
        <table className="role-table">
          <tbody>
            {[
              ["0", "tło strony, raster"],
              ["1", "treść, kafle (kolejność w stosie stała)"],
              ["20", "przyklejony pasek nawigacji"],
              ["30", "menu rozwijane, podpowiedzi"],
              ["40", "okno dialogowe i tło pod nim"],
              ["50", "toast"],
              ["100", "efekty kursora (iskry)"],
            ].map(([z, use]) => (
              <tr key={z}>
                <td className="sb-mono" style={{ width: 80 }}>
                  {z}
                </td>
                <td>{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Block>

      <Block id="fd-a11y" title="Dostępność">
        <table className="role-table">
          <thead>
            <tr>
              <th scope="col">Para</th>
              <th scope="col">Próbka</th>
              <th scope="col">Kontrast</th>
              <th scope="col">Dozwolone dla</th>
            </tr>
          </thead>
          <tbody>
            {contrast.map(([name, fg, bg, ratio, use]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>
                  <span className="fd-swatch" style={{ color: fg, background: bg }}>
                    Aa 123
                  </span>
                </td>
                <td className="sb-mono">{ratio}:1</td>
                <td>{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="sb-note fd-note">
          Fokus: przerywana biała rama 3 px, odsunięta o 4–7 px. Cel dotyku min. 44×44 px. Każda
          animacja ma wersję przy prefers-reduced-motion (bez przesunięć, bez iskier, raster
          statyczny).
        </p>
      </Block>

      <Block id="fd-map" title="Tokeny aplikacji">
        <table className="role-table">
          <thead>
            <tr>
              <th scope="col">Token w aplikacji</th>
              <th scope="col">Token noir</th>
              <th scope="col">Wartość / uwaga</th>
            </tr>
          </thead>
          <tbody>
            {mapping.map(([app, noir, val]) => (
              <tr key={app}>
                <td className="sb-mono">{app}</td>
                <td className="sb-mono">{noir}</td>
                <td>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Block>
    </>
  );
}
