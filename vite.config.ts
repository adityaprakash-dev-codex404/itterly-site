import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

// Force production mode during build to prevent jsxDEV runtime errors on Vercel
if (process.env.VERCEL || process.argv.includes("build")) {
  process.env.NODE_ENV = "production";
}

export default defineConfig({
  plugins: [
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    react(),
  ],
  server: {
    host: "::",
    port: 8080,
  },
});
