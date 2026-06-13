import { ref } from "vue";
import type { Provider, User } from "@supabase/supabase-js";
import { getSupabase } from "../supabase";

/** OAuth providers the Account screen offers. Must also be enabled in the
 *  Supabase dashboard (Authentication → Providers). Add more here as needed. */
export type OAuthProvider = Extract<Provider, "google">;

/** Minimal view of the signed-in user the app cares about. */
export type AuthUser = { id: string; email: string | null };

const toUser = (u: User | null): AuthUser | null =>
  u ? { id: u.id, email: u.email ?? null } : null;

// Module-scoped so the whole app shares one auth state. `null` user = signed
// out (or sync not configured). `ready` flips true once we've resolved the
// initial session, so UI can avoid flashing the signed-out state on load.
const user = ref<AuthUser | null>(null);
const ready = ref(false);

// Resolve the persisted session (and any OAuth redirect in the URL), then track
// sign-in / sign-out / token refresh for the app's lifetime. No-ops — and never
// loads the SDK — when sync isn't configured.
async function initAuth() {
  const sb = await getSupabase();
  if (!sb) {
    ready.value = true;
    return;
  }
  const { data } = await sb.auth.getSession();
  user.value = toUser(data.session?.user ?? null);
  ready.value = true;
  sb.auth.onAuthStateChange((_event, session) => {
    user.value = toUser(session?.user ?? null);
  });
}
void initAuth();

export function useAuth() {
  /**
   * Start an OAuth sign-in. Redirects to the provider, which returns to the
   * current URL where `detectSessionInUrl` completes the session. No email is
   * sent, so this sidesteps the email rate limit entirely.
   */
  const signInWithOAuth = async (provider: OAuthProvider) => {
    const sb = await getSupabase();
    if (!sb) throw new Error("Cloud sync is not configured.");
    const { error } = await sb.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.href },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const sb = await getSupabase();
    if (sb) await sb.auth.signOut();
  };

  return { user, ready, signInWithOAuth, signOut };
}

// Exported for non-component modules (e.g. useHabits) that need to react to
// auth changes without going through the composable's return shape.
export { user as authUser };
