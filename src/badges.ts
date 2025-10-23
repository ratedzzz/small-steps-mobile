// src/badges.ts
import { Badge, Goal, Habit, JournalEntry } from './types';

export const evalBadges = (
  entries: JournalEntry[],
  habits: Habit[],
  goals: Goal[],
  existingBadges: Badge[] = []
): Badge[] => {
  const badges: Badge[] = [];

  // Helper to preserve or create unlock timestamp
  const getUnlockedAt = (badgeId: string): string => {
    const existing = existingBadges.find(b => b.id === badgeId);
    return existing?.unlockedAt || new Date().toISOString();
  };

  // Helper to get previous day as YYYY-MM-DD string (UTC-consistent)
  const getPreviousDay = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00Z'); // Parse as UTC
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().split('T')[0];
  };

  // First Habit Badge
  if (habits.length >= 1) {
    badges.push({
      id: 'first-habit',
      name: 'Getting Started',
      description: 'Created your first habit',
      icon: '🌱',
      unlockedAt: getUnlockedAt('first-habit'),
    });
  }

  // Consistency Badge (e.g., 7 day streak)
  // Calculate streaks from entries
  const habitStreaks: { [habitId: string]: number } = {};
  habits.forEach(habit => {
    let currentStreak = 0;
    let lastDate: string | null = null;

    // Sort entries by date in descending order
    const sortedEntries = entries
      .filter(e => e.habitId === habit.id && e.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const entry of sortedEntries) {
      const entryDateStr = entry.date; // YYYY-MM-DD string

      if (!lastDate) {
        currentStreak = 1;
      } else {
        const expectedPrevDay = getPreviousDay(lastDate);
        
        if (entryDateStr === expectedPrevDay) {
          // Consecutive day - continue streak
          currentStreak++;
        } else if (entryDateStr === lastDate) {
          // Same-day duplicate entry - skip without breaking streak
          continue;
        } else {
          // Gap detected - break the streak
          break;
        }
      }
      lastDate = entryDateStr;
    }
    habitStreaks[habit.id] = currentStreak;
  });

  const hasSevenDayStreak = Object.values(habitStreaks).some(streak => streak >= 7);
  if (hasSevenDayStreak) {
    badges.push({
      id: 'week-streak',
      name: '7 Day Streak',
      description: 'Maintained a habit for 7 days',
      icon: '🔥',
      unlockedAt: getUnlockedAt('week-streak'),
    });
  }

  // Goal Achievement Badge
  const completedGoals = goals.filter(g => g.completed);
  if (completedGoals.length >= 1) {
    badges.push({
      id: 'first-goal',
      name: 'Goal Crusher',
      description: 'Completed your first goal',
      icon: '🎯',
      unlockedAt: getUnlockedAt('first-goal'),
    });
  }

  return badges;
};