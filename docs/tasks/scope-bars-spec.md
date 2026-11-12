# Paski zakresu pracy w zgłoszeniu: specyfikacja prototypu

Cykl: `tydzien-2-ponowny-zakup-v2` · 10.11.2026 · Status: **zaimplementowane w prototypie, do zatwierdzenia przez Kubę** (notatka: `scope-bars.md`)
Podstawa: wynik E1 (`../e1-paski/wynik.md`), plan testów (`../05-experiments.md`: E3, E2, E6), rozmowy F1–F4 (`../affinity/`).

## Po co to jest

Rekruter na DoRoboty.ai nie wie, co kandydat zrobił sam. Od czerwca asystent pisania zaciera granicę własnej pracy w tekście zgłoszenia, a Match Score przestał odróżniać dobrych kandydatów (AUC 0,49). Szansa O01: _przy kilku podobnie opisanych kandydatach rekruter chce przed zaproszeniem wiedzieć, co każdy zrobił sam, żeby wiedzieć, od kogo zacząć._

Paski zakresu pracy to kilka krótkich pytań w formularzu zgłoszenia. Na każde kandydat odpowiada jednym z czterech zdań o swojej roli w projekcie. Na wysokich odpowiedziach dopisuje jedno zdanie dowodu. Rekruter widzi te zdania przy każdym zgłoszeniu, a lista zaczyna się od osób, które coś zrobiły same.

E1 (dane generowane) pokazał, że taka informacja odróżnia udane rozmowy lepiej niż Match Score (AUC 0,65 wobec 0,57) i że cały sygnał leży na granicy „pomagałem” / „zrobiłem część sam”.

Prototyp ma dwa zadania:

1. Jest rozbudową formularza aplikacji, którą Kuba chce zrobić.
2. Jest materiałem do testów E3 (czy kandydaci odpowiadają uczciwie) i E2 (czy rekruter wybiera trafniej).

## Decyzje Kuby

- **Tematy pasków są wspólne dla wszystkich kandydatów na dane ogłoszenie.** Rekruter musi móc porównać kandydatów między sobą. (10.11)
- **Tekst kandydata decyduje tylko o dopytaniu.** Asystent wskazuje zdania-ogólniki w temacie paska i prosi o wybór odpowiedzi. Nie zaznacza jej za kandydata. (10.11)
- **Zamiast skali 1–5 są opisowe odpowiedzi.** (10.11)
- Główny pomysł do testów to P6 + P5, karta zakresu z opisową skalą. (04.11)

## Cele

- Rekruter przed zaproszeniem widzi przy każdym kandydacie, co ten zrobił sam w temacie każdego paska, razem z jednym zdaniem dowodu.
- Lista kandydatów do ogłoszenia zaczyna się od osób, które zrobiły coś same.
- Kandydat może pokazać granicę swojej pracy: co zrobił sam, a co ktoś inny. Działa to także wtedy, gdy tekst wkleił z ChatGPT.
- Prototyp da się przejść w E3 (kandydat) i E2 (rekruter) bez backendu.

## Czego nie robimy

- Żadnych liczb ani gwiazdek, ani dla kandydata, ani dla rekrutera.
- Asystent nie zaznacza odpowiedzi za kandydata, nawet jako podpowiedź.
- Domyślnie nie zmieniamy Match Score. Wynik z mnożnikiem z pasków (E6) jest za przełącznikiem, domyślnie wyłączonym; patrz „Przełącznik: Match Score z mnożnikiem”.
- Nie zmieniamy asystenta pisania tekstu (to P2 + P1, kolejka drugiego pomysłu).
- Nie budujemy wersji produkcyjnej: AI jest symulowane, jak w całej aplikacji (`docs/tasks/frontend-only.md`).

## Czego chcemy uniknąć (porażka, nawet jeśli działa)

- **Wszyscy wybierają najwyższą odpowiedź**, więc paski przestają różnicować.
- **Kandydaci porzucają formularz**, bo pola dowodu są zbyt pracochłonne.
- **Rekruter ma więcej pracy niż dziś**: musi coś konfigurować albo czytać więcej tekstu, zanim zacznie.
- **Paski brzmią jak egzamin albo przesłuchanie.** Kandydaci (Natalia, N03) rezygnują z procesów, które ich odczłowieczają.

## Jak to działa

### 1. Rekruter publikuje ogłoszenie

