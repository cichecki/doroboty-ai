import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./features/prototype/app";
import "./app/globals.css";
// Noir design system (src/sandbox/noir) followed by the host recipes for app screens.
import "./sandbox/noir/noir.css";
import "./sandbox/noir/forms.css";
import "./sandbox/noir/navfilters.css";
import "./sandbox/noir/recruit.css";
import "./sandbox/noir/portraits.css";
import "./sandbox/noir/polish.css";
import "./app/noir-host.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
