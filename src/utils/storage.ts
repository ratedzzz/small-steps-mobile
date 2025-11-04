import AsyncStorage from '@react-native-async-storage/async-storage';

/* ---------------------------------------------
   Config
---------------------------------------------- */

// If true: free-form journal (no habitId) is ONE entry per day (upsert by date).
// If false: allow multiple free-form notes per day (always append).
const SINGLE_JOURNAL_PER_DAY = true;

/* ---------------------------------------------
   Storage keys
---------------------------------------------- */
const HABITS_KEY = 'habits';
const GOALS_KEY = 'goals';
const JOURNAL_KEY = 'journal';

/* ---------------------------------------------
   Init / DB shim
---------------------------------------------- */
/** No-op for AsyncStorage - schema is implicit in JSON structure */
export function initSchema() {
  console.log('[storage] Using AsyncStorage (no schema needed)');
}

/** No-op - kept for API compatibility */
export function getDB() {
  return null;
}

/* ---------------------------------------------
   Helpers
---------------------------------------------- */

function safeParseArray<T = any>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

// De-duplicate by id (keeps first)
function uniqById<T extends { id?: string }>(arr: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of arr) {
    const id = it && typeof it.id !== 'undefined' ? String(it.id) : '';
    if (!id) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ ...it, id } as T);
  }
  return out;
}

// Write an array safely
async function writeArray(key: string, value: any[]) {
  await AsyncStorage.setItem(key, JSON.stringify(value ?? []));
}

// String id generator (keeps id type consistent across app)
function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* =============================
   HABITS HELPERS
=============================*/

export async function insertHabit(habit: {
  id: string;
  name: string;
  color?: string;
  reminderTime?: string | null;
}): Promise<void> {
  try {
    const existing = safeParseArray<any>(await AsyncStorage.getItem(HABITS_KEY));
    const idx = existing.findIndex((h) => String(h?.id) === String(habit.id));

    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...habit, id: String(habit.id) };
    } else {
      existing.push({ ...habit, id: String(habit.id) });
    }

    const deduped = uniqById(existing);
    await writeArray(HABITS_KEY, deduped);
  } catch (err) {
    console.warn('[storage] insertHabit error:', err);
  }
}

export async function getAllHabits(): Promise<any[]> {
  try {
    const arr = safeParseArray<any>(await AsyncStorage.getItem(HABITS_KEY));
    return uniqById(arr);
  } catch (err) {
    console.warn('[storage] getAllHabits error:', err);
    return [];
  }
}

export async function deleteHabit(id: string): Promise<void> {
  try {
    const existing = safeParseArray<any>(await AsyncStorage.getItem(HABITS_KEY));
    const filtered = existing.filter((h) => String(h?.id) !== String(id));
    await writeArray(HABITS_KEY, filtered);
  } catch (err) {
    console.warn('[storage] deleteHabit error:', err);
  }
}

/* =============================
   GOALS HELPERS
=============================*/

export async function insertGoal(goal: {
  id: string;
  title: string;
  color?: string;
  dueDate?: string;
}): Promise<void> {
  try {
    const existing = safeParseArray<any>(await AsyncStorage.getItem(GOALS_KEY));
    const idx = existing.findIndex((g) => String(g?.id) === String(goal.id));

    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...goal, id: String(goal.id) };
    } else {
      existing.push({ ...goal, id: String(goal.id) });
    }

    const deduped = uniqById(existing);
    await writeArray(GOALS_KEY, deduped);
  } catch (err) {
    console.warn('[storage] insertGoal error:', err);
  }
}

export async function getAllGoals(): Promise<any[]> {
  try {
    const arr = safeParseArray<any>(await AsyncStorage.getItem(GOALS_KEY));
    return uniqById(arr);
  } catch (err) {
    console.warn('[storage] getAllGoals error:', err);
    return [];
  }
}

export async function deleteGoal(id: string): Promise<void> {
  try {
    const existing = safeParseArray<any>(await AsyncStorage.getItem(GOALS_KEY));
    const filtered = existing.filter((g) => String(g?.id) !== String(id));
    await writeArray(GOALS_KEY, filtered);
  } catch (err) {
    console.warn('[storage] deleteGoal error:', err);
  }
}

/* =============================
   JOURNAL HELPERS
=============================*/

/**
 * Journal entry shape we persist.
 * - id is a string everywhere for consistency
 * - For (date, habitId) rows => upsert by composite key
 * - For free-form notes (no habitId):
 *   - If SINGLE_JOURNAL_PER_DAY = true, upsert by (date)
 *   - Else, append new entry
 */
export type JournalEntry = {
  id: string;
  date: string;          // YYYY-MM-DD
  habitId?: string;      // undefined for free-form journal
  text?: string;
  createdAtISO?: string;
  updatedAtISO?: string;
};

