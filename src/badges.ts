// src/badges.ts
import { Badge, Goal, Habit, ID, JournalEntry } from './types';

// ---------- helpers ----------
function uniqueById<T extends { id: ID }>(list: T[]): T[] {
  const seen = new Set<ID>();
  const out: T[] = [];
  for (const item of list) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
}

function makeBadge(
  id: ID,
  title: string,
  description: string,
  icon?: string
): Badge {
  return { id, title, description, icon, unlockedAt: null };
}

type EvalArgs = {
  entries: JournalEntry[];
  existingBadges: Badge[];
  habits: Habit[];
  goals: Goal[];
};

// Try to infer which array is which based on a property unique to each type.
function normalizeArgs(
  a?: unknown[],
  b?: unknown[],
  c?: unknown[],
  d?: unknown[]
): EvalArgs {
  const empty: EvalArgs = { entries: [], existingBadges: [], habits: [], goals: [] };

  const isEntry = (x: any) => x && typeof x.date === 'string';
  const isBadge = (x: any) => x && typeof (x.title ?? x.name) === 'string' && typeof x.id === 'string';
  const isHabit = (x: any) => x && typeof x.name === 'string' && typeof x.color === 'string';
  const isGoal  = (x: any) => x && typeof x.title === 'string' && typeof x.color === 'string';

  const buckets: EvalArgs = { ...empty };

  for (const arr of [a, b, c, d]) {
    if (!Array.isArray(arr) || arr.length === 0) continue;
    const sample = arr[0] as any;
    if (isEntry(sample)) buckets.entries = arr as JournalEntry[];
    else if (isBadge(sample)) buckets.existingBadges = arr as Badge[];
    else if (isHabit(sample)) buckets.habits = arr as Habit[];
    else if (isGoal(sample)) buckets.goals = arr as Goal[];
  }

  return buckets;
}

// ---------- overloads (either order works) ----------
export function evalBadges(
  entries: JournalEntry[],
  existingBadges: Badge[],
  habits?: Habit[],
  goals?: Goal[]
): Badge[];
export function evalBadges(
  habits: Habit[],
  goals: Goal[],
  entries: JournalEntry[],
  existingBadges: Badge[]
): Badge[];

// ---------- implementation ----------
export function evalBadges(a?: any[], b?: any[], c?: any[], d?: any[]): Badge[] {
  const { entries, existingBadges, habits, goals } = normalizeArgs(a, b, c, d);

  // Catalog of built-in badges (start locked; unlock by conditions below)
  const catalog: Badge[] = [
    makeBadge('first_habit',   'First Habit!',   'Created your first habit.', '🏁'),
    makeBadge('first_goal',    'Goal Getter',    'Added your first goal.',    '🎯'),
    makeBadge('first_journal', 'Dear Diary',     'Wrote your first entry.',   '📔'),
  ];

  // Merge existing + catalog without losing prior unlockedAt values
  const map = new Map<ID, Badge>();
  for (const b of existingBadges) map.set(b.id, { ...b });
  for (const b of catalog) if (!map.has(b.id)) map.set(b.id, { ...b });

  const unlock = (id: ID) => {
    const b = map.get(id);
    if (b && !b.unlockedAt) b.unlockedAt = new Date().toISOString();
  };

  if (habits.length > 0) unlock('first_habit');
  if (goals.length  > 0) unlock('first_goal');
  if (entries.length > 0) unlock('first_journal');

  return uniqueById(Array.from(map.values()));
}

export default evalBadges;