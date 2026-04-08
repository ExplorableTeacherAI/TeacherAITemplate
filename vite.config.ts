import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
//  If we want to deploy to the github pages without custom domain use this 
// base: mode === "development" ? "/" : "/MathVibeTemplate",

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ['.mathvibe.online', '.mathvibe.xyz', '.mathvibe.space'],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
}));
