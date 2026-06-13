<script setup lang="ts">
// Shared layout for text/content screens: a centered, max-width column with
// common typography for an intro `.lead` and a muted `.note`, applied to
// slotted content so individual pages don't repeat it.
</script>

<template>
  <div class="content-page"><slot /></div>
</template>

<style scoped>
.content-page {
  max-width: 520px;
  margin: 0 auto;
}

.content-page :slotted(.lead) {
  font-size: 1.05rem;
  margin-top: 0;
}

.content-page :slotted(.note) {
  color: var(--muted);
  font-size: 0.9rem;
}
</style>
