// src/badges.ts - Badge evaluation logic for SQLite-based store
import { Badge, JournalEntry, Habit, Goal } from './types';

const BADGE_DEFINITIONS = [
  {
    id: 'first-habit',
    name: 'First Step',
    description: 'Complete your first habit',
    icon: '🌱',
    checkUnlock: (completedCount: number) => completedCount >= 1,
  },
  {
    id: 'three-days',
    name: '3 Day Streak',
    description: 'Complete habits 3 days in a row',
    icon: '🔥',
    checkUnlock: (completedCount: number, uniqueDays: number) => uniqueDays >= 3,
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Complete habits 7 days in a row',
    icon: '⭐',
    checkUnlock: (completedCount: number, uniqueDays: number) => uniqueDays >= 7,
  },
  {
    id: 'habit-collector',
    name: 'Habit Collector',
    description: 'Create 5 different habits',
    icon: '📚',
    checkUnlock: (completedCount: number, uniqueDays: number, habitCount: number) => habitCount >= 5,
  },
  {
    id: 'century',
    name: 'Century Club',
    description: 'Complete 100 habits total',
    icon: '💯',
    checkUnlock: (completedCount: number) => completedCount >= 100,
  },
  {
    id: 'month-master',
    name: 'Month Master',
    description: 'Complete habits 30 days in a row',
    icon: '🏆',
    checkUnlock: (completedCount: number, uniqueDays: number) => uniqueDays >= 30,
  },
  {
    id: 'dedication',
    name: 'Dedication',
    description: 'Complete habits 100 days in a row',
    icon: '👑',
    checkUnlock: (completedCount: number, uniqueDays: number) => uniqueDays >= 100,
  },
  {
    id: 'consistency',
    name: 'Consistency King or Queen',
    description: 'Complete 500 habits total',
    icon: '💪',
    checkUnlock: (completedCount: number) => completedCount >= 500,
  },
];

/**
 * Evaluate badges based on current entries and context
 * This function is called by the store after any habit/goal/entry change
 * 
 * @param entries - All journal entries
 * @param context - Object containing habits, goals, and current badges
 * @returns Updated badge array with newly unlocked badges
 */
export function evalBadges(
  entries: JournalEntry[],
  context: {
    habits: Habit[];
    goals: Goal[];
    badges: Badge[];
  }
): Badge[] {
  const { habits, badges: currentBadges } = context;

  // Calculate stats from entries
  const completedHabits = entries.filter(e => e.completed && e.habitId).length;
  const uniqueDates = new Set(
    entries.filter(e => e.completed && e.habitId).map(e => e.date)
  ).size;
  const habitCount = habits.length;

  const updatedBadges = [...(currentBadges || [])];

  BADGE_DEFINITIONS.forEach(badgeDef => {
    // Check if badge already exists
    const existingBadge = updatedBadges.find(b => b.id === badgeDef.id);
    
    // Check if badge should be unlocked
    const shouldUnlock = badgeDef.checkUnlock(completedHabits, uniqueDates, habitCount);

    if (shouldUnlock && !existingBadge) {
      // Unlock new badge
      updatedBadges.push({
        id: badgeDef.id,
        name: badgeDef.name,
        description: badgeDef.description,
        unlockedAt: new Date().toISOString(),
      });
    } else if (shouldUnlock && existingBadge && !existingBadge.unlockedAt) {
      // Update existing badge to unlocked
      const index = updatedBadges.findIndex(b => b.id === badgeDef.id);
      if (index >= 0) {
        updatedBadges[index] = {
          ...existingBadge,
          unlockedAt: new Date().toISOString(),
        };
      }
    } else if (!existingBadge) {
      // Add locked badge placeholder
      updatedBadges.push({
        id: badgeDef.id,
        name: badgeDef.name,
        description: badgeDef.description,
      });
    }
  });

  return updatedBadges;
}

/**
 * Get all badge definitions with their current unlock status
 * This is used by BadgesScreen for display purposes
 * 
 * @param entries - All journal entries
 * @param habits - All habits
 * @returns Array of badges with unlock status and icons
 */
export function getAllBadges(
  entries: JournalEntry[],
  habits: Habit[]
): Array<{
  id: string;
  icon: string;
  name: string;
  description: string;
  unlocked: boolean;
}> {
  const completedHabits = entries.filter(e => e.completed && e.habitId).length;
  const uniqueDates = new Set(
    entries.filter(e => e.completed && e.habitId).map(e => e.date)
  ).size;

  return BADGE_DEFINITIONS.map(badgeDef => ({
    id: badgeDef.id,
    icon: badgeDef.icon,
    name: badgeDef.name,
    description: badgeDef.description,
    unlocked: badgeDef.checkUnlock(completedHabits, uniqueDates, habits.length),
  }));
}