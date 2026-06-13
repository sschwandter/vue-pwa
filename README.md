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
- **No page-level rubber-band, native bounce kept** — the body is locked
  (`overflow: hidden`) so the page can never rubber-band, while the single
  `#app` scroll container uses `overscroll-behavior: contain` to keep the
  native elastic bounce inside the content.
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

## Optional: cloud sync across devices

The habit tracker works fully offline with no account — habits live in
`localStorage`. Cloud sync (accounts + cross-device sync) is **opt-in** and off
unless you provide [Supabase](https://supabase.com) credentials at build time.

To enable it:

1. Create a Supabase project, then run the SQL in `supabase/migrations/` in its
   SQL editor — `0001_habits.sql` (the `habits` table, Row Level Security
   policies, realtime publication) and `0002_habits_updated_at.sql` (the
   server-side `updated_at` trigger).
2. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_PUBLISHABLE_KEY` (Project Settings → API). Both are public;
   **never** add a secret (`sb_secret_…`) / service-role key.
3. Enable a sign-in provider under **Authentication → Providers** — Google
   and/or Apple (the **Account & sync** screen offers both). Each needs its
   OAuth client configured per Supabase's provider docs.
4. In **Authentication → URL Configuration**, set the **Site URL** and add your
   app origin(s) to the redirect allow-list (e.g. `http://localhost:5173` for
   dev and your production URL) so OAuth is allowed to return to the app.
5. `npm run dev` (or build) — the **Account & sync** screen now offers
   "Continue with Apple/Google". Sign in with the *same* provider each time
   (a different provider may create a separate account). Once signed in, habits
   sync across devices and stay cached locally for offline use.

How it works: `localStorage` is the offline working copy; Supabase is the
reconciliation layer. Changes push on edit and a full pull/merge runs on
sign-in, on reconnect, and when the app returns to the foreground. Conflicts
resolve per-record, last-write-wins (`src/composables/useHabits.ts`,
`useAuth.ts`, `src/supabase.ts`). Leave the env vars unset and none of the
Supabase SDK ships in the build.
