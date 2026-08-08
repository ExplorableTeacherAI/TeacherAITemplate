import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeTheme, setupThemeListener } from "./lib/theme.ts";
import { initEmbedRecorder } from "./lib/embedRecorder.ts";
import { installEEStateBridge } from "./lib/eeState.ts";

// Initialize theme before rendering
initializeTheme();
setupThemeListener();

// When embedded in the student tutor page, mirror in-iframe activity into the
// tutor's rrweb screen recording (best-effort, no-op when not embedded)
initEmbedRecorder();

// Expose the variable store as window.__eeState for the verification harness
installEEStateBridge();

const Root = import.meta.env.PROD ? (
  <StrictMode>
    <App />
  </StrictMode>
) : (
  <App />
);

createRoot(document.getElementById("root")!).render(Root);
