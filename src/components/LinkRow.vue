<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

defineProps<{ to: RouteLocationRaw }>();
</script>

<template>
  <RouterLink class="link-row" :to="to"><slot /></RouterLink>
</template>

<style scoped>
.link-row {
  display: inline-block;
  color: var(--accent);
  text-decoration: none;
  font-size: 1rem;
  padding: 12px 0;
  touch-action: manipulation;
}
</style>
