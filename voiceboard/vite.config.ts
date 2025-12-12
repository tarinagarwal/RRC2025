import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
      process: "process/browser", // 👈 add polyfill
    },
  },
  define: {
    "process.env": {}, // 👈 stops crashes when Excalidraw checks env vars
  },
  server: {
    port: 6969,
    proxy: {
      "/api/trpc": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
