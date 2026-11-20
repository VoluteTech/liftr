import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    react(),
    tailwind(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Liftr — Exercise Ladder",
        short_name: "Liftr",
        start_url: "/",
        display: "standalone",
        theme_color: "#1f211b",
        background_color: "#1f211b",
        icons: [192, 512].map((size) => ({
          src: `/liftr-${size}.png`,
          sizes: `${size}x${size}`,
          type: "image/png",
        })),
      },
    }),
  ],
});
