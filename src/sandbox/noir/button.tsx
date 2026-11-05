import { useId, type ReactNode } from "react";

/* ------------------------------------------------------------------
   Przycisk
   ------------------------------------------------------------------ */
type BtnProps = {
  variant: "master" | "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  busy?: boolean;
  disabled?: boolean;
  demo?: "hover" | "active";
  stripes?: 3 | 5;
  onClick?: () => void;
  type?: "button" | "submit";
};

function Glint({ small }: { small?: boolean }) {
  return (
    <svg
      className={`nbtn__glint${small ? " nbtn__glint--small" : ""}`}
      viewBox="0 0 30 30"
      aria-hidden="true"
    >
      <path d="M15 1 L18 12 L29 15 L18 18 L15 29 L12 18 L1 15 L12 12 Z" />
    </svg>
  );
}

export function NButton({
  variant,
  size = "md",
  children,
  busy,
  disabled,
  demo,
  stripes = 3,
  onClick,
  type = "button",
}: BtnProps) {
  const cls = [
    "nbtn",
    `nbtn--${variant}`,
    size !== "md" && `nbtn--${size}`,
    demo === "hover" && "is-demo-hover",
    demo === "active" && "is-demo-hover is-demo-active",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      type={type}
      className={cls}
      aria-busy={busy || undefined}
      disabled={disabled}
      data-stripes={stripes}
      onClick={onClick}
    >
      <span className="nbtn__body">
        <span className="nbtn__wave" aria-hidden="true" />
        <span className="nbtn__label">{busy ? "Chwila…" : children}</span>
      </span>
      {variant === "master" && !disabled ? (
        <>
          <Glint />
          <Glint small />
        </>
      ) : null}
    </button>
  );
}

/* ------------------------------------------------------------------
   Kafelek decyzji: skośny kwadrat z ikoną (ptaszek / krzyżyk) i dymkiem
   podpowiedzi na hover i fokus. Etykieta dla czytnika = treść dymka.
   ------------------------------------------------------------------ */
export function DecisionTile({
  kind,
  label,
  icon,
  onClick,
  disabled,
}: {
  kind: "yes" | "no";
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const tip = useId();
  return (
    <span className="dtile-wrap">
      <button
        type="button"
        className={`dtile dtile--${kind}`}
        aria-label={label}
        aria-describedby={tip}
        onClick={onClick}
        disabled={disabled}
      >
        <span className="dtile__body">{icon}</span>
      </button>
      <span className="dtile__tip" role="tooltip" id={tip}>
        {label}
      </span>
    </span>
  );
}
