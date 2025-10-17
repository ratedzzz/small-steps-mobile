// src/badges.ts
import { Badge, Habit, Goal, JournalEntry } from './types';

export const evalBadges = (entries: JournalEntry[], habits: Habit[], goals: Goal[]): Badge[] => {
  const badges: Badge[] = [];

  // First Habit Badge
  if (habits.length >= 1) {
    badges.push({
      id: 'first-habit',
      name: 'Getting Started',
      description: 'Created your first habit',
      icon: '🌱',
      unlockedAt: new Date().toISOString(),
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
      if (!lastDate) {
        currentStreak = 1;
      } else {
        const prevDay = new Date(lastDate);
        prevDay.setDate(prevDay.getDate() - 1);
        const entryDate = new Date(entry.date);

        if (entryDate.toDateString() === prevDay.toDateString()) {
          currentStreak++;
        } else if (entryDate.toDateString() !== new Date(lastDate).toDateString()) {
          // If there's a gap, break the streak
          break;
        }
      }
      lastDate = entry.date;
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
      unlockedAt: new Date().toISOString(),
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
      unlockedAt: new Date().toISOString(),
    });
  }

  return badges;
};
