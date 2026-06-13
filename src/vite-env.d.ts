/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** Service-worker update poll interval in ms. Defaults to hourly if unset. */
  readonly VITE_SW_POLL_INTERVAL?: string;
  /** Supabase project URL — enables optional cloud sync when set (with the key). */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase publishable key (sb_publishable_…) — safe to ship; RLS protects the data. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}
