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
        const i = s.entries.findIndex(x => x.date === e.date && x.habitId === e.habitId && (!e.text || x.text === e.text));
        let entries = [...s.entries];
        if (i >= 0) entries[i] = { ...entries[i], ...e };
        else entries = [...entries, e];
        const badges = evalBadges(entries, s.badges);
        return { entries, badges };
      }),
    }),
    { name: 'small-steps', storage: createJSONStorage(() => AsyncStorage) }
  )
);
