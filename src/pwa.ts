import { ref } from "vue";
import { registerSW } from "virtual:pwa-register";

// Registers the service worker once for the whole app and exposes reactive
// update state. With registerType "prompt" the new SW waits, so we surface it
// via `needRefresh` (see UpdateToast.vue) instead of reloading automatically.
export const needRefresh = ref(false);

let registration: ServiceWorkerRegistration | undefined;
let pollTimer: ReturnType<typeof setInterval> | undefined;

// How often to poll for a new service worker while the app stays open.
// Defaults to hourly; override via the VITE_SW_POLL_INTERVAL env var (ms) for a
// fast test loop, e.g. `VITE_SW_POLL_INTERVAL=10000 npm run build`.
const UPDATE_POLL_INTERVAL =
  Number(import.meta.env.VITE_SW_POLL_INTERVAL) || 60 * 60 * 1000;

const updateSW = registerSW({
  onNeedRefresh() {
    needRefresh.value = true;
  },
  onRegisteredSW(_swUrl, swRegistration) {
    registration = swRegistration;
    if (registration && !pollTimer) {
      pollTimer = setInterval(checkForUpdate, UPDATE_POLL_INTERVAL);
    }
  },
});

// Re-check whenever the app returns to the foreground. This is the main
// trigger on iOS, where a standalone PWA resumes from a frozen state instead
// of reloading (so the hourly poll above may not have fired). Backgrounding
// and reopening the app is also the quickest way to test the update flow.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    checkForUpdate();
  }
});

/** Activate the waiting service worker and reload into the new version. */
export function applyUpdate() {
  return updateSW(true);
}

/**
 * Ask the browser to re-check the service worker script. If a newer one is
 * found it installs and (in prompt mode) waits, flipping `needRefresh`.
 */
async function checkForUpdate() {
  if (!registration || registration.installing || !navigator.onLine) return;
  try {
    await registration.update();
  } catch {
    // Offline or a transient network error — the next navigation retries.
  }
}