- Ogłoszenie ma kategorię (Build, Apply, Lead). Asystent dobiera 3 paski z banku tej kategorii, dopasowane do zadania opisanego w ogłoszeniu.
- Rekruter widzi je w kroku podglądu jako „Kandydaci odpowiedzą, jak duża była ich rola w tych obszarach” i może jeden pasek podmienić na inny z banku. Domyślnie po prostu zatwierdza.
- W banku na start są dokładnie 3 paski na kategorię (niżej), więc w prototypie dobór jest prosty: ogłoszenie dostaje wszystkie 3 paski swojej kategorii. Podmiana działa dopiero, gdy bank się rozrośnie. **Moja decyzja**: przy 3 paskach w banku przycisk podmiany jest ukryty.

### 2. Kandydat aplikuje

Kolejność kroków w formularzu:

1. Kandydat wybiera projekt, o którym opowiada (krótki tytuł albo obszar), i pisze odpowiedź tekstową jak dziś, sam albo z asystentem lub ChatGPT.
2. **Paski: „Jaka była Twoja rola w tym projekcie?”** Trzy pytania, każde z czterema odpowiedziami do wyboru (radio). Wybór jest obowiązkowy.
3. **Pole dowodu** pojawia się po wybraniu odpowiedzi 3 albo 4 i jest obowiązkowe, minimum około 30 znaków (dokładny próg: **moja decyzja**, do korekty po E3). Asystent pisania nie może go przepisać: pole nie ma przycisku asystenta.
4. **Dopytanie z tekstu.** Jeśli w odpowiedzi z kroku 1 jest zdanie-ogólnik w temacie paska, przy tym pasku pojawia się cytat tego zdania i pytanie, np. _„Napisałeś: »wdrażałem rozwiązanie w organizacji«. Którą część zrobiłeś sam?”_. Pod spodem są te same cztery odpowiedzi. Kandydat odpowiada tak samo jak przy pasku bez cytatu, więc cytat tylko pokazuje, które zdanie warto doprecyzować.
5. Podsumowanie przed wysłaniem: tekst i trzy wybrane zdania, w takiej postaci, w jakiej zobaczy je rekruter.

**Wykrywanie ogólników w prototypie (symulacja):** lista fraz na pasek, np. „wdrażałem”, „odpowiadałem za”, „w organizacji”, „w dwóch działach”, „koordynowałem”, „prowadziłem projekt”, „byłem zaangażowany”. Jeśli fraza występuje w tekście, przy pasku pokazujemy pierwsze zdanie, które ją zawiera. Listę fraz układa budujący. Przykłady do testów powinny zawierać takie zdania.

### 3. Rekruter przegląda zgłoszenia

- **Przy każdym kandydacie** jest blok „Rola w projekcie”: trzy wiersze z nazwą paska, wybraną odpowiedzią (krótka wersja, niżej) i, jeśli jest, jednym zdaniem dowodu. Nie ma liczb ani pasków postępu.
- **Kolejność listy:** najpierw liczba pasków z odpowiedzią 3 lub 4 (3, 2, 1, 0), potem liczba odpowiedzi 4, a przy remisie data zgłoszenia, od najstarszego (żeby nikt nie czekał). **Moja decyzja**, oparta na E1: nie porządkujemy według Match Score, bo po czerwcu jest niewiarygodny.
- Na liście krótki znacznik, np. „Sam: 2 z 3 obszarów”. Pełne zdania są w szczegółach zgłoszenia i w rozwijanym podglądzie na liście.

## Bank pasków i odpowiedzi

Każdy pasek ma pytanie, cztery odpowiedzi dla kandydata, ich krótkie wersje dla rekrutera i pytanie dowodowe przy odpowiedziach 3–4. Treść odpowiedzi oparłem na zdaniach, którymi kandydaci opisywali swoją pracę w danych. **To moja propozycja do przeglądu Kuby.**

Wspólna logika czterech odpowiedzi:

1. **Nie robiłem tego w projekcie.**
2. **Pomagałem:** przygotowywałem materiały lub sprawdzałem cudzą pracę; robił i decydował ktoś inny.
3. **Zrobiłem część sam:** jasno wydzielony fragment; resztę albo decyzje miał ktoś inny. Pytanie dowodowe: _„Która część była Twoja, a kto robił resztę?”_
4. **Zrobiłem to sam i sprawdziłem efekt.** Pytanie dowodowe: _„Po czym poznaliście, że zadziałało?”_

