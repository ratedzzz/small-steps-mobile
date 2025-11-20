export type ID = string;

export type Habit = {
  id: ID;
  name: string;
  color: string;
  reminderTime?: string; // "07:30" in 24-hour format
  archived?: boolean;
  doneDate?: string; // YYYY-MM-DD - tracks when habit was last completed
};

export type Goal = {
  id: ID;
  title: string;
  color: string;
  dueDate?: string;      // YYYY-MM-DD
  relatedHabitIds?: ID[];
  archived?: boolean;
};

export type JournalEntry = {
  id: ID;
  date: string;          // YYYY-MM-DD
  habitId?: ID;          // undefined => general day note
  text?: string;
  completed?: boolean;
};

export type Badge = {
  id: ID;
  name: string;
  description: string;
  unlockedAt?: string;
};