import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import { surface } from "./theme.js";

// Inject the light/dark status-bar tint from the shared theme so the colors
// live in one place (theme.js) rather than being hand-copied into index.html.
// These come first so iOS (which uses the first matching meta) picks them;
// vite-plugin-pwa also emits a media-less fallback from manifest.theme_color
// (= surface.light), which only applies if neither media query matches.
const themeColorMeta: Plugin = {
  name: "inject-theme-color",
  transformIndexHtml: () => [
    {
      tag: "meta",
      attrs: { name: "theme-color", content: surface.light, media: "(prefers-color-scheme: light)" },
      injectTo: "head",
    },
    {
      tag: "meta",
      attrs: { name: "theme-color", content: surface.dark, media: "(prefers-color-scheme: dark)" },
      injectTo: "head",
    },
  ],
};

// https://vitejs.dev/config/
export default defineConfig({
  server: { host: true },
  preview: {
    allowedHosts: ["clean-sunglasses-compromise-boat.trycloudflare.com"],
  },
  plugins: [
    vue(),
    themeColorMeta,
    VitePWA({
      registerType: "prompt",
      workbox: {
        // The iOS launch screens are only needed at app launch (read straight
        // from the device), so keep them out of the precache — otherwise the
        // ~30 splash PNGs would bloat the offline bundle.
        globIgnores: ["**/apple-splash/**"],
        // Once the user accepts the update prompt and the new SW skips waiting,
        // claim the open page so `controllerchange` fires and vite-plugin-pwa
        // actually reloads. Without this, "Reload" skips waiting silently and
        // the page never refreshes. (skipWaiting stays false — still a prompt.)
        clientsClaim: true,
      },
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
        background_color: surface.dark,
        theme_color: surface.light,
      },
    }),
  ],
});