/**
 * Returns the saved entry (always a full object with string id).
 */
export async function insertJournalEntry(entry: {
  id?: string;
  date: string;
  habitId?: string;
  text?: string;
}): Promise<JournalEntry> {
  try {
    const journal = safeParseArray<JournalEntry>(await AsyncStorage.getItem(JOURNAL_KEY));

    const now = new Date().toISOString();
    let saved: JournalEntry | null = null;

    if (entry.habitId) {
      // UPSERT by composite key (date + habitId)
      const idx = journal.findIndex(
        (e) => e?.date === entry.date && e?.habitId === entry.habitId
      );
      if (idx >= 0) {
        const updated: JournalEntry = {
          ...journal[idx],
          ...entry,
          id: String(journal[idx].id || entry.id || genId()),
          updatedAtISO: now,
          createdAtISO: journal[idx].createdAtISO || now,
        };
        journal[idx] = updated;
        saved = updated;
      } else {
        const created: JournalEntry = {
          id: String(entry.id || genId()),
          date: entry.date,
          habitId: entry.habitId,
          text: entry.text ?? '',
          createdAtISO: now,
          updatedAtISO: now,
        };
        journal.push(created);
        saved = created;
      }
    } else {
      // Free-form journal
      if (SINGLE_JOURNAL_PER_DAY) {
        // Upsert by (date)
        const idx = journal.findIndex((e) => e?.date === entry.date && !e?.habitId);
        if (idx >= 0) {
          const updated: JournalEntry = {
            ...journal[idx],
            ...entry,
            id: String(journal[idx].id || entry.id || genId()),
            updatedAtISO: now,
            createdAtISO: journal[idx].createdAtISO || now,
          };
          journal[idx] = updated;
          saved = updated;
        } else {
          const created: JournalEntry = {
            id: String(entry.id || genId()),
            date: entry.date,
            text: entry.text ?? '',
            createdAtISO: now,
            updatedAtISO: now,
          };
          journal.push(created);
          saved = created;
        }
      } else {
        // Allow multiple notes per day → always append
        const created: JournalEntry = {
          id: String(entry.id || genId()),
          date: entry.date,
          text: entry.text ?? '',
          createdAtISO: now,
          updatedAtISO: now,
        };
        journal.push(created);
        saved = created;
      }
    }

    await writeArray(JOURNAL_KEY, journal);
    return saved!;
  } catch (err) {
    console.warn('[storage] insertJournalEntry error:', err);
    // Return a best-effort entry so UI logic doesn’t break
    return {
      id: String(entry.id || genId()),
      date: entry.date,
      habitId: entry.habitId,
      text: entry.text ?? '',
      createdAtISO: new Date().toISOString(),
      updatedAtISO: new Date().toISOString(),
    };
  }
}

export async function getAllJournalEntries(): Promise<JournalEntry[]> {
  try {
    const entries = safeParseArray<JournalEntry>(await AsyncStorage.getItem(JOURNAL_KEY));

    // Normalize id to string
    const normalized = entries.map((e) => ({ ...e, id: String(e?.id || genId()) }));

    // If there are accidental duplicates for (date, habitId), keep the LAST one (last write wins)
    const byKey = new Map<string, JournalEntry>();
    for (const e of normalized) {
      if (!e) continue;
      if (e.habitId) {
        const k = `${e.date}__${e.habitId}`;
        byKey.set(k, e);
      } else if (SINGLE_JOURNAL_PER_DAY) {
        const k = `daily__${e.date}`;
        byKey.set(k, e);
      } else {
        // multiple notes per day: keep all - use unique key to preserve each
        byKey.set(`note__${e.id}`, e);
      }
    }
    const out = Array.from(byKey.values());

    // Sort by date DESC then updatedAtISO DESC then createdAtISO DESC
    out.sort((a, b) => {
      const d = String(b.date).localeCompare(String(a.date));
      if (d !== 0) return d;
      const u = String(b.updatedAtISO ?? '').localeCompare(String(a.updatedAtISO ?? ''));
      if (u !== 0) return u;
      return String(b.createdAtISO ?? '').localeCompare(String(a.createdAtISO ?? ''));
    });

    return out;
  } catch (err) {
    console.warn('[storage] getAllJournalEntries error:', err);
    return [];
  }
}

/* =============================
   EXPORT / ERASE HELPERS
=============================*/

export async function exportJson() {
  const [habits, goals, journal] = await Promise.all([
    getAllHabits(),
    getAllGoals(),
    getAllJournalEntries(),
  ]);
  return { habits, goals, journal };
}

export async function eraseAll(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([HABITS_KEY, GOALS_KEY, JOURNAL_KEY]);
  } catch (err) {
    console.warn('[storage] eraseAll error:', err);
  }
}
