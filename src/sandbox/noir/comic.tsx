import { portraitFit } from "./portraits";
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";

/* ------------------------------------------------------------------
   Rozmiar elementu (ResizeObserver)
   ------------------------------------------------------------------ */
export function useSize<T extends HTMLElement>(ref: RefObject<T | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

/* Deterministyczny „los”, żeby każda ramka była inna, ale stała między renderami */
function rng(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/* ------------------------------------------------------------------
   Geometria ramki: skośny czworokąt + pierścień o zmiennej grubości.
   Każdy bok ma inną grubość na początku i na końcu (zwęża się jak pociągnięcie pędzlem).
   ------------------------------------------------------------------ */
type Pt = [number, number];

export function quadPoints(w: number, h: number, seed: number, skew: number): Pt[] {
  const r = rng(seed);
  const o = (min = 0.25) => skew * (min + r() * (1 - min));
  // rogi TL, TR, BR, BL: wyraźnie różne, żeby boki nie były równoległe
  return [
    [o(), o(0)],
    [w - o(0), o()],
    [w - o(), h - o(0)],
    [o(0), h - o()],
  ];
}

function intersect(a1: Pt, a2: Pt, b1: Pt, b2: Pt): Pt {
  const d = (a1[0] - a2[0]) * (b1[1] - b2[1]) - (a1[1] - a2[1]) * (b1[0] - b2[0]);
  if (Math.abs(d) < 1e-6) return a2;
  const ta = a1[0] * a2[1] - a1[1] * a2[0];
  const tb = b1[0] * b2[1] - b1[1] * b2[0];
  return [
    (ta * (b1[0] - b2[0]) - (a1[0] - a2[0]) * tb) / d,
    (ta * (b1[1] - b2[1]) - (a1[1] - a2[1]) * tb) / d,
  ];
}

/** Wewnętrzny czworokąt: każdy bok przesunięty do środka o grubość zmienną wzdłuż boku */
export function innerPoints(outer: Pt[], seed: number, [tMin, tMax]: [number, number]): Pt[] {
  const r = rng(seed + 101);
  const n = outer.length;
  const lines: [Pt, Pt][] = outer.map((p, i) => {
    const q = outer[(i + 1) % n];
    const dx = q[0] - p[0],
      dy = q[1] - p[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len,
      ny = dx / len; // normalna do środka (układ ekranu, rogi zgodnie z ruchem wskazówek)
    const ta = tMin + r() * (tMax - tMin);
    const tb = tMin + r() * (tMax - tMin);
    return [
      [p[0] + nx * ta, p[1] + ny * ta],
      [q[0] + nx * tb, q[1] + ny * tb],
    ];
  });
  return lines.map((line, i) => {
    const prev = lines[(i - 1 + n) % n];
    return intersect(prev[0], prev[1], line[0], line[1]);
  });
}

const toPath = (pts: Pt[]) =>
  "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L") + " Z";
export const toClip = (pts: Pt[]) =>
  `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(", ")})`;

/** SVG z wypełnieniem i ramą-pierścieniem; używane przez Frame i Portrait */
export function QuadArt({
  w,
  h,
  outer,
  inner,
  fill,
  extra,
  className = "",
}: {
  w: number;
  h: number;
  outer: Pt[];
  inner: Pt[];
  /** obszar wypełnienia; domyślnie cały czworokąt */
  fill?: Pt[];
  extra?: string;
  className?: string;
}) {
  return (
    <svg
      className={`quad ${className}`}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
    >
      <path className="quad__fill" d={toPath(fill ?? outer)} />
      <path
        className="quad__ring"
        d={toPath(outer) + " " + toPath([...inner].reverse())}
        fillRule="evenodd"
      />
      {extra ? <path className="quad__ring" d={extra} /> : null}
    </svg>
  );
}

/** Linia podziału od ramy do ramy: pionowa (x) albo pozioma (y), lekko skośna, grubsza na jednym końcu */
function dividerPath(inner: Pt[], d: { kind: "v"; x: number } | { kind: "h"; y: number }, m = 0) {
  const onX = (a: Pt, b: Pt, x: number): Pt => [
    x,
    a[1] + ((x - a[0]) / (b[0] - a[0] || 1)) * (b[1] - a[1]),
  ];
  const onY = (a: Pt, b: Pt, y: number): Pt => [
    a[0] + ((y - a[1]) / (b[1] - a[1] || 1)) * (b[0] - a[0]),
    y,
  ];
  if (d.kind === "v") {
    const top = onX(inner[0], inner[1], d.x + 4 + 8 * m); // na hover linia przechyla się razem z narożnikami
    const bot = onX(inner[3], inner[2], d.x - 4 - 8 * m);
    const pts: Pt[] = [
      [top[0] - 2.2, top[1] - 3],
      [top[0] + 2.2, top[1] - 3],
      [bot[0] + 4.5, bot[1] + 3],
      [bot[0] - 4.5, bot[1] + 3],
    ];
    return toPath(pts);
  }
  const left = onY(inner[3], inner[0], d.y + 3);
  const right = onY(inner[1], inner[2], d.y - 3);
  return toPath([
    [left[0] - 3, left[1] - 4.5],
    [right[0] + 3, right[1] - 2.2],
    [right[0] + 3, right[1] + 2.2],
    [left[0] - 3, left[1] + 4.5],
  ]);
}

/* ------------------------------------------------------------------
   Ramka komiksu. Treść nie jest przycinana (etykiety wychodzą na ramę).
   hoverMorph: na hover narożniki przesuwają się tylko w poziomie (kadr „oddycha”),
   bez skalowania, żeby karta nie udawała przycisku.
   dots: delikatny raster w środku, który pod kursorem jaśnieje i rośnie.
   ------------------------------------------------------------------ */
type FrameProps = {
  seed?: number;
  /** maks. przesunięcie rogu w px */
  skew?: number;
  /** grubość ramy: [min, max] w px */
  thickness?: [number, number];
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  as?: "article" | "div" | "section" | "form";
  hoverMorph?: boolean;
  dots?: boolean;
} & Record<string, unknown>;

const reducedMotion = () =>
  document.documentElement.classList.contains("reduce-motion") ||
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Frame({
  seed = 1,
  skew = 14,
  thickness = [5, 11],
  className = "",
  style,
  children,
  as = "div",
  hoverMorph,
  dots,
  ...rest
}: FrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { w, h } = useSize(ref);
  const [m, setM] = useState(0); // 0 = spoczynek, 1 = hover
  const anim = useRef({ target: 0, value: 0, raf: 0 });
  const dot = useRef({ on: 0, onTarget: 0, x: -999, y: -999, tx: -999, ty: -999, raf: 0 });

  const base = quadPoints(w, h, seed, skew);
  const r = rng(seed + 7);
  const shift = [-1, 1, -1, 1].map((sign) => sign * (5 + r() * 6));
  const outer: Pt[] = base.map(([x, y], i) => [x + shift[i] * m, y]);
  const inner = innerPoints(outer, seed, thickness);
  const innerClip = toClip(inner);
  // wypełnienie kończy się pod ramą, nie na jej zewnętrznej krawędzi:
  // inaczej wygładzona krawędź łapie ciemny kolor i między kaflami widać czarną szczelinę
  const fillPts = innerPoints(outer, seed, [
    Math.max(0, thickness[0] - 2),
    Math.max(0, thickness[1] - 2),
  ]);

  // linia podziału: element z data-frame-divider wyznacza jej położenie
  const [div, setDiv] = useState<{ kind: "v"; x: number } | { kind: "h"; y: number } | null>(null);
  useLayoutEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>("[data-frame-divider]");
    if (!el || !ref.current) {
      setDiv(null);
      return;
    }
    const f = ref.current.getBoundingClientRect(),
      b = el.getBoundingClientRect();
    // kolumna na całą szerokość = układ mobilny = linia pozioma nad nią
    // kolumna na całą szerokość (mobile/tablet) = bez linii, bo zaburza czytanie
    setDiv(b.width > f.width * 0.7 ? null : { kind: "v", x: b.left - f.left });
  }, [w, h]);

  // płynny ruch narożników
  const morphTo = (target: number) => {
    if (!hoverMorph) return;
    const a = anim.current;
    a.target = target;
    if (reducedMotion()) {
      a.value = target;
      setM(target);
      return;
    }
    cancelAnimationFrame(a.raf);
    const step = () => {
      const k = a.target > a.value ? 0.22 : 0.12; // szybciej na wejściu, miękko na wyjściu
      a.value += (a.target - a.value) * k;
      if (Math.abs(a.target - a.value) < 0.004) a.value = a.target;
      setM(a.value);
      if (a.value !== a.target) a.raf = requestAnimationFrame(step);
    };
    a.raf = requestAnimationFrame(step);
  };

  // raster
  const drawDots = () => {
    const c = canvasRef.current;
    if (!c || !w) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (c.width !== Math.round(w * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const d = dot.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const gap = 10,
      R = 150;
    for (let y = gap / 2; y < h; y += gap) {
      for (let x = gap / 2 + ((y / gap) % 2) * (gap / 2); x < w; x += gap) {
        const dist = Math.hypot(x - d.x, y - d.y);
        const f = d.on * Math.pow(Math.max(0, 1 - dist / R), 2);
        const rad = 0.65 + 1.9 * f;
        ctx.fillStyle = `rgba(242,239,232,${(0.055 + 0.3 * f).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };
  const runDots = () => {
    const d = dot.current;
    cancelAnimationFrame(d.raf);
    const step = () => {
      d.x += (d.tx - d.x) * 0.2;
      d.y += (d.ty - d.y) * 0.2;
      d.on += (d.onTarget - d.on) * 0.1;
      drawDots();
      const moving =
        Math.abs(d.tx - d.x) > 0.3 ||
        Math.abs(d.ty - d.y) > 0.3 ||
        Math.abs(d.onTarget - d.on) > 0.004;
      if (moving) d.raf = requestAnimationFrame(step);
    };
    d.raf = requestAnimationFrame(step);
  };

  useLayoutEffect(() => {
    if (dots) drawDots();
  });
  useLayoutEffect(
    () => () => {
      cancelAnimationFrame(anim.current.raf);
      cancelAnimationFrame(dot.current.raf);
    },
    [],
  );

  const handlers = {
    onPointerEnter: (e: ReactPointerEvent) => {
      morphTo(1);
      if (dots && !reducedMotion()) {
        const b = ref.current!.getBoundingClientRect();
        const d = dot.current;
        d.x = d.tx = e.clientX - b.left;
        d.y = d.ty = e.clientY - b.top;
        d.onTarget = 1;
        runDots();
      }
    },
    onPointerMove: (e: ReactPointerEvent) => {
      if (!dots || reducedMotion()) return;
      const b = ref.current!.getBoundingClientRect();
      dot.current.tx = e.clientX - b.left;
      dot.current.ty = e.clientY - b.top;
      runDots();
    },
    onPointerLeave: () => {
      morphTo(0);
      if (dots) {
        dot.current.onTarget = 0;
        runDots();
      }
    },
    onFocus: () => morphTo(1),
    onBlur: (e: ReactFocusEvent) => {
      if (!ref.current?.contains(e.relatedTarget as Node)) morphTo(0);
    },
  };

  const Tag = as as "div";
  return (
    <Tag
      ref={ref}
      className={`kf${hoverMorph ? " kf--morph" : ""} ${className}`}
      style={style}
      {...(hoverMorph || dots ? handlers : {})}
      {...rest}
    >
      {w > 0 ? (
        <QuadArt
          w={w}
          h={h}
          outer={outer}
          inner={inner}
          fill={fillPts}
          extra={div ? dividerPath(inner, div, m) : undefined}
          className="kf__svg"
        />
      ) : null}
      {dots ? (
        <canvas
          ref={canvasRef}
          className="kf__dots"
          style={{ clipPath: innerClip, width: w, height: h }}
          aria-hidden="true"
        />
      ) : null}
      <div className="kf__content">{children}</div>
    </Tag>
  );
}

/* ------------------------------------------------------------------
   Dymek: kształt w SVG (falujący albo „wybuchowy”) + ogonek liczony
   do konkretnego punktu, np. ust doradcy.
   ------------------------------------------------------------------ */
type BubbleProps = {
  children: ReactNode;
  /** element, w który celuje ogonek */
  target?: RefObject<HTMLElement | null>;
  /** punkt w celu jako ułamek szerokości i wysokości (doradca: usta ok. 0.41 / 0.19) */
  aim?: [number, number];
  variant?: "round" | "burst";
  className?: string;
  style?: CSSProperties;
  /** zmiana tej wartości wymusza przeliczenie (np. po animacji) */
  recalc?: unknown;
  /** odstęp czubka ogonka od celu w px */
  gap?: number;
  /** szerokość nasady ogonka w px */
  tailWidth?: number;
};

function wobblyPath(w: number, h: number, seed: number) {
  const r = rng(seed);
  const n = 28;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    // superelipsa: zaokrąglony prostokąt
    const c = Math.cos(a),
      s = Math.sin(a);
    const ex = Math.sign(c) * Math.pow(Math.abs(c), 0.55);
    const ey = Math.sign(s) * Math.pow(Math.abs(s), 0.55);
    const j = (r() - 0.5) * 3;
    pts.push([w / 2 + ex * (w / 2 + j), h / 2 + ey * (h / 2 + j)]);
  }
  return smooth(pts);
}

function burstPath(w: number, h: number, seed: number) {
  const r = rng(seed);
  const n = 22;
  const pts: [number, number][] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const out = i % 2 === 0;
    const k = out ? 1.14 + r() * 0.12 : 0.98 + r() * 0.04;
    pts.push([w / 2 + Math.cos(a) * (w / 2) * k, h / 2 + Math.sin(a) * (h / 2) * k]);
  }
  return "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L") + " Z";
}

function smooth(pts: [number, number][]) {
  const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const n = pts.length;
  let d = "";
  for (let i = 0; i < n; i++) {
    const p = pts[i],
      q = pts[(i + 1) % n];
    const m = mid(p, q);
    if (i === 0) {
      const m0 = mid(pts[n - 1], p);
      d += `M${m0[0].toFixed(1)} ${m0[1].toFixed(1)}`;
    }
    d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return d + " Z";
}

export function SpeechBubble({
  children,
  target,
  aim = [0.41, 0.19],
  variant = "round",
  className = "",
  style,
  recalc,
  gap = 8,
  tailWidth = 22,
}: BubbleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { w, h } = useSize(ref);
  const [tail, setTail] = useState<string | null>(null);

  useLayoutEffect(() => {
    const el = ref.current,
      t = target?.current;
    if (!el || !t || !w) {
      setTail(null);
      return;
    }
    const compute = () => {
      const b = el.getBoundingClientRect(),
        tr = t.getBoundingClientRect();
      // cel w układzie dymka
      const tx = tr.left + tr.width * aim[0] - b.left;
      const ty = tr.top + tr.height * aim[1] - b.top;
      const cx = b.width / 2,
        cy = b.height / 2;
      const ang = Math.atan2(ty - cy, tx - cx);
      // podstawa ogonka: na brzegu elipsy, dwa punkty rozsunięte o ~0.22 rad
      const rx = b.width / 2 - 6,
        ry = b.height / 2 - 6;
      const base = (a: number) => [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
      const spread = Math.min(0.32, tailWidth / Math.max(rx, ry));
      const [x1, y1] = base(ang - spread);
      const [x2, y2] = base(ang + spread);
      // czubek: 8 px przed celem
      const dist = Math.hypot(tx - cx, ty - cy);
      const k = Math.max(0, (dist - gap) / dist);
      const px = cx + (tx - cx) * k,
        py = cy + (ty - cy) * k;
      // lekko wygięty ogonek
      const bend = 0.18;
      const qx = (x2 + px) / 2 + (y2 - py) * bend,
        qy = (y2 + py) / 2 - (x2 - px) * bend;
      setTail(
        `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${((x1 + px) / 2).toFixed(1)} ${((y1 + py) / 2).toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)} Q${qx.toFixed(1)} ${qy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} Z`,
      );
    };
    compute();
    window.addEventListener("resize", compute);
    const id = window.setTimeout(compute, 60);
    return () => {
      window.removeEventListener("resize", compute);
      window.clearTimeout(id);
    };
  }, [target, aim, w, h, recalc, gap, tailWidth]);

  const body = w ? (variant === "burst" ? burstPath(w, h, 3) : wobblyPath(w, h, 5)) : "";
  return (
    <div ref={ref} className={`sbub sbub--${variant} ${className}`} style={style}>
      {w ? (
        <svg
          className="sbub__svg"
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          aria-hidden="true"
        >
          {tail ? <path className="sbub__tail" d={tail} /> : null}
          <path className="sbub__body" d={body} />
          {tail ? <path className="sbub__tail-cover" d={tail} /> : null}
        </svg>
      ) : null}
      <span className="sbub__text">{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------
   Match Score: połamany prostokąt wychodzący na ramę karty
   ------------------------------------------------------------------ */
export function ScoreTag({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={`score-tag score-tag--${size}`} aria-label={`Match Score ${score} na 100`}>
      <span className="score-tag__num">{score}</span>
      <span className="score-tag__label">Match</span>
    </span>
  );
}

/* ------------------------------------------------------------------
   Portret: skośny kadr z ramą o zmiennej grubości, raster w tle.
   Docelowo ilustracja postaci; do tego czasu sylwetka.
   ------------------------------------------------------------------ */
export function Portrait({
  src,
  gender = "f",
  seed = 7,
  size = 92,
}: {
  src?: string;
  gender?: "f" | "m";
  seed?: number;
  size?: number;
}) {
  const w = size,
    h = Math.round(size * 1.25);
  const skew = Math.max(3, size * 0.09);
  const outer = quadPoints(w, h, seed, skew);
  const inner = innerPoints(outer, seed, size > 60 ? [2, 4.5] : [1.2, 2.4]);
  return (
    <span
      className="portrait"
      style={{
        width: w,
        height: h,
        ["--dot" as string]: `${Math.max(4, Math.min(10, size / 10)).toFixed(1)}px`,
      }}
      aria-hidden="true"
    >
      <span className="portrait__in" style={{ clipPath: toClip(inner) }}>
        {src ? (
          <img src={src} alt="" style={{ ["--fit" as string]: portraitFit(src) }} />
        ) : (
          <svg viewBox="0 0 80 100" className="portrait__ph">
            {gender === "f" ? (
              <path d="M40 18c-11 0-18 8-18 19 0 6 2 11 1 17-1 5-4 8-6 10 6 2 12 1 15-2 3 2 5 3 8 3s5-1 8-3c3 3 9 4 15 2-2-2-5-5-6-10-1-6 1-11 1-17 0-11-7-19-18-19zM14 100c1-15 10-24 26-24s25 9 26 24z" />
            ) : (
              <path d="M40 20c-10 0-16 7-16 17 0 7 3 13 6 16-1 3-1 5 0 7 3 2 6 3 10 3s7-1 10-3c1-2 1-4 0-7 3-3 6-9 6-16 0-10-6-17-16-17zM12 100c1-16 11-26 28-26s27 10 28 26z" />
            )}
          </svg>
        )}
      </span>
      <QuadArt w={w} h={h} outer={outer} inner={inner} className="portrait__frame" />
    </span>
  );
}

/* ------------------------------------------------------------------
   Raster na całej stronie: słabe kropki zawsze widoczne; przy kursorze
   jaśnieją i rosną, mocniej przy ruchu, potem powoli gasną.
   Kropki tła rysowane raz, przy kursorze dorysowywany jest tylko wycinek.
   ------------------------------------------------------------------ */
export function PageDots({ gap = 10, radius = 170 }: { gap?: number; radius?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const base = document.createElement("canvas");
    const bctx = base.getContext("2d")!;
    let w = 0,
      h = 0,
      dpr = 1,
      raf = 0;
    const s = { x: -999, y: -999, tx: -999, ty: -999, on: 0, energy: 0 };

    const dotAlpha = 0.055;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      for (const cv of [c, base]) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      c.style.width = w + "px";
      c.style.height = h + "px";
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.clearRect(0, 0, w, h);
      bctx.fillStyle = `rgba(242,239,232,${dotAlpha})`;
      for (let y = gap / 2, row = 0; y < h; y += gap, row++) {
        for (let x = gap / 2 + (row % 2) * (gap / 2); x < w; x += gap) {
          bctx.beginPath();
          bctx.arc(x, y, 0.65, 0, Math.PI * 2);
          bctx.fill();
        }
      }
      draw();
    };

    const draw = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      // A zero-size window (hidden tab or pane) would make drawImage throw.
      if (!base.width || !base.height) return;
      ctx.drawImage(base, 0, 0);
      const k = s.on * (0.45 + 0.55 * s.energy);
      if (k < 0.01) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const R = radius;
      const y0 = Math.max(gap / 2, Math.floor((s.y - R) / gap) * gap + gap / 2);
      for (let y = y0; y < Math.min(h, s.y + R); y += gap) {
        const row = Math.round((y - gap / 2) / gap);
        const off = (row % 2) * (gap / 2) + gap / 2;
        const x0 = Math.max(off, Math.floor((s.x - R - off) / gap) * gap + off);
        for (let x = x0; x < Math.min(w, s.x + R); x += gap) {
          const f = k * Math.pow(Math.max(0, 1 - Math.hypot(x - s.x, y - s.y) / R), 2);
          if (f < 0.01) continue;
          ctx.fillStyle = `rgba(242,239,232,${(0.3 * f).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, 0.65 + 2 * f, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const reduced = () =>
      document.documentElement.classList.contains("reduce-motion") ||
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    const loop = () => {
      const dx = s.tx - s.x,
        dy = s.ty - s.y;
      s.x += dx * 0.18;
      s.y += dy * 0.18;
      s.energy *= 0.965; // po zatrzymaniu kursora efekt powoli słabnie do stanu spoczynku
      draw();
      if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3 || s.energy > 0.01)
        raf = requestAnimationFrame(loop);
      else raf = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      if (reduced()) return;
      if (s.on === 0) {
        s.x = e.clientX;
        s.y = e.clientY;
      }
      const v = Math.hypot(e.clientX - s.tx, e.clientY - s.ty);
      s.tx = e.clientX;
      s.ty = e.clientY;
      s.on = 1;
      s.energy = Math.min(1, s.energy + v / 120);
      kick();
    };
    const leave = () => {
      s.on = 0;
      draw();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [gap, radius]);
  return <canvas ref={ref} className="page-dots" aria-hidden="true" />;
}

/* ------------------------------------------------------------------
   Kursor komiksowy: sam grot (nieregularny trójkąt z wcięciem), biały,
   czarny obrys, czerwony cień. Nad elementami klikalnymi iskry przy grocie.
   Klik = iskry rozsypują się na boki.
   ------------------------------------------------------------------ */
const ARROWHEAD = "M9 7 L8.2 29.5 L15.2 23.4 L28 23 Z";
const SPARKS = "M6.2 5.2 L2.4 2.6 M9.8 3.6 L10.6 0.6 M13.4 5 L16.6 2.6 M5 9 L1.2 9.6";
/** Sam obrazek kursora (data URI), też do podglądu w dokumentacji */
export const cursorUri = (pointer: boolean) =>
  `data:image/svg+xml,` +
  `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>` +
  `<path d='${ARROWHEAD}' transform='translate(2.4 2.4)' fill='%23d3202a'/>` +
  `<path d='${ARROWHEAD}' fill='%23f2efe8' stroke='%230a0a0a' stroke-width='2.2' stroke-linejoin='round'/>` +
  (pointer
    ? `<path d='${SPARKS}' stroke='%230a0a0a' stroke-width='3.6' stroke-linecap='round'/>` +
      `<path d='${SPARKS}' stroke='%23f2efe8' stroke-width='1.6' stroke-linecap='round'/>`
    : "") +
  `</svg>`;
const cursorSvg = (pointer: boolean) => `url("${cursorUri(pointer)}") 9 7`;

type Spark = { a: number; d: number; len: number; delay: number };
export function ComicCursor() {
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number; sparks: Spark[] }[]>([]);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--cursor-default", `${cursorSvg(false)}, auto`);
    root.style.setProperty("--cursor-pointer", `${cursorSvg(true)}, pointer`);
    root.classList.add("comic-cursor");
    let id = 0;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if (
        root.classList.contains("reduce-motion") ||
        matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;
      const n = 8;
      const base = Math.random() * 40;
      const sparks = Array.from({ length: n }, (_, i) => ({
        a: base + (i / n) * 360 + (Math.random() * 24 - 12),
        d: 22 + Math.random() * 16,
        len: 7 + Math.random() * 6,
        delay: Math.random() * 40,
      }));
      const b = { id: ++id, x: e.clientX, y: e.clientY, sparks };
      setBursts((list) => [...list.slice(-4), b]);
      window.setTimeout(() => setBursts((list) => list.filter((x) => x.id !== b.id)), 650);
    };
    window.addEventListener("pointerdown", down);
    return () => {
      window.removeEventListener("pointerdown", down);
      root.classList.remove("comic-cursor");
    };
  }, []);
  return (
    <div className="click-bursts" aria-hidden="true">
      {bursts.map((b) => (
        <span key={b.id} className="click-burst" style={{ left: b.x, top: b.y }}>
          {b.sparks.map((s, i) => (
            <i
              key={i}
              style={
                {
                  "--a": `${s.a}deg`,
                  "--d": `${s.d}px`,
                  "--len": `${s.len}px`,
                  animationDelay: `${s.delay}ms`,
                } as CSSProperties
              }
            />
          ))}
        </span>
      ))}
    </div>
  );
}
