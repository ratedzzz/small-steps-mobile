import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const HABITS_KEY = 'habits';
const GOALS_KEY = 'goals';
const JOURNAL_KEY = 'journal';

/** No-op for AsyncStorage - schema is implicit in JSON structure */
export function initSchema() {
  console.log('[storage] Using AsyncStorage (no schema needed)');
}

/** No-op - kept for API compatibility */
export function getDB() {
  return null;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function safeParseArray(raw: string | null): any[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// De-duplicate by id (keeps first)
function uniqById<T extends { id?: string }>(arr: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of arr) {
    if (!it || !it.id) continue;
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    out.push(it);
  }
  return out;
}

// Write an array safely
async function writeArray(key: string, value: any[]) {
  await AsyncStorage.setItem(key, JSON.stringify(value ?? []));
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
    const existing = safeParseArray(await AsyncStorage.getItem(HABITS_KEY));
    const idx = existing.findIndex((h: any) => h?.id === habit.id);

    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...habit };
    } else {
      existing.push(habit);
    }

    // Deduplicate by id (defensive)
    const deduped = uniqById(existing);
    await writeArray(HABITS_KEY, deduped);
  } catch (err) {
    console.warn('[storage] insertHabit error:', err);
  }
}

export async function getAllHabits(): Promise<any[]> {
  try {
    const arr = safeParseArray(await AsyncStorage.getItem(HABITS_KEY));
    return uniqById(arr);
  } catch (err) {
    console.warn('[storage] getAllHabits error:', err);
    return [];
  }
}

export async function deleteHabit(id: string): Promise<void> {
  try {
    const existing = safeParseArray(await AsyncStorage.getItem(HABITS_KEY));
    const filtered = existing.filter((h: any) => h?.id !== id);
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
    const existing = safeParseArray(await AsyncStorage.getItem(GOALS_KEY));
    const idx = existing.findIndex((g: any) => g?.id === goal.id);

    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...goal };
    } else {
      existing.push(goal);
    }

    const deduped = uniqById(existing);
    await writeArray(GOALS_KEY, deduped);
  } catch (err) {
    console.warn('[storage] insertGoal error:', err);
  }
}

export async function getAllGoals(): Promise<any[]> {
  try {
    const arr = safeParseArray(await AsyncStorage.getItem(GOALS_KEY));
    return uniqById(arr);
  } catch (err) {
    console.warn('[storage] getAllGoals error:', err);
    return [];
  }
}

export async function deleteGoal(id: string): Promise<void> {
  try {
    const existing = safeParseArray(await AsyncStorage.getItem(GOALS_KEY));
    const filtered = existing.filter((g: any) => g?.id !== id);
    await writeArray(GOALS_KEY, filtered);
  } catch (err) {
    console.warn('[storage] deleteGoal error:', err);
  }
}

/* =============================
   JOURNAL HELPERS
=============================*/

/**
 * Upsert by (date, habitId) when habitId is provided.
 * - This keeps "one row per habit per day", which avoids duplicate-completion counting.
 * - For free-form notes without habitId, we append (multiple notes per day are allowed).
 */
export async function insertJournalEntry(entry: {
  date: string;
  habitId?: string;
  text?: string;
}): Promise<void> {
  try {
    const journal = safeParseArray(await AsyncStorage.getItem(JOURNAL_KEY));

    if (entry.habitId) {
      // UPSERT by composite key (date + habitId)
      const idx = journal.findIndex(
        (e: any) => e?.date === entry.date && e?.habitId === entry.habitId
      );
      if (idx >= 0) {
        journal[idx] = { ...journal[idx], ...entry };
      } else {
        // id: keep numeric auto-increment for consistency
        const maxId =
          journal.length > 0 ? Math.max(...journal.map((e: any) => e?.id || 0)) : 0;
        journal.push({ ...entry, id: maxId + 1 });
      }
    } else {
      // No habitId => allow multiple notes per date
      const maxId =
        journal.length > 0 ? Math.max(...journal.map((e: any) => e?.id || 0)) : 0;
      journal.push({ ...entry, id: maxId + 1 });
    }

    await writeArray(JOURNAL_KEY, journal);
  } catch (err) {
    console.warn('[storage] insertJournalEntry error:', err);
  }
}

export async function getAllJournalEntries(): Promise<any[]> {
  try {
    const entries = safeParseArray(await AsyncStorage.getItem(JOURNAL_KEY));

    // If there are accidental duplicates for (date, habitId), keep the last one
    const byKey = new Map<string, any>();
    for (const e of entries) {
      if (!e) continue;
      if (e.habitId) {
        const k = `${e.date}__${e.habitId}`;
        byKey.set(k, e); // last write wins
      } else {
        // keep non-habit notes as-is by pushing with a unique key
        const k = `note__${e.id ?? Math.random()}`;
        byKey.set(k, e);
      }
    }
    const normalized = Array.from(byKey.values());

    // Sort by date DESC (most recent first), then by id DESC if dates equal
    normalized.sort((a: any, b: any) => {
      const d = String(b.date).localeCompare(String(a.date));
      if (d !== 0) return d;
      return (b.id ?? 0) - (a.id ?? 0);
    });

    return normalized;
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
