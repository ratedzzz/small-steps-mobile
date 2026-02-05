import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { doc, setDoc, deleteDoc, writeBatch, collection, getDocs } from "firebase/firestore";
import { db } from "./lib/firebase"; 
import { Habit, Goal, JournalEntry, Badge } from "./types"; // Import from the file we just restored

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

export const newId = () => Math.random().toString(36).slice(2, 10);

interface AppState {
  userId: string | null;
  userName: string;
  userAvatar: string | null;
  
  habits: Habit[];
  goals: Goal[];
  entries: JournalEntry[];
  badges: Badge[];
  pro: boolean;
  
  setUser: (uid: string | null, name?: string, avatar?: string | null) => void;
  syncFromFirebase: (uid: string) => Promise<void>;
  pushLocalToFirebase: (uid: string) => Promise<void>;

  addHabit: (h: Partial<Habit>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  toggleHabit: (id: string) => void; 
  
  addGoal: (g: Partial<Goal>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  upsertEntry: (e: JournalEntry) => void;
  
  deleteHabit: (id: string) => void;
  deleteGoal: (id: string) => void;
  setPro: (v: boolean) => void;
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      userId: null,
      userName: "Guest",
      userAvatar: null,
      habits: [],
      goals: [],
      entries: [],
      badges: [],
      pro: false,

      setUser: (uid, name, avatar) => set({ userId: uid, userName: name || get().userName, userAvatar: avatar || get().userAvatar }),
      setPro: (v) => set({ pro: v }),

      syncFromFirebase: async (uid) => {
        try {
          const habitsSnap = await getDocs(collection(db, "users", uid, "habits"));
          const goalsSnap = await getDocs(collection(db, "users", uid, "goals"));
          const entriesSnap = await getDocs(collection(db, "users", uid, "entries"));
          
          set({ 
            habits: habitsSnap.docs.map(d => d.data() as Habit),
            goals: goalsSnap.docs.map(d => d.data() as Goal),
            entries: entriesSnap.docs.map(d => d.data() as JournalEntry)
          });
        } catch (e) {
          console.error("Sync Error:", e);
        }
      },

      pushLocalToFirebase: async (uid) => {
        const { habits, goals, entries } = get();
        const batch = writeBatch(db);
        habits.forEach(h => batch.set(doc(db, "users", uid, "habits", h.id), h));
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
        set((state) => ({ habits: [...state.habits, newHabit] }));
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

      toggleHabit: (id) => {
        const date = new Date().toISOString().split('T')[0];
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== id) return h;
            const dates = h.completedDates || [];
            const newDates = dates.includes(date) ? dates.filter((d) => d !== date) : [...dates, date];
            return { ...h, completedDates: newDates };
          })
        }));
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
        set((state) => ({ goals: [...state.goals, newGoal] }));
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
          let idx = entries.findIndex((x) => x.id === e.id);
          if (idx >= 0) entries[idx] = { ...entries[idx], ...e };
          else entries.push(e);
          return { entries };
        });
        const { userId } = get();
        if (userId && e.id) saveToCloud(userId, "entries", e.id, e);
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