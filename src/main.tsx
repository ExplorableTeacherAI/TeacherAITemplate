import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeTheme, setupThemeListener } from "./lib/theme.ts";

// Initialize theme before rendering
initializeTheme();
setupThemeListener();

const Root = import.meta.env.PROD ? (
  <StrictMode>
    <App />
  </StrictMode>
) : (
  <App />
);

createRoot(document.getElementById("root")!).render(Root);
