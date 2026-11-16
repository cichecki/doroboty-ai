# Home hero: advisor left, copy right, ink reveal

Slug: `home-hero-ink`
Created: 2026-11-15

## Goal

Kuba asked to rework the home hero: copy (tag, H1, lead, actions) moves to the right, the advisor
to the left, and the speech bubble must not cover the advisor's face. Entry animation: option C
"Atrament" (ink).

## Design

- Desktop: two columns, advisor column first (narrower), copy column on the right. The advisor's
  open hand points towards the copy. The bubble sits above the head on the copy side; its tail
  ends next to the head, never on the face (noir rule).
- Mobile (≤ 900 px): copy first, advisor below as today.
- Ink reveal, once per load, ~1.6 s, reusing noir motion tokens:
  1. Advisor emerges from the dark (brightness 0 → 1, slight drift from the left).
  2. Tag, then H1 revealed left to right by a soft ink mask; lead and actions fade up.
  3. The red light on the advisor's chest lights up last with one soft pulse; then the bubble.
- `prefers-reduced-motion` and the "Mniej ruchu" class show the final state with no animation.

## Acceptance criteria

- [x] Advisor left, copy right at 1280 px; bubble does not overlap the face.
- [x] Mobile 375 px and ~325 px: no horizontal overflow, readable order.
- [x] Reduced motion: hero visible immediately.
- [x] `./scripts/verify` passes.
- [x] FEATURES.md reviewed.

Checked locally with headless Chromium: animation frames at 0.2–1.8 s, final 1280 px, 375/325 px
(no horizontal overflow), reduced motion shows the final state at 150 ms. FEATURES.md PUB-01 updated.
