/**
 * Match Score as the design-system score tag: a broken red rectangle with the number in
 * Bangers. On candidate cards (.ccard) it sits on the frame; `size="sm"` fits inline meta rows.
 */
export function MatchScore({ score, size = "lg" }: { score: number; size?: "sm" | "lg" }) {
  return (
    <span
      className={`match-score score-tag score-tag--${size}`}
      role="img"
      aria-label={`Match Score: ${score}%`}
    >
      <span className="score-tag__num" aria-hidden="true">
        {score}
        <span className="score-tag__pct">%</span>
      </span>
      <span className="score-tag__label" aria-hidden="true">
        Match Score
      </span>
    </span>
  );
}
