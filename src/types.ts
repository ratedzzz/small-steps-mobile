export interface Habit {
  id: string;
  name: string; // The name of the habit (e.g., "Drink Water")
  color: string;
  reminderTime?: string;
  archived: boolean;
  completedDates: string[];
}

export interface Goal {
  id: string;
  title: string; // The goal title (e.g., "Read 12 Books")
  color: string;
  dueDate?: string;
  createdAt: string;
  archived: boolean;
  relatedHabitIds?: string[]; // Added this to fix ArchivesScreen error
}

export interface JournalEntry {
  id: string;
  date: string;
  habitId?: string;
  text: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description?: string; // Added to fix badges.tsx error
  unlockedAt?: string;  // Added to fix badges.tsx and settings.tsx errors
  earnedDate?: string;  // Keeping this for backward compatibility
}