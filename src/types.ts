export interface Habit {
  id: string;
  title: string;
  color: string;
  icon?: string;       
  streak: number;      
  completedDates: string[];
  reminderTime: string | null; 
  archived: boolean;
}

export interface Goal {
  id: string;
  title: string;
  color: string;
  dueDate: string;
  completed: boolean; 
  progress: number;
  total: number;
  createdAt?: string; 
  archived: boolean;
  relatedHabitIds: string[];
}

export interface JournalEntry {
  id?: string;
  date: string;       
  content: string;    
  mood: 'happy' | 'neutral' | 'sad' | 'excited' | 'tired';
  tags: string[];
  habitId?: string;   
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string; 
}