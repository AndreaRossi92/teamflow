import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: command === "build" ? "/teamflow/" : "/",
    plugins: [react()],
    server: {
      port: 5173,
      host: "0.0.0.0",
      watch: {
        usePolling: true,
        interval: 1000,
      },
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./vitest-setup.ts"],
      globals: true,
      env: {
        VITE_DEMO_MODE: "false",
      },
    },
  };
});
