import { JournalEntry, Badge } from './types';

// Badge evaluation function
export function evalBadges(entries: JournalEntry[], currentBadges: Badge[]): Badge[] {
  // Calculate stats from entries
  const completedHabits = entries.filter(e => e.completed && e.habitId).length;
  const uniqueDates = new Set(entries.filter(e => e.completed).map(e => e.date));
  const uniqueDatesCount = uniqueDates.size;

  // Check for consecutive days (streak)
  const sortedDates = Array.from(uniqueDates).sort();
  let currentStreak = 0;
  let maxStreak = 0;

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      currentStreak = 1;
    } else {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, currentStreak);
  }

  // Define badge unlock conditions
  const badgeDefinitions = [
    {
      id: 'first-habit',
      name: 'First Step',
      description: 'Complete your first habit',
      condition: completedHabits >= 1,
    },
    {
      id: 'three-days',
      name: '3 Day Streak',
      description: 'Complete habits 3 days in a row',
      condition: maxStreak >= 3,
    },
    {
      id: 'week-warrior',
      name: 'Week Warrior',
      description: 'Complete habits 7 days in a row',
      condition: maxStreak >= 7,
    },
    {
      id: 'month-master',
      name: 'Month Master',
      description: 'Complete habits 30 days in a row',
      condition: maxStreak >= 30,
    },
    {
      id: 'dedication',
      name: 'Dedication',
      description: 'Complete habits 100 days in a row',
      condition: maxStreak >= 100,
    },
    {
      id: 'century',
      name: 'Century Club',
      description: 'Complete 100 habits total',
      condition: completedHabits >= 100,
    },
    {
      id: 'consistency',
      name: 'Consistency King',
      description: 'Complete 500 habits total',
      condition: completedHabits >= 500,
    },
  ];

  // Update badges
  const updatedBadges = [...currentBadges];

  badgeDefinitions.forEach(def => {
    const existingBadge = updatedBadges.find(b => b.id === def.id);

    if (def.condition && !existingBadge) {
      // Unlock new badge
      updatedBadges.push({
        id: def.id,
        name: def.name,
        description: def.description,
        unlockedAt: new Date().toISOString(),
      });
    }
  });

  return updatedBadges;
}
