# Contributing / extending the app

Read `ARCHITECTURE.md` first for the constraints. This file is the paved-path
guide for the common things you'll actually do. Stay on these paths and the
native-feel behavior (scroll restore, titles, theming, offline) keeps working
for free.

## Add a screen

1. Create `src/views/MyView.vue`.
2. Register it in `src/router.ts` with a **lazy import** and a `meta.title`:

   ```ts
   {
     path: "/my",
     name: "my",
     component: () => import("./views/MyView.vue"),
     meta: { title: "My Screen" }, // required — drives <title> + back label
   }
   ```

3. Link to it with `<LinkRow to="/my">My Screen ›</LinkRow>`.

The page title, back button, scroll save/restore, and code-splitting all work
automatically — no per-page wiring.

## Add a content/text page

Wrap the body in `<ContentPage>` for the standard centered, max-width column and
shared `.lead` / `.note` typography:

```vue
<ContentPage>
  <p class="lead">Intro paragraph.</p>
  <p class="note">Muted footnote.</p>
</ContentPage>
```

## Add a tappable button

Use `usePressed()` for instant touch feedback — `:active` lags on iOS because
Safari waits to disambiguate tap vs scroll:

```vue
<script setup lang="ts">
import { usePressed } from "../composables/usePressed";
const { pressed, on } = usePressed();
</script>

<template>
  <button :class="{ 'is-pressed': pressed }" v-on="on">Tap</button>
</template>
```

Pair `.is-pressed` with `:active` in CSS so keyboard/mouse activation is covered too.

## Use colors

Always use the theme tokens so light/dark just works:

`var(--surface)`, `var(--on-surface)`, `var(--muted)`, `var(--accent)`,
`var(--input-bg)`, `var(--input-border)`, `var(--hairline)`.

Don't hard-code hex colors in component styles. To **add** a token, define it in
*both* the `:root` (dark default) and the `@media (prefers-color-scheme: light)`
blocks of `src/style.css`.

To **change a surface color**, edit `theme.js` *and* the matching `--surface`
token in `src/style.css` — `npm run check-theme` enforces that they agree.

## Rebrand (logo, icons, splash)

1. Replace `public/logo.svg`.
2. `npm run generate-pwa-assets` — favicon, apple-touch-icon, maskable/PWA icons.
3. `npm run generate-pwa-splash` — iOS launch screens (also rerun after a
   `theme.js` color change).

`generate-pwa-assets` also runs as part of `npm run build`.

## Scripts

```bash
npm run dev                   # dev server
npm run build                 # check-theme + type-check + production build
npm run preview               # serve the production build
npm run check-theme           # verify theme.js and style.css colors match
npm run generate-pwa-assets   # regenerate icons from public/logo.svg
npm run generate-pwa-splash   # regenerate iOS splash screens
```

## Testing PWA behavior

PWA features (offline, install, update prompt) only run in a **production build
over HTTPS or `localhost`**: `npm run build && npm run preview`, then open the
network URL on the device and use Safari's **Share → Add to Home Screen**.

To exercise the update flow quickly, build with a short SW poll interval:

```bash
VITE_SW_POLL_INTERVAL=10000 npm run build && npm run preview
```

Then background and reopen the installed app — `pwa.ts` re-checks on foreground.
