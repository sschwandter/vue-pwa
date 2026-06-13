import { createRouter, createWebHistory } from "vue-router";
import HomeView from "./views/HomeView.vue";

// Per-route #app scroll offsets, saved on leave and restored on return.
const scrollPositions = new Map<string, number>();

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { title: "Vue PWA" },
    },
    {
      // Lazy-loaded so it ships as its own chunk — the realistic shape once an
      // app has several screens.
      path: "/about",
      name: "about",
      component: () => import("./views/AboutView.vue"),
      meta: { title: "About" },
    },
    {
      path: "/info",
      name: "info",
      component: () => import("./views/InfoView.vue"),
      meta: { title: "Info" },
    },
  ],
  // The app scrolls inside #app, not the window, so vue-router's default
  // (window-based) scroll handling does nothing here. Save/restore the #app
  // scroll position ourselves: top on forward nav, previous offset on back.
  scrollBehavior(to) {
    const el = document.getElementById("app");
    if (!el) return;
    const top = scrollPositions.get(to.fullPath) ?? 0;
    // Wait a frame so the incoming view is laid out before we scroll.
    requestAnimationFrame(() => el.scrollTo({ top }));
  },
});

router.beforeEach((_to, from) => {
  const el = document.getElementById("app");
  if (el) scrollPositions.set(from.fullPath, el.scrollTop);
});

router.afterEach((to) => {
  document.title = (to.meta.title as string | undefined) ?? "Vue PWA";
});

// A failed dynamic import after a deploy means the requested route chunk no
// longer exists on the server (the user is on a stale build). Reload once at
// the target path to fetch the current build; a sessionStorage guard prevents
// a reload loop if it's a genuine failure.
const CHUNK_RELOAD_GUARD = "chunk-reload";
router.onError((error, to) => {
  const message = String((error as Error)?.message ?? error);
  const isStaleChunk =
    /dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(
      message
    );
  if (isStaleChunk && to.fullPath && !sessionStorage.getItem(CHUNK_RELOAD_GUARD)) {
    sessionStorage.setItem(CHUNK_RELOAD_GUARD, "1");
    window.location.assign(to.fullPath);
  }
});
router.afterEach(() => sessionStorage.removeItem(CHUNK_RELOAD_GUARD));

export default router;
