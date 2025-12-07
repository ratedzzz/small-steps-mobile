// src/badges.ts
import { Badge, Goal, Habit, JournalEntry } from './types';

// We extend the Badge type locally to include icons for the UI
// (You should eventually add 'icon' to your Badge definition in src/types.ts)
export interface BadgeWithIcon extends Badge {
  icon: string;
}

// ---------- HELPERS ----------
function makeBadge(
  id: string,
  name: string,
  description: string,
  icon: string
): BadgeWithIcon {
  return { id, name, description, icon, unlockedAt: undefined };
}

// ---------- THE LOGIC ----------
export function evalBadges(
  habits: Habit[] = [],
  goals: Goal[] = [],
  entries: JournalEntry[] = [],
  existingBadges: Badge[] = []
): BadgeWithIcon[] {
  
  // 1. Define the Catalog of ALL possible badges here
  const catalog: BadgeWithIcon[] = [
    makeBadge('first_habit', 'First Step', 'Created your first habit', 'footsteps'),
    makeBadge('habit_5', 'Habit Builder', 'Created 5 different habits', 'construct'),
    makeBadge('first_goal', 'Goal Getter', 'Set your first goal', 'flag'),
    makeBadge('first_journal', 'Dear Diary', 'Wrote your first journal entry', 'book'),
    makeBadge('journal_3', 'Storyteller', 'Wrote 3 journal entries', 'library'),
    makeBadge('goal_master', 'Dream Big', 'Created 3 goals', 'trophy'),
    makeBadge('pro_user', 'Supporter', 'Became a Pro user', 'star'),
  ];

  // 2. Create a Map to merge existing unlocked status with the catalog
  const map = new Map<string, BadgeWithIcon>();
  
  // Load catalog first
  for (const b of catalog) {
    map.set(b.id, b);
  }

  // Preserve previous unlock dates from the store
  for (const b of existingBadges) {
    if (map.has(b.id) && b.unlockedAt) {
      const current = map.get(b.id)!;
      current.unlockedAt = b.unlockedAt;
      map.set(b.id, current);
    }
  }

  // 3. The Rules Engine: Check if badges should be unlocked NOW
  const unlock = (id: string) => {
    const b = map.get(id);
    if (b && !b.unlockedAt) {
      b.unlockedAt = new Date().toISOString(); // Unlock it!
    }
  };

  // --- RULE DEFINITIONS ---
  if (habits.length >= 1) unlock('first_habit');
  if (habits.length >= 5) unlock('habit_5');
  
  if (goals.length >= 1) unlock('first_goal');
  if (goals.length >= 3) unlock('goal_master');

  if (entries.length >= 1) unlock('first_journal');
  if (entries.length >= 3) unlock('journal_3');

  // Convert map back to array
  return Array.from(map.values());
}

export default evalBadges;