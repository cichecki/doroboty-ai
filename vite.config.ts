import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: {
    rollupOptions: {
      // aplikacja + osobna strona design systemu (noir)
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        "design-system": fileURLToPath(new URL("./design-system.html", import.meta.url)),
      },
    },
  },
});
