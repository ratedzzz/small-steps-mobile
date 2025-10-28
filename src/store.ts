// src/store.ts

import { create } from 'zustand';
import { evalBadges } from './badges';
import { Badge, Goal, Habit, JournalEntry } from './types';

import {
  initSchema,
  insertHabit,
  insertGoal,
  getAllHabits,
  getAllGoals,
} from './utils/storage';

import {
  scheduleHabitReminder,
  rescheduleAll,
} from './utils/notifications';

// simple id generator
export const newId = () => Math.random().toString(36).slice(2, 10);

export type State = {
  habits: Habit[];
  goals: Goal[];
  entries: JournalEntry[]; // journal / notes / check-ins
  badges: Badge[];
  pro: boolean; // subscription stub for Settings

  // actions exposed to UI:
  setPro: (v: boolean) => void;

  loadFromDB: () => Promise<void>;

  addHabit: (h: Partial<Habit>) => Promise<void>;
  addGoal: (g: Partial<Goal>) => Promise<void>;

  upsertEntry: (e: JournalEntry) => void;

  /**
   * resetAllInMemory
   * Clears all local Zustand state after we wipe SQLite
   * (used by SettingsScreen "Clear All Data")
   */
  resetAllInMemory: () => void;
};

export const useApp = create<State>((set, get) => ({
  habits: [],
  goals: [],
  entries: [],
  badges: [],
  pro: false,

  // toggle / set Pro status (placeholder for paid tier)
  setPro: (v: boolean) => set({ pro: v }),

  /**
   * resetAllInMemory()
   * This should be called after eraseAll() in Settings.
   * It wipes in-memory state so the UI instantly reflects "no data".
   */
  resetAllInMemory: () => {
    set({
      habits: [],
      goals: [],
      entries: [],
      badges: [],
      pro: false,
    });
  },

  /**
   * loadFromDB()
   * - ensure schema exists
   * - fetch habits/goals from SQLite
   * - recompute badges
   * - push everything into Zustand
   * - reschedule habit reminders
   */
  loadFromDB: async () => {
    // 1. Make sure our tables exist
    initSchema();

    // 2. Read from SQLite
    const [habitsRows, goalsRows] = await Promise.all([
      getAllHabits(),
      getAllGoals(),
    ]);

    // 3. Keep any existing in-memory stuff we don't fetch yet (entries/badges)
    const { entries, badges: oldBadges } = get();

    // 4. Recompute badges using new habits/goals
    const newBadges = evalBadges(entries, habitsRows, goalsRows, oldBadges);

    // 5. Update Zustand
    set({
      habits: habitsRows,
      goals: goalsRows,
      badges: newBadges,
    });

    // 6. Rebuild notifications after load
    await rescheduleAll(
      habitsRows.map((h: Habit) => ({
        id: h.id,
        name: h.name,
        reminderTime: h.reminderTime ?? null,
      }))
    );
  },

  /**
   * addHabit()
   * - create a new Habit object
   * - write it to SQLite
   * - update Zustand immediately so UI feels instant
   * - schedule notification if reminderTime is set
   */
  addHabit: async (h: Partial<Habit>) => {
    const id = newId();

    const newHabit: Habit = {
      id,
      name: h.name ?? 'New habit',
      color: h.color ?? '#6fb3ff',
      reminderTime: h.reminderTime,
    };

    // 1. Persist to DB
    await insertHabit({
      id: newHabit.id,
      name: newHabit.name,
      color: newHabit.color,
      reminderTime: newHabit.reminderTime,
    });

    // 2. Update Zustand copy of habits
    const { habits, entries, goals, badges } = get();
    const updatedHabits = [...habits, newHabit];

    // 3. Recompute badges because habits changed
    const newBadges = evalBadges(entries, updatedHabits, goals, badges);

    set({
      habits: updatedHabits,
      badges: newBadges,
    });

    // 4. Schedule daily reminder if habit has reminderTime
    if (newHabit.reminderTime) {
      await scheduleHabitReminder({
        id: newHabit.id,
        name: newHabit.name,
        reminderTime: newHabit.reminderTime ?? null,
      });
    }
  },

  /**
   * addGoal()
   * - create a new Goal object
   * - write it to SQLite
   * - update Zustand immediately
   * - recompute badges
   */
  addGoal: async (g: Partial<Goal>) => {
    const id = newId();

    const newGoal: Goal = {
      id,
      title: g.title ?? 'New goal',
      color: g.color ?? '#9ad67d',
      dueDate: g.dueDate,
    };

    // 1. Persist to DB
    await insertGoal({
      id: newGoal.id,
      title: newGoal.title,
      color: newGoal.color,
      dueDate: newGoal.dueDate,
    });

    // 2. Update Zustand copy of goals
    const { habits, goals, entries, badges } = get();
    const updatedGoals = [...goals, newGoal];

    // 3. Recompute badges because goals changed
    const newBadges = evalBadges(entries, habits, updatedGoals, badges);

    set({
      goals: updatedGoals,
      badges: newBadges,
    });
  },

  /**
   * upsertEntry()
   * - add or update a journal entry / daily log / check-in
   * - currently in-memory only (not yet persisted to SQLite)
   * - also recalculates badges using latest entries
   */
  upsertEntry: (e: JournalEntry) => {
    const { habits, goals, badges, entries } = get();

    // an "entry" is considered the same if same date + same habitId
    // note: you're also doing this "(!e.text || x.text === e.text)" check:
    const i = entries.findIndex(
      (x) =>
        x.date === e.date &&
        x.habitId === e.habitId &&
        (!e.text || x.text === e.text)
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
  },
}));
