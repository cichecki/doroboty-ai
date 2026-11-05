# Portrety postaci

Pliki: `src/sandbox/noir/img/portraits/`, nazwa `{kategoria}-{nr}-{f|m}.webp` (źródło: `Desktop/Claude/AI Product Heroes/Doroboty landing/assets/profilowe/`). Lista i przypisania są w `portraits.ts`; nowy plik o takiej nazwie pojawi się sam w galerii (sekcja „Portrety” w piaskownicy).

## Komplet (14)

| Kategoria | Kobiety                            | Mężczyźni                          |
| --------- | ---------------------------------- | ---------------------------------- |
| Build     | `build-1-f`, `build-2-f`           | `build-1-m`, `build-2-m`           |
| Apply     | `apply-1-f`, `apply-2-f`           | `apply-1-m`, `apply-2-m`           |
| Lead      | `lead-1-f`, `lead-2-f`, `lead-3-f` | `lead-1-m`, `lead-2-m`, `lead-3-m` |

## Przypisania do osób z prototypu (propozycja)

| Osoba (`people.json`)                      | Portret     |
| ------------------------------------------ | ----------- |
| Anna Kowalska, kandydatka                  | `lead-1-f`  |
| Marek Nowak, kandydat                      | `lead-2-m`  |
| Karolina Wiśniewska, rekruterka BrightLabs | `apply-2-f` |
| Tomasz Zieliński, Northstar Health         | `lead-3-m`  |

## Wymagania dla nowych portretów

- Źródło: PNG z prawdziwą przezroczystością (kanał alfa), bez ramki i cienia.
- Popiersie, ujęcie 3/4, głowa w górnej 1/3; karta przycina obraz od góry.
- Komiks noir, tusz i szarości, jeden czerwony detal `#D3202A`.
- Źródło min. 800 × 1000 px; w repo trzymamy WebP 320 px szerokości (ok. 30 KB).

Prompt dla kandydatów (PL i EN) jest w sekcji „Portrety” piaskownicy i w `portraits-section.tsx`.