Odpowiedzi 2 i 3 muszą się wzajemnie wykluczać. Różnica brzmi: „robiłem coś dla kogoś” kontra „mam własny kawałek, który mogę pokazać”.

### Build

**B1. Własny komponent (kod, moduł, pipeline)** — _Jaka była Twoja rola w budowie rozwiązania?_

| #   | Kandydat widzi                                                               | Rekruter widzi          |
| --- | ---------------------------------------------------------------------------- | ----------------------- |
| 1   | Nie budowałem rozwiązania w tym projekcie                                    | Nie budował             |
| 2   | Przygotowywałem prompty, demo albo prezentację; kod pisał ktoś inny          | Pomagał (prompty, demo) |
| 3   | Napisałem wydzieloną część kodu (np. moduł, integrację); resztę robił zespół | Napisał część kodu      |
| 4   | Sam zbudowałem komponent i sprawdziłem, że działa na danych                  | Sam zbudował komponent  |

**B2. Ewaluacja** — _Jaka była Twoja rola w sprawdzaniu, czy rozwiązanie działa dobrze?_

| #   | Kandydat widzi                                                                       | Rekruter widzi           |
| --- | ------------------------------------------------------------------------------------ | ------------------------ |
| 1   | Nie sprawdzałem jakości rozwiązania                                                  | Nie oceniał jakości      |
| 2   | Sprawdzałem gotowe odpowiedzi i opisywałem przypadki; jak mierzyć, ustalał ktoś inny | Sprawdzał odpowiedzi     |
| 3   | Przygotowałem część testów albo scenariuszy; metodę ustalał ktoś inny                | Przygotował część testów |
| 4   | Sam ustaliłem, jak mierzyć, uruchomiłem ewaluację i znam wynik                       | Sam prowadził ewaluację  |

**B3. Utrzymanie po wdrożeniu** — _Jaka była Twoja rola po uruchomieniu rozwiązania?_

| #   | Kandydat widzi                                                                          | Rekruter widzi   |
| --- | --------------------------------------------------------------------------------------- | ---------------- |
| 1   | Rozwiązanie nie trafiło do codziennej pracy albo nie miałem z nim kontaktu po wdrożeniu | Bez utrzymania   |
| 2   | Zgłaszałem błędy i zbierałem uwagi; utrzymywał ktoś inny                                | Zgłaszał uwagi   |
| 3   | Utrzymywałem część rozwiązania (np. jeden komponent); za całość odpowiadał ktoś inny    | Utrzymywał część |
| 4   | Sam odpowiadałem za działanie rozwiązania po wdrożeniu i reagowałem na problemy         | Sam utrzymywał   |

### Apply

**A1. Zmiana procesu w zespole** — _Jaka była Twoja rola w zmianie sposobu pracy zespołu?_

| #   | Kandydat widzi                                                                              | Rekruter widzi              |
| --- | ------------------------------------------------------------------------------------------- | --------------------------- |
| 1   | Brałem udział w warsztatach albo szkoleniu; proces się nie zmienił                          | Warsztaty, bez zmiany       |
| 2   | Przygotowywałem opis zastosowań, instrukcje albo demo; zmianę wprowadzał ktoś inny          | Pomagał (instrukcje, demo)  |
| 3   | Zmieniłem jeden krok pracy razem z właścicielem procesu; decyzję o zmianie podjął ktoś inny | Zmienił krok z właścicielem |
| 4   | Sam wprowadziłem zmianę w pracy zespołu i doprowadziłem do codziennego używania             | Sam wprowadził zmianę       |

**A2. Pomiar użycia i efektu** — _Jaka była Twoja rola w sprawdzaniu, czy zmiana działa?_

| #   | Kandydat widzi                                                                        | Rekruter widzi          |
| --- | ------------------------------------------------------------------------------------- | ----------------------- |
| 1   | Nie sprawdzaliśmy, czy ludzie z tego korzystają                                       | Bez pomiaru             |
| 2   | Zbierałem opinie albo dane; co i jak mierzyć, decydował ktoś inny                     | Zbierał dane            |
| 3   | Mierzyłem jeden wskaźnik (np. czas pracy przed i po), który ustalił ktoś inny         | Mierzył wskaźnik        |
| 4   | Sam ustaliłem, co mierzyć, zebrałem wyniki i na ich podstawie poprawiałem rozwiązanie | Sam mierzył i poprawiał |

