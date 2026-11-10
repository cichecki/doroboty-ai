# GUI — DoRoboty.ai noir

The visual direction of the running app is the DoRoboty.ai **noir** design system. Its living
reference is `design-system.html` (sources in `src/sandbox/noir/`). Poster People
(`docs/design-system/`) is kept only as history and is no longer the target for new screens.

## Read and preview

1. Run `npm run dev` and open http://127.0.0.1:3001/design-system.html for the noir reference:
   colors and scales, typography, icons, spacing, shapes, statuses, buttons, cards, forms,
   navigation, filters, recruiting record, portraits, advisor states and motifs.
2. `src/sandbox/noir/noir.css` holds the noir tokens (`--ink`, `--panel`, `--white`, `--red`,
   `--f-display`, `--f-action`, `--f-ui`, shapes, motion) and component classes.
3. `tokens.css` maps the app's existing `--gui-*` and shadcn tokens to noir roles;
   `src/app/noir-host.css` adapts shell, primitives and screens.

## Implement in this app

- One role per typeface: Climate Crisis for display headings (uppercase, 24 px and up), Bangers
  for actions, tags and figures, Satoshi for body, tables and forms, Kalam only in speech bubbles.
- Buttons come from the shared `Button` / `buttonVariants`: `master` (red, one key action per
  screen), `default` (off-white primary with a red wave), `outline` (secondary contour), `ghost`,
  `link`. The recipe works on buttons, links and labels.
- Reuse sandbox components instead of new ones: `Frame` (skewed comic frame), `Portrait`,
  `SpeechBubble`, `PageDots`, the advisor image, `portraitFor` and the noir icons.
- No rounded corners; frames are off-white contours on ink, offsets are hard (no blur).
- Preserve hash routes, Base UI `render` composition, Zod/local data operations and existing
  workflows. Keep accessible names and focus visible (dashed off-white outline).
- Check desktop and mobile (no horizontal overflow, display headings scale down on phones),
  keyboard focus, dialogs and long content. Run `./scripts/verify` and report what actually ran.
