/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** Service-worker update poll interval in ms. Defaults to hourly if unset. */
  readonly VITE_SW_POLL_INTERVAL?: string;
}
