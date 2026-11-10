import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { Menu, LogOut, X } from "lucide-react";
import { buttonVariants, MasterBody, masterClassName } from "@/components/ui/button";
import { ComicCursor, Frame, PageDots } from "@/sandbox/noir/comic";
import advisorImg from "@/sandbox/noir/img/doradca-cut.webp";
import { portraitFor } from "@/sandbox/noir/portraits";
import { currentPerson } from "./model";
import { usePrototype } from "./store";

const navigation = [
  { to: "/oferty", label: "Oferty" },
  { to: "/metodologia", label: "Metodologia" },
  { to: "/auth/sign-in?audience=employer&next=/app/oferty", label: "Dla firm" },
];

export function Notice({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="prototype-notice">
      {children}
    </div>
  );
}
export function PageTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="page-heading">
      <h1>{children}</h1>
      {action}
    </div>
  );
}
/* Empty state: the noir advisor next to a framed tile (design system "Pusty stan"). */
export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="adv-row n-empty">
      <img src={advisorImg} alt="" className="adv-row__figure" />
      <Frame seed={31} className="adv-tile">
        {children}
      </Frame>
    </div>
  );
}
export function NotFound() {
  return (
    <section className="prototype-section">
      <h1>Nie znaleziono strony</h1>
      <p className="my-5">Ten adres nie prowadzi do dostępnej oferty lub aplikacji.</p>
      <Link className={buttonVariants()} to="/oferty">
        Wróć do ofert
      </Link>
    </section>
  );
}

const candidateNav = [
  ["/app", "Przegląd"],
  ["/app/profil", "Profil"],
  ["/app/zapisane", "Zapisane oferty"],
  ["/app/aplikacje", "Moje aplikacje"],
] as const;
const employerNav = [
  ["/app", "Przegląd"],
  ["/app/oferty", "Moje oferty"],
  ["/app/kandydaci", "Kandydaci"],
  ["/app/organizacja", "Organizacja"],
] as const;

function Logo({ size }: { size?: number }) {
  return (
    <Link
      className="nlogo"
      to="/"
      aria-label="DoRoboty.ai — strona główna"
      style={size ? { fontSize: size } : undefined}
    >
      DOROBOTY<b>.AI</b>
    </Link>
  );
}

function Avatar({ personId, name }: { personId: string; name: string }) {
  const src = portraitFor(personId);
  if (src)
    return (
      <span className="navatar navatar--photo" aria-hidden="true">
        <img src={src} alt="" />
      </span>
    );
  return (
    <span className="navatar" style={{ width: 44, height: 44, fontSize: 21 }} aria-hidden="true">
      {name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)}
    </span>
  );
}

