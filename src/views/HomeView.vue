<script setup lang="ts">
import { ref } from "vue";
import LinkRow from "../components/LinkRow.vue";
import { usePressed } from "../composables/usePressed";

const message = ref("Welcome to Vue PWA!");
const inputText = ref("");

const { pressed, on: pressEvents } = usePressed();

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
        v-on="pressEvents"
        @click="updateMessage"
      >
        Update
      </button>
    </div>

    <p class="instructions">
      This is a PWA optimized for iOS. Try adding it to your home screen!

      blage loijdsf oisdf oiblage loijdsf oisdf oisdfo is dfso ifudsoifu osdiufdosf oi sdfo is dfso ifudsoifu osdiufdosf oi
      blage loijdsf oisdf oiblage loijdsf oisdf oisdfo is dfso ifudsoifu osdiufdosf oi sdfo is dfso ifudsoifu osdiufdosf oi
      blage loijdsf oisdf oiblage loijdsf oisdf oisdfo is dfso ifudsoifu osdiufdosf oi sdfo is dfso ifudsoifu osdiufdosf oi
      blage loijdsf oisdf oiblage loijdsf oisdf oisdfo is dfso ifudsoifu osdiufdosf oi sdfo is dfso ifudsoifu osdiufdosf oi
      blage loijdsf oisdf oiblage loijdsf oisdf oisdfo is dfso ifudsoifu osdiufdosf oi sdfo is dfso ifudsoifu osdiufdosf oi
      blage loijdsf oisdf oiblage loijdsf oisdf oisdfo is dfso ifudsoifu osdiufdosf oi sdfo is dfso ifudsoifu osdiufdosf oi
      blage loijdsf oisdf oiblage loijdsf oisdf oisdfo is dfso ifudsoifu osdiufdosf oi sdfo is dfso ifudsoifu osdiufdosf oi
      blage loijdsf oisdf oiblage loijdsf oisdf oisdfo is dfso ifudsoifu osdiufdosf oi sdfo is dfso ifudsoifu osdiufdosf oi
      blage loijdsf oisdf oiblage loijdsf oisdf oisdfo is dfso ifudsoifu osdiufdosf oi sdfo is dfso ifudsoifu osdiufdosf oi
      blage loijdsf oisdf oiblage loijdsf oisdf oisdfo is dfso ifudsoifu osdiufdosf oi sdfo is dfso ifudsoifu osdiufdosf oi
      blage loijdsf oisdf oiblage loijdsf oisdf oisdfo is dfso ifudsoifu osdiufdosf oi sdfo is dfso ifudsoifu osdiufdosf oi
      blage loijdsf oisdf oiblage loijdsf oisdf oisdfo is dfso ifudsoifu osdiufdosf oi sdfo is dfso ifudsoifu osdiufdosf oi
      blage loijdsf oisdf oiblage loijdsf oisdf oisdfo is dfso ifudsoifu osdiufdosf oi sdfo is dfso ifudsoifu osdiufdosf oi
      blage loijdsf oisdf oiblage loijdsf oisdf oisdfo is dfso ifudsoifu osdiufdosf oi sdfo is dfso ifudsoifu osdiufdosf oi
      blage loijdsf oisdf oiblage loijdsf oisdf oisdfo is dfso ifudsoifu osdiufdosf oi sdfo is dfso ifudsoifu osdiufdosf oi
    </p>

    <LinkRow to="/about">About this app ›</LinkRow>
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

/* .is-pressed (pointer-driven, see usePressed) gives instant touch feedback;
   :active keeps keyboard/mouse activation covered. */
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
</style>
