<script setup lang="ts">
import ContentPage from "../components/ContentPage.vue";

// A simple leaf page reached from About. Back navigation, scroll restore and
// the title all work automatically via the router/shell — no per-page wiring.
const rows = [
  ["Framework", "Vue 3 + TypeScript"],
  ["Build tool", "Vite"],
  ["PWA", "vite-plugin-pwa (Workbox)"],
  ["Routing", "vue-router"],
  ["Update model", "prompt + foreground checks"],
  ["Reload test", "✓ update applied"],
];
</script>

<template>
  <ContentPage>
    <p class="lead">Build &amp; technology details for this demo.</p>

    <dl class="info-list">
      <div v-for="([label, value], i) in rows" :key="i" class="info-row">
        <dt>{{ label }}</dt>
        <dd>{{ value }}</dd>
      </div>
    </dl>

    <p class="note info-note">Tap “FAQ” to go back one step.</p>
  </ContentPage>
</template>

<style scoped>
.info-list {
  margin: 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--hairline);
}

.info-row dt {
  color: var(--muted);
}

.info-row dd {
  margin: 0;
  text-align: right;
}

.info-note {
  margin-top: 1.5rem;
}
</style>
