import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { doc, setDoc, deleteDoc, writeBatch, collection, getDocs } from "firebase/firestore";
import { db } from "./lib/firebase"; 
import { Habit, Goal, JournalEntry, Badge } from "./types"; 

// --- 1. BADGE DEFINITIONS ---
export const BADGE_DEFINITIONS: Badge[] = [
  { id: 'first-step', name: 'First Step', description: 'Complete your first habit ever.', icon: 'footsteps' },
  { id: 'streak-3', name: 'On Fire', description: 'Achieve a 3-day streak on any habit.', icon: 'flame' },
  { id: 'streak-7', name: 'Unstoppable', description: 'Achieve a 7-day streak on any habit.', icon: 'rocket' },
  { id: 'goal-setter', name: 'Goal Setter', description: 'Create your first goal.', icon: 'trophy' },
  { id: 'master-habit', name: 'Habit Master', description: 'Complete a habit 10 times total.', icon: 'star' }
];

// --- 2. HELPERS ---

const sanitize = (data: any) => {
  return JSON.parse(JSON.stringify(data));
};

const calculateStreak = (dates: string[]) => {
  if (!dates || dates.length === 0) return 0;
  const sorted = [...dates].sort().reverse(); 
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let currentCheck: string | null = sorted[0] === today ? today : (sorted[0] === yesterday ? yesterday : null);
  if (!currentCheck) return 0; 

  let streak = 0;
  for (const dateStr of sorted) {
    if (dateStr === currentCheck) {
      streak++;
      // FIXED: Explicitly typed as Date to stop the error
      const dateObj: Date = new Date(currentCheck);
      dateObj.setDate(dateObj.getDate() - 1);
      currentCheck = dateObj.toISOString().split('T')[0];
    }
  }
  return streak;
};

const saveToCloud = async (uid: string, collectionName: string, id: string, data: any) => {
  try {
    const cleanData = sanitize(data);
    await setDoc(doc(db, "users", uid, collectionName, id), cleanData, { merge: true });
  } catch (e) {
    console.error(`Cloud Save Error (${collectionName}):`, e);
  }
};

const deleteFromCloud = async (uid: string, collectionName: string, id: string) => {
  try {
    await deleteDoc(doc(db, "users", uid, collectionName, id));
  } catch (e) {
    console.error(`Cloud Delete Error (${collectionName}):`, e);
  }
};

export const newId = () => Math.random().toString(36).slice(2, 10);

// --- 3. STATE ---
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
  deleteHabit: (id: string) => void;
  
  addGoal: (g: Partial<Goal>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  upsertEntry: (e: JournalEntry) => void;
  setPro: (v: boolean) => void;
  checkBadges: () => void;
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

      setUser: (uid, name, avatar) => set({ userId: uid, userName: name || "Guest", userAvatar: avatar || null }),
      setPro: (v) => set({ pro: v }),

      syncFromFirebase: async (uid) => {
        try {
          const [hSnap, gSnap, eSnap, bSnap] = await Promise.all([
            getDocs(collection(db, "users", uid, "habits")),
            getDocs(collection(db, "users", uid, "goals")),
            getDocs(collection(db, "users", uid, "entries")),
            getDocs(collection(db, "users", uid, "badges"))
          ]);
          
          set({ 
            habits: hSnap.docs.map(d => d.data() as Habit),
            goals: gSnap.docs.map(d => d.data() as Goal),
            entries: eSnap.docs.map(d => d.data() as JournalEntry),
            badges: bSnap.docs.map(d => d.data() as Badge)
          });
        } catch (e) {
          console.error("Sync Error:", e);
        }
      },

      pushLocalToFirebase: async (uid) => {
        const { habits, goals, entries, badges } = get();
        const batch = writeBatch(db);
        
        habits.forEach(h => batch.set(doc(db, "users", uid, "habits", h.id), sanitize(h)));
        goals.forEach(g => batch.set(doc(db, "users", uid, "goals", g.id), sanitize(g)));
        entries.forEach(e => batch.set(doc(db, "users", uid, "entries", e.date), sanitize(e)));
        badges.forEach(b => batch.set(doc(db, "users", uid, "badges", b.id), sanitize(b)));

        await batch.commit();
      },

      addHabit: (h) => {
        const id = newId();
        const newHabit: Habit = {
          id,
          title: h.title?.trim() || "New Habit",
          color: h.color || "#1DA27E",
          reminderTime: h.reminderTime ?? null, // FIXED: Null handling
          archived: false,
          streak: 0,
          completedDates: [],
          icon: h.icon || 'star'
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
        const { userId } = get();
        if (userId) saveToCloud(userId, "habits", id, newHabit);
        get().checkBadges();
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
        set((state) => {
            const updatedHabits = state.habits.map((h) => {
                if (h.id !== id) return h;
                const dates = h.completedDates || [];
                const newDates = dates.includes(date) 
                    ? dates.filter((d) => d !== date) 
                    : [...dates, date];
                return { 
                    ...h, 
                    completedDates: newDates, 
                    streak: calculateStreak(newDates) 
                };
            });
            return { habits: updatedHabits };
        });

        const { userId, habits } = get();
        const updated = habits.find(h => h.id === id);
        if (userId && updated) saveToCloud(userId, "habits", id, updated);
        
        get().checkBadges();
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
          title: g.title?.trim() || "New Goal",
          color: g.color || "#F1C453",
          dueDate: g.dueDate || new Date().toISOString(),
          completed: false,
          progress: 0,
          total: 100,
          archived: false,
          relatedHabitIds: [],
        };

        set((state) => ({ goals: [...state.goals, newGoal] }));
        
        const { userId } = get();
        if (userId) saveToCloud(userId, "goals", id, newGoal);
        get().checkBadges();
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
          const idx = entries.findIndex((x) => x.date === e.date);
          if (idx >= 0) entries[idx] = { ...entries[idx], ...e };
          else entries.push(e);
          return { entries };
        });
        const { userId } = get();
        if (userId && e.date) saveToCloud(userId, "entries", e.date, e);
      },

      checkBadges: () => {
        set((state) => {
            const currentBadgeIds = state.badges.map(b => b.id);
            const newBadges: Badge[] = [];
            
            // 1. First Step
            const hasFirstStep = state.habits.some(h => h.completedDates.length > 0);
            if (!currentBadgeIds.includes('first-step') && hasFirstStep) {
                 const def = BADGE_DEFINITIONS.find(b => b.id === 'first-step');
                 if (def) newBadges.push({ ...def, unlockedAt: new Date().toISOString() });
            }

            // 2. Goal Setter
            if (!currentBadgeIds.includes('goal-setter') && state.goals.length > 0) {
                 const def = BADGE_DEFINITIONS.find(b => b.id === 'goal-setter');
                 if (def) newBadges.push({ ...def, unlockedAt: new Date().toISOString() });
            }

            // 3. Streaks
            const maxStreak = Math.max(0, ...state.habits.map(h => h.streak));
            if (!currentBadgeIds.includes('streak-3') && maxStreak >= 3) {
                 const def = BADGE_DEFINITIONS.find(b => b.id === 'streak-3');
                 if (def) newBadges.push({ ...def, unlockedAt: new Date().toISOString() });
            }

            if (newBadges.length > 0) {
                 const { userId } = get();
                 if(userId) newBadges.forEach(b => saveToCloud(userId, "badges", b.id, b));
            }

            return { badges: [...state.badges, ...newBadges] };
        });
      }
    }),
    {
      name: "small-steps",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);