<script setup lang="ts">
import { usePressed } from "../composables/usePressed";

defineProps<{ name: string; done: boolean; streak: number }>();
const emit = defineEmits<{ toggle: []; remove: [] }>();

const { pressed, on } = usePressed();
</script>

<template>
  <div class="habit-row">
    <button
      class="habit-row__toggle"
      :class="{ 'is-pressed': pressed, 'is-done': done }"
      v-on="on"
      @click="emit('toggle')"
      :aria-pressed="done"
      :aria-label="done ? `Mark ${name} not done` : `Mark ${name} done`"
    >
      <span class="habit-row__check" aria-hidden="true">
        <svg v-if="done" viewBox="0 0 24 24">
          <path
            d="M5 13 L10 18 L19 7"
            fill="none"
            stroke="currentColor"
            stroke-width="2.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <span class="habit-row__name" :class="{ 'is-done': done }">{{ name }}</span>
      <span v-if="streak > 0" class="habit-row__streak">🔥 {{ streak }}</span>
    </button>

    <button
      class="habit-row__remove"
      @click="emit('remove')"
      :aria-label="`Delete ${name}`"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6 6 L18 18 M18 6 L6 18"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.habit-row {
  display: flex;
  align-items: stretch;
  gap: 4px;
  border-bottom: 1px solid var(--hairline);
}

.habit-row__toggle {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 4px;
  border: none;
  background: transparent;
  color: var(--on-surface);
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  /* Removes the 300ms tap delay / double-tap zoom on this control. */
  touch-action: manipulation;
  transition: transform 0.1s ease;
}

/* .is-pressed (pointer-driven, see usePressed) gives instant touch feedback;
   :active keeps keyboard/mouse activation covered. */
.habit-row__toggle.is-pressed,
.habit-row__toggle:active {
  transform: scale(0.98);
}

.habit-row__check {
  flex: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid var(--input-border);
  display: grid;
  place-items: center;
  color: #fff;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.habit-row__toggle.is-done .habit-row__check {
  background-color: var(--accent);
  border-color: var(--accent);
}

.habit-row__check svg {
  width: 16px;
  height: 16px;
}

.habit-row__name {
  flex: 1;
  min-width: 0;
}

.habit-row__name.is-done {
  color: var(--muted);
  text-decoration: line-through;
}

.habit-row__streak {
  flex: none;
  color: var(--muted);
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}

.habit-row__remove {
  flex: none;
  display: grid;
  place-items: center;
  width: 40px;
  border: none;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  touch-action: manipulation;
}

.habit-row__remove svg {
  width: 18px;
  height: 18px;
}
</style>
