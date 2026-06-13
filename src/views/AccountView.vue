<script setup lang="ts">
import { ref } from "vue";
import ContentPage from "../components/ContentPage.vue";
import { usePressed } from "../composables/usePressed";
import { useAuth } from "../composables/useAuth";
import { isSyncConfigured } from "../supabase";

const { user, signInWithEmail, signOut } = useAuth();

const email = ref("");
const sent = ref(false);
const error = ref("");
const busy = ref(false);

const { pressed, on: pressEvents } = usePressed();

const submit = async () => {
  error.value = "";
  if (!email.value.trim() || busy.value) return;
  busy.value = true;
  try {
    await signInWithEmail(email.value);
    sent.value = true;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Couldn't send the link.";
  } finally {
    busy.value = false;
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
      <p class="lead">Signed in as {{ user.email }}.</p>
      <p class="note">
        Your habits sync across every device you sign in on. They're also kept
        on this device, so the app keeps working offline.
      </p>
      <button class="account-btn" @click="signOut">Sign out</button>
    </template>

    <!-- Signed out: magic-link sign-in. -->
    <template v-else-if="sent">
      <p class="lead">Check your email.</p>
      <p class="note">
        We sent a sign-in link to <strong>{{ email }}</strong>. Open it on this
        device to finish signing in.
      </p>
    </template>

    <template v-else>
      <p class="lead">Sync your habits across devices.</p>
      <p class="note">
        Enter your email and we'll send a one-tap sign-in link — no password.
        Until you sign in, everything stays on this device.
      </p>

      <div class="input-group">
        <input
          type="email"
          v-model="email"
          placeholder="you@example.com"
          enterkeyhint="send"
          autocomplete="email"
          autocapitalize="off"
          autocorrect="off"
          inputmode="email"
          @keyup.enter="submit"
        />
        <button
          :class="{ 'is-pressed': pressed }"
          v-on="pressEvents"
          :disabled="busy"
          @click="submit"
        >
          {{ busy ? "Sending…" : "Send link" }}
        </button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </template>
  </ContentPage>
</template>

<style scoped>
.input-group {
  display: flex;
  gap: 10px;
  margin-top: 1.25rem;
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
  background-color: var(--accent);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  /* Removes the 300ms tap delay and double-tap zoom on this control. */
  touch-action: manipulation;
  transition: transform 0.1s ease, filter 0.1s ease;
}

button:disabled {
  opacity: 0.6;
}

/* .is-pressed (pointer-driven, see usePressed) gives instant touch feedback;
   :active keeps keyboard/mouse activation covered. */
button.is-pressed,
button:active {
  filter: brightness(0.9);
  transform: scale(0.94);
}

.account-btn {
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
