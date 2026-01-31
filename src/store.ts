// src/store.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { evalBadges } from "./badges";
import { Badge, Goal, Habit, ID, JournalEntry } from "./types";
import { doc, setDoc, updateDoc, deleteDoc, writeBatch, collection, getDocs } from "firebase/firestore";
import { db } from "./lib/firebase"; // Ensure this matches your path

export const newId = () => Math.random().toString(36).slice(2, 10);

export type State = {
  // User Profile
  userId: string | null;
  userName: string;
  userAvatar: string | null;
  
  habits: Habit[];
  goals: Goal[];
  entries: JournalEntry[];
  badges: Badge[];
  pro: boolean;
  
  // Setup Actions
  setUser: (uid: string | null, name?: string, avatar?: string | null) => void;
  syncFromFirebase: (uid: string) => Promise<void>;
  pushLocalToFirebase: (uid: string) => Promise<void>;

  // Data Actions
  addHabit: (h: Partial<Habit>) => void;
  updateHabit: (id: ID, updates: Partial<Habit>) => void;
  toggleHabit: (id: ID, date: string) => void;
  
  addGoal: (g: Partial<Goal>) => void;
  updateGoal: (id: ID, updates: Partial<Goal>) => void;
  
  upsertEntry: (e: JournalEntry) => void;
  
  archiveHabit: (id: ID) => void;
  archiveGoal: (id: ID) => void;
  deleteHabit: (id: ID) => void;
  deleteGoal: (id: ID) => void;
  setPro: (v: boolean) => void;
};

// Helper: Fire-and-forget Firestore write
const saveToCloud = async (uid: string, collectionName: string, id: string, data: any) => {
  try {
    await setDoc(doc(db, "users", uid, collectionName, id), data, { merge: true });
  } catch (e) {
    console.error("Cloud Save Error:", e);
  }
};

const deleteFromCloud = async (uid: string, collectionName: string, id: string) => {
  try {
    await deleteDoc(doc(db, "users", uid, collectionName, id));
  } catch (e) {
    console.error("Cloud Delete Error:", e);
  }
};

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      userId: null,
      userName: "Friend",
      userAvatar: null,

      habits: [],
      goals: [],
      entries: [],
      badges: [],
      pro: false,

      setUser: (uid, name, avatar) => set({ 
        userId: uid, 
        userName: name || get().userName, 
        userAvatar: avatar || get().userAvatar 
      }),

      setPro: (v) => set({ pro: v }),

      // 1. DOWNLOAD DATA (Login)
      syncFromFirebase: async (uid) => {
        try {
          const habitsSnap = await getDocs(collection(db, "users", uid, "habits"));
          const goalsSnap = await getDocs(collection(db, "users", uid, "goals"));
          const entriesSnap = await getDocs(collection(db, "users", uid, "entries"));
          
          const habits = habitsSnap.docs.map(d => d.data() as Habit);
          const goals = goalsSnap.docs.map(d => d.data() as Goal);
          const entries = entriesSnap.docs.map(d => d.data() as JournalEntry);
          
          set({ habits, goals, entries });
        } catch (e) {
          console.error("Sync Error:", e);
        }
      },

      // 2. UPLOAD DATA (Signup)
      pushLocalToFirebase: async (uid) => {
        const { habits, goals, entries } = get();
        const batch = writeBatch(db);
        
        habits.forEach(h => {
          const ref = doc(db, "users", uid, "habits", h.id);
          batch.set(ref, h);
        });
        goals.forEach(g => {
          const ref = doc(db, "users", uid, "goals", g.id);
          batch.set(ref, g);
        });
        entries.forEach(e => {
          const ref = doc(db, "users", uid, "entries", e.id);
          batch.set(ref, e);
        });

        await batch.commit();
      },

      addHabit: (h) => {
        const id = newId();
        const newHabit: Habit = {
          id,
          name: h.name?.trim() || "New habit",
          color: h.color || "#1DA27E",
          reminderTime: h.reminderTime,
          archived: false,
          completedDates: [],
        };
        
        set((state) => ({
          habits: [...state.habits, newHabit],
          badges: evalBadges([...state.habits, newHabit], state.goals, state.entries, state.badges)
        }));

        const { userId } = get();
        if (userId) saveToCloud(userId, "habits", id, newHabit);
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((h) => h.id === id ? { ...h, ...updates } : h),
        }));
        
        const { userId, habits } = get();
        const updated = habits.find(h => h.id === id);
        if (userId && updated) saveToCloud(userId, "habits", id, updated);
      },

      toggleHabit: (id, date) => {
        set((state) => {
          const habits = state.habits.map((h) => {
            if (h.id !== id) return h;
            const dates = h.completedDates || [];
            const exists = dates.includes(date);
            const newDates = exists ? dates.filter((d) => d !== date) : [...dates, date];
            return { 
              ...h, 
              completedDates: newDates,
              doneDate: newDates.includes(date) ? date : undefined 
            };
          });
          return { habits, badges: evalBadges(habits, state.goals, state.entries, state.badges) };
        });

        const { userId, habits } = get();
        const updated = habits.find(h => h.id === id);
        if (userId && updated) saveToCloud(userId, "habits", id, updated);
      },

      addGoal: (g) => {
        const id = newId();
        const newGoal: Goal = {
          id,
          title: g.title?.trim() || "New goal",
          color: g.color || "#F1C453",
          dueDate: g.dueDate,
          createdAt: new Date().toISOString(),
          archived: false,
        };
        
        set((state) => ({
          goals: [...state.goals, newGoal],
          badges: evalBadges(state.habits, [...state.goals, newGoal], state.entries, state.badges)
        }));

        const { userId } = get();
        if (userId) saveToCloud(userId, "goals", id, newGoal);
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) => g.id === id ? { ...g, ...updates } : g),
        }));
        
        const { userId, goals } = get();
        const updated = goals.find(g => g.id === id);
        if (userId && updated) saveToCloud(userId, "goals", id, updated);
      },

      upsertEntry: (e) => {
        set((s) => {
          const entries = [...s.entries];
          // Find existing Logic
          let idx = entries.findIndex((x) => x.id === e.id);
          if (idx === -1 && e.habitId) {
            idx = entries.findIndex((x) => x.date === e.date && x.habitId === e.habitId);
          }
          
          if (idx >= 0) entries[idx] = { ...entries[idx], ...e };
          else entries.push(e);

          return { entries, badges: evalBadges(s.habits, s.goals, entries, s.badges) };
        });

        const { userId, entries } = get();
        // We need the ID to save. If it was a new entry without ID, we might miss it, 
        // but typically upsertEntry is passed an object with ID.
        if (userId && e.id) saveToCloud(userId, "entries", e.id, e);
      },

      archiveHabit: (id) => {
        set((s) => ({ habits: s.habits.map((h) => h.id === id ? { ...h, archived: true } : h) }));
        const { userId } = get();
        if (userId) saveToCloud(userId, "habits", id, { archived: true });
      },

      archiveGoal: (id) => {
        set((s) => ({ goals: s.goals.map((g) => g.id === id ? { ...g, archived: true } : g) }));
        const { userId } = get();
        if (userId) saveToCloud(userId, "goals", id, { archived: true });
      },

      deleteHabit: (id) => {
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }));
        const { userId } = get();
        if (userId) deleteFromCloud(userId, "habits", id);
      },

      deleteGoal: (id) => {
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
        const { userId } = get();
        if (userId) deleteFromCloud(userId, "goals", id);
      },
    }),
    {
      name: "small-steps",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);