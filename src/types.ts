export type ID = string;

export type Habit = {
  id: ID;
  name: string;
  color: string;
  reminderTime?: string; // "07:30"
  archived?: boolean;
};

export type Goal = {
  id: ID;
  title: string;
  color: string;
  dueDate?: string;      // YYYY-MM-DD
  relatedHabitIds?: ID[];
  archived?: boolean;
  completed?: boolean; // added: optional completed flag used by badges.ts
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
  description?: string;
  unlockedAt?: string;
  icon?: string; // added: optional icon property for emoji or icon identifiers
};
