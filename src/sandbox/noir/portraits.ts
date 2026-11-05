/* Portrety postaci: PNG z przezroczystym tłem w img/portraits/, nazwa: {kategoria}-{nr}-{f|m}.webp */
const files = import.meta.glob("./img/portraits/*.webp", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export type PortraitInfo = {
  id: string;
  src: string;
  category: "build" | "apply" | "lead";
  gender: "f" | "m";
  n: number;
};

export const portraits: PortraitInfo[] = Object.entries(files)
  .map(([path, src]) => {
    const m = path.match(/\/(build|apply|lead)-(\d+)-(f|m)\.webp$/);
    if (!m) return null;
    return {
      id: `${m[1]}-${m[2]}-${m[3]}`,
      src,
      category: m[1] as PortraitInfo["category"],
      n: Number(m[2]),
      gender: m[3] as "f" | "m",
    };
  })
  .filter((x): x is PortraitInfo => x !== null)
  .sort(
    (a, b) => a.category.localeCompare(b.category) || a.n - b.n || a.gender.localeCompare(b.gender),
  );

/** Przypisanie portretów do osób z people.json (propozycja do zmiany) */
const byPerson: Record<string, string> = {
  "candidate-anna": "lead-1-f",
  "candidate-marek": "lead-2-m",
  "employer-brightlabs": "apply-2-f",
  "employer-northstar": "lead-3-m",
};

export const portraitById = (id: string) => portraits.find((p) => p.id === id)?.src;
export const portraitFor = (personId: string) => portraitById(byPerson[personId] ?? "");

/** Skala per plik: postacie są narysowane w różnej wielkości, więc część trzeba zmniejszyć,
 *  żeby głowy w kartach miały podobny rozmiar. 1 = bez zmian. */
const fitById: Record<string, number> = {
  "build-2-f": 0.82,
  "build-2-m": 0.82,
  "apply-1-f": 0.82,
  "apply-2-f": 0.84,
  "lead-1-f": 0.84,
};
export const portraitFit = (src?: string) => {
  const p = src ? portraits.find((x) => x.src === src) : undefined;
  return p ? (fitById[p.id] ?? 1) : 1;
};
