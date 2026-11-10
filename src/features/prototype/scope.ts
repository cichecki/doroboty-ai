export type ScopeCategory = "build" | "apply" | "lead";
export type ScopeAnswer = 1 | 2 | 3 | 4;
export type FormVariant = "A" | "B";

export interface ScopeOption {
  candidate: string;
  recruiter: string;
}

export interface ScopeBar {
  id: "B1" | "B2" | "B3" | "A1" | "A2" | "A3" | "L1" | "L2" | "L3";
  category: ScopeCategory;
  title: string;
  question: string;
  options: [ScopeOption, ScopeOption, ScopeOption, ScopeOption];
  vaguePhrases: string[];
}

export const SCOPE_BARS: readonly ScopeBar[] = [
  {
    id: "B1",
    category: "build",
    title: "Własny komponent (kod, moduł, pipeline)",
    question: "Jaka była Twoja rola w budowie rozwiązania?",
    options: [
      {
        candidate: "Nie budowałem rozwiązania w tym projekcie",
        recruiter: "Nie budował",
      },
      {
        candidate: "Przygotowywałem prompty, demo albo prezentację; kod pisał ktoś inny",
        recruiter: "Pomagał (prompty, demo)",
      },
      {
        candidate: "Napisałem wydzieloną część kodu (np. moduł, integrację); resztę robił zespół",
        recruiter: "Napisał część kodu",
      },
      {
        candidate: "Sam zbudowałem komponent i sprawdziłem, że działa na danych",
        recruiter: "Sam zbudował komponent",
      },
    ],
    vaguePhrases: [
      "budował",
      "tworzył rozwiązanie",
      "odpowiadał za",
      "zaangażowan",
      "uczestniczył",
      "rozwijał",
    ],
  },
  {
    id: "B2",
    category: "build",
    title: "Ewaluacja",
    question: "Jaka była Twoja rola w sprawdzaniu, czy rozwiązanie działa dobrze?",
    options: [
      {
        candidate: "Nie sprawdzałem jakości rozwiązania",
        recruiter: "Nie oceniał jakości",
      },
      {
        candidate:
          "Sprawdzałem gotowe odpowiedzi i opisywałem przypadki; jak mierzyć, ustalał ktoś inny",
        recruiter: "Sprawdzał odpowiedzi",
      },
      {
        candidate: "Przygotowałem część testów albo scenariuszy; metodę ustalał ktoś inny",
        recruiter: "Przygotował część testów",
      },
      {
        candidate: "Sam ustaliłem, jak mierzyć, uruchomiłem ewaluację i znam wynik",
        recruiter: "Sam prowadził ewaluację",
      },
    ],
    vaguePhrases: ["dbał o jakość", "testował", "sprawdzał", "weryfikował", "sprawdzania efektów"],
  },
  {
    id: "B3",
    category: "build",
    title: "Utrzymanie po wdrożeniu",
    question: "Jaka była Twoja rola po uruchomieniu rozwiązania?",
    options: [
      {
        candidate:
          "Rozwiązanie nie trafiło do codziennej pracy albo nie miałem z nim kontaktu po wdrożeniu",
        recruiter: "Bez utrzymania",
      },
      {
        candidate: "Zgłaszałem błędy i zbierałem uwagi; utrzymywał ktoś inny",
        recruiter: "Zgłaszał uwagi",
      },
      {
        candidate:
          "Utrzymywałem część rozwiązania (np. jeden komponent); za całość odpowiadał ktoś inny",
        recruiter: "Utrzymywał część",
      },
      {
        candidate:
          "Sam odpowiadałem za działanie rozwiązania po wdrożeniu i reagowałem na problemy",
        recruiter: "Sam utrzymywał",
      },
    ],
    vaguePhrases: ["utrzymywał", "wspierał", "odpowiadał za działanie", "po wdrożeniu"],
  },
  {
    id: "A1",
    category: "apply",
    title: "Zmiana procesu w zespole",
    question: "Jaka była Twoja rola w zmianie sposobu pracy zespołu?",
    options: [
      {
        candidate: "Brałem udział w warsztatach albo szkoleniu; proces się nie zmienił",
        recruiter: "Warsztaty, bez zmiany",
      },
      {
        candidate:
          "Przygotowywałem opis zastosowań, instrukcje albo demo; zmianę wprowadzał ktoś inny",
        recruiter: "Pomagał (instrukcje, demo)",
      },
      {
        candidate:
          "Zmieniłem jeden krok pracy razem z właścicielem procesu; decyzję o zmianie podjął ktoś inny",
        recruiter: "Zmienił krok z właścicielem",
      },
      {
        candidate:
          "Sam wprowadziłem zmianę w pracy zespołu i doprowadziłem do codziennego używania",
        recruiter: "Sam wprowadził zmianę",
      },
    ],
    vaguePhrases: [
      "wdrażał",
      "w organizacji",
      "w dwóch działach",
      "prowadził projekt",
      "uczestniczył",
      "zmieniał proces",
    ],
  },
  {
    id: "A2",
    category: "apply",
    title: "Pomiar użycia i efektu",
    question: "Jaka była Twoja rola w sprawdzaniu, czy zmiana działa?",
    options: [
      {
        candidate: "Nie sprawdzaliśmy, czy ludzie z tego korzystają",
        recruiter: "Bez pomiaru",
      },
      {
        candidate: "Zbierałem opinie albo dane; co i jak mierzyć, decydował ktoś inny",
        recruiter: "Zbierał dane",
      },
      {
        candidate: "Mierzyłem jeden wskaźnik (np. czas pracy przed i po), który ustalił ktoś inny",
        recruiter: "Mierzył wskaźnik",
      },
      {
        candidate:
          "Sam ustaliłem, co mierzyć, zebrałem wyniki i na ich podstawie poprawiałem rozwiązanie",
        recruiter: "Sam mierzył i poprawiał",
      },
    ],
    vaguePhrases: ["mierzył", "sprawdzania efektów", "efekty", "wyniki", "adopcj"],
  },
  {
    id: "A3",
    category: "apply",
    title: "Praca z użytkownikami",
    question: "Jaka była Twoja rola w kontakcie z osobami, które miały z tego korzystać?",
    options: [
      {
        candidate: "Nie miałem kontaktu z użytkownikami",
        recruiter: "Bez kontaktu",
      },
      {
        candidate: "Prezentowałem rozwiązanie albo prowadziłem szkolenie według cudzego planu",
        recruiter: "Prezentował",
      },
      {
        candidate:
          "Rozmawiałem z użytkownikami i przekazywałem ich uwagi; zmiany wprowadzał ktoś inny",
        recruiter: "Zbierał uwagi",
      },
      {
        candidate:
          "Sam prowadziłem obserwacje i rozmowy z użytkownikami i zmieniałem rozwiązanie po ich uwagach",
        recruiter: "Sam pracował z użytkownikami",
      },
    ],
    vaguePhrases: [
      "potrzeby użytkowników",
      "z użytkownikami",
      "szkolił",
      "współpracować z osobami",
    ],
  },
  {
    id: "L1",
    category: "lead",
    title: "Priorytety i decyzje ze sponsorem",
    question: "Jaka była Twoja rola w ustalaniu, co robimy najpierw?",
    options: [
      {
        candidate: "Priorytety poznawałem, gdy były już ustalone",
        recruiter: "Bez wpływu",
      },
      {
        candidate:
          "Przygotowywałem materiały, kalendarz albo prezentację planu; priorytety ustalał ktoś inny",
        recruiter: "Pomagał (materiały)",
      },
      {
        candidate:
          "Proponowałem kolejność prac i uzgadniałem ją ze sponsorem; ostateczna decyzja była jego",
        recruiter: "Uzgadniał ze sponsorem",
      },
      {
        candidate:
          "Sam ustaliłem priorytety i kryteria decyzji ze sponsorem i odpowiadałem za kolejność prac",
        recruiter: "Sam ustalał priorytety",
      },
    ],
    vaguePhrases: ["koordynował", "priorytet", "ustalał kierunek", "prowadził projekt"],
  },
  {
    id: "L2",
    category: "lead",
    title: "Mandat: zakres i budżet",
    question: "Jaka była Twoja rola w decyzjach o zakresie i budżecie?",
    options: [
      {
        candidate: "Zakres i budżet ustalał ktoś inny; nie brałem w tym udziału",
        recruiter: "Bez mandatu",
      },
      {
        candidate: "Robiłem przegląd narzędzi albo rekomendację; decyzję podejmował ktoś inny",
        recruiter: "Rekomendował",
      },
      {
        candidate: "Zarządzałem kolejnością prac w budżecie zatwierdzonym przez kogoś innego",
        recruiter: "Zarządzał w budżecie",
      },
      {
        candidate:
          "Miałem mandat do ustalenia zakresu wdrożenia i sam decydowałem o jego ograniczeniu",
        recruiter: "Sam decydował o zakresie",
      },
    ],
    vaguePhrases: ["budżet", "uzgodniony zakres", "decydował", "odpowiadał za"],
  },
  {
    id: "L3",
    category: "lead",
    title: "Kryteria decyzji (start, zatrzymanie, finansowanie)",
    question:
      "Jaka była Twoja rola w ustalaniu, kiedy projekt idzie dalej, a kiedy się zatrzymuje?",
    options: [
      {
        candidate: "Nie ustalaliśmy takich kryteriów albo nie brałem w tym udziału",
        recruiter: "Bez kryteriów",
      },
      {
        candidate: "Zbierałem pomysły i dane do decyzji; kryteria ustalał ktoś inny",
        recruiter: "Zbierał dane",
      },
      {
        candidate:
          "Współtworzyłem kryteria zatrzymania albo dalszego finansowania; zatwierdzał ktoś inny",
        recruiter: "Współtworzył kryteria",
      },
      {
        candidate: "Sam zaproponowałem kryteria, uzgodniłem je i według nich podjęliśmy decyzję",
        recruiter: "Sam ustalił kryteria",
      },
    ],
    vaguePhrases: ["kryteri", "decyzj", "zaangażowan"],
  },
];

