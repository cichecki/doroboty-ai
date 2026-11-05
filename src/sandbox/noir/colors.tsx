/* ------------------------------------------------------------------
   Kolory: główne, wspierające, skale odcieni
   ------------------------------------------------------------------ */
type Swatch = { token: string; hex: string; role?: string };

const main: Swatch[] = [
  { token: "--ink", hex: "#0a0a0a", role: "tło strony" },
  { token: "--white", hex: "#f2efe8", role: "tekst, ramy, primary" },
  { token: "--red", hex: "#d3202a", role: "talent AI, master" },
];

const support: Swatch[] = [
  { token: "--panel", hex: "#151515", role: "wnętrze kafli" },
  { token: "--panel-2", hex: "#1f1f1f", role: "pola formularzy, hover wiersza" },
  { token: "--line", hex: "#3a3835", role: "linie, obrys pola, chip" },
  { token: "--muted", hex: "#a8a49b", role: "tekst drugorzędny" },
  { token: "--tag-grey", hex: "#b9b5ac", role: "etykiety" },
  { token: "--red-dark", hex: "#a3141c", role: "master wciśnięty" },
];

const greys: Swatch[] = [
  { token: "--grey-950", hex: "#0a0a0a" },
  { token: "--grey-900", hex: "#151515" },
  { token: "--grey-850", hex: "#1f1f1f" },
  { token: "--grey-800", hex: "#262523" },
  { token: "--grey-750", hex: "#2a2926" },
  { token: "--grey-700", hex: "#3a3835" },
  { token: "--grey-600", hex: "#4a4844" },
  { token: "--grey-500", hex: "#5c5952" },
  { token: "--grey-450", hex: "#77736b" },
  { token: "--grey-400", hex: "#8a867e" },
  { token: "--grey-300", hex: "#a8a49b" },
  { token: "--grey-250", hex: "#b9b5ac" },
  { token: "--grey-200", hex: "#d8d4cb" },
  { token: "--grey-150", hex: "#e6e2d9" },
  { token: "--grey-100", hex: "#f2efe8" },
];

const reds: Swatch[] = [
  { token: "--red-950", hex: "#3a0709" },
  { token: "--red-900", hex: "#5c0c10" },
  { token: "--red-800", hex: "#7f1016" },
  { token: "--red-700", hex: "#a3141c" },
  { token: "--red-600", hex: "#d3202a" },
  { token: "--red-500", hex: "#e2434b" },
  { token: "--red-400", hex: "#ec6e74" },
  { token: "--red-300", hex: "#f39ca0" },
  { token: "--red-200", hex: "#f8c8ca" },
  { token: "--red-100", hex: "#fbe6e6" },
];

function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

function Big({ s }: { s: Swatch }) {
  return (
    <div className="csw-big">
      <span
        className="csw-big__chip"
        style={{ background: s.hex, color: isLight(s.hex) ? "#0a0a0a" : "#f2efe8" }}
      >
        Aa
      </span>
      <b>{s.token}</b>
      <span className="sb-mono">{s.hex}</span>
      {s.role ? <span className="csw__role">{s.role}</span> : null}
    </div>
  );
}

function Scale({ list, label }: { list: Swatch[]; label: string }) {
  return (
    <div className="cscale" role="list" aria-label={label}>
      {list.map((s) => (
        <div key={s.token} className="cscale__item" role="listitem">
          <span
            className="cscale__chip"
            style={{ background: s.hex, color: isLight(s.hex) ? "#0a0a0a" : "#f2efe8" }}
          >
            {s.token.replace(/^--\w+-/, "")}
          </span>
          <span className="sb-mono">{s.hex}</span>
        </div>
      ))}
    </div>
  );
}

export function Colors() {
  return (
    <section className="sb-section" id="kolory" aria-labelledby="kolory-h">
      <p className="sb-kicker">Fundamenty</p>
      <h2 className="sb-h2" id="kolory-h">
        Kolory
      </h2>
      <h3 className="sb-h3">Główne</h3>
      <div className="cgrid cgrid--main">
        {main.map((s) => (
          <Big key={s.token} s={s} />
        ))}
      </div>
      <h3 className="sb-h3">Wspierające</h3>
      <div className="cgrid">
        {support.map((s) => (
          <Big key={s.token} s={s} />
        ))}
      </div>
      <h3 className="sb-h3">Szarości</h3>
      <Scale list={greys} label="Skala szarości" />
      <h3 className="sb-h3">Czerwienie</h3>
      <Scale list={reds} label="Skala czerwieni" />
    </section>
  );
}
