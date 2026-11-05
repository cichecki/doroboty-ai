import { cursorUri } from "./comic";

export function CursorSection() {
  return (
    <section className="sb-section" id="kursor" aria-labelledby="kursor-h">
      <p className="sb-kicker">Wzorce</p>
      <h2 className="sb-h2" id="kursor-h">
        Kursor
      </h2>

      <div className="cur-previews">
        <figure className="cur-prev">
          <img src={cursorUri(false)} alt="" width={96} height={96} />
          <figcaption>
            <b>Domyślny</b>
            <span>grot, biały, czarny obrys, czerwony cień</span>
          </figcaption>
        </figure>
        <figure className="cur-prev">
          <img src={cursorUri(true)} alt="" width={96} height={96} />
          <figcaption>
            <b>Klikalny</b>
            <span>ten sam grot + iskry przy czubku</span>
          </figcaption>
        </figure>
      </div>

      <table className="role-table" style={{ marginTop: 28 }}>
        <thead>
          <tr>
            <th scope="col">Stan</th>
            <th scope="col">Gdzie</th>
            <th scope="col">Kursor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Domyślny</td>
            <td>tło, tekst, kafle</td>
            <td>grot</td>
          </tr>
          <tr>
            <td>Klikalny</td>
            <td>przyciski, linki, etykiety pól, checkbox, radio, select</td>
            <td>grot z iskrami</td>
          </tr>
          <tr>
            <td>Tekst</td>
            <td>pola tekstowe, textarea</td>
            <td>systemowy (I-beam)</td>
          </tr>
          <tr>
            <td>Wyłączony</td>
            <td>przyciski i pola disabled</td>
            <td>systemowy not-allowed</td>
          </tr>
        </tbody>
      </table>

      <table className="role-table" style={{ marginTop: 28 }}>
        <thead>
          <tr>
            <th scope="col">Parametr</th>
            <th scope="col">Wartość</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Rozmiar</td>
            <td className="sb-mono">32 × 32 px (SVG)</td>
          </tr>
          <tr>
            <td>Punkt kliknięcia</td>
            <td className="sb-mono">9, 7 (czubek grotu)</td>
          </tr>
          <tr>
            <td>Klik</td>
            <td>8 iskier rozsypuje się od punktu kliknięcia, 520 ms, co trzecia czerwona</td>
          </tr>
          <tr>
            <td>Mniej ruchu</td>
            <td>kursor zostaje, iskier nie ma</td>
          </tr>
          <tr>
            <td>Dotyk</td>
            <td>brak kursora; iskry tylko dla myszy</td>
          </tr>
          <tr>
            <td>Zapas</td>
            <td className="sb-mono">auto / pointer, gdy SVG się nie wczyta</td>
          </tr>
        </tbody>
      </table>

      <div className="cur-try" tabIndex={-1}>
        <span>Kliknij tutaj</span>
        <button type="button" className="nlink">
          albo tu (element klikalny)
        </button>
      </div>
    </section>
  );
}
