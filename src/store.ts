import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { doc, setDoc, deleteDoc, writeBatch, collection, getDocs } from "firebase/firestore";
import { db } from "./lib/firebase"; 
import { Habit, Goal, JournalEntry, Badge } from "./types"; 

// --- BADGE DEFINITIONS (The Rules) ---
export const BADGE_DEFINITIONS: Badge[] = [
  { 
    id: 'first-step', 
    name: 'First Step', 
    description: 'Complete your first habit ever.', 
    icon: 'footsteps' 
  },
  { 
    id: 'streak-3', 
    name: 'On Fire', 
    description: 'Achieve a 3-day streak on any habit.', 
    icon: 'flame' 
  },
  { 
    id: 'streak-7', 
    name: 'Unstoppable', 
    description: 'Achieve a 7-day streak on any habit.', 
    icon: 'rocket' 
  },
  { 
    id: 'goal-setter', 
    name: 'Goal Setter', 
    description: 'Create your first goal.', 
    icon: 'trophy' 
  },
  { 
    id: 'master-habit', 
    name: 'Habit Master', 
    description: 'Complete a habit 10 times total.', 
    icon: 'star' 
  }
];

// --- HELPER: CALCULATE STREAK ---
const calculateStreak = (dates: string[]) => {
  if (!dates || dates.length === 0) return 0;
  
  const sorted = [...dates].sort().reverse(); // Newest first
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let streak = 0;
  
  // Start checking from Today. If not done today, check Yesterday.
  // If not done yesterday, the streak is broken (unless it's today and we just haven't done it yet, logic handled below)
  let currentCheck: string | null = sorted[0] === today ? today : (sorted[0] === yesterday ? yesterday : null);

  if (!currentCheck) return 0; 

  for (const dateStr of sorted) {
    if (dateStr === currentCheck) {
      streak++;
      // FIXED: Explicitly typed 'dateObj' as Date to prevent TS Error 7022
      const dateObj: Date = new Date(currentCheck);
      dateObj.setDate(dateObj.getDate() - 1);
      currentCheck = dateObj.toISOString().split('T')[0];
    }
  }
  return streak;
};

// --- HELPER: FIRESTORE ---
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
  
  // Auth
  setUser: (uid: string | null, name?: string, avatar?: string | null) => void;
  syncFromFirebase: (uid: string) => Promise<void>;
  pushLocalToFirebase: (uid: string) => Promise<void>;

  // Habits
  addHabit: (h: Partial<Habit>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  toggleHabit: (id: string) => void; 
  deleteHabit: (id: string) => void;
  
  // Goals
  addGoal: (g: Partial<Goal>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Entries
  upsertEntry: (e: JournalEntry) => void;
  
  // Misc
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
            habits: habitsSnap.docs.map(docSnap => docSnap.data() as Habit),
            goals: goalsSnap.docs.map(docSnap => docSnap.data() as Goal),
            entries: entriesSnap.docs.map(docSnap => docSnap.data() as JournalEntry)
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

      // --- THE MAIN LOGIC: TOGGLE + CHECK BADGES ---
      toggleHabit: (id) => {
        const date = new Date().toISOString().split('T')[0];
        
        set((state) => {
            // 1. Toggle the date
            const updatedHabits = state.habits.map((h) => {
                if (h.id !== id) return h;
                const dates = h.completedDates || [];
                const newDates = dates.includes(date) ? dates.filter((d) => d !== date) : [...dates, date];
                return { ...h, completedDates: newDates };
            });

            // 2. Check for Badges
            const currentBadgeIds = state.badges.map(b => b.id);
            const newBadges: Badge[] = [];

            // Trigger: "first-step"
            const totalCompletions = updatedHabits.reduce((acc, h) => acc + h.completedDates.length, 0);
            if (!currentBadgeIds.includes('first-step') && totalCompletions >= 1) {
                const def = BADGE_DEFINITIONS.find(b => b.id === 'first-step');
                if (def) newBadges.push({ ...def, unlockedAt: new Date().toISOString() });
            }

            // Trigger: "master-habit" (Any habit completed 10 times)
            if (!currentBadgeIds.includes('master-habit') && updatedHabits.some(h => h.completedDates.length >= 10)) {
                const def = BADGE_DEFINITIONS.find(b => b.id === 'master-habit');
                if (def) newBadges.push({ ...def, unlockedAt: new Date().toISOString() });
            }

            // Trigger: Streaks (3 and 7)
            const maxStreak = Math.max(0, ...updatedHabits.map(h => calculateStreak(h.completedDates)));
            
            if (!currentBadgeIds.includes('streak-3') && maxStreak >= 3) {
                 const def = BADGE_DEFINITIONS.find(b => b.id === 'streak-3');
                 if (def) newBadges.push({ ...def, unlockedAt: new Date().toISOString() });
            }
            if (!currentBadgeIds.includes('streak-7') && maxStreak >= 7) {
                 const def = BADGE_DEFINITIONS.find(b => b.id === 'streak-7');
                 if (def) newBadges.push({ ...def, unlockedAt: new Date().toISOString() });
            }

            return { 
                habits: updatedHabits, 
                badges: [...state.badges, ...newBadges] 
            };
        });

        // 3. Save to Cloud
        const { userId, habits } = get();
        const updated = habits.find(h => h.id === id);
        if (userId && updated) saveToCloud(userId, "habits", id, updated);
      },

      deleteHabit: (id) => {
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }));
        const { userId } = get();
        if (userId) deleteFromCloud(userId, "habits", id);
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
          relatedHabitIds: [],
        };

        set((state) => {
            // Check Badge: "goal-setter"
            const currentBadgeIds = state.badges.map(b => b.id);
            const newBadges: Badge[] = [];

            if (!currentBadgeIds.includes('goal-setter')) {
                 const def = BADGE_DEFINITIONS.find(b => b.id === 'goal-setter');
                 if (def) newBadges.push({ ...def, unlockedAt: new Date().toISOString() });
            }

            return { 
                goals: [...state.goals, newGoal],
                badges: [...state.badges, ...newBadges]
            };
        });

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

      deleteGoal: (id) => {
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
        const { userId } = get();
        if (userId) deleteFromCloud(userId, "goals", id);
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
    }),
    {
      name: "small-steps",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);