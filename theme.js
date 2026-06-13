// Single source of truth for the app's surface colors, shared across the build:
// the web manifest and index.html theme-color metas (vite.config.ts) and the
// iOS splash generator (scripts/generate-splash.mjs). The CSS mirrors these in
// :root tokens in src/style.css (CSS can't import JS).
export const surface = {
  light: "#f5f5f5",
  dark: "#1c1c1e",
};
