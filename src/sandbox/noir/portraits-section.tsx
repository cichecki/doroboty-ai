import { useState } from "react";
import { NButton } from "./button";
import { Frame, Portrait, ScoreTag } from "./comic";
import { Avatar } from "./nav";
import { portraits, portraitById } from "./portraits";

const PROMPT_PL = `Na podstawie załączonego zdjęcia narysuj mój portret w stylu komiksu noir.

Zachowaj moje rysy twarzy, kształt głowy, fryzurę, zarost i okulary (jeśli mam), żeby było widać, że to ja.

Styl:
- komiks noir: czarny tusz i szarości, mocne czarne cienie, wyraźny czarny kontur,
- kreskowanie i drobny raster tylko w cieniach na postaci,
- jeden czerwony akcent w kolorze #D3202A, np. słuchawki, oprawki okularów, szalik, smycz, kosmyk włosów albo detal kurtki (wybierz jeden),
- poza tym żadnych innych kolorów.

Kadr:
- popiersie od połowy klatki piersiowej w górę, ujęcie 3/4,
- twarz w górnej 1/3 kadru, wzrok w stronę widza,
- światło z lewej i z góry,
- format pionowy 4:5, minimum 800 × 1000 px.

Tło: całkowicie przezroczyste (PNG z kanałem alfa). Bez napisów, bez ramki, bez cienia pod postacią.

Postać ma wyglądać jak bohater komiksu, ale wciąż rozpoznawalnie jak ja.`;

const PROMPT_EN = `Using the attached photo, draw my portrait in a noir comic book style.

Keep my facial features, head shape, hairstyle, facial hair and glasses (if any) so it is clearly me.

Style:
- noir comic: black ink and greys, strong black shadows, bold black outline,
- hatching and fine halftone only in the shadows on the figure,
- exactly one red accent in #D3202A, e.g. headphones, glasses frames, scarf, lanyard, a strand of hair or a jacket detail (pick one),
- no other colours.

Framing:
- bust from mid-chest up, 3/4 view,
- face in the top third of the frame, looking towards the viewer,
- light from the upper left,
- vertical 4:5 format, at least 800 × 1000 px.

Background: fully transparent (PNG with alpha channel). No text, no frame, no drop shadow.

It should look like a comic book hero, but still recognisably me.`;

function PromptBox({ lang, text }: { lang: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Frame seed={lang === "PL" ? 501 : 502} className="prompt">
      <div className="prompt__head">
        <span className="tag-cat tag-cat--sm tag-cat--grey">{lang}</span>
        <NButton
          variant={copied ? "secondary" : "primary"}
          size="sm"
          onClick={() => {
            navigator.clipboard?.writeText(text).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            });
          }}
        >
          {copied ? "Skopiowano!" : "Kopiuj prompt"}
        </NButton>
      </div>
      <pre className="prompt__text">{text}</pre>
    </Frame>
  );
}

export function PortraitsSection() {
  const cats = ["build", "apply", "lead"] as const;
  const labels = { build: "Build", apply: "Apply", lead: "Lead" };
  return (
    <section className="sb-section" id="portrety" aria-labelledby="portrety-h">
      <p className="sb-kicker">Komponenty</p>
      <h2 className="sb-h2" id="portrety-h">
        Portrety kandydatów
      </h2>

      <h3 className="sb-h3">Komplet ({portraits.length})</h3>
      <div className="pgal">
        {cats.map((c) => (
          <div key={c} className="pgal__group">
            <span className="tag-cat tag-cat--sm tag-cat--grey">{labels[c]}</span>
            <div className="pgal__row">
              {portraits
                .filter((p) => p.category === c)
                .map((p, i) => (
                  <figure key={p.id} className="pgal__item">
                    <Portrait src={p.src} gender={p.gender} size={120} seed={i + 60 + c.length} />
                    <figcaption className="sb-mono">{p.id}</figcaption>
                  </figure>
                ))}
            </div>
          </div>
        ))}
      </div>

      <h3 className="sb-h3" style={{ marginTop: 44 }}>
        Rozmiary i miejsca
      </h3>
      <div className="psizes">
        <div className="psizes__item">
          <Portrait src={portraitById("lead-1-f")} size={140} seed={71} />
          <span>
            <b>140 px</b> · nagłówek pełnego zgłoszenia, profil
          </span>
        </div>
        <div className="psizes__item">
          <Portrait src={portraitById("lead-1-f")} size={92} seed={72} />
          <span>
            <b>92 px</b> · karta kandydata
          </span>
        </div>
        <div className="psizes__item">
          <Portrait src={portraitById("lead-1-f")} size={64} seed={73} />
          <span>
            <b>64 px</b> · wybór persony, menu panelu
          </span>
        </div>
        <div className="psizes__item">
          <Portrait src={portraitById("lead-1-f")} size={40} seed={74} />
          <span>
            <b>40 px</b> · lista, komentarz
          </span>
        </div>
        <div className="psizes__item">
          <Avatar name="Anna Kowalska" size={36} />
          <span>
            <b>Bez zdjęcia</b> · inicjały
          </span>
        </div>
      </div>

      <h3 className="sb-h3" style={{ marginTop: 44 }}>
        Shortlista
      </h3>
      <div className="pshort">
        {(["build-1-m", "apply-1-f", "lead-3-m", "build-2-f"] as const).map((id, i) => (
          <Frame key={id} seed={520 + i} hoverMorph className="pshort__card">
            <ScoreTag score={[91, 86, 78, 74][i]} size="sm" />
            <Portrait src={portraitById(id)} size={110} seed={80 + i} />
            <b className="pshort__name">
              {["Kowal Kodu", "Zmienniczka", "Komandor", "Ada Builder"][i]}
            </b>
            <span className="pshort__role">
              {["Staff AI Engineer", "AI Operations", "Growth Lead", "ML Engineer"][i]}
            </span>
          </Frame>
        ))}
      </div>

      <h3 className="sb-h3" style={{ marginTop: 52 }}>
        Zrób sobie portret w tym stylu
      </h3>
      <ol className="psteps">
        <li>
          Zrób albo wybierz zdjęcie: twarz na wprost lub lekko z boku, dobre światło, bez filtrów.
        </li>
        <li>Otwórz generator obrazów, dołącz zdjęcie i wklej prompt.</li>
        <li>
          Sprawdź, czy tło jest przezroczyste (nie biała ani szara szachownica w pliku). Jeśli nie,
          poproś: „Usuń tło, zostaw przezroczyste”.
        </li>
        <li>Pobierz PNG i wgraj w profilu. Portal sam doda ramkę i raster.</li>
      </ol>
      <div className="sb-grid sb-grid--2" style={{ marginTop: 26, alignItems: "start" }}>
        <PromptBox lang="PL" text={PROMPT_PL} />
        <PromptBox lang="EN" text={PROMPT_EN} />
      </div>
    </section>
  );
}