**A3. Praca z użytkownikami** — _Jaka była Twoja rola w kontakcie z osobami, które miały z tego korzystać?_

| #   | Kandydat widzi                                                                               | Rekruter widzi               |
| --- | -------------------------------------------------------------------------------------------- | ---------------------------- |
| 1   | Nie miałem kontaktu z użytkownikami                                                          | Bez kontaktu                 |
| 2   | Prezentowałem rozwiązanie albo prowadziłem szkolenie według cudzego planu                    | Prezentował                  |
| 3   | Rozmawiałem z użytkownikami i przekazywałem ich uwagi; zmiany wprowadzał ktoś inny           | Zbierał uwagi                |
| 4   | Sam prowadziłem obserwacje i rozmowy z użytkownikami i zmieniałem rozwiązanie po ich uwagach | Sam pracował z użytkownikami |

### Lead

**L1. Priorytety i decyzje ze sponsorem** — _Jaka była Twoja rola w ustalaniu, co robimy najpierw?_

| #   | Kandydat widzi                                                                            | Rekruter widzi         |
| --- | ----------------------------------------------------------------------------------------- | ---------------------- |
| 1   | Priorytety poznawałem, gdy były już ustalone                                              | Bez wpływu             |
| 2   | Przygotowywałem materiały, kalendarz albo prezentację planu; priorytety ustalał ktoś inny | Pomagał (materiały)    |
| 3   | Proponowałem kolejność prac i uzgadniałem ją ze sponsorem; ostateczna decyzja była jego   | Uzgadniał ze sponsorem |
| 4   | Sam ustaliłem priorytety i kryteria decyzji ze sponsorem i odpowiadałem za kolejność prac | Sam ustalał priorytety |

**L2. Mandat: zakres i budżet** — _Jaka była Twoja rola w decyzjach o zakresie i budżecie?_

| #   | Kandydat widzi                                                                     | Rekruter widzi           |
| --- | ---------------------------------------------------------------------------------- | ------------------------ |
| 1   | Zakres i budżet ustalał ktoś inny; nie brałem w tym udziału                        | Bez mandatu              |
| 2   | Robiłem przegląd narzędzi albo rekomendację; decyzję podejmował ktoś inny          | Rekomendował             |
| 3   | Zarządzałem kolejnością prac w budżecie zatwierdzonym przez kogoś innego           | Zarządzał w budżecie     |
| 4   | Miałem mandat do ustalenia zakresu wdrożenia i sam decydowałem o jego ograniczeniu | Sam decydował o zakresie |

**L3. Kryteria decyzji (start, zatrzymanie, finansowanie)** — _Jaka była Twoja rola w ustalaniu, kiedy projekt idzie dalej, a kiedy się zatrzymuje?_

| #   | Kandydat widzi                                                                        | Rekruter widzi        |
| --- | ------------------------------------------------------------------------------------- | --------------------- |
| 1   | Nie ustalaliśmy takich kryteriów albo nie brałem w tym udziału                        | Bez kryteriów         |
| 2   | Zbierałem pomysły i dane do decyzji; kryteria ustalał ktoś inny                       | Zbierał dane          |
| 3   | Współtworzyłem kryteria zatrzymania albo dalszego finansowania; zatwierdzał ktoś inny | Współtworzył kryteria |
| 4   | Sam zaproponowałem kryteria, uzgodniłem je i według nich podjęliśmy decyzję           | Sam ustalił kryteria  |

## Warianty do E3

Ten sam formularz w dwóch wariantach, przełączanych parametrem w adresie albo w ustawieniach prototypu:

- **A:** paski z czterema odpowiedziami, bez pól dowodu.
- **B:** paski z polami dowodu przy odpowiedziach 3 i 4 (wersja docelowa z tej specyfikacji).

Zmiana względem planu z 04.11: przykład wymagamy już od odpowiedzi 3, nie od 4–5, bo E1 wskazał, że tam leży sygnał. W obu wariantach jest dopytanie z tekstu.

## Przełącznik: Match Score z mnożnikiem (do E6)

Decyzja Kuby (10.11): liczba obszarów, w których kandydat zrobił coś sam, ma móc wpływać na Match Score. To osobny eksperyment (E6), więc w prototypie jest tylko przełącznik, **domyślnie wyłączony**. W E3 i w pierwszym porównaniu E2 pozostaje wyłączony.