/* Public mobile menu: full-screen off-white sheet (.nmenu) */
function PublicMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) close.current?.focus();
  }, [open]);
  return (
    <div
      id="public-menu"
      className={`nmenu${open ? " is-open" : ""}`}
      aria-hidden={!open}
      inert={!open}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="nmenu__top">
        <Logo />
        <button
          ref={close}
          type="button"
          className="nicon-btn"
          aria-label="Zamknij menu"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
      <nav className="nmenu__nav" aria-label="Menu">
        {navigation.map((item, i) => (
          <Link
            key={item.to}
            to={item.to}
            className="nmenu__link"
            style={{ ["--d" as string]: `${i * 50}ms` }}
            onClick={onClose}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="nmenu__cta">
        <Link to="/oferty" className={masterClassName()} onClick={onClose}>
          <MasterBody>Zobacz oferty</MasterBody>
        </Link>
      </div>
    </div>
  );
}

export function Shell() {
  const { state, issue, error, clearError } = usePrototype();
  const person = currentPerson(state);
  const { pathname } = useLocation();
  const workspace = pathname.startsWith("/app") && person;
  const [menuAt, setMenuAt] = useState<string | null>(null);
  const main = useRef<HTMLElement>(null);
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      clearError();
      main.current?.focus();
      window.scrollTo(0, 0);
      lastPath.current = pathname;
    }
  }, [pathname, clearError]);
  const menuOpen = menuAt === pathname;
  const nav =
    person?.role === "employer"
      ? employerNav
      : person?.role === "operator"
        ? ([["/app/case", "Materiały case study"]] as const)
        : candidateNav;
  const content = (
    <>
      {issue && (
        <Notice>
          {issue}{" "}
          <Link className="underline" to="/app/settings">
            Ustawienia danych
          </Link>
        </Notice>
      )}
      {error && (
        <p className="prototype-error" role="alert">
          {error}
        </p>
      )}
      <div key={`${state.activePersonId}:${pathname}`}>
        <Outlet />
      </div>
    </>
  );
  const skip = (
    <a
      href="#main"
      className="skip-link"
      onClick={(e) => {
        e.preventDefault();
        main.current?.focus();
      }}
    >
      Przejdź do treści
    </a>
  );

  if (workspace)
    return (
      <>
        <PageDots />
        <ComicCursor />
        {skip}
        <div className="app-frame">
          <div className="mobile-header">
            <Logo size={22} />
            <button
              type="button"
              className="nicon-btn"
              aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
              aria-expanded={menuOpen}
              aria-controls="workspace-nav"
              onClick={() => setMenuAt(menuOpen ? null : pathname)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
          <aside
            className={`sidebar npanel ${menuOpen ? "sidebar-open" : ""}`}
            onKeyDown={(e) => {
              if (e.key === "Escape") setMenuAt(null);
            }}
          >
            <div className="sidebar__logo">
              <Logo />
            </div>
            <div className="npanel__person">
              <Avatar personId={person.id} name={person.name} />
              <div>
                <b>{person.name}</b>
                <span>{person.headline}</span>
              </div>
            </div>
            <Link className="npanel__switch" to="/auth/sign-in" onClick={() => setMenuAt(null)}>
              Zmień osobę
            </Link>
            <nav id="workspace-nav" className="npanel__nav" aria-label="Panel użytkownika">
              {nav.map(([to, label]) => (
                <NavLink
                  end={to === "/app"}
                  key={to}
                  to={to}
                  onClick={() => setMenuAt(null)}
                  className={({ isActive }) => `npanel__item${isActive ? " is-active" : ""}`}
                >
                  {label}
                </NavLink>
              ))}
              <NavLink
                to="/app/settings"
                onClick={() => setMenuAt(null)}
                className={({ isActive }) => `npanel__item${isActive ? " is-active" : ""}`}
              >
                Ustawienia
              </NavLink>
            </nav>
            <div className="npanel__foot">
              <Link to="/oferty" onClick={() => setMenuAt(null)}>
                Wszystkie oferty
              </Link>
              <Link to="/" onClick={() => setMenuAt(null)}>
                Strona główna
              </Link>
            </div>
          </aside>
          <div className="workspace">
            <div className="topbar">
              <span>
                {person.role === "candidate"
                  ? "Strefa kandydata"
                  : person.role === "employer"
                    ? "Strefa pracodawcy"
                    : "Case study"}
              </span>
              <Link to="/auth/sign-in">{person.name}</Link>
            </div>
            <main id="main" ref={main} tabIndex={-1} className="main-content outline-none">
              {content}
            </main>
          </div>
        </div>
      </>
    );

  return (
    <>
      <PageDots />
      <ComicCursor />
      {skip}
      <div className="n-app">
        <header className="ntop">
          <div className="ntop__inner">
            <Logo />
            <nav aria-label="Główna nawigacja" className="ntop__main">
              <div className="ntop__nav">
                {navigation.map((item) => (
                  <NavLink key={item.to} className="ntop__link" to={item.to} end>
                    {item.label}
                  </NavLink>
                ))}
              </div>
              <div className="ntop__right">
                {person ? (
                  <>
                    {person.role === "candidate" && (
                      <>
                        <NavLink className="ntop__link" to="/app/aplikacje">
                          Aplikacje
                        </NavLink>
                        <NavLink className="ntop__link" to="/app/profil">
                          Profil
                        </NavLink>
                      </>
                    )}
                    <Link to="/app" className={buttonVariants({ size: "sm" })}>
                      Moje konto
                    </Link>
                    <Link
                      className="ntop__icon"
                      to="/auth/sign-in"
                      aria-label="Zmień osobę"
                      title="Zmień osobę"
                    >
                      <LogOut aria-hidden="true" />
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/auth/sign-in?audience=candidate"
                    className={buttonVariants({ size: "sm" })}
                  >
                    Wybierz osobę
                  </Link>
                )}
                <button
                  type="button"
                  className="nicon-btn ntop__burger"
                  aria-label="Otwórz menu"
                  aria-expanded={menuOpen}
                  aria-controls="public-menu"
                  onClick={() => setMenuAt(pathname)}
                >
                  <Menu />
                </button>
              </div>
            </nav>
          </div>
        </header>
        <PublicMenu open={menuOpen} onClose={() => setMenuAt(null)} />
        <main id="main" ref={main} tabIndex={-1} className="outline-none">
          {content}
        </main>
        <footer className="nfoot">
          <div className="nfoot__inner">
            <div className="nfoot__row">
              <Logo size={20} />
              <nav aria-label="Stopka" className="nfoot__nav">
                <Link to="/oferty">Oferty</Link>
                <Link to="/metodologia">Metodologia</Link>
                <Link to="/polityka-prywatnosci">Prywatność</Link>
                <Link to="/auth/sign-in">Strefa case</Link>
              </nav>
            </div>
            <p className="nfoot__note">
              Praca dla ludzi, którzy potrafią z AI zbudować coś wartościowego — nie tylko wpisać je
              do CV. © {new Date().getFullYear()} DoRoboty.ai — od Superhero.tech
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
