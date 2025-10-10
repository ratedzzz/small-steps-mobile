import { Badge, JournalEntry } from './types';

export function evalBadges(entries: JournalEntry[], current: Badge[]): Badge[] {
  const have = new Set(current.map(b=>b.id));
  const out = [...current];
  const byHabit = new Map<string, string[]>();
  for (const e of entries) {
    if (e.habitId && e.completed) {
      const arr = byHabit.get(e.habitId) ?? [];
      if (!arr.includes(e.date)) arr.push(e.date);
      byHabit.set(e.habitId, arr);
    }
  }
  for (const [hid, dates] of byHabit) {
    dates.sort();
    if (dates.length >= 7) {
      const id = `streak7-${hid}`;
      if (!have.has(id)) out.push({ id, name: 'One-Week Warrior', description: '7-day streak', unlockedAt: new Date().toISOString() });
    }
  }
  return out;
}
