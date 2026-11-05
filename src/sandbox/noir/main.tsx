import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./noir.css";
import "./forms.css";
import "./navfilters.css";
import "./recruit.css";
import "./portraits.css";
import "./ds.css";
import "./polish.css";
import { Sandbox } from "./sandbox";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Sandbox />
  </StrictMode>,
);
