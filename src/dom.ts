/**
 * The app renders into and scrolls inside a single fixed container (see the
 * `#app` element in index.html and the mount in main.ts). Centralized here so
 * the id isn't a magic string scattered across the router and mount call.
 */
export const APP_SCROLL_ID = "app";

export const getScroller = (): HTMLElement | null =>
  document.getElementById(APP_SCROLL_ID);
