// src/types.ts
export type ID = string;

export type Habit = {
  id: ID;
  name: string;
  color: string;
  reminderTime?: string; // "07:30" in 24-hour format
  archived?: boolean;
  
  // NEW: Tracks history of completions for the Calendar
  completedDates: string[]; 
  
  // We keep this for backward compatibility (it will represent the LAST done date)
  doneDate?: string; 
};

export type Goal = {
  id: ID;
  title: string;
  color: string;
  dueDate?: string;      // YYYY-MM-DD
  
  // NEW: Needed so the Calendar knows when to START drawing the line
  createdAt: string;     
  
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
  
  // NEW: For the new Medal UI
  icon?: string; 
};