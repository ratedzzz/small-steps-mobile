// src/types.ts

export type ID = string;

/** A daily, color-coded habit the user can track. */
export type Habit = {
  id: ID;
  name: string;
  color: string;
  /** "HH:MM" (24h) if the user set a reminder */
  reminderTime?: string;
  archived?: boolean;
};

/** A larger objective; may be related to one or more habits. */
export type Goal = {
  id: ID;
  title: string;
  color: string;
  /** YYYY-MM-DD */
  dueDate?: string;
  /** Link to habits that support this goal */
  relatedHabitIds?: ID[];
  archived?: boolean;
};

/** Freeform journaling or habit-specific notes for a date. */
export type JournalEntry = {
  id: ID;
  /** YYYY-MM-DD */
  date: string;
  /** undefined => a general day note (not tied to a habit) */
  habitId?: ID;
  text?: string;
  /** convenience flag if you’re marking a habit as completed via journal */
  completed?: boolean;
};

/**
 * Achievement badges.
 *
 * Notes:
 * - `title` is the preferred display field.
 * - `name` is kept optional for backward compatibility with any older code that used `name`.
 * - `unlockedAt` is optional; treat falsy (undefined or null) as "locked".
 */
export type Badge = {
  id: ID;
  /** Preferred display field */
  title: string;
  /** Legacy/compat: some code may still read `name` */
  name?: string;
  description: string;
  /** Optional emoji or asset key */
  icon?: string;
  /** ISO string when unlocked; falsy means locked */
  unlockedAt?: string | null;
};