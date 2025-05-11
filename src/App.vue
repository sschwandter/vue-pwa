<script setup lang="ts">
import { ref, onMounted } from "vue";

const message = ref("Welcome to Vue PWA!");
const inputText = ref("");

const updateMessage = () => {
  message.value = inputText.value || "Welcome to Vue PWA!";
};

onMounted(() => {
  let lastTap = 0;
  const doubleTapDelay = 300;

  document.addEventListener(
    "touchend",
    (e) => {
      const target = e.target as HTMLElement;
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;

      // Only prevent default on double tap of non-input elements
      if (tapLength < doubleTapDelay && tapLength > 0) {
        if (
          !(
            target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement
          )
        ) {
          e.preventDefault();
        }
      }
      lastTap = currentTime;
    },
    { passive: false }
  );

  // Handle input focus
  // document.addEventListener(
  //   "focus",
  //   (e) => {
  //     if (
  //       e.target instanceof HTMLInputElement ||
  //       e.target instanceof HTMLTextAreaElement
  //     ) {
  //       e.target.scrollIntoView({ behavior: "smooth", block: "center" });
  //     }
  //   },
  //   true
  // );
});
</script>

<template>
  <div class="app-container">
    <header>
      <h1>{{ message }}</h1>
    </header>

    <main>
      <div class="input-group">
        <input
          type="text"
          v-model="inputText"
          placeholder="Type something..."
          @keyup.enter="updateMessage"
          @blur="updateMessage"
        />
        <button @click="updateMessage">Update</button>
      </div>

      <p class="instructions">
        This is a PWA optimized for iOS. Try adding it to your home screen!
      </p>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f5f5f5;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y pinch-zoom;
}

header {
  text-align: center;
  margin-bottom: 2rem;
  padding-top: env(safe-area-inset-top);
}

h1 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
  padding: 0;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 300px;
  position: relative;
  z-index: 1;
}

input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
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
  touch-action: manipulation;
}

button:active {
  background-color: #45a049;
  transform: scale(0.98);
}

.instructions {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  max-width: 300px;
  margin: 0;
  padding: 0;
}
</style>
