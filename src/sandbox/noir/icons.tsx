/* ------------------------------------------------------------------
   Ikony komiksowe: białe, wypełnione, czarne detale, szary twardy cień.
   Kształty lekko krzywe, jak rysowane ręką. viewBox 24×24.
   ------------------------------------------------------------------ */
import type { ReactNode } from "react";

function Icon({
  children,
  className = "",
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <svg
      className={`cicon ${className}`}
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      {/* cień: ten sam kształt przesunięty, szary */}
      <g className="cicon__shadow" transform="translate(1.6 1.6)">
        {children}
      </g>
      <g className="cicon__body">{children}</g>
    </svg>
  );
}

/** Pinezka lokalizacji */
export function IconPin() {
  return (
    <Icon>
      <path d="M12.3 2.2c-4.3-.2-7.6 3-7.4 7.1.2 3.6 3.6 7.4 6.9 12.3 3.4-4.9 6.9-8.6 7-12.4.1-4-2.6-6.8-6.5-7z" />
      <circle className="cicon__ink" cx="12" cy="9.2" r="2.6" />
    </Icon>
  );
}

/** Tryb pracy: stacjonarnie = biurowiec, hybrydowo = dom + biurowiec, zdalnie = dom z laptopem */
export function IconWorkMode({ mode }: { mode: "onsite" | "hybrid" | "remote" }) {
  if (mode === "onsite")
    return (
      <Icon>
        <path d="M5.2 21.6 5.6 4.1l9.6-1.5.2 19z" />
        <path d="M15.4 9.2l3.8.5-.3 11.8-3.5.1z" />
        <path
          className="cicon__ink-line"
          d="M8.2 7.4h1.6M11.6 7.1h1.4M8.2 11h1.6M11.6 10.8h1.4M8.2 14.6h1.6M11.6 14.4h1.4"
        />
      </Icon>
    );
  if (mode === "remote")
    return (
      <Icon>
        <path d="M2.6 11.4 12.2 3.2l9.3 8.4-2.4.1.2 9.8-13.8.3.1-10.1z" />
        <path className="cicon__ink" d="M8.6 18.6l.2-4.6 6.6-.2-.1 4.7z" />
        <path className="cicon__ink-line" d="M7.4 19.4h9.6" />
      </Icon>
    );
  return (
    <Icon>
      <path d="M1.8 13.2 7.6 7.6l5.6 5.4-1.6.1.1 8.2-8.4.2-.1-8.3z" />
      <path d="M13.8 21.6l.3-17.4 7.6-1.1.2 18.4z" />
      <path
        className="cicon__ink-line"
        d="M16.4 7.4h2.6M16.4 11h2.6M16.4 14.6h2.6M6.2 21.2v-4h2.8v4"
      />
    </Icon>
  );
}

/** Poziom: trzy schodki, wypełnione do poziomu */
export function IconLevel({ level }: { level: "junior" | "mid" | "senior" | "lead" }) {
  const n = { junior: 1, mid: 2, senior: 3, lead: 3 }[level];
  // Lead: czerwone słupki, żeby nie zlewał się z Seniorem
  const on = level === "lead" ? "cicon__red" : "";
  return (
    <Icon>
      <path d="M3.2 21.4l.2-5.6 4.4-.2-.1 5.8z" className={n >= 1 ? on : "cicon__off"} />
      <path d="M9.6 21.5l.1-9.6 4.6-.3-.2 9.9z" className={n >= 2 ? on : "cicon__off"} />
      <path d="M16.1 21.6l.2-14.4 4.6-.4-.1 14.7z" className={n >= 3 ? on : "cicon__off"} />
      {level === "lead" ? (
        <path d="M18.6 2.2l.8 1.7 1.8.2-1.3 1.2.3 1.8-1.6-.9-1.6.9.3-1.8-1.3-1.2 1.8-.2z" />
      ) : null}
    </Icon>
  );
}

/** Zakładka „zapisz”; zapisana = wypełniona + iskry */
export function IconBookmark({ on }: { on?: boolean }) {
  return (
    <Icon className={on ? "cicon--on" : ""}>
      <path d="M6.2 2.6l11.9-.3-.4 19.4-5.8-4.6-5.6 4.8z" className={on ? "" : "cicon__hollow"} />
      {on ? <path className="cicon__spark" d="M20.4 3.4l2.2-1.6M21 7.4h2.4M3.4 3.6 1.4 2" /> : null}
    </Icon>
  );
}

/** Strzałka w przycisku „Zobacz rolę” */
export function IconArrow() {
  return (
    <svg className="cicon-arrow" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M5.4 18.8 16.6 7.2M8.6 6.4l9.2-.6-.4 9.4" />
    </svg>
  );
}

/** Dokument (CV) z zagiętym rogiem */
export function IconDoc() {
  return (
    <Icon>
      <path d="M5.4 2.4l9.2-.2 4.6 4.8-.3 15-13.6.3z" />
      <path className="cicon__ink" d="M14.4 2.4l.2 4.9 4.6-.1z" />
      <path className="cicon__ink-line" d="M8.2 11.2h7.4M8.2 14.4h7.6M8.2 17.6h5" />
    </Icon>
  );
}

/** Strzałka listy rozwijanej: gruba, ręcznie rysowana */
export function IconChevron() {
  return (
    <svg className="cicon-chevron" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4.6 8.6l7.6 7.6 7.4-8" />
    </svg>
  );
}

/* ---- Ikony liniowe (grube, ręczne) do nawigacji i filtrów: kolor = currentColor ---- */
function Line({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg
      className={`cline ${className}`}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
export const IconSearch = () => (
  <Line d="M10.6 3.2c-4.2-.1-7.3 3-7.2 7.1.1 4 3.2 6.9 7.2 6.8 4-.1 6.9-3.1 6.9-7.1-.1-3.9-3-6.7-6.9-6.8zM15.6 15.4l5.4 5.6" />
);
export const IconClose = () => <Line d="M5.2 4.8l14 14.6M19.4 5 4.8 19.2" />;
export const IconBurger = () => <Line d="M3.4 6.2l17.4-.6M3.2 12.2l17.6.2M3.6 18.4l13.2-.4" />;
export const IconBack = () => <Line d="M19.6 12.4 5 11.8M10.8 5.4 4.6 11.8l6.6 6.6" />;
export const IconFilter = () => <Line d="M3.2 4.4l17.8-.2-6.8 8.2.2 7.6-4.2 1.4-.2-9z" />;
export const IconList = () => (
  <Line d="M8.4 6h12.4M8.6 12.2h12M8.4 18.2h12.2M3.4 5.8h1.4M3.4 12h1.4M3.6 18.2h1.2" />
);
export const IconMap = () => (
  <Line d="M2.8 5.6l6-2.4 6.4 2.6 6-2.2.2 15.2-6.2 2.4-6.4-2.6-6 2.2zM8.8 3.2l.2 15.4M15.2 5.8l.2 15.4" />
);

/* ---- Kafelki decyzji: wypełnione, pędzlowe kształty ptaszka i krzyżyka (kolor = currentColor) ---- */
export function IconTick() {
  return (
    <svg className="cdecide" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
      <path d="M2.6 17.4l5.2-4.8 6 6.2L27 3.4l3.4 3.8L14.6 28.2z" />
    </svg>
  );
}
export function IconCross() {
  return (
    <svg className="cdecide" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
      <path d="M4.2 7.6 8 3.2l8.4 8.8 8-9 4.4 4.2-8.2 8.6 8.8 9.4-4.4 4.4-8.6-9.2-8.8 9.6-4.4-4.2 9-9.4z" />
    </svg>
  );
}
