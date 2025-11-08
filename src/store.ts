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
  addGoal: (g: Partial<Goal>) => void;
  upsertEntry: (e: JournalEntry) => void;
  archiveHabit: (id: ID) => void;
  archiveGoal: (id: ID) => void;
  deleteHabit: (id: ID) => void;
  deleteGoal: (id: ID) => void;
  setPro: (v: boolean) => void;
};

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      habits: [], goals: [], entries: [], badges: [], pro: false,
      setPro: (v) => set({ pro: v }),
      addHabit: (h) => set((s) => ({ habits: [...s.habits, { id: newId(), name: h.name ?? 'New habit', color: h.color ?? '#6fb3ff', reminderTime: h.reminderTime }] })),
      addGoal: (g) => set((s) => ({ goals: [...s.goals, { id: newId(), title: g.title ?? 'New goal', color: g.color ?? '#9ad67d', dueDate: g.dueDate }] })),
      upsertEntry: (e) => set((s) => {
        // Find existing entry by ID first, then by date/habitId combo for habits, or by date for journal entries
        const i = s.entries.findIndex(x => x.id === e.id || (x.date === e.date && x.habitId === e.habitId));
        let entries = [...s.entries];
        if (i >= 0) entries[i] = { ...entries[i], ...e };
        else entries = [...entries, e];
        const badges = evalBadges(entries, s.badges);
        return { entries, badges };
      }),
      archiveHabit: (id) => set((s) => ({
        habits: s.habits.map(h => h.id === id ? { ...h, archived: true } : h)
      })),
      archiveGoal: (id) => set((s) => ({
        goals: s.goals.map(g => g.id === id ? { ...g, archived: true } : g)
      })),
      deleteHabit: (id) => set((s) => ({
        habits: s.habits.filter(h => h.id !== id)
      })),
      deleteGoal: (id) => set((s) => ({
        goals: s.goals.filter(g => g.id !== id)
      })),
    }),
    { name: 'small-steps', storage: createJSONStorage(() => AsyncStorage) }
  )
);
