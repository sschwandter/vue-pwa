<script setup lang="ts">
import { applyUpdate, needRefresh } from "../pwa";

const reload = () => applyUpdate();

const dismiss = () => {
  needRefresh.value = false;
};
</script>

<template>
  <Transition name="toast">
    <div v-if="needRefresh" class="update-toast" role="status" aria-live="polite">
      <span class="update-toast__text">A new version is available.</span>
      <div class="update-toast__actions">
        <button class="update-toast__reload" @click="reload">Reload</button>
        <button
          class="update-toast__dismiss"
          aria-label="Dismiss"
          @click="dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.update-toast {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(16px + env(safe-area-inset-bottom));
  z-index: 1000;

  display: flex;
  align-items: center;
  gap: 16px;
  max-width: min(
    420px,
    calc(100vw - 32px - env(safe-area-inset-left) - env(safe-area-inset-right))
  );
  padding: 12px 12px 12px 18px;

  border-radius: 14px;
  background: rgba(40, 40, 42, 0.92);
  color: #fff;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
}

.update-toast__text {
  font-size: 0.95rem;
}

.update-toast__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.update-toast__reload {
  padding: 8px 16px;
  border: none;
  border-radius: 10px;
  background-color: #0a84ff;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
}

.update-toast__reload:active {
  background-color: #0066cc;
  transform: scale(0.97);
}

.update-toast__dismiss {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  cursor: pointer;
  touch-action: manipulation;
}

.update-toast__dismiss:active {
  background: rgba(255, 255, 255, 0.12);
}

/* Slide up + fade in. The global prefers-reduced-motion rule in style.css
   collapses these transitions to ~instant when the user asks for less motion. */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 16px);
}
</style>
