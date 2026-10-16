import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/*
 * Host and port come from .env, so the uat and production branches share
 * this file and differ only in their .env (Raj, 16.10, items 2-4):
 *
 *   UAT         APP_ALLOWED_HOSTS=sandbox-billkidhar.svkm.ac.in   APP_PORT=5173
 *   Production  APP_ALLOWED_HOSTS=billkidhar.svkm.ac.in           APP_PORT=5174
 *
 * APP_ALLOWED_HOSTS takes a comma-separated list. Neither variable starts
 * with VITE_, so neither is bundled into the app. Without them, local
 * development behaves as before: port 5173, localhost only.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.APP_PORT) || 5173;
  const allowedHosts = (env.APP_ALLOWED_HOSTS || "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  const hosts = allowedHosts.length ? { allowedHosts } : {};

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port,
      strictPort: true, // fail rather than move to another port
      ...hosts,
    },
    preview: {
      port,
      strictPort: true,
      ...hosts,
    },
  };
});