export const EVIDENCE_PROMPTS: Record<3 | 4, string> = {
  3: "Która część była Twoja, a kto robił resztę?",
  4: "Po czym poznaliście, że zadziałało?",
};

export const MIN_EVIDENCE_LENGTH = 30;

export const SCOPE_PROMPT = "Jaka była Twoja rola w tym projekcie?";

export function barsForCategory(category: ScopeCategory): ScopeBar[] {
  return SCOPE_BARS.filter((bar) => bar.category === category);
}

export function barById(id: string): ScopeBar | undefined {
  return SCOPE_BARS.find((bar) => bar.id === id);
}

/** Liczba odpowiedzi 3 lub 4, czyli obszarów zrobionych samemu. */
export function ownCount(answers: readonly number[]): number {
  return answers.filter((answer) => answer >= 3).length;
}

/** Liczba odpowiedzi 4, czyli obszarów zrobionych samemu i sprawdzonych. */
export function fullCount(answers: readonly number[]): number {
  return answers.filter((answer) => answer === 4).length;
}

export function multiplierScore(score: number, own: number): number {
  return Math.round((score * (1 + own / 3)) / 2);
}

export function evidenceRequired(variant: FormVariant, answer: number | undefined): boolean {
  return variant === "B" && answer !== undefined && answer >= 3;
}

