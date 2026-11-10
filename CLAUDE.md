@AGENTS.md

Start with npm ci and npm run dev. Do not infer work from historical course material. Keep durable task notes in docs/tasks and review the actual diff before claiming completion.

## UI work uses the noir design system

Use the DoRoboty.ai noir design system for every new or changed screen. Its reference page is `design-system.html` (http://127.0.0.1:3001/design-system.html, sources in `src/sandbox/noir/`). [GUI.md](GUI.md) is the entry point. `tokens.css` maps the app tokens to noir roles and `src/app/noir-host.css` adapts the shell, primitives and screens. Reuse the shared `Button` variants (`master` for one key action per screen) and sandbox components (`Frame`, `Portrait`, `SpeechBubble`, advisor, noir icons) instead of building parallel controls. Keep hash routes, Base UI `render` composition, Zod, persona data, localStorage and application/employer workflows. The earlier Poster People kit in `docs/design-system/` is history only. Validate new UI at desktop/mobile widths and with keyboard/state checks, run ./scripts/verify, update FEATURES.md for actual behavior changes and report actual evidence.
