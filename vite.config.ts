import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  server: { host: true },
  preview: {
    allowedHosts: ["clean-sunglasses-compromise-boat.trycloudflare.com"],
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: "prompt",
      // Generates favicon, apple-touch-icon and the maskable/pwa icons from
      // public/logo.svg (see pwa-assets.config.ts) and injects the matching
      // <link> tags into index.html plus the icons into the manifest.
      pwaAssets: {
        config: true,
      },
      manifest: {
        name: "Vue PWA App",
        short_name: "Vue PWA",
        description: "Vue.js PWA Application",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        background_color: "#1c1c1e",
        theme_color: "#f5f5f5",
      },
    }),
  ],
});
