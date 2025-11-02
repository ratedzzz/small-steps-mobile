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

// robust id generator for habits/goals
function generateUniqueId(existing: string[]): string {
  let id;
  do {
    id = Math.random().toString(36).slice(2, 10);
  } while (existing.includes(id));
  return id;
}

export type State = {
  habits: Habit[];
  goals: Goal[];
  entries: JournalEntry[]; // journal / notes / check-ins
  badges: Badge[];
  pro: boolean; // subscription stub for Settings

  setPro: (v: boolean) => void;
  loadFromDB: () => Promise<void>;
  addHabit: (h: Partial<Habit>) => Promise<void>;
  addGoal: (g: Partial<Goal>) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;

  // NEW: update APIs for editing
  updateHabit: (id: string, patch: Partial<Habit>) => Promise<void>;
  updateGoal: (id: string, patch: Partial<Goal>) => Promise<void>;

  // NEW: selectors for edit screens
  getHabitById: (id: string) => Habit | undefined;
  getGoalById: (id: string) => Goal | undefined;

  upsertEntry: (e: JournalEntry) => void;
  resetAllInMemory: () => void;
};

export const useApp = create<State>((set, get) => ({
  habits: [],
  goals: [],
  entries: [],
  badges: [],
  pro: false,

  setPro: (v: boolean) => set({ pro: v }),

  resetAllInMemory: () => {
    set({
      habits: [],
      goals: [],
      entries: [],
      badges: [],
      pro: false,
    });
  },

  loadFromDB: async () => {
    const [habitsRows, goalsRows, journalRowsRaw] = await Promise.all([
      getAllHabits(),
      getAllGoals(),
      getAllJournalEntries(),
    ]);

    const journalRows: JournalEntry[] = journalRowsRaw.map((row: any) => ({
      id: row.id,
      date: row.date,
      habitId: row.habitId ?? undefined,
      completed: row.text === 'completed',
      text:
        row.text && row.text !== 'completed'
          ? row.text
          : undefined,
    }));

    const newBadges = evalBadges(journalRows, habitsRows, goalsRows, []);

    set({
      habits: habitsRows,
      goals: goalsRows,
      entries: journalRows,
      badges: newBadges,
    });

    await rescheduleAll(
      habitsRows.map((h: Habit) => ({
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

    await insertHabit({
      id: newHabit.id,
      name: newHabit.name,
      color: newHabit.color,
      reminderTime: newHabit.reminderTime ?? null,
    });

    const { entries, goals, badges } = get();
    const updatedHabits = [...habits, newHabit];

    const newBadges = evalBadges(entries, updatedHabits, goals, badges);

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
    const id = generateUniqueId(goals.map(x => x.id));

    const newGoal: Goal = {
      id,
      title: g.title ?? 'New goal',
      color: g.color ?? '#9ad67d',
      dueDate: g.dueDate,
    };

    await insertGoal({
      id: newGoal.id,
      title: newGoal.title,
      color: newGoal.color,
      dueDate: newGoal.dueDate,
    });

    const { habits, entries, badges } = get();
    const updatedGoals = [...goals, newGoal];

    const newBadges = evalBadges(entries, habits, updatedGoals, badges);

    set({
      goals: updatedGoals,
      badges: newBadges,
    });
  },

  removeHabit: async (id: string) => {
    const { habits, goals, entries, badges } = get();

    await deleteHabit(id);
    const updatedHabits = habits.filter((h) => h.id !== id);

    const newBadges = evalBadges(entries, updatedHabits, goals, badges);

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
    const updatedGoals = goals.filter((g) => g.id !== id);

    const newBadges = evalBadges(entries, habits, updatedGoals, badges);

    set({
      goals: updatedGoals,
      badges: newBadges,
    });
  },

  updateHabit: async (id: string, patch: Partial<Habit>) => {
    const { habits, goals, entries, badges } = get();
    const idx = habits.findIndex(h => h.id === id);
    if (idx < 0) return;

    const prev = habits[idx];
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
      console.warn('updateHabit: insertHabit failed (is it not an UPSERT/REPLACE?) — keeping in-memory state only', err);
    }

    const updatedHabits = [...habits];
    updatedHabits[idx] = next;

    const newBadges = evalBadges(entries, updatedHabits, goals, badges);

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
    const idx = goals.findIndex(g => g.id === id);
    if (idx < 0) return;

    const prev = goals[idx];
    const next: Goal = { ...prev, ...patch };

    try {
      await insertGoal({
        id: next.id,
        title: next.title,
        color: next.color,
        dueDate: next.dueDate,
      });
    } catch (err) {
      console.warn('updateGoal: insertGoal failed (is it not an UPSERT/REPLACE?) — keeping in-memory state only', err);
    }

    const updatedGoals = [...goals];
    updatedGoals[idx] = next;

    const newBadges = evalBadges(entries, habits, updatedGoals, badges);

    set({
      goals: updatedGoals,
      badges: newBadges,
    });
  },

  getHabitById: (id: string) => get().habits.find(h => h.id === id),
  getGoalById:  (id: string) => get().goals.find(g => g.id === id),

  upsertEntry: (e: JournalEntry) => {
    const { habits, goals, badges, entries } = get();
    const i = entries.findIndex(
      (x) => x.date === e.date && x.habitId === e.habitId
    );

    let newEntries = [...entries];

    if (i >= 0) {
      newEntries[i] = { ...newEntries[i], ...e };
    } else {
      newEntries = [...newEntries, e];
    }

    const newBadges = evalBadges(newEntries, habits, goals, badges);

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
