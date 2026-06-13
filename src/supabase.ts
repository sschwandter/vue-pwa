import type { SupabaseClient } from "@supabase/supabase-js";

// Cloud sync is entirely optional. It turns on only when both env vars are set
// at build time (see .env.example); otherwise the app runs fully local and
// offline with no account and no network calls.
//
// These values are public by design (the publishable key is meant to ship in
// the client); Row Level Security on the database is what protects user data.
// Never put a *secret* (sb_secret_…) / service-role key or any private secret
// in here.
const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSyncConfigured = Boolean(url && publishableKey);

let client: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient | null> | null = null;

/**
 * Lazily create (once) and return the Supabase client, or `null` when sync
 * isn't configured. The SDK is loaded via dynamic `import()` so it lands in its
 * own chunk and never runs in local-only builds — the main bundle stays lean.
 */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSyncConfigured) return Promise.resolve(null);
  if (client) return Promise.resolve(client);
  if (!initPromise) {
    initPromise = import("@supabase/supabase-js")
      .then(({ createClient }) => {
        client = createClient(url!, publishableKey!, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            // The magic-link callback returns with the session in the URL hash;
            // let the client pick it up on load.
            detectSessionInUrl: true,
          },
        });
        return client;
      })
      .catch((e) => {
        // SDK chunk unavailable (e.g. offline cold start, since it's excluded
        // from the precache). Resolve to null and clear the promise so a later
        // call — once back online — can retry the load.
        console.warn("[supabase] failed to load SDK:", e);
        initPromise = null;
        return null;
      });
  }
  return initPromise;
}
