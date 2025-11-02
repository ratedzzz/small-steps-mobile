import { create } from 'zustand';
import { evalBadges } from './badges';
import { Badge, Goal, Habit, JournalEntry } from './types';
import { normalizeReminderTime } from './types'; // add this near the top of store.ts

import {
  deleteGoal,
  deleteHabit,
  getAllGoals,
  getAllHabits,
  getAllJournalEntries,
  insertGoal,
  insertHabit,
  insertJournalEntry
} from './utils/storage';

import {
  rescheduleAll,
  scheduleHabitReminder,
} from './utils/notifications';

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

// Prefer crypto.randomUUID when available; otherwise use robust fallback
function makeId(): string {
  try {
    // @ts-ignore - RN >= 0.71 exposes crypto.randomUUID on Hermes/JSI
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {}
  // 16-char base36 chunk
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

// De-duplicate by id (keeps first occurrence)
function uniqById<T extends { id: string }>(items: T[] | undefined | null): T[] {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of items) {
    if (!it || !it.id) continue;
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    out.push(it);
  }
  return out;
}

// Generate an id guaranteed not to collide with an existing set
function generateUniqueId(existing: string[]): string {
  let id = makeId();
  while (existing.includes(id)) {
    id = makeId();
  }
  return id;
}

/* ------------------------------------------------------------------ */
/* Store types                                                         */
/* ------------------------------------------------------------------ */

export type State = {
  habits: Habit[];
  goals: Goal[];
  entries: JournalEntry[]; // journal / notes / check-ins
  badges: Badge[];
  pro: boolean; // subscription stub for Settings

  /** prevents double-hydration / duplicate inserts during HMR & StrictMode */
  _hydrated: boolean;

  setPro: (v: boolean) => void;
  loadFromDB: () => Promise<void>;
  addHabit: (h: Partial<Habit>) => Promise<void>;
  addGoal: (g: Partial<Goal>) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;

  // update APIs for editing
  updateHabit: (id: string, patch: Partial<Habit>) => Promise<void>;
  updateGoal: (id: string, patch: Partial<Goal>) => Promise<void>;

  // selectors for edit screens
  getHabitById: (id: string) => Habit | undefined;
  getGoalById: (id: string) => Goal | undefined;

  upsertEntry: (e: JournalEntry) => void;
  resetAllInMemory: () => void;
};

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

export const useApp = create<State>((set, get) => ({
  habits: [],
  goals: [],
  entries: [],
  badges: [],
  pro: false,
  _hydrated: false,

  setPro: (v: boolean) => set({ pro: v }),

  resetAllInMemory: () => {
    set({
      habits: [],
      goals: [],
      entries: [],
      badges: [],
      pro: false,
      _hydrated: false,
    });
  },

  loadFromDB: async () => {
    // Guard against duplicate hydration in dev / HMR / StrictMode
    if (get()._hydrated) return;

    const [habitsRows, goalsRows, journalRowsRaw] = await Promise.all([
      getAllHabits(),
      getAllGoals(),
      getAllJournalEntries(),
    ]);

    // Normalize & dedupe data coming from storage
    const safeHabits: Habit[] = uniqById((habitsRows ?? []).filter(Boolean) as Habit[]);
    const safeGoals: Goal[] = uniqById((goalsRows ?? []).filter(Boolean) as Goal[]);

    const journalRows: JournalEntry[] = (journalRowsRaw ?? []).map((row: any) => ({
      id: row.id,
      date: row.date,
      habitId: row.habitId ?? undefined,
      completed: row.text === 'completed',
      text: row.text && row.text !== 'completed' ? row.text : undefined,
    }));

    const newBadges = evalBadges(journalRows, safeHabits, safeGoals, []);

    set({
      habits: safeHabits,
      goals: safeGoals,
      entries: journalRows,
      badges: newBadges,
      _hydrated: true,
    });

    // (Re)schedule notifications for the deduped set
    await rescheduleAll(
      safeHabits.map((h: Habit) => ({
        id: h.id,
        name: h.name,
        reminderTime: h.reminderTime ?? undefined,
      }))
    );
  },

  addHabit: async (h: Partial<Habit>) => {
    const { habits } = get();
    const id = generateUniqueId(habits.map(x => x.id));

    const newHabit: Habit = {
      id,
      name: h.name ?? 'New habit',
      color: h.color ?? '#6fb3ff',
      reminderTime: h.reminderTime ?? null,
    };

    // Persist first
    await insertHabit({
      id: newHabit.id,
      name: newHabit.name,
      color: newHabit.color,
      reminderTime: newHabit.reminderTime ?? null,
    });

    // Update in-memory (dedupe to avoid double renders / duplicates)
    const { entries, goals, badges } = get();
    const updatedHabits = uniqById< Habit >([...(habits ?? []), newHabit]);

    const newBadges = evalBadges(entries ?? [], updatedHabits, goals ?? [], badges ?? []);

    set({
      habits: updatedHabits,
      badges: newBadges,
    });

    if (newHabit.reminderTime) {
      await scheduleHabitReminder({
        id: newHabit.id,
        name: newHabit.name,
        reminderTime: newHabit.reminderTime ?? undefined,
      });
    }
  },

  addGoal: async (g: Partial<Goal>) => {
    const { goals } = get();
    const id = generateUniqueId((goals ?? []).map(x => x.id));

    const newGoal: Goal = {
      id,
      title: g.title ?? 'New goal',
      color: g.color ?? '#9ad67d',
      dueDate: g.dueDate,
    };

    // Persist first
    await insertGoal({
      id: newGoal.id,
      title: newGoal.title,
      color: newGoal.color,
      dueDate: newGoal.dueDate,
    });

    // Update in-memory (dedupe)
    const { habits, entries, badges } = get();
    const updatedGoals = uniqById< Goal >([...(goals ?? []), newGoal]);

    const newBadges = evalBadges(entries ?? [], habits ?? [], updatedGoals, badges ?? []);

    set({
      goals: updatedGoals,
      badges: newBadges,
    });
  },

  removeHabit: async (id: string) => {
    const { habits, goals, entries, badges } = get();

    await deleteHabit(id);
    const updatedHabits = uniqById((habits ?? []).filter((h) => h.id !== id));

    const newBadges = evalBadges(entries ?? [], updatedHabits, goals ?? [], badges ?? []);

    set({
      habits: updatedHabits,
      badges: newBadges,
    });

    await rescheduleAll(
      updatedHabits.map((h: Habit) => ({
        id: h.id,
        name: h.name,
        reminderTime: h.reminderTime ?? undefined,
      }))
    );
  },

  removeGoal: async (id: string) => {
    const { habits, goals, entries, badges } = get();

    await deleteGoal(id);
    const updatedGoals = uniqById((goals ?? []).filter((g) => g.id !== id));

    const newBadges = evalBadges(entries ?? [], habits ?? [], updatedGoals, badges ?? []);

    set({
      goals: updatedGoals,
      badges: newBadges,
    });
  },

  updateHabit: async (id: string, patch: Partial<Habit>) => {
    const { habits, goals, entries, badges } = get();
    const safeHabits = habits ?? [];
    const idx = safeHabits.findIndex(h => h.id === id);
    if (idx < 0) return;

    const prev = safeHabits[idx];
    const next: Habit = {
      ...prev,
      ...patch,
      reminderTime:
        patch.reminderTime === undefined
          ? (prev.reminderTime ?? null)
          : normalizeReminderTime(patch.reminderTime),
    };

    try {
      await insertHabit({
        id: next.id,
        name: next.name,
        color: next.color,
        reminderTime: next.reminderTime ?? null,
      });
    } catch (err) {
      console.warn(
        'updateHabit: insertHabit failed (is it not an UPSERT/REPLACE?) — keeping in-memory state only',
        err
      );
    }

    const updatedHabits = uniqById< Habit >(
      safeHabits.map((h, i) => (i === idx ? next : h))
    );

    const newBadges = evalBadges(entries ?? [], updatedHabits, goals ?? [], badges ?? []);

    set({
      habits: updatedHabits,
      badges: newBadges,
    });

    await rescheduleAll(
      updatedHabits.map((h: Habit) => ({
        id: h.id,
        name: h.name,
        reminderTime: h.reminderTime ?? undefined,
      }))
    );
  },

  updateGoal: async (id: string, patch: Partial<Goal>) => {
    const { habits, goals, entries, badges } = get();
    const safeGoals = goals ?? [];
    const idx = safeGoals.findIndex(g => g.id === id);
    if (idx < 0) return;

    const prev = safeGoals[idx];
    const next: Goal = { ...prev, ...patch };

    try {
      await insertGoal({
        id: next.id,
        title: next.title,
        color: next.color,
        dueDate: next.dueDate,
      });
    } catch (err) {
      console.warn(
        'updateGoal: insertGoal failed (is it not an UPSERT/REPLACE?) — keeping in-memory state only',
        err
      );
    }

    const updatedGoals = uniqById< Goal >(
      safeGoals.map((g, i) => (i === idx ? next : g))
    );

    const newBadges = evalBadges(entries ?? [], habits ?? [], updatedGoals, badges ?? []);

    set({
      goals: updatedGoals,
      badges: newBadges,
    });
  },

  getHabitById: (id: string) => (get().habits ?? []).find(h => h.id === id),
  getGoalById:  (id: string) => (get().goals ?? []).find(g => g.id === id),

  upsertEntry: (e: JournalEntry) => {
    const { habits, goals, badges, entries } = get();
    const safeEntries = entries ?? [];

    const i = safeEntries.findIndex(
      (x) => x.date === e.date && x.habitId === e.habitId
    );

    let newEntries = [...safeEntries];

    if (i >= 0) {
      newEntries[i] = { ...newEntries[i], ...e };
    } else {
      newEntries = [...newEntries, e];
    }

    const newBadges = evalBadges(newEntries, habits ?? [], goals ?? [], badges ?? []);

    set({
      entries: newEntries,
      badges: newBadges,
    });

    insertJournalEntry({
      date: e.date,
      habitId: e.habitId,
      text: e.completed ? 'completed' : e.text ?? undefined,
    }).catch((err) => {
      console.warn('Failed to insert journal entry', err);
    });
  },
}));
