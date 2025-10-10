import { Habit, JournalEntry } from './types';

export function aiTipsForDay(dateISO: string, habits: Habit[], entries: JournalEntry[]): string[] {
  const tips: string[] = [];
  for (const h of habits) {
    const last7 = lastNDays(dateISO, 7);
    const done = last7.filter(d => entries.some(e=>e.habitId===h.id && e.date===d && e.completed)).length;
    if (done >= 5) tips.push(`Great streak on ${h.name}! Consider a tiny upgrade (add 1 minute).`);
    if (done <= 1) tips.push(`Struggling with ${h.name}? Try shrinking it to 2 minutes and set the reminder earlier.`);
  }
  if (habits.length === 0) tips.push('Start with one ultra‑small habit (e.g., drink one glass of water).');
  return tips;
}

function lastNDays(endISO: string, n: number): string[] {
  const [y,m,d] = endISO.split('-').map(Number);
  const end = new Date(y, m-1, d);
  const out: string[] = [];
  for (let i=0;i<n;i++) { const t = new Date(end); t.setDate(t.getDate()-i); out.push(t.toISOString().slice(0,10)); }
  return out;
}
