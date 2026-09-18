import { defineConfig, searchForWorkspaceRoot } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

// node_modules is a symlink into the shared install (see cacheDir note below).
// Vite serves assets referenced from those deps (e.g. KaTeX webfonts in
// katex.min.css) via /@fs/ URLs at their REAL path, which sits outside the
// workspace root — the default server.fs.allow sandbox then 403s them and
// math silently falls back to system fonts (KaTeX \imath/\jmath render as
// missing-glyph boxes). Allow the resolved shared install explicitly.
const realNodeModules = (() => {
  try {
    return fs.realpathSync(path.resolve(__dirname, "node_modules"));
  } catch {
    return path.resolve(__dirname, "node_modules");
  }
})();

// https://vitejs.dev/config/
//  If we want to deploy to the github pages without custom domain use this 
// base: mode === "development" ? "/" : "/MathVibeTemplate",

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ['.mathvibe.online', '.mathvibe.xyz', '.mathvibe.space'],
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), realNodeModules],
    },
  },
  // Workspaces symlink node_modules to a shared install, so the default cache
  // location (node_modules/.vite) would be SHARED by every workspace's dev
  // server — concurrent servers clobber each other's optimize metadata, which
  // serves mixed-hash bundles (duplicate React) and blank pages. Keep the
  // cache inside each workspace instead.
  cacheDir: ".vite_cache",
  // Pre-bundle every library a generated explorable might import. Without this,
  // the first explorable that pulls in a not-yet-optimized dep (mafs, three, …)
  // triggers a mid-session re-optimization and a forced full-page reload, which
  // shows up to students as the explorable going blank until they refresh.
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "framer-motion",
      "mafs",
      "katex",
      "d3",
      "rrweb",
      "zustand",
      "immer",
      "zundo",
      "lucide-react",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "konva",
      "react-konva",
      "recharts",
      "two.js",
      "@xyflow/react",
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
    ],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
}));
