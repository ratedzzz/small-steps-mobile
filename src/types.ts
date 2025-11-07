export type ID = string;

export type Habit = {
  id: string;
  name: string;
  color: string;
  reminderTime: string | null;
};
export type Goal = {
  id: string;
  title: string;
  color: string;
  dueDate?: string;
};
export type JournalEntry = {
  date: string;
  habitId?: string;
  text?: string;
  completed?: boolean;
};
export type Badge = {
  id: string;
  name: string;
  description: string;
  unlockedAt?: string; // ISO timestamp when unlocked
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

