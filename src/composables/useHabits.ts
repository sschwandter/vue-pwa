import { computed, reactive, watch } from "vue";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase, isSyncConfigured } from "../supabase";
import { authUser } from "./useAuth";

export type Habit = {
  id: string;
  name: string;
  /** Local "YYYY-MM-DD" dates the habit was completed. */
  history: string[];
  /** Last-modified time (ms epoch) — drives last-write-wins sync merges. */
  updatedAt: number;
  /** Soft-delete tombstone (ms epoch) so deletes propagate across devices. */
  deletedAt: number | null;
};

const STORAGE_KEY = "habits.v2";
const LEGACY_KEY = "habits.v1";
const TABLE = "habits";

const pad = (n: number) => String(n).padStart(2, "0");

/** Local calendar-day key (not UTC) so "today" matches the user's wall clock. */
const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const addDays = (d: Date, delta: number) => {
  const next = new Date(d);
  next.setDate(next.getDate() + delta);
  return next;
};

const newId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const readJson = (key: string): unknown => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

function load(): Habit[] {
  const now = Date.now();
  // Current shape (v2): includes updatedAt/deletedAt for sync.
  const v2 = readJson(STORAGE_KEY);
  if (Array.isArray(v2)) {
    return v2
      .filter(
        (h): h is Partial<Habit> =>
          !!h && typeof h.id === "string" && typeof h.name === "string"
      )
      .map((h) => ({
        id: h.id!,
        name: h.name!,
        history: Array.isArray(h.history) ? h.history : [],
        updatedAt: typeof h.updatedAt === "number" ? h.updatedAt : now,
        deletedAt: typeof h.deletedAt === "number" ? h.deletedAt : null,
      }));
  }
  // Migrate the pre-sync local-only shape (v1: id/name/history only).
  const v1 = readJson(LEGACY_KEY);
  if (Array.isArray(v1)) {
    return v1
      .filter(
        (h): h is { id: string; name: string; history?: unknown } =>
          !!h && typeof h.id === "string" && typeof h.name === "string"
      )
      .map((h) => ({
        id: h.id,
        name: h.name,
        history: Array.isArray(h.history) ? h.history : [],
        updatedAt: now,
        deletedAt: null,
      }));
  }
  return [];
}

// Module-scoped working copy. Includes tombstones (deletedAt set) so deletions
// can sync; the UI reads `visibleHabits` below, which filters them out.
// localStorage is the offline source of truth — the only persistence when
// sync is off, and an instant local cache when it's on.
const records = reactive<Habit[]>(load());

watch(
  records,
  () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      // Storage full or unavailable (e.g. Private Browsing) — keep running
      // in-memory rather than throwing.
    }
  },
  { deep: true }
);

const visibleHabits = computed(() => records.filter((h) => !h.deletedAt));

// ── Sync layer ────────────────────────────────────────────────────────────
// Everything below is a no-op unless sync is configured AND a user is signed
// in. localStorage stays the working copy; Supabase is the reconciliation
// layer. Conflict policy is per-record last-write-wins keyed by updatedAt.

type Row = {
  id: string;
  user_id: string;
  name: string;
  history: string[];
  updated_at: string;
  deleted_at: string | null;
};

const toRecord = (row: Row): Habit => ({
  id: row.id,
  name: row.name,
  history: Array.isArray(row.history) ? row.history : [],
  updatedAt: Date.parse(row.updated_at) || 0,
  deletedAt: row.deleted_at ? Date.parse(row.deleted_at) : null,
});

const toRow = (h: Habit, userId: string): Row => ({
  id: h.id,
  user_id: userId,
  name: h.name,
  history: h.history,
  updated_at: new Date(h.updatedAt).toISOString(),
  deleted_at: h.deletedAt ? new Date(h.deletedAt).toISOString() : null,
});

/** Fold remote rows into the local copy; the newer updatedAt wins per id. */
function mergeRemote(rows: Row[]) {
  for (const row of rows) {
    const incoming = toRecord(row);
    const local = records.find((r) => r.id === incoming.id);
    if (!local) records.push(incoming);
    else if (incoming.updatedAt > local.updatedAt) Object.assign(local, incoming);
  }
}

/** Best-effort push of one record. Failures are fine — the next full sync
 *  (sign-in / online / focus) reconciles anything that didn't make it. */
async function pushRecord(h: Habit) {
  const sb = await getSupabase();
  if (!sb || !authUser.value) return;
  try {
    await sb.from(TABLE).upsert(toRow(h, authUser.value.id));
  } catch {
    /* offline / transient — reconciled by sync() later */
  }
}

let syncing = false;

/** Pull everything, merge (local now holds the latest per record), then push
 *  the merged copy so the account gains local-only and locally-newer rows. */
async function sync() {
  const sb = await getSupabase();
  if (!sb || !authUser.value || syncing) return;
  syncing = true;
  try {
    const { data, error } = await sb.from(TABLE).select("*");
    if (error) throw error;
    mergeRemote((data ?? []) as Row[]);

    const userId = authUser.value.id;
    const rows = records.map((r) => toRow(r, userId));
    if (rows.length) {
      const { error: upsertError } = await sb.from(TABLE).upsert(rows);
      if (upsertError) throw upsertError;
    }
  } catch (e) {
    // Offline or transient; the next trigger will retry the whole reconcile.
    console.warn("[habits] sync failed:", e);
  } finally {
    syncing = false;
  }
}

let channel: RealtimeChannel | null = null;

async function startRealtime(userId: string) {
  const sb = await getSupabase();
  if (!sb || channel) return;
  channel = sb
    .channel("habits-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: TABLE, filter: `user_id=eq.${userId}` },
      (payload) => {
        if (payload.new && "id" in payload.new) mergeRemote([payload.new as Row]);
      }
    )
    .subscribe();
}

function stopRealtime() {
  if (channel) {
    void channel.unsubscribe();
    channel = null;
  }
}

if (isSyncConfigured) {
  // Start/stop sync as the user signs in and out.
  watch(
    authUser,
    (u) => {
      if (u) {
        void sync();
        void startRealtime(u.id);
      } else {
        stopRealtime();
      }
    },
    { immediate: true }
  );

  // Reconcile when connectivity returns or the app is brought to the
  // foreground (the main resume trigger on iOS).
  window.addEventListener("online", () => void sync());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void sync();
  });
}

export function useHabits() {
  const addHabit = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const habit: Habit = {
      id: newId(),
      name: trimmed,
      history: [],
      updatedAt: Date.now(),
      deletedAt: null,
    };
    records.push(habit);
    void pushRecord(habit);
  };

  const removeHabit = (id: string) => {
    const habit = records.find((h) => h.id === id);
    if (!habit) return;
    // Tombstone rather than splice, so the deletion can sync to other devices.
    habit.deletedAt = Date.now();
    habit.updatedAt = habit.deletedAt;
    void pushRecord(habit);
  };

  const isDoneToday = (habit: Habit) => habit.history.includes(dayKey());

  const toggleToday = (id: string) => {
    const habit = records.find((h) => h.id === id);
    if (!habit) return;
    const key = dayKey();
    const i = habit.history.indexOf(key);
    if (i === -1) habit.history.push(key);
    else habit.history.splice(i, 1);
    habit.updatedAt = Date.now();
    void pushRecord(habit);
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

  return {
    habits: visibleHabits,
    addHabit,
    removeHabit,
    toggleToday,
    isDoneToday,
    streak,
  };
}
