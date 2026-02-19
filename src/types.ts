export interface Habit {
  id: string;
  title: string;       // We are standardizing on 'title' (was 'name')
  color: string;
  icon?: string;       // Added: The store needs this
  streak: number;      // Added: The store needs this
  completedDates: string[];
  reminderTime: string | null; 
  archived: boolean;
}

export interface Goal {
  id: string;
  title: string;
  color: string;
  dueDate: string;
  completed: boolean;  // Added: For checkbox logic
  progress: number;
  total: number;
  createdAt?: string;  // Kept from your old file
  archived: boolean;
  relatedHabitIds: string[];
}

export interface JournalEntry {
  id?: string;
  date: string;        // YYYY-MM-DD
  content: string;     // We are standardizing on 'content' (was 'text')
  mood: 'happy' | 'neutral' | 'sad' | 'excited' | 'tired';
  tags: string[];
  habitId?: string;    // Kept from your old file
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string; // ISO Date string
}