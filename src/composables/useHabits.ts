import { reactive, watch } from "vue";

export type Habit = {
  id: string;
  name: string;
  /** Local "YYYY-MM-DD" dates the habit was completed. */
  history: string[];
};

const STORAGE_KEY = "habits.v1";

const pad = (n: number) => String(n).padStart(2, "0");

/** Local calendar-day key (not UTC) so "today" matches the user's wall clock. */
const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const addDays = (d: Date, delta: number) => {
  const next = new Date(d);
  next.setDate(next.getDate() + delta);
  return next;
};

function load(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Drop anything that doesn't match the shape — a stale/corrupt entry
    // shouldn't crash the list on launch.
    return parsed.filter(
      (h): h is Habit =>
        h &&
        typeof h.id === "string" &&
        typeof h.name === "string" &&
        Array.isArray(h.history)
    );
  } catch {
    return [];
  }
}

// Module-scoped so the list is shared across navigations and lives for the
// app's lifetime. A deep watcher mirrors every change to localStorage — the
// only persistence layer, since this app has no backend.
const habits = reactive<Habit[]>(load());

watch(
  habits,
  () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    } catch {
      // Storage full or unavailable (e.g. Private Browsing) — keep running
      // in-memory rather than throwing.
    }
  },
  { deep: true }
);

const newId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function useHabits() {
  const addHabit = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    habits.push({ id: newId(), name: trimmed, history: [] });
  };

  const removeHabit = (id: string) => {
    const i = habits.findIndex((h) => h.id === id);
    if (i !== -1) habits.splice(i, 1);
  };

  const isDoneToday = (habit: Habit) => habit.history.includes(dayKey());

  const toggleToday = (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    const key = dayKey();
    const i = habit.history.indexOf(key);
    if (i === -1) habit.history.push(key);
    else habit.history.splice(i, 1);
  };

  /**
   * Length of the unbroken run of completed days ending today — or yesterday,
   * so a streak you simply haven't continued *yet* today still shows.
   */
  const streak = (habit: Habit) => {
    const done = new Set(habit.history);
    let cursor = new Date();
    if (!done.has(dayKey(cursor))) cursor = addDays(cursor, -1);
    let count = 0;
    while (done.has(dayKey(cursor))) {
      count++;
      cursor = addDays(cursor, -1);
    }
    return count;
  };

  return { habits, addHabit, removeHabit, toggleToday, isDoneToday, streak };
}
