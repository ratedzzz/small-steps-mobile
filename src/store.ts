import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, Goal, JournalEntry, Badge, ID } from './types';
import { evalBadges } from './badges';

export const newId = () => Math.random().toString(36).slice(2, 10);

export type State = {
  habits: Habit[];
  goals: Goal[];
  entries: JournalEntry[];
  badges: Badge[];
  pro: boolean; // subscription stub
  addHabit: (h: Partial<Habit>) => void;
  updateHabit: (id: string, data: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  addGoal: (g: Partial<Goal>) => void;
  upsertEntry: (e: JournalEntry) => void;
  setPro: (v: boolean) => void;
};

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      habits: [],
      goals: [],
      entries: [],
      badges: [],
      pro: false,
      setPro: (v) => set({ pro: v }),

      addHabit: (h) =>
        set((s) => ({
          habits: [
            ...s.habits,
            {
              id: newId(),
              title: h.title ?? 'New habit',
              color: h.color ?? '#6fb3ff',
              reminderTime: h.reminderTime,
              doneDate: h.doneDate,
              archived: h.archived,
            },
          ],
        })),

      // Update existing habit
      updateHabit: (id, data) => {
        set((s) => ({
          habits: s.habits.map(h => h.id === id ? { ...h, ...data } : h)
        }));
      },

      // Delete habit by ID
      deleteHabit: (id) => {
        set((s) => ({
          habits: s.habits.filter(h => h.id !== id),
        }));
      },

      addGoal: (g) =>
        set((s) => ({
          goals: [
            ...s.goals,
            {
              id: newId(),
              title: g.title ?? 'New goal',
              color: g.color ?? '#9ad67d',
              dueDate: g.dueDate,
              archived: g.archived,
            },
          ],
        })),

      upsertEntry: (e) => {
        const i = get().entries.findIndex(
          (x) => x.date === e.date && x.habitId === e.habitId && (!e.text || x.text === e.text)
        );
        let entries = [...get().entries];
        if (i >= 0) entries[i] = { ...entries[i], ...e };
        else entries = [...entries, e];
        const badges = evalBadges(entries, get().badges);
        set({ entries, badges });
      },
    }),
    { name: 'small-steps', storage: createJSONStorage(() => AsyncStorage) }
  )
);
