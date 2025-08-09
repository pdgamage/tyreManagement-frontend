import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: "localhost",
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'pdf-libs': ['jspdf', 'jspdf-autotable'],
        },
      },
    },
  },
});
