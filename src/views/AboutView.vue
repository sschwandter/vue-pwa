<script setup lang="ts">
import ContentPage from "../components/ContentPage.vue";
import LinkRow from "../components/LinkRow.vue";

// The native-feel techniques this demo applies, listed so the page has enough
// content to scroll (handy for checking scroll save/restore on back nav).
const features = [
  "Chromeless standalone launch with safe-area-aware layout",
  "No rubber-band page scroll — a single fixed scroll container",
  "Instant, pointer-driven button press feedback",
  "Light / dark theming that follows the system appearance",
  "Generated icons and per-device launch screens",
  "In-app update prompt with foreground update checks",
  "Persistent storage requested on startup",
  "Landscape-safe insets for the notch / Dynamic Island",
  "Honors Reduce Motion",
  "Back navigation that doesn't rely on the (absent) system gesture",
];
</script>

<template>
  <ContentPage>
    <p class="lead">
      A minimal Vue 3 PWA tuned to feel as native as possible when installed to
      the iOS home screen.
    </p>

    <h2>What makes it feel native</h2>
    <ul class="feature-list">
      <li v-for="(feature, i) in features" :key="i">{{ feature }}</li>
    </ul>

    <p class="note">
      Scroll down and tap “Back” — the home screen restores its previous scroll
      position, and this page returns to the top next time you open it.
    </p>

    <LinkRow to="/info">Info ›</LinkRow>
  </ContentPage>
</template>

<style scoped>
h2 {
  font-size: 1rem;
  margin: 1.5rem 0 0.5rem;
}

.feature-list {
  margin: 0;
  padding-left: 1.2rem;
  line-height: 1.7;
}
</style>
