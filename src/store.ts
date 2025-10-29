import { create } from 'zustand';
import { evalBadges } from './badges';
import { Badge, Goal, Habit, JournalEntry } from './types';

import {
  initSchema,
  insertHabit,
  insertGoal,
  getAllHabits,
  getAllGoals,
  getAllJournalEntries,
  insertJournalEntry,
  deleteHabit,
  deleteGoal,
} from './utils/storage';

import {
  scheduleHabitReminder,
  rescheduleAll,
  // cancelHabitReminder, // TODO: implement in utils/notifications if you want
} from './utils/notifications';

// simple id generator for habits/goals etc.
export const newId = () => Math.random().toString(36).slice(2, 10);

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

  upsertEntry: (e: JournalEntry) => void;

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
   * - fetch habits/goals/journal from SQLite
   * - recompute badges
   * - push everything into Zustand
   * - reschedule habit reminders
   */
  loadFromDB: async () => {
    // 1. Make sure our tables exist
    initSchema();

    // 2. Read from SQLite
    const [habitsRows, goalsRows, journalRowsRaw] = await Promise.all([
      getAllHabits(),
      getAllGoals(),
      getAllJournalEntries(),
    ]);

    // 3. Convert raw journal rows from DB into in-memory shape
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

    // 4. Recompute badges with fresh data
    const newBadges = evalBadges(journalRows, habitsRows, goalsRows, []);

    // 5. Update Zustand
    set({
      habits: habitsRows,
      goals: goalsRows,
      entries: journalRows,
      badges: newBadges,
    });

    // 6. Rebuild notifications after load
    await rescheduleAll(
      habitsRows.map((h: Habit) => ({
        id: h.id,
        name: h.name,
        // IMPORTANT: pass undefined, not null, because some notif types forbid null
        reminderTime: h.reminderTime ?? undefined,
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
      // normalize to null if missing so SQLite gets NULL
      reminderTime: h.reminderTime ?? null,
    };

    // 1. Persist to DB
    await insertHabit({
      id: newHabit.id,
      name: newHabit.name,
      color: newHabit.color,
      reminderTime: newHabit.reminderTime ?? null,
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
        reminderTime: newHabit.reminderTime ?? undefined,
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
   * removeHabit()
   * - delete from SQLite
   * - cancel its notification (TODO when you add cancelHabitReminder)
   * - update Zustand
   * - recompute badges
   */
  removeHabit: async (id: string) => {
    const { habits, goals, entries, badges } = get();

    // 1. delete from DB
    await deleteHabit(id);

    // 2. cancel OS notification for this habit if/when implemented
    // await cancelHabitReminder(id);

    // 3. update local arrays
    const updatedHabits = habits.filter((h) => h.id !== id);

    // 4. recompute badges
    const newBadges = evalBadges(entries, updatedHabits, goals, badges);

    set({
      habits: updatedHabits,
      badges: newBadges,
    });
  },

  /**
   * removeGoal()
   * - delete from SQLite
   * - update Zustand
   * - recompute badges
   */
  removeGoal: async (id: string) => {
    const { habits, goals, entries, badges } = get();

    // 1. delete from DB
    await deleteGoal(id);

    // 2. update local arrays
    const updatedGoals = goals.filter((g) => g.id !== id);

    // 3. recompute badges
    const newBadges = evalBadges(entries, habits, updatedGoals, badges);

    set({
      goals: updatedGoals,
      badges: newBadges,
    });
  },

  /**
   * upsertEntry()
   * - add or update a journal entry / daily log / check-in in memory
   * - persist new row to SQLite
   * - recalc badges
   */
  upsertEntry: (e: JournalEntry) => {
    const { habits, goals, badges, entries } = get();

    // We consider one row per (date, habitId).
    const i = entries.findIndex(
      (x) => x.date === e.date && x.habitId === e.habitId
    );

    let newEntries = [...entries];

    if (i >= 0) {
      // merge into existing entry
      newEntries[i] = { ...newEntries[i], ...e };
    } else {
      // brand new entry
      newEntries = [...newEntries, e];
    }

    // Recompute badges with updated entries
    const newBadges = evalBadges(newEntries, habits, goals, badges);

    // Update Zustand immediately
    set({
      entries: newEntries,
      badges: newBadges,
    });

    // Persist to SQLite in the background.
    insertJournalEntry({
      date: e.date,
      habitId: e.habitId,
      // store "completed" as text = "completed", otherwise store user's text.
      text: e.completed ? 'completed' : e.text ?? undefined,
    }).catch((err) => {
      console.warn('Failed to insert journal entry', err);
    });
  },
}));
