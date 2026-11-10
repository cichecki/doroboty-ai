import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import { CheckCircle2, FileText } from "lucide-react";
import { ConfettiBurst, type ConfettiOrigin } from "@/components/confetti-burst";
import { BackLink } from "@/components/back-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { JobCard } from "@/features/jobs/job-card";
import { ApplicationOfferPreview } from "@/features/jobs/application-offer-preview";
import { usePrototype } from "./store";
import { currentPerson, publishedJobs, stageLabels, MIN_APPLICATION_ANSWER_LENGTH } from "./model";
import { PageTitle, Empty, NotFound, Notice } from "./shell";
import { CvAttachment } from "./cv-attachment";
import { Frame, Portrait } from "@/sandbox/noir/comic";
import { portraitFor } from "@/sandbox/noir/portraits";
import { MatchScore } from "./match-score";
import { RecruitingApplication } from "./recruiting-application";
import { CandidateApplication } from "./candidate-application";
import { ScopeQuestions, scopeProblems, type ScopeDraft } from "./scope-questions";
import { ScopeBlock } from "./scope-block";
import { barsForCategory, evidenceRequired, findVagueSentence } from "./scope";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function PersonPicker() {
  const { state, run } = usePrototype();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next");
  const audience = params.get("audience");
  const people =
    audience === "candidate" || audience === "employer"
      ? state.people.filter((person) => person.role === audience)
      : state.people;
  const safeNext = next && /^\/(?!\/)/.test(next) && !next.startsWith("/auth") ? next : null;
  return (
    <section className="prototype-section persona-page">
      <p className="n-kicker">Prototyp · bez haseł i kont</p>
      <h1>
        Wybierz <span className="n-accent">osobę</span>
      </h1>
      <p className="n-lead persona-page__lead">
        Wybierz profil, z którego chcesz korzystać w prototypie. Hasło nie jest potrzebne.
      </p>
      <div className="npersona">
        {people.map((person, index) => (
          <Frame
            as="article"
            key={person.id}
            seed={120 + index * 5}
            hoverMorph
            dots
            className="npersona__card"
          >
            <div className="npersona__head">
              <Portrait
                gender={person.name.split(" ")[0].endsWith("a") ? "f" : "m"}
                size={64}
                seed={index + 30}
                src={portraitFor(person.id)}
              />
              <div>
                <span className="tag-cat tag-cat--sm tag-cat--grey">
                  {person.role === "employer"
                    ? "Firma"
                    : person.role === "candidate"
                      ? "Kandydat"
                      : "Prowadzący"}
                </span>
                <h2 className="npersona__name">{person.name}</h2>
                <p className="npersona__line">{person.headline}</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => {
                run({ type: "select_person", id: person.id });
                navigate(
                  person.role === "candidate"
                    ? (safeNext ?? "/app")
                    : person.role === "employer"
                      ? "/app/oferty"
                      : "/app/case",
                );
              }}
            >
              Wejdź jako {person.name}
            </Button>
          </Frame>
        ))}
      </div>
    </section>
  );
}
export function RequireRole({
  role,
  children,
}: {
  role?: "candidate" | "employer" | "operator";
  children: ReactNode;
}) {
  const { state } = usePrototype();
  const person = currentPerson(state);
  if (!person) return <PersonPicker />;
  if (role && person.role !== role)
    return (
      <Empty>
        <p className="mb-4">
          Ten widok jest dostępny dla{" "}
          {role === "candidate" ? "kandydata" : role === "employer" ? "pracodawcy" : "prowadzącego"}
          .
        </p>
        <Link className={buttonVariants({ variant: "outline" })} to="/auth/sign-in">
          Zmień osobę
        </Link>
      </Empty>
    );
  return children;
}
export function WorkspaceHome() {
  const { state } = usePrototype();
  const person = currentPerson(state)!;
  if (person.role === "operator") return <Navigate to="/app/case" replace />;
  const candidate = person.role === "candidate";
  const applications = state.applications.filter((a) =>
    candidate ? a.candidateId === person.id : a.companyId === person.companyId,
  );
  return (
    <>
      <PageTitle>Witaj, {person.name.split(" ")[0]}</PageTitle>
      <div className="grid gap-5 sm:grid-cols-3">
        {[
          ["Aplikacje", applications.length],
          [
            candidate ? "Zapisane oferty" : "Twoje oferty",
            candidate
              ? state.saved.filter((x) => x.candidateId === person.id).length
              : state.jobs.filter((x) => x.companyId === person.companyId).length,
          ],
          [
            "W trakcie procesu",
            applications.filter((x) => !["rejected", "withdrawn", "hired"].includes(x.stage))
              .length,
          ],
        ].map(([label, value]) => (
          <div className="prototype-panel n-stat" key={label}>
            <p className="n-kicker">{label}</p>
            <strong className="n-stat__value">{value}</strong>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className={buttonVariants()} to={candidate ? "/oferty" : "/app/kandydaci"}>
          {candidate ? "Przeglądaj oferty" : "Przejrzyj kandydatów"}
        </Link>
        <Link
          className={buttonVariants({ variant: "outline" })}
          to={candidate ? "/app/profil" : "/app/oferty"}
        >
          {candidate ? "Edytuj profil" : "Zarządzaj ofertami"}
        </Link>
      </div>
    </>
  );
}
export function ProfilePage({ preview = false }: { preview?: boolean }) {
  const { state, run } = usePrototype();
  const person = currentPerson(state)!;
  const [message, setMessage] = useState("");
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (
      run({
        type: "profile",
        value: {
          name: String(data.get("name")),
          headline: String(data.get("headline")),
          bio: String(data.get("bio")),
          location: String(data.get("location")),
        },
      })
    )
      setMessage("Profil został zapisany.");
  }
  return (
    <>
      <PageTitle
        action={
          <Link
            to={preview ? "/app/profil" : "/app/profil/podglad"}
            className={buttonVariants({ variant: "outline" })}
          >
            {preview ? "Edytuj profil" : "Podgląd profilu"}
          </Link>
        }
      >
        {preview ? person.name : "Twój profil"}
      </PageTitle>
      {preview ? (
        <div className="prototype-panel space-y-4">
          <h2>{person.headline}</h2>
          <p>{person.location}</p>
          <p>{person.bio}</p>
        </div>
      ) : (
        <form onSubmit={save} className="prototype-panel prototype-form">
          <Field label="Imię i nazwisko">
            <Input name="name" required maxLength={200} defaultValue={person.name} />
          </Field>
          <Field label="Nagłówek zawodowy">
            <Input name="headline" required maxLength={200} defaultValue={person.headline} />
          </Field>
          <Field label="Lokalizacja">
            <Input name="location" required maxLength={200} defaultValue={person.location} />
          </Field>
          <Field label="O mnie">
            <Textarea name="bio" maxLength={12000} defaultValue={person.bio} />
          </Field>
          <Button type="submit">Zapisz profil</Button>
          {message && <p role="status">{message}</p>}
        </form>
      )}
      <section className="prototype-panel mt-6">
        <h2 className="mb-4 flex items-center gap-2">
          <FileText className="size-5" />
          CV
        </h2>
        <CvAttachment candidateId={person.id} fallbackText={person.cv} />
      </section>
    </>
  );
}
export function SavedPage() {
  const { state } = usePrototype();
  const person = currentPerson(state)!;
  const jobs = publishedJobs(state).filter((job) =>
    state.saved.some((x) => x.candidateId === person.id && x.jobId === job.id),
  );
  return (
    <>
      <PageTitle>Zapisane oferty</PageTitle>
      {jobs.length ? (
        <div className="pp-job-list">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} saved />
          ))}
        </div>
      ) : (
        <Empty>
          <p className="mb-4">Nie masz jeszcze zapisanych ofert.</p>
          <Link className={buttonVariants({ variant: "outline" })} to="/oferty">
            Przeglądaj oferty
          </Link>
        </Empty>
      )}
    </>
  );
}
export function ApplyPage() {
  const { slug } = useParams();
  const { state, run } = usePrototype();
  const person = currentPerson(state)!;
  const navigate = useNavigate();
  const job = publishedJobs(state).find((x) => x.slug === slug);
  const draft = state.drafts.find((x) => x.jobId === job?.id && x.candidateId === person.id);
  const notes = draft?.notes ?? "";
  const generated = draft?.generated ?? "";
  const [answer, setAnswer] = useState(draft?.answer ?? "");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [project, setProject] = useState("");
  const [scope, setScope] = useState<ScopeDraft>({});
  const projectInput = useRef<HTMLInputElement>(null);
  const scopeOpened = useRef(false);
  const openedAt = useRef(0);
  const jobId = job?.id;
  useEffect(() => {
    if (!jobId || scopeOpened.current) return;
    scopeOpened.current = true;
    openedAt.current = Date.now();
    run({ type: "scope_open", jobId });
  }, [jobId, run]);
  const answerInput = useRef<HTMLTextAreaElement>(null);
  const sendButton = useRef<HTMLButtonElement>(null);
  const submittedOnce = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const [confettiOrigin, setConfettiOrigin] = useState<ConfettiOrigin | null>(null);
  useEffect(() => {
    if (!submitted) return;
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900;
    const timeout = window.setTimeout(() => navigate("/app/aplikacje?wyslano=1"), delay);
    return () => window.clearTimeout(timeout);
  }, [submitted, navigate]);
  const answerLength = answer.trim().length;
  const answerInvalid = attempted && answerLength < MIN_APPLICATION_ANSWER_LENGTH;
  const consentInvalid = attempted && !consent;
  if (!job) return <NotFound />;
  const existing = state.applications.find(
    (x) => x.jobId === job.id && x.candidateId === person.id,
  );
  if (existing && !submitted)
    return (
      <section className="prototype-section">
        <Notice>Aplikacja na tę ofertę została już wysłana.</Notice>
        <Link to={`/app/aplikacje/${existing.id}`} className={buttonVariants()}>
          Zobacz aplikację
        </Link>
      </section>
    );
  const bars = barsForCategory(job.category);
  const variant = state.experiment.formVariant;
  const projectInvalid = attempted && project.trim() === "";
  const scopeComplete = bars.every((bar) => scope[bar.id]?.answer);
  const summaryAnswers = bars.flatMap((bar) => {
    const item = scope[bar.id];
    return item?.answer
      ? [
          {
            barId: bar.id,
            answer: item.answer,
            evidence: evidenceRequired(variant, item.answer) ? item.evidence : undefined,
          },
        ]
      : [];
  });
  function submit(e: FormEvent) {
    e.preventDefault();
    if (submittedOnce.current) return;
    setAttempted(true);
    if (answerLength < MIN_APPLICATION_ANSWER_LENGTH) {
      answerInput.current?.focus();
      return;
    }
    if (project.trim() === "") {
      projectInput.current?.focus();
      return;
    }
    const problems = scopeProblems(bars, variant, scope);
    if (problems.length) {
      const first = bars.find((bar) => problems.includes(bar.id))!;
      const target = scope[first.id]?.answer
        ? document.getElementById(`scope-evidence-${first.id}`)
        : document.querySelector<HTMLElement>(`input[name="scope-${first.id}"]`);
      target?.focus();
      return;
    }
    if (!consent) {
      document.getElementById("application-consent")?.focus();
      return;
    }
    const scopeAnswers = bars.map((bar) => {
      const item = scope[bar.id]!;
      const probeQuote = findVagueSentence(answer, bar) ?? undefined;
      return {
        barId: bar.id,
        answer: item.answer!,
        evidence: evidenceRequired(variant, item.answer) ? item.evidence.trim() : undefined,
        probeQuote,
        changedAfterProbe: Boolean(probeQuote) && item.firstAnswer !== item.answer,
      };
    });
    if (
      run({
        type: "submit",
        jobId: job!.id,
        notes,
        generated,
        answer,
        consent,
        scope: {
          project: project.trim(),
          answers: scopeAnswers,
          durationMs: Math.max(0, Math.round(Date.now() - openedAt.current)),
        },
      })
    ) {
      submittedOnce.current = true;
      setSubmitted(true);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const rect = sendButton.current?.getBoundingClientRect();
        if (rect)
          setConfettiOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }
    }
  }
  return (
    <section className="pp-container application-page">
      <BackLink to={`/oferty/${job.slug}`}>Wróć do oferty</BackLink>
      <header className="application-header">
        <h1>Aplikuj na ofertę</h1>
        <p>Sprawdź ofertę i opowiedz, dlaczego pasujesz do tej roli.</p>
      </header>
      <div className="application-layout">
        <ApplicationOfferPreview job={job} />
        <form
          noValidate
          onSubmit={submit}
          className="record-sheet application-form"
          aria-labelledby="application-form-title"
        >
          <header className="application-form-intro">
            <h2 id="application-form-title">Twoja aplikacja</h2>
            <p>
              Aplikujesz jako <strong>{person.name}</strong>.
            </p>
          </header>
          <section className="application-form-section" aria-labelledby="application-cv-title">
            <h3 id="application-cv-title">Twoje CV</h3>
            <p className="application-help">Do aplikacji dołączymy CV z Twojego profilu.</p>
            <CvAttachment
              candidateId={person.id}
              fallbackText={person.cv}
              layout="row"
              contextLabel="CV z Twojego profilu"
            />
          </section>
          <section className="application-form-section application-project">
            <Field label="Projekt, o którym opowiadasz">
              <Input
                ref={projectInput}
                disabled={submitted}
                maxLength={200}
                aria-invalid={projectInvalid || undefined}
                aria-describedby={projectInvalid ? "application-project-error" : undefined}
                value={project}
                onChange={(e) => {
                  setProject(e.target.value);
                  setConsent(false);
                }}
              />
            </Field>
            {projectInvalid && (
              <p id="application-project-error" className="error-message" role="alert">
                Wpisz, o którym projekcie opowiadasz.
              </p>
            )}
          </section>
          <section
            className="application-form-section application-answer"
            aria-label="Odpowiedź do aplikacji"
          >
            <Field label="Dlaczego pasujesz do tej roli?">
              <Textarea
                disabled={submitted}
                ref={answerInput}
                required
                minLength={MIN_APPLICATION_ANSWER_LENGTH}
                maxLength={12000}
                aria-invalid={answerInvalid || undefined}
                aria-describedby="application-answer-help"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setConsent(false);
                }}
              />
            </Field>
            <p
              id="application-answer-help"
              role={answerInvalid ? "alert" : undefined}
              className={answerInvalid ? "error-message" : "text-sm text-muted-foreground"}
            >
              {answerInvalid
                ? `Odpowiedź jest za krótka. Wpisz co najmniej ${MIN_APPLICATION_ANSWER_LENGTH} znaków (obecnie: ${answerLength}).`
                : `Minimum ${MIN_APPLICATION_ANSWER_LENGTH} znaków. Obecnie: ${answerLength}.`}
            </p>
          </section>
          <section
            className="application-form-section application-scope"
            aria-labelledby="scope-questions-title"
          >
            <ScopeQuestions
              bars={bars}
              variant={variant}
              answerText={answer}
              value={scope}
              disabled={submitted}
              attempted={attempted}
              onChange={(next) => {
                setScope(next);
                setConsent(false);
              }}
            />
          </section>
          {scopeComplete && (
            <section
              className="application-form-section application-recruiter-view"
              aria-labelledby="application-recruiter-view-title"
            >
              <h3 id="application-recruiter-view-title">Tak zobaczy to rekruter</h3>
              <ScopeBlock answers={summaryAnswers} />
            </section>
          )}
          <div className="application-form-section application-submit">
            <label className="application-consent">
              <Checkbox
                id="application-consent"
                disabled={submitted}
                checked={consent}
                onCheckedChange={(v) => setConsent(v)}
                aria-invalid={consentInvalid || undefined}
                aria-describedby={consentInvalid ? "application-consent-error" : undefined}
                aria-label="Zatwierdzam treść i przesłanie aplikacji"
              />
              <span>
                Zatwierdzam treść aplikacji i przesłanie profilu oraz przykładowego CV pracodawcy.
              </span>
            </label>
            {consentInvalid && (
              <p id="application-consent-error" className="error-message" role="alert">
                Zatwierdź treść aplikacji i jej przesłanie pracodawcy.
              </p>
            )}
            <div className="application-actions">
              <Button
                ref={sendButton}
                type="submit"
                variant="master"
                disabled={submitted}
                className="application-send"
              >
                {submitted && <CheckCircle2 aria-hidden="true" />}
                {submitted ? "Wysłano!" : "Wyślij aplikację"}
              </Button>
              <Button
                type="button"
                disabled={submitted}
                variant="outline"
                onClick={() => {
                  if (run({ type: "draft", jobId: job.id, notes, generated, answer }))
                    setMessage("Szkic został zapisany.");
                }}
              >
                Zapisz szkic
              </Button>
            </div>
            <p
              role="status"
              className={submitted || !message ? "sr-only" : "application-save-status"}
            >
              {submitted ? "Wysłano aplikację. Otwieramy listę Twoich aplikacji." : message}
            </p>
            <p className="application-help">
              Prototyp: aplikacja zostaje w tym przeglądarkowym scenariuszu.
            </p>
          </div>
        </form>
      </div>
      <ConfettiBurst origin={confettiOrigin} />
    </section>
  );
}
export function ApplicationsPage({ employer = false }: { employer?: boolean }) {
  const { state } = usePrototype();
  const person = currentPerson(state)!;
  const [query, setQuery] = useState("");
  const [params] = useSearchParams();
  const applications = state.applications.filter(
    (x) =>
      (employer ? x.companyId === person.companyId : x.candidateId === person.id) &&
      `${x.candidateName} ${x.jobTitle}`
        .toLocaleLowerCase("pl")
        .includes(query.toLocaleLowerCase("pl")),
  );
  return (
    <>
      <PageTitle>{employer ? "Kandydaci" : "Moje aplikacje"}</PageTitle>
      {params.has("wyslano") && (
        <Notice>
          <CheckCircle2 className="inline size-5" /> Aplikacja została wysłana.
        </Notice>
      )}
      <Field label={employer ? "Szukaj kandydata lub oferty" : "Szukaj oferty"}>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} />
      </Field>
      <div className="app-list">
        {applications.length ? (
          applications.map((a, index) => (
            <Frame
              as="article"
              key={a.id}
              seed={60 + index * 9}
              hoverMorph
              className="ccard app-card"
              aria-labelledby={`application-${a.id}`}
            >
              <MatchScore score={a.score} />
              <div className="ccard__head">
                {employer && (
                  <Portrait
                    gender={a.candidateName.split(" ")[0].endsWith("a") ? "f" : "m"}
                    src={portraitFor(a.candidateId)}
                    seed={index + 40}
                    size={72}
                  />
                )}
                <div className="ccard__id">
                  <h2 className="ccard__name" id={`application-${a.id}`}>
                    <Link to={`${employer ? "/app/kandydaci" : "/app/aplikacje"}/${a.id}`}>
                      {employer ? a.candidateName : a.jobTitle}
                    </Link>
                  </h2>
                  <p className="app-card__sub">
                    {employer
                      ? a.jobTitle
                      : state.companies.find((x) => x.id === a.companyId)?.name}
                  </p>
                  <p className="ccard__stage">
                    <span className="stage-dot" aria-hidden="true" />
                    <span>{stageLabels[a.stage]}</span>
                  </p>
                </div>
              </div>
              {employer && <p className="app-card__summary">{a.summary}</p>}
            </Frame>
          ))
        ) : (
          <Empty>Brak aplikacji spełniających kryteria.</Empty>
        )}
      </div>
    </>
  );
}
export function ApplicationDetail({ employer = false }: { employer?: boolean }) {
  const { id } = useParams();
  const { state } = usePrototype();
  const person = currentPerson(state)!;
  const application = state.applications.find(
    (x) =>
      x.id === id && (employer ? x.companyId === person.companyId : x.candidateId === person.id),
  );
  if (!application) return <NotFound />;
  if (employer) return <RecruitingApplication key={application.id} application={application} />;
  return <CandidateApplication key={application.id} application={application} />;
}
