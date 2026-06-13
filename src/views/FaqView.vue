<script setup lang="ts">
import ContentPage from "../components/ContentPage.vue";
import LinkRow from "../components/LinkRow.vue";

// Q&A on how the habit tracker is meant to be used. Plain content page — the
// title, back button and scroll restore all come from the router/shell.
const faqs = [
  {
    q: "What is this app?",
    a: "A simple daily habit tracker. You list the things you want to do every day and check them off as you go — the goal is to keep each streak unbroken.",
  },
  {
    q: "How do I add a habit?",
    a: "On the Today screen, type a name into the box at the top and tap Add (or press Return). Add as many as you like — short, action-style names like “Read” or “Stretch” work best.",
  },
  {
    q: "How do I mark one done?",
    a: "Tap the circle next to a habit. It fills in and the name gets a line through it. Tap it again to undo if you checked it off by mistake.",
  },
  {
    q: "What does the 🔥 number mean?",
    a: "It's your streak: how many days in a row you've completed that habit. It counts back from today — or from yesterday if you haven't ticked it off yet today — so a live streak never looks broken first thing in the morning.",
  },
  {
    q: "What happens if I miss a day?",
    a: "The streak resets to zero the next time you complete the habit. Days you missed simply aren't counted; nothing is deleted, and you can start a fresh streak whenever you like.",
  },
  {
    q: "Does the list reset each day?",
    a: "Your habits stay put — only the checkmarks are per-day. Each new day starts with everything unchecked, ready to be completed again.",
  },
  {
    q: "How do I remove a habit?",
    a: "Tap the ✕ on the right of a row. You'll be asked to confirm, because deleting a habit also clears its streak history.",
  },
  {
    q: "Where is my data stored?",
    a: "Entirely on this device, in the browser's local storage. It's private and works offline, but it isn't synced or backed up — clearing site data or removing the app erases it.",
  },
  {
    q: "Can I install it like a real app?",
    a: "Yes. In Safari, use Share → Add to Home Screen. It then launches full-screen, works offline, and updates itself in the background.",
  },
];
</script>

<template>
  <ContentPage>
    <p class="lead">
      How to use the habit tracker — what each part does and where your data
      lives.
    </p>

    <template v-for="(item, i) in faqs" :key="i">
      <h2>{{ item.q }}</h2>
      <p>{{ item.a }}</p>
    </template>

    <LinkRow to="/info">Info ›</LinkRow>
  </ContentPage>
</template>

<style scoped>
h2 {
  font-size: 1rem;
  margin: 1.5rem 0 0.4rem;
}

p {
  margin: 0;
}
</style>
