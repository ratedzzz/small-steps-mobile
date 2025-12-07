// src/store.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { evalBadges } from "./badges";
import { Badge, Goal, Habit, ID, JournalEntry } from "./types";

export const newId = () => Math.random().toString(36).slice(2, 10);

export type State = {
  habits: Habit[];
  goals: Goal[];
  entries: JournalEntry[];
  badges: Badge[];
  pro: boolean;
  
  // Actions
  addHabit: (h: Partial<Habit>) => void;
  updateHabit: (id: ID, updates: Partial<Habit>) => void;
  toggleHabit: (id: ID, date: string) => void; // <--- NEW ACTION
  
  addGoal: (g: Partial<Goal>) => void;
  updateGoal: (id: ID, updates: Partial<Goal>) => void;
  
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
      habits: [],
      goals: [],
      entries: [],
      badges: [],
      pro: false,

      setPro: (v) => set({ pro: v }),

      addHabit: (h) => {
        const id = newId();
        const newHabit: Habit = {
          id,
          name: h.name?.trim() || "New habit",
          color: h.color || "#1DA27E",
          reminderTime: h.reminderTime,
          archived: false,
          completedDates: [], // Initialize empty array
        };
        
        set((state) => {
          const habits = [...state.habits, newHabit];
          // Re-evaluate badges
          const badges = evalBadges(habits, state.goals, state.entries, state.badges);
          return { habits, badges };
        });
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        }));
      },

      // NEW: Handles checking/unchecking a habit for a specific date
      toggleHabit: (id, date) => {
        set((state) => {
          const habits = state.habits.map((h) => {
            if (h.id !== id) return h;

            const dates = h.completedDates || [];
            const exists = dates.includes(date);

            let newDates;
            if (exists) {
              // Remove date (uncheck)
              newDates = dates.filter((d) => d !== date);
            } else {
              // Add date (check)
              newDates = [...dates, date];
            }

            return { 
              ...h, 
              completedDates: newDates,
              // Sync doneDate for simple "today" checks in UI
              doneDate: newDates.includes(date) ? date : undefined 
            };
          });

          // Re-evaluate badges
          const badges = evalBadges(habits, state.goals, state.entries, state.badges);
          return { habits, badges };
        });
      },

      addGoal: (g) => {
        const id = newId();
        const newGoal: Goal = {
          id,
          title: g.title?.trim() || "New goal",
          color: g.color || "#F1C453",
          dueDate: g.dueDate,
          createdAt: new Date().toISOString(), // Track creation for Calendar
          archived: false,
        };
        
        set((state) => {
          const goals = [...state.goals, newGoal];
          const badges = evalBadges(state.habits, goals, state.entries, state.badges);
          return { goals, badges };
        });
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        }));
      },

      upsertEntry: (e) =>
        set((s) => {
          const entries = [...s.entries];
          let existingIndex = entries.findIndex((x) => x.id === e.id);

          // Logic to find existing entry by habit/date if ID not provided
          if (existingIndex === -1 && e.habitId) {
            existingIndex = entries.findIndex(
              (x) => x.date === e.date && x.habitId === e.habitId
            );
          }

          if (existingIndex >= 0) {
            entries[existingIndex] = { ...entries[existingIndex], ...e };
          } else {
            entries.push(e);
          }

          const badges = evalBadges(s.habits, s.goals, entries, s.badges);
          return { entries, badges };
        }),

      archiveHabit: (id) =>
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id ? { ...h, archived: true } : h
          ),
        })),

      archiveGoal: (id) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, archived: true } : g
          ),
        })),

      deleteHabit: (id) =>
        set((s) => ({
          habits: s.habits.filter((h) => h.id !== id),
        })),

      deleteGoal: (id) =>
        set((s) => ({
          goals: s.goals.filter((g) => g.id !== id),
        })),
    }),
    {
      name: "small-steps",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);