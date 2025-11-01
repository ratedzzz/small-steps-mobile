export type ID = string;

export type Habit = {
  id: ID;
  name: string;
  color: string;

  // allow null at runtime, but sometimes we'll pass undefined first then normalize
  reminderTime?: string | null; // "07:30" or null if no reminder set

  archived?: boolean;
};

export type Goal = {
  id: ID;
  title: string;
  color: string;
  dueDate?: string;      // YYYY-MM-DD
  relatedHabitIds?: ID[];
  archived?: boolean;
  completed?: boolean;   // optional, used by badges.ts etc.
};

export type JournalEntry = {
  // Optional because new entries get an id from SQLite (AUTOINCREMENT).
  // Can be a string (if we ever generate IDs) or number (from SQLite rowid).
  id?: ID | number;

  date: string;          // YYYY-MM-DD
  habitId?: ID;          // if undefined, it's a general note about the day
  text?: string;         // freeform note OR placeholder like "completed"
  completed?: boolean;   // true if user checked off the habit for that date
};

export type Badge = {
  id: ID;
  name: string;
  description?: string;
  unlockedAt?: string;
  icon?: string; // emoji / asset ref
};

// ------------------------------------------
// Optional helpers for time validation
// ------------------------------------------

export function isHHMM(v: string): boolean {
  return /^([0-1]?\d|2[0-3]):([0-5]\d)$/.test(v.trim());
}

export function normalizeReminderTime(v?: string | null): string | null {
  if (!v) return null;
  const m = /^([0-1]?\d|2[0-3]):([0-5]\d)$/.exec(v.trim());
  if (!m) return null;
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}

