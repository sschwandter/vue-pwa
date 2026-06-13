<script setup lang="ts">
// A simple leaf page reached from About. Back navigation, scroll restore and
// the title all work automatically via the router/shell — no per-page wiring.
const rows = [
  ["Framework", "Vue 3 + TypeScript"],
  ["Build tool", "Vite"],
  ["PWA", "vite-plugin-pwa (Workbox)"],
  ["Routing", "vue-router"],
  ["Update model", "prompt + foreground checks"],
];
</script>

<template>
  <div class="info">
    <p class="lead">Build &amp; technology details for this demo.</p>

    <dl class="info-list">
      <div v-for="([label, value], i) in rows" :key="i" class="info-row">
        <dt>{{ label }}</dt>
        <dd>{{ value }}</dd>
      </div>
    </dl>

    <p class="note">Tap “About” to go back one step.</p>
  </div>
</template>

<style scoped>
.info {
  max-width: 520px;
  margin: 0 auto;
}

.lead {
  font-size: 1.05rem;
  margin-top: 0;
}

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

.note {
  color: var(--muted);
  font-size: 0.9rem;
  margin-top: 1.5rem;
}
</style>
