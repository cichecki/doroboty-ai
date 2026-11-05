import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  initialState,
  MIN_APPLICATION_ANSWER_LENGTH,
  publishedJobs,
} from "@/features/prototype/model";
import { NButton } from "./button";
import { Frame } from "./comic";
import { StageBadge } from "./foundations";
import { IconChevron, IconDoc } from "./icons";

const job = publishedJobs(initialState())[0];

/* ------------------------------------------------------------------
   Pole: etykieta, podpowiedź, błąd (bez czerwieni: biała rama + odwrócony komunikat)
   ------------------------------------------------------------------ */
export function Field({
  label,
  hint,
  error,
  children,
  id,
  optional,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: (props: { id: string; describedBy?: string; invalid?: boolean }) => ReactNode;
  id?: string;
  optional?: boolean;
}) {
  const auto = useId();
  const fid = id ?? auto;
  const hintId = `${fid}-hint`,
    errId = `${fid}-err`;
  return (
    <div className={`field${error ? " is-error" : ""}`}>
      <label htmlFor={fid}>
        {label} {optional ? <span className="field__opt">(opcjonalnie)</span> : null}
      </label>
      {children({
        id: fid,
        describedBy: error ? errId : hint ? hintId : undefined,
        invalid: !!error,
      })}
      {error ? (
        <div className="field__error" id={errId} role="alert">
          <span className="field__error-icon" aria-hidden="true">
            !
          </span>
          {error}
        </div>
      ) : hint ? (
        <span className="field__hint" id={hintId}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

/* Textarea z licznikiem znaków */
export function NTextarea({
  value,
  onChange,
  max = 2000,
  min,
  ...p
}: {
  value: string;
  onChange: (v: string) => void;
  max?: number;
  min?: number;
  id: string;
  describedBy?: string;
  invalid?: boolean;
  placeholder?: string;
  rows?: number;
}) {
  const n = value.trim().length;
  return (
    <div className="ntextarea">
      <textarea
        id={p.id}
        className="ninput ntextarea__input"
        rows={p.rows ?? 6}
        maxLength={max}
        value={value}
        placeholder={p.placeholder}
        aria-describedby={p.describedBy}
        aria-invalid={p.invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className={`ntextarea__count${min && n < min ? " is-short" : ""}`} aria-live="polite">
        {min && n < min ? `jeszcze ${min - n} zn.` : `${n} / ${max}`}
      </span>
    </div>
  );
}

/* Lista rozwijana: natywny select (dostępny, działa na telefonie) w komiksowej oprawie */
export function NSelect({
  value,
  onChange,
  options,
  ...p
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
  id: string;
  describedBy?: string;
  invalid?: boolean;
}) {
  return (
    <span className="nselect">
      <select
        id={p.id}
        className="ninput nselect__input"
        value={value}
        aria-describedby={p.describedBy}
        aria-invalid={p.invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <IconChevron />
    </span>
  );
}

/* Checkbox: skośny kwadrat, ptaszek rysuje się kreską */
export function NCheckbox({
  checked,
  onChange,
  children,
  describedBy,
  invalid,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
  describedBy?: string;
  invalid?: boolean;
}) {
  return (
    <label className={`ncheck${invalid ? " is-error" : ""}`}>
      <input
        type="checkbox"
        className="ncheck__input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
      />
      <span className="ncheck__box" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path className="ncheck__tick" d="M4.5 12.6l5 5.2L19.8 5.4" />
        </svg>
      </span>
      <span className="ncheck__label">{children}</span>
    </label>
  );
}

/* Radio: romb jak znacznik etapu */
export function NRadioGroup({
  legend,
  name,
  value,
  onChange,
  options,
}: {
  legend: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <fieldset className="nradio-group">
      <legend>{legend}</legend>
      <div className="nradio-group__opts">
        {options.map(([v, l]) => (
          <label key={v} className="nradio">
            <input
              type="radio"
              className="nradio__input"
              name={name}
              value={v}
              checked={value === v}
              onChange={() => onChange(v)}
            />
            <span className="nradio__mark" aria-hidden="true" />
            {l}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* Załącznik CV: strefa upuszczania + plik */
export function CvUpload({
  file,
  onFile,
  error,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [localErr, setLocalErr] = useState("");
  const accept = (f: File | undefined) => {
    if (!f) return;
    if (f.type !== "application/pdf") return setLocalErr("To nie PDF. Wgraj CV w formacie PDF.");
    if (f.size > 5 * 1024 * 1024)
      return setLocalErr("Plik ma ponad 5 MB. Zmniejsz go i spróbuj jeszcze raz.");
    setLocalErr("");
    onFile(f);
  };
  const err = localErr || error;
  return (
    <div className={`field${err ? " is-error" : ""}`}>
      <span className="field__label" id="cv-label">
        CV (PDF, do 5 MB)
      </span>
      {file ? (
        <div className="cvfile">
          <IconDoc />
          <div className="cvfile__meta">
            <b>{file.name}</b>
            <span>{(file.size / 1024).toFixed(0)} KB · PDF</span>
          </div>
          <button type="button" className="nlink" onClick={() => onFile(null)}>
            Usuń
          </button>
        </div>
      ) : (
        <div
          className={`dropzone${drag ? " is-drag" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            accept(e.dataTransfer.files[0]);
          }}
        >
          <IconDoc />
          <p>Przeciągnij tu CV albo</p>
          <NButton variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
            Wybierz plik
          </NButton>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            aria-labelledby="cv-label"
            tabIndex={-1}
            onChange={(e) => accept(e.target.files?.[0])}
          />
        </div>
      )}
      {err ? (
        <div className="field__error" role="alert">
          <span className="field__error-icon" aria-hidden="true">
            !
          </span>
          {err}
        </div>
      ) : null}
    </div>
  );
}

/* Sekcja formularza: numer w Bangers, tytuł, opis */
export function FormSection({
  n,
  title,
  desc,
  children,
}: {
  n?: number;
  title: string;
  desc?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="fsection">
      <legend className="fsection__head">
        {n ? <span className="fsection__n">{n}</span> : null}
        <span className="fsection__title">{title}</span>
      </legend>
      {desc ? <p className="fsection__desc">{desc}</p> : null}
      <div className="fsection__body">{children}</div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------
   Pasek kroków: trzy skośne kadry
   ------------------------------------------------------------------ */
function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="steps" aria-label="Kroki aplikacji">
      {steps.map((s, i) => (
        <li
          key={s}
          className={`steps__item${i === current ? " is-current" : ""}${i < current ? " is-done" : ""}`}
          aria-current={i === current ? "step" : undefined}
        >
          <span className="steps__n">{i < current ? "✓" : i + 1}</span>
          <span className="steps__label">{s}</span>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------
   Dialog: natywny <dialog> (fokus w środku, Esc zamyka) w ramce komiksu
   ------------------------------------------------------------------ */
export function ComicDialog({
  open,
  onClose,
  title,
  children,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement;
      d.showModal();
    } else if (!open && d.open) {
      d.close();
      (opener.current as HTMLElement | null)?.focus();
    }
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="ndialog"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <Frame seed={77} skew={12} className="ndialog__frame">
        <h2 className="ndialog__title" id={titleId}>
          {title}
        </h2>
        <div className="ndialog__body">{children}</div>
        <div className="ndialog__actions">{actions}</div>
      </Frame>
    </dialog>
  );
}

/* ------------------------------------------------------------------
   Demo: aplikacja w 3 krokach + dialog wycofania
   ------------------------------------------------------------------ */
function ApplicationFlow() {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [tried, setTried] = useState<Record<number, boolean>>({});
  const [name, setName] = useState("Anna Kowalska");
  const [email, setEmail] = useState("");
  const [cv, setCv] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [answer, setAnswer] = useState("");
  const [start, setStart] = useState("1m");
  const [contract, setContract] = useState("any");
  const [confirm, setConfirm] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  const formTop = useRef<HTMLDivElement>(null);

  const errors0 = {
    name: name.trim() ? "" : "Wpisz imię i nazwisko.",
    email: /^\S+@\S+\.\S+$/.test(email) ? "" : "Wpisz adres e-mail, np. anna@firma.pl.",
    cv: cv ? "" : "Dodaj CV, bez niego firma nie zobaczy doświadczenia.",
    consent: consent ? "" : "Potrzebujemy zgody, żeby przekazać aplikację firmie.",
  };
  const errors1 = {
    answer:
      answer.trim().length >= MIN_APPLICATION_ANSWER_LENGTH
        ? ""
        : `Napisz co najmniej ${MIN_APPLICATION_ANSWER_LENGTH} znaków o tym, co zrobił(a)ś sam(a).`,
  };
  const show = (k: number) => !!tried[k];
  const next = () => {
    setTried((t) => ({ ...t, [step]: true }));
    const errs = step === 0 ? errors0 : errors1;
    if (Object.values(errs).some(Boolean)) {
      window.setTimeout(
        () =>
          (
            formTop.current?.querySelector(
              "[aria-invalid='true'], .field.is-error input, .ncheck.is-error input",
            ) as HTMLElement | null
          )?.focus(),
        0,
      );
      return;
    }
    setStep((s) => s + 1);
    formTop.current?.scrollIntoView({ block: "start" });
  };
  const steps = ["Dane i CV", "Odpowiedź", "Podsumowanie"];
  const starts: [string, string][] = [
    ["now", "Od zaraz"],
    ["1m", "Za miesiąc"],
    ["3m", "Za 3 miesiące"],
  ];
  const contracts: [string, string][] = [
    ["employment", "Umowa o pracę"],
    ["b2b", "B2B"],
    ["any", "Bez znaczenia"],
  ];
  const reset = () => {
    setStep(0);
    setSent(false);
    setTried({});
    setEmail("");
    setCv(null);
    setConsent(false);
    setAnswer("");
    setWithdrawn(false);
  };

  if (sent)
    return (
      <Frame seed={88} className="appdone">
        <div className="appdone__burst" aria-hidden="true">
          <span className="sfx">WYSŁANE!</span>
        </div>
        <h3 className="appdone__title">Aplikacja leci do {job.company.name}</h3>
        <p className="appdone__text">
          {job.title}. Firma zobaczy Twoje CV i odpowiedź. Status sprawdzisz w zakładce Aplikacje.
        </p>
        <div className="appdone__status">
          {withdrawn ? <StageBadge stage="withdrawn" /> : <StageBadge stage="submitted" />}
        </div>
        <div className="appdone__actions">
          <NButton variant="primary" size="sm">
            Zobacz aplikację
          </NButton>
          {!withdrawn ? (
            <NButton variant="secondary" size="sm" onClick={() => setConfirm(true)}>
              Wycofaj aplikację
            </NButton>
          ) : null}
          <button type="button" className="nlink" onClick={reset}>
            Od nowa (piaskownica)
          </button>
        </div>
        <ComicDialog
          open={confirm}
          onClose={() => setConfirm(false)}
          title="Wycofać aplikację?"
          actions={
            <>
              <NButton variant="secondary" size="sm" onClick={() => setConfirm(false)}>
                Zostaw
              </NButton>
              <NButton
                variant="primary"
                size="sm"
                onClick={() => {
                  setWithdrawn(true);
                  setConfirm(false);
                }}
              >
                Wycofaj
              </NButton>
            </>
          }
        >
          <p>
            Firma {job.company.name} przestanie widzieć Twoją aplikację na stanowisko{" "}
            <b>{job.title}</b>. Tego nie da się cofnąć, ale możesz zaaplikować ponownie.
          </p>
        </ComicDialog>
      </Frame>
    );

  return (
    <div ref={formTop} className="appflow">
      <Frame seed={91} className="appflow__frame">
        <p className="appflow__job">
          Aplikujesz na <b>{job.title}</b> · {job.company.name}
        </p>
        <Steps steps={steps} current={step} />
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 2) next();
            else setSent(true);
          }}
        >
          {step === 0 ? (
            <>
              <FormSection
                n={1}
                title="Kim jesteś"
                desc="Te dane zobaczy tylko firma, do której aplikujesz."
              >
                <Field label="Imię i nazwisko" error={show(0) ? errors0.name : ""}>
                  {(f) => (
                    <input
                      id={f.id}
                      className="ninput"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      aria-describedby={f.describedBy}
                      aria-invalid={f.invalid || undefined}
                      autoComplete="name"
                    />
                  )}
                </Field>
                <Field
                  label="E-mail"
                  hint="Na ten adres firma odpisze po pierwszej rozmowie."
                  error={show(0) ? errors0.email : ""}
                >
                  {(f) => (
                    <input
                      id={f.id}
                      type="email"
                      className="ninput"
                      value={email}
                      placeholder="anna@firma.pl"
                      onChange={(e) => setEmail(e.target.value)}
                      aria-describedby={f.describedBy}
                      aria-invalid={f.invalid || undefined}
                      autoComplete="email"
                    />
                  )}
                </Field>
              </FormSection>
              <FormSection n={2} title="CV">
                <CvUpload file={cv} onFile={setCv} error={show(0) ? errors0.cv : ""} />
                <div className={`field${show(0) && errors0.consent ? " is-error" : ""}`}>
                  <NCheckbox
                    checked={consent}
                    onChange={setConsent}
                    invalid={show(0) && !!errors0.consent}
                    describedBy={show(0) && errors0.consent ? "consent-err" : undefined}
                  >
                    Zgadzam się na przekazanie aplikacji firmie {job.company.name}.
                  </NCheckbox>
                  {show(0) && errors0.consent ? (
                    <div className="field__error" id="consent-err" role="alert">
                      <span className="field__error-icon" aria-hidden="true">
                        !
                      </span>
                      {errors0.consent}
                    </div>
                  ) : null}
                </div>
              </FormSection>
            </>
          ) : step === 1 ? (
            <FormSection
              n={3}
              title="Twoja odpowiedź"
              desc="Opisz jedno zadanie z AI, które zrobił(a)ś samodzielnie: co było problemem, co zrobił(a)ś i jaki był wynik."
            >
              <Field label="Odpowiedź" error={show(1) ? errors1.answer : ""}>
                {(f) => (
                  <NTextarea
                    {...f}
                    value={answer}
                    onChange={setAnswer}
                    min={MIN_APPLICATION_ANSWER_LENGTH}
                    placeholder="Np. Zautomatyzowałam obsługę zgłoszeń…"
                  />
                )}
              </Field>
              <Field label="Kiedy możesz zacząć?">
                {(f) => <NSelect {...f} value={start} onChange={setStart} options={starts} />}
              </Field>
              <NRadioGroup
                legend="Forma współpracy"
                name="contract"
                value={contract}
                onChange={setContract}
                options={contracts}
              />
            </FormSection>
          ) : (
            <FormSection n={4} title="Sprawdź i wyślij">
              <dl className="summary">
                <div>
                  <dt>Imię i nazwisko</dt>
                  <dd>{name}</dd>
                </div>
                <div>
                  <dt>E-mail</dt>
                  <dd>{email}</dd>
                </div>
                <div>
                  <dt>CV</dt>
                  <dd>{cv?.name}</dd>
                </div>
                <div>
                  <dt>Start</dt>
                  <dd>{starts.find(([v]) => v === start)?.[1]}</dd>
                </div>
                <div>
                  <dt>Forma</dt>
                  <dd>{contracts.find(([v]) => v === contract)?.[1]}</dd>
                </div>
                <div className="summary__wide">
                  <dt>Odpowiedź</dt>
                  <dd>{answer}</dd>
                </div>
              </dl>
              <button type="button" className="nlink" onClick={() => setStep(1)}>
                Popraw odpowiedź
              </button>
            </FormSection>
          )}
          <div className="appflow__nav">
            {step > 0 ? (
              <NButton variant="secondary" size="sm" onClick={() => setStep((s) => s - 1)}>
                Wstecz
              </NButton>
            ) : (
              <span />
            )}
            {step < 2 ? (
              <NButton variant="primary" type="submit">
                Dalej
              </NButton>
            ) : (
              <NButton variant="master" type="submit">
                Wyślij aplikację
              </NButton>
            )}
          </div>
        </form>
      </Frame>
    </div>
  );
}

function ControlsGallery() {
  const [t, setT] = useState("");
  const [s, setS] = useState("hybrid");
  const [c1, setC1] = useState(true);
  const [c2, setC2] = useState(false);
  const [r, setR] = useState("mid");
  const [dlg, setDlg] = useState(false);
  return (
    <div className="sb-grid sb-grid--2" style={{ alignItems: "start" }}>
      <Frame seed={101} className="ctrl-card">
        <span className="kadr__caption">Pola</span>
        <div className="ctrl-stack">
          <Field label="Notatka rekrutacyjna" hint="Widoczna tylko dla Twojego zespołu." optional>
            {(f) => (
              <NTextarea
                {...f}
                value={t}
                onChange={setT}
                max={1200}
                rows={4}
                placeholder="Co warto sprawdzić w rozmowie?"
              />
            )}
          </Field>
          <Field label="Tryb pracy">
            {(f) => (
              <NSelect
                {...f}
                value={s}
                onChange={setS}
                options={[
                  ["onsite", "Stacjonarnie"],
                  ["hybrid", "Hybrydowo"],
                  ["remote", "Zdalnie"],
                ]}
              />
            )}
          </Field>
          <Field label="Pole wyłączone">
            {(f) => <input id={f.id} className="ninput" value="BrightLabs" disabled readOnly />}
          </Field>
        </div>
      </Frame>
      <Frame seed={102} className="ctrl-card">
        <span className="kadr__caption">Wybór</span>
        <div className="ctrl-stack">
          <NCheckbox checked={c1} onChange={setC1}>
            Pokazuj tylko oferty z widełkami
          </NCheckbox>
          <NCheckbox checked={c2} onChange={setC2}>
            Powiadom mnie o nowych ofertach Lead
          </NCheckbox>
          <NRadioGroup
            legend="Poziom"
            name="lvl"
            value={r}
            onChange={setR}
            options={[
              ["junior", "Junior"],
              ["mid", "Mid"],
              ["senior", "Senior"],
              ["lead", "Lead"],
            ]}
          />
          <div>
            <NButton variant="secondary" size="sm" onClick={() => setDlg(true)}>
              Otwórz dialog
            </NButton>
          </div>
        </div>
      </Frame>
      <ComicDialog
        open={dlg}
        onClose={() => setDlg(false)}
        title="Zapisano filtry"
        actions={
          <NButton variant="primary" size="sm" onClick={() => setDlg(false)}>
            Super
          </NButton>
        }
      >
        <p>
          Dostaniesz powiadomienie, gdy pojawi się nowa oferta pasująca do filtrów. Esc albo
          kliknięcie w tło zamyka okno.
        </p>
      </ComicDialog>
    </div>
  );
}

export function Forms() {
  return (
    <section className="sb-section" id="formularze" aria-labelledby="formularze-h">
      <p className="sb-kicker">Komponenty</p>
      <h2 className="sb-h2" id="formularze-h">
        Formularze i dialog
      </h2>
      <h3 className="sb-h3">Kontrolki</h3>
      <ControlsGallery />
      <h3 className="sb-h3" style={{ marginTop: 48 }}>
        Aplikacja w 3 krokach
      </h3>
      <ApplicationFlow />
    </section>
  );
}
