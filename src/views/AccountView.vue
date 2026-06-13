<script setup lang="ts">
import { ref } from "vue";
import ContentPage from "../components/ContentPage.vue";
import { useAuth, type OAuthProvider } from "../composables/useAuth";
import { isSyncConfigured } from "../supabase";

const { user, signInWithOAuth, signOut } = useAuth();

const error = ref("");
// The provider whose sign-in is in flight (until the redirect happens).
const busy = ref<OAuthProvider | null>(null);

const signIn = async (provider: OAuthProvider) => {
  error.value = "";
  if (busy.value) return;
  busy.value = provider;
  try {
    await signInWithOAuth(provider);
    // On success the browser redirects to the provider; nothing else to do.
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Couldn't start sign-in.";
    busy.value = null;
  }
};
</script>

<template>
  <ContentPage>
    <!-- Sync not built into this deployment. -->
    <template v-if="!isSyncConfigured">
      <p class="lead">Cloud sync isn't enabled for this build.</p>
      <p class="note">
        Your habits are saved on this device and work offline. To sync across
        devices, the app needs Supabase credentials set at build time — see
        <code>.env.example</code>.
      </p>
    </template>

    <!-- Signed in. -->
    <template v-else-if="user">
      <p class="lead">Signed in as {{ user.email ?? "your account" }}.</p>
      <p class="note">
        Your habits sync across every device you sign in on. They're also kept
        on this device, so the app keeps working offline.
      </p>
      <button class="provider-btn signout" @click="signOut">Sign out</button>
    </template>

    <!-- Signed out: OAuth sign-in. -->
    <template v-else>
      <p class="lead">Sync your habits across devices.</p>
      <p class="note">
        Sign in to sync. Use the same provider every time — signing in with a
        different one creates a separate account. Until you sign in, everything
        stays on this device.
      </p>

      <div class="providers">
        <button
          class="provider-btn"
          :disabled="!!busy"
          @click="signIn('apple')"
        >
          {{ busy === "apple" ? "Redirecting…" : "Continue with Apple" }}
        </button>
        <button
          class="provider-btn"
          :disabled="!!busy"
          @click="signIn('google')"
        >
          {{ busy === "google" ? "Redirecting…" : "Continue with Google" }}
        </button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </template>
  </ContentPage>
</template>

<style scoped>
.providers {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 1.25rem;
}

.provider-btn {
  padding: 12px 16px;
  background-color: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  /* Removes the 300ms tap delay and double-tap zoom on this control. */
  touch-action: manipulation;
  transition: transform 0.1s ease, filter 0.1s ease;
}

.provider-btn:disabled {
  opacity: 0.6;
}

.provider-btn:active {
  filter: brightness(0.9);
  transform: scale(0.98);
}

.signout {
  margin-top: 1.25rem;
}

.error {
  color: #ff453a;
  font-size: 0.9rem;
  margin-top: 0.75rem;
}

code {
  font-size: 0.85em;
  background: var(--input-bg);
  padding: 1px 5px;
  border-radius: 4px;
}
</style>
