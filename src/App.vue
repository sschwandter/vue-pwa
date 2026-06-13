<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import UpdateToast from "./components/UpdateToast.vue";

const route = useRoute();
const router = useRouter();

const isHome = computed(() => route.name === "home");
const title = computed(() => route.meta.title);

// iOS shows the previous screen's title on the back button (collapsing to a
// generic "Back" when it's missing or too long). Resolve it from the history
// entry we'd return to; depends on route.fullPath so it recomputes per nav.
const backLabel = computed(() => {
  void route.fullPath;
  const backPath = window.history.state?.back;
  if (typeof backPath === "string") {
    const previousTitle = router.resolve(backPath).meta.title;
    if (previousTitle && previousTitle.length <= 14) return previousTitle;
  }
  return "Back";
});

// iOS standalone PWAs have no system back gesture, so provide our own. Prefer
// real history (preserves scroll/state); fall back to home when there's none —
// e.g. the user cold-launched directly onto this route.
const goBack = () => {
  if (window.history.state?.back) router.back();
  else router.push("/");
};
</script>

<template>
  <div class="app-shell">
    <header class="nav-bar">
      <div class="nav-bar__row">
        <button
          v-if="!isHome"
          class="nav-bar__back"
          @click="goBack"
          :aria-label="`Back to ${backLabel}`"
        >
          <svg
            class="nav-bar__chevron"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M15 4 L7 12 L15 20"
              fill="none"
              stroke="currentColor"
              stroke-width="2.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {{ backLabel }}
        </button>
        <h1 class="nav-bar__title">{{ title }}</h1>
      </div>
    </header>

    <main class="app-content">
      <RouterView />
    </main>

    <UpdateToast />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--surface);
  color: var(--on-surface);
}

/* Sticky translucent nav bar that extends up under the status bar. The
   safe-area padding lives on the bar; the fixed-height row inside centers the
   title and back button together so they always share a baseline. */
.nav-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  padding-top: env(safe-area-inset-top);
  padding-left: calc(8px + env(safe-area-inset-left));
  padding-right: calc(8px + env(safe-area-inset-right));
  border-bottom: 1px solid var(--hairline);
  background-color: color-mix(in srgb, var(--surface) 80%, transparent);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
}

.nav-bar__row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
}

.nav-bar__title {
  font-size: 1.0625rem; /* iOS 17pt */
  font-weight: 600;
  line-height: 1;
  margin: 0;
}

.nav-bar__back {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 0 8px 0 4px;
  border: none;
  background: transparent;
  color: var(--accent);
  font-size: 1.0625rem;
  line-height: 1;
  cursor: pointer;
  touch-action: manipulation;
}

.nav-bar__chevron {
  width: 1.1em;
  height: 1.1em;
  margin-right: 2px;
  flex: none;
}

.app-content {
  flex: 1;
  padding: 20px;
  padding-left: calc(20px + env(safe-area-inset-left));
  padding-right: calc(20px + env(safe-area-inset-right));
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}
</style>
