<script setup lang="ts">
import { ref } from "vue";
import ContentPage from "../components/ContentPage.vue";
import { usePressed } from "../composables/usePressed";
import { useAuth } from "../composables/useAuth";
import { isSyncConfigured } from "../supabase";

const { user, signInWithEmail, verifyEmailOtp, signOut } = useAuth();

const email = ref("");
const code = ref("");
const sent = ref(false);
const error = ref("");
const busy = ref(false);

const { pressed, on: pressEvents } = usePressed();

const sendCode = async () => {
  error.value = "";
  if (!email.value.trim() || busy.value) return;
  busy.value = true;
  try {
    await signInWithEmail(email.value);
    sent.value = true;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Couldn't send the code.";
  } finally {
    busy.value = false;
  }
};

const verify = async () => {
  error.value = "";
  if (!code.value.trim() || busy.value) return;
  busy.value = true;
  try {
    // On success, onAuthStateChange flips `user` and this screen re-renders.
    await verifyEmailOtp(email.value, code.value);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Invalid or expired code.";
  } finally {
    busy.value = false;
  }
};

const reset = () => {
  sent.value = false;
  code.value = "";
  error.value = "";
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

    <!-- Signed out, code sent: enter the one-time code. -->
    <template v-else-if="sent">
      <p class="lead">Enter your code.</p>
      <p class="note">
        We emailed a 6-digit code to <strong>{{ email }}</strong>. Enter it here
        to finish signing in — no need to leave the app.
      </p>

      <div class="input-group">
        <input
          type="text"
          v-model="code"
          placeholder="123456"
          enterkeyhint="done"
          autocomplete="one-time-code"
          autocapitalize="off"
          autocorrect="off"
          inputmode="numeric"
          @keyup.enter="verify"
        />
        <button
          :class="{ 'is-pressed': pressed }"
          v-on="pressEvents"
          :disabled="busy"
          @click="verify"
        >
          {{ busy ? "Verifying…" : "Verify" }}
        </button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <button class="link-btn" @click="reset">Use a different email</button>
    </template>

    <!-- Signed out: request a code. -->
    <template v-else>
      <p class="lead">Sync your habits across devices.</p>
      <p class="note">
        Enter your email and we'll send a 6-digit sign-in code — no password.
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
          @keyup.enter="sendCode"
        />
        <button
          :class="{ 'is-pressed': pressed }"
          v-on="pressEvents"
          :disabled="busy"
          @click="sendCode"
        >
          {{ busy ? "Sending…" : "Send code" }}
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

/* Secondary text-style action ("Use a different email"). */
.link-btn {
  margin-top: 1rem;
  padding: 4px 0;
  background: none;
  color: var(--accent);
  font-size: 0.9rem;
}

.link-btn:active {
  filter: none;
  transform: none;
  opacity: 0.6;
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
