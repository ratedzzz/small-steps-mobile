// src/types/habit.ts
export type Habit = {
  id: string;
  name: string;
  color?: string;
  reminderTime?: string | null; // e.g., "08:00" in user's local time
};
