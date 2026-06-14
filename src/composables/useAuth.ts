import { ref } from "vue";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "../supabase";

/** Minimal view of the signed-in user the app cares about. */
export type AuthUser = { id: string; email: string | null };

const toUser = (u: User | null): AuthUser | null =>
  u ? { id: u.id, email: u.email ?? null } : null;

// Module-scoped so the whole app shares one auth state. `null` user = signed
// out (or sync not configured). `ready` flips true once we've resolved the
// initial session, so UI can avoid flashing the signed-out state on load.
const user = ref<AuthUser | null>(null);
const ready = ref(false);

// Resolve the persisted session (and any magic-link redirect in the URL), then
// track sign-in / sign-out / token refresh for the app's lifetime. No-ops — and
// never loads the SDK — when sync isn't configured.
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
   * Email the user a one-time sign-in code. We use the code (not the magic
   * link) because an installed iOS PWA runs in an isolated storage context:
   * tapping a link opens Safari, whose session the standalone PWA can't see.
   * Entering the code keeps verification inside the PWA. (The Supabase email
   * template must include `{{ .Token }}` for the code to appear.)
   */
  const signInWithEmail = async (email: string) => {
    const sb = await getSupabase();
    if (!sb) throw new Error("Cloud sync is not configured.");
    const { error } = await sb.auth.signInWithOtp({ email: email.trim() });
    if (error) throw error;
  };

  /** Verify the emailed one-time code; on success the session is stored in this
   *  (PWA) context and `onAuthStateChange` flips the user to signed-in. */
  const verifyEmailOtp = async (email: string, token: string) => {
    const sb = await getSupabase();
    if (!sb) throw new Error("Cloud sync is not configured.");
    const { error } = await sb.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: "email",
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const sb = await getSupabase();
    if (sb) await sb.auth.signOut();
  };

  return { user, ready, signInWithEmail, verifyEmailOtp, signOut };
}

// Exported for non-component modules (e.g. useHabits) that need to react to
// auth changes without going through the composable's return shape.
export { user as authUser };