- **Wzór:** `wynik = Score × (1 + n_sam / 3) / 2`, zaokrąglony do liczby całkowitej. `n_sam` to liczba pasków z odpowiedzią 3 albo 4 (0–3). Odpowiedź 2 („pomagałem”) nie daje bonusu. Przykład: Score 80 i 2 obszary → 80 × 5/3 / 2 = 67; Score 80 i 3 obszary → 80.
- **Gdy przełącznik jest włączony**, rekruter widzi przy kandydacie wynik z mnożnikiem w miejscu Match Score, z dopiskiem „Sam: 2 z 3 obszarów”, a lista jest ułożona według tego wyniku (remis: data zgłoszenia, od najstarszego). Blok „Rola w projekcie” zostaje bez zmian.
- **Gdy jest wyłączony**, wszystko działa jak w punkcie 3: bez nowej liczby, kolejka według pasków.
- Kandydat nie widzi ani przełącznika, ani wyniku, ani tego, że paski wpływają na wynik.
- Przełącznik jest ustawieniem prototypu (np. w panelu wariantów razem z wariantem A/B do E3), nie opcją dla rekrutera.
- Wynik z mnożnikiem trafia do eksportu danych obok Match Score, także przy wyłączonym przełączniku, żeby E6 dało się policzyć na odpowiedziach z E3.

## Widok do E2

Lista 10 zgłoszeń do jednego ogłoszenia z widokiem rekrutera, w dwóch wariantach:

- **obecny:** tekst po asystencie i Match Score;
- **z paskami:** ten sam tekst i blok „Rola w projekcie”, w kolejności z punktu 3.
- **później (E6, po E3):** widok z paskami z włączonym przełącznikiem mnożnika. Nie jest częścią pierwszego porównania.

Zgłoszenia buduje się z prawdziwych, zanonimizowanych aplikacji z `applications.csv` o znanym wyniku rozmowy. Odpowiedzi na paskach wynikają z rubryki E1 (`../e1-paski/rubryka.md`, przeliczone na cztery odpowiedzi), a zdania dowodu pochodzą z tekstu kandydata przed asystentem. Wynik rozmowy jest ukryty przed uczestnikiem.

## Ograniczenia

- Prototyp powstaje na gałęzi `noir-migracja` (worktree `Desktop/Claude/doroboty-ai-noir`, od commita `4782a22`; decyzja Kuby 10.11), w stylu noir (skill `doroboty-noir`), bez backendu i bez prawdziwego AI. Stan zapisuje się lokalnie, jak w reszcie aplikacji.
- Po polsku.
- Aplikacja dla uczestników kursu: nie może psuć istniejących ścieżek ani testów.

## Doprecyzowania (moje decyzje po przeglądzie specyfikacji)

- **Ogłoszenia, które już są w danych aplikacji**, dostają paski automatycznie, według swojej kategorii. Nie trzeba ich ponownie publikować.
- **Przeliczenie rubryki E1 na cztery odpowiedzi** (do zgłoszeń w E2): poziom 1 → odp. 1, 2 → 2, 3 → 3, 4 i 5 → 4. Pasek „między zespołami” z E1 pomijamy. W Build trzecim paskiem jest utrzymanie (P3 z E1). W Apply i Lead trzeci pasek bierzemy z P3 rubryki.
- **Zgłoszenia do E2** mogą pochodzić z kilku ogłoszeń tej samej kategorii i wymagań. Pokazujemy je jako jedno ogłoszenie. Z jednego ogłoszenia rzadko jest 10 rozmów.
- **Dane do analizy E3:** prototyp zapisuje przy każdym zgłoszeniu wariant (A/B), wybrane odpowiedzi, treść pól dowodu, czy kandydat zmienił odpowiedź po dopytaniu, czas od otwarcia do wysłania i to, czy formularz porzucono. Wszystko da się wyeksportować do pliku (aplikacja ma już eksport).

## Pozostawione budującemu

- Układ ekranów, komponenty, animacje (w granicach skilla `doroboty-noir`).
- Lista fraz-ogólników i dokładne reguły wykrywania.
- Model danych w lokalnym stanie i sposób zapisu odpowiedzi w zgłoszeniu.
- Sposób przełączania wariantów A/B i widoków do E2.
- Dobór 10 zgłoszeń do E2: zrównoważona mieszanka udanych i odrzuconych, z kilkoma takimi, gdzie Match Score myli.
