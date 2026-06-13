<script setup lang="ts">
import { ref } from "vue";

const message = ref("Welcome to Vue PWA!");
const inputText = ref("");

// Drive the button's pressed state from pointer events: pointerdown fires the
// instant a finger touches (before iOS's tap/scroll disambiguation that makes
// :active lag), and pointercancel clears it if the gesture becomes a scroll.
const pressed = ref(false);

const updateMessage = () => {
  message.value = inputText.value || "Welcome to Vue PWA!";
};
</script>

<template>
  <div class="home">
    <header>
      <h1>{{ message }}</h1>
    </header>

    <div class="input-group">
      <input
        type="text"
        v-model="inputText"
        placeholder="Type something..."
        enterkeyhint="done"
        autocomplete="off"
        autocapitalize="sentences"
        autocorrect="on"
        @keyup.enter="updateMessage"
        @blur="updateMessage"
      />
      <button
        :class="{ 'is-pressed': pressed }"
        @click="updateMessage"
        @pointerdown="pressed = true"
        @pointerup="pressed = false"
        @pointercancel="pressed = false"
        @pointerleave="pressed = false"
      >
        Update
      </button>
    </div>

    <p class="instructions">
      This is a PWA optimized for iOS. Try adding it to your home screen!
    </p>

    <RouterLink class="link-row" to="/about">About this app ›</RouterLink>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

h1 {
  font-size: 1.5rem;
  color: inherit;
  margin: 0;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 300px;
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
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  /* Removes the 300ms tap delay and double-tap zoom on this control. */
  touch-action: manipulation;
  transition: transform 0.1s ease, background-color 0.1s ease;
}

/* .is-pressed (pointer-driven) gives instant touch feedback; :active keeps
   keyboard/mouse activation covered. */
button.is-pressed,
button:active {
  background-color: #3d8b40;
  transform: scale(0.94);
}

.instructions {
  text-align: center;
  color: var(--muted);
  font-size: 0.9rem;
  max-width: 300px;
  margin: 0 0 2rem;
}

.link-row {
  color: var(--accent);
  text-decoration: none;
  font-size: 1rem;
  padding: 12px;
  touch-action: manipulation;
}
</style>