export const MAX_VAGUE_SENTENCE = 240;

function capSentence(sentence: string): string {
  if (sentence.length <= MAX_VAGUE_SENTENCE) return sentence;
  const cut = sentence.slice(0, MAX_VAGUE_SENTENCE);
  const space = cut.lastIndexOf(" ");
  return `${(space > 0 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

/** Zwraca pierwsze zdanie (podział po .!? i na nowych liniach, max 240 znaków) zawierające frazę ogólnika z paska (bez względu na wielkość liter). */
export function findVagueSentence(text: string, bar: ScopeBar): string | null {
  const sentences = text.split(/(?<=[.!?])\s+|\r?\n+/);
  for (const raw of sentences) {
    const sentence = raw.trim();
    if (sentence === "") continue;
    const lower = sentence.toLocaleLowerCase("pl");
    if (bar.vaguePhrases.some((phrase) => lower.includes(phrase))) {
      return capSentence(sentence);
    }
  }
  return null;
}

export function ownLabel(own: number, total?: number): string {
  return `Sam: ${own} z ${total ?? 3} obszarów`;
}

export interface Rankable {
  answers: readonly number[];
  submittedAt: string;
  score: number;
}

function byDateAsc(a: Rankable, b: Rankable): number {
  return Date.parse(a.submittedAt) - Date.parse(b.submittedAt);
}

/** Najpierw liczba obszarów 3–4, potem liczba 4, a przy remisie najstarsze zgłoszenie. Zgłoszenia bez odpowiedzi (puste answers) zawsze na końcu. */
export function compareByScope(a: Rankable, b: Rankable): number {
  const aEmpty = a.answers.length === 0;
  const bEmpty = b.answers.length === 0;
  if (aEmpty !== bEmpty) return aEmpty ? 1 : -1;
  return (
    ownCount(b.answers) - ownCount(a.answers) ||
    fullCount(b.answers) - fullCount(a.answers) ||
    byDateAsc(a, b)
  );
}

/** Wynik z mnożnikiem malejąco, a przy remisie najstarsze zgłoszenie. */
export function compareByMultiplier(a: Rankable, b: Rankable): number {
  return (
    multiplierScore(b.score, ownCount(b.answers)) - multiplierScore(a.score, ownCount(a.answers)) ||
    byDateAsc(a, b)
  );
}
