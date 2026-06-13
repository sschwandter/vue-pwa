<script setup lang="ts">
import { computed, ref } from "vue";
import { useHabits } from "../composables/useHabits";
import { usePressed } from "../composables/usePressed";
import HabitRow from "../components/HabitRow.vue";
import LinkRow from "../components/LinkRow.vue";

const { habits, addHabit, removeHabit, toggleToday, isDoneToday, streak } =
  useHabits();

const draft = ref("");
const { pressed, on: pressEvents } = usePressed();

const doneCount = computed(
  () => habits.value.filter((h) => isDoneToday(h)).length
);

const submit = () => {
  addHabit(draft.value);
  draft.value = "";
};

const confirmRemove = (id: string, name: string) => {
  if (window.confirm(`Delete “${name}”? This clears its history.`)) {
    removeHabit(id);
  }
};
</script>

<template>
  <div class="home">
    <header>
      <h1>Today</h1>
      <p v-if="habits.length" class="summary">
        {{ doneCount }} of {{ habits.length }} done
      </p>
    </header>

    <div class="input-group">
      <input
        type="text"
        v-model="draft"
        placeholder="Add a habit…"
        enterkeyhint="done"
        autocomplete="off"
        autocapitalize="sentences"
        autocorrect="on"
        @keyup.enter="submit"
      />
      <button
        :class="{ 'is-pressed': pressed }"
        v-on="pressEvents"
        @click="submit"
      >
        Add
      </button>
    </div>

    <ul v-if="habits.length" class="habit-list">
      <li v-for="habit in habits" :key="habit.id">
        <HabitRow
          :name="habit.name"
          :done="isDoneToday(habit)"
          :streak="streak(habit)"
          @toggle="toggleToday(habit.id)"
          @remove="confirmRemove(habit.id, habit.name)"
        />
      </li>
    </ul>

    <p v-else class="empty">
      No habits yet. Add one above — tap the circle each day to keep your streak
      going. Everything is saved on this device and works offline.
    </p>

    <nav class="links">
      <LinkRow to="/account">Account &amp; sync ›</LinkRow>
      <LinkRow to="/faq">FAQ ›</LinkRow>
    </nav>
  </div>
</template>

<style scoped>
.home {
  max-width: 520px;
  margin: 0 auto;
}

header {
  margin-bottom: 1.5rem;
}

h1 {
  font-size: 1.5rem;
  color: inherit;
  margin: 0;
}

.summary {
  color: var(--muted);
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 1.5rem;
}

input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--on-surface);
  -webkit-appearance: none;
  appearance: none;
  touch-action: auto;
}

button {
  padding: 8px 16px;
  background-color: var(--accent);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  /* Removes the 300ms tap delay and double-tap zoom on this control. */
  touch-action: manipulation;
  transition: transform 0.1s ease, filter 0.1s ease;
}

/* .is-pressed (pointer-driven, see usePressed) gives instant touch feedback;
   :active keeps keyboard/mouse activation covered. */
button.is-pressed,
button:active {
  filter: brightness(0.9);
  transform: scale(0.94);
}

.habit-list {
  list-style: none;
  margin: 0 0 2rem;
  padding: 0;
  /* Top border so the first row's hairline reads as a full divider set. */
  border-top: 1px solid var(--hairline);
}

.empty {
  color: var(--muted);
  font-size: 0.9rem;
  margin: 0 0 2rem;
}

.links {
  display: flex;
  flex-direction: column;
}
</style>
