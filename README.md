# Vue iOS PWA

A minimal Vue 3 + TypeScript + Vite progressive web app tuned to feel as
native as possible when installed to the iOS home screen.

This repo is meant to be used as a **template**. Before building on it:

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — load-bearing invariants (what not to
  change and why). Read this first.
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — the paved-path guide for adding
  screens, components, colors, and branding.

## Use-as-template checklist

Rename these placeholders before shipping your own app:

- [ ] `vite.config.ts` → remove the personal tunnel host in `preview.allowedHosts`.
- [ ] `vite.config.ts` → manifest `name`, `short_name`, `description`.
- [ ] `index.html` → `apple-mobile-web-app-title` and `<title>`.
- [ ] `package.json` → `name`.
- [ ] `public/logo.svg` → your logo, then `npm run generate-pwa-assets &&
      npm run generate-pwa-splash`.

## What makes it iOS-friendly

- **Installable & standalone** — full web manifest (`display: standalone`,
  scope, start URL, background/theme colors) plus the Apple meta tags so it
  launches chromeless from the home screen.
- **Generated icons** — favicon, `apple-touch-icon`, and the maskable/PWA
  icons are produced from `public/logo.svg` by
  [`@vite-pwa/assets-generator`](https://vite-pwa-org.netlify.app/assets-generator/)
  and injected automatically (see `pwa-assets.config.ts`).
- **No rubber-band scroll** — the body is locked and a single `#app`
  container handles scrolling (`overscroll-behavior: none`).
- **Safe areas** — `viewport-fit=cover` with `env(safe-area-inset-*)` padding
  keeps content clear of the notch and home indicator.
- **No accidental zoom** — 16px inputs prevent focus-zoom and
  `touch-action: manipulation` removes the double-tap zoom / 300ms tap delay
  without disabling pinch-zoom (kept for accessibility).
- **Light & dark mode** — the UI and the status-bar `theme-color` both follow
  `prefers-color-scheme`.
- **Offline** — `vite-plugin-pwa` (`autoUpdate`) precaches the app shell and
  prompts to reload when a new version is available.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Regenerating icons

Edit `public/logo.svg` (or point `pwa-assets.config.ts` at a different source
image), then run:

```bash
npm run generate-pwa-assets
```

Icons are also generated automatically as part of `npm run build`.

## Testing the PWA on iOS

The PWA features only run in a production build over HTTPS (or `localhost`).
Run `npm run build && npm run preview`, open the network URL on the device, and
use Safari's **Share → Add to Home Screen**.
