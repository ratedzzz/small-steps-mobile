import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const HABITS_KEY = 'habits';
const GOALS_KEY = 'goals';
const JOURNAL_KEY = 'journal';

/** No-op for AsyncStorage - schema is implicit in JSON structure */
export function initSchema() {
  // AsyncStorage doesn't need schema initialization
  // This function exists just to keep the same API
  console.log('[storage] Using AsyncStorage (no schema needed)');
}

/** No-op - kept for API compatibility */
export function getDB() {
  return null;
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
    const existing = await AsyncStorage.getItem(HABITS_KEY);
    const habits = existing ? JSON.parse(existing) : [];
    habits.push(habit);
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (err) {
    console.warn('[storage] insertHabit error:', err);
  }
}

export async function getAllHabits(): Promise<any[]> {
  try {
    const data = await AsyncStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.warn('[storage] getAllHabits error:', err);
    return [];
  }
}

export async function deleteHabit(id: string): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(HABITS_KEY);
    const habits = existing ? JSON.parse(existing) : [];
    const filtered = habits.filter((h: any) => h.id !== id);
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(filtered));
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
    const existing = await AsyncStorage.getItem(GOALS_KEY);
    const goals = existing ? JSON.parse(existing) : [];
    goals.push(goal);
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch (err) {
    console.warn('[storage] insertGoal error:', err);
  }
}

export async function getAllGoals(): Promise<any[]> {
  try {
    const data = await AsyncStorage.getItem(GOALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.warn('[storage] getAllGoals error:', err);
    return [];
  }
}

export async function deleteGoal(id: string): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(GOALS_KEY);
    const goals = existing ? JSON.parse(existing) : [];
    const filtered = goals.filter((g: any) => g.id !== id);
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('[storage] deleteGoal error:', err);
  }
}

/* =============================
   JOURNAL HELPERS
=============================*/

export async function insertJournalEntry(entry: {
  date: string;
  habitId?: string;
  text?: string;
}): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(JOURNAL_KEY);
    const journal = existing ? JSON.parse(existing) : [];
    
    // Add auto-incrementing id
    const maxId = journal.length > 0 
      ? Math.max(...journal.map((e: any) => e.id || 0))
      : 0;
    
    journal.push({ ...entry, id: maxId + 1 });
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(journal));
  } catch (err) {
    console.warn('[storage] insertJournalEntry error:', err);
  }
}

export async function getAllJournalEntries(): Promise<any[]> {
  try {
    const data = await AsyncStorage.getItem(JOURNAL_KEY);
    const entries = data ? JSON.parse(data) : [];
    // Sort by date DESC (most recent first)
    return entries.sort((a: any, b: any) => b.date.localeCompare(a.date));
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
  return {
    habits,
    goals,
    journal,
  };
}

export async function eraseAll(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([HABITS_KEY, GOALS_KEY, JOURNAL_KEY]);
  } catch (err) {
    console.warn('[storage] eraseAll error:', err);
  }
}