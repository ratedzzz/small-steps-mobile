import { Goal, JournalEntry, Habit } from '../types';

export function buildMarkedDates(dateISO: string[], entries: JournalEntry[], goals: Goal[], habits: Habit[], selected?: string) {
  const marked: Record<string, { dots?: { color: string }[]; selected?: boolean; selectedColor?: string }> = {};
  for (const d of dateISO) marked[d] = { dots: [] };
  for (const e of entries) {
    const habitColor = e.habitId ? habits.find(h=>h.id===e.habitId)?.color : undefined;
    if (habitColor) {
      if (!marked[e.date]) marked[e.date] = { dots: [] };
      marked[e.date].dots!.push({ color: habitColor });
    }
  }
  for (const g of goals) {
    if (g.dueDate) {
      if (!marked[g.dueDate]) marked[g.dueDate] = { dots: [] };
      marked[g.dueDate].dots!.push({ color: '#ff4d4d' });
    }
  }
  if (selected) {
    marked[selected] = { ...(marked[selected]||{}), selected: true, selectedColor: '#222' };
  }
  return marked;
}
