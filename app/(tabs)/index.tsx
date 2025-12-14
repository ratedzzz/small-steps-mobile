// app/(tabs)/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddGoalModal from "../../src/components/AddGoalModal";
import AddHabitModal from "../../src/components/AddHabitModal";
import GoalItem from "../../src/components/GoalItem";
import HabitItem from "../../src/components/HabitItem";
import { useApp } from "../../src/store";
import { Goal, Habit } from "../../src/types";
import { getLocalDate } from "../../src/utils"; 


// --- TYPES ---
interface StoreData {
  habits: Habit[];
  goals: Goal[];
  pro: boolean;
  updateHabit: (id: string, data: Partial<Habit>) => void;
  toggleHabit: (id: string, date: string) => void; // <--- NEW
  deleteHabit: (id: string) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addHabit: (data: Partial<Habit>) => void;
  addGoal: (data: Partial<Goal>) => void;
}

// --- THEME ---
const PALETTE = {
  deepTeal: "#15292E",
  teal: "#074047",
  aqua: "#1C8585",
  mint: "#1DA27E",
  goldSoft: "#F1C453",
} as const;

const LIGHT = {
  bg: "#FFF9EC",
  cardBg: "#FFFFFF",
  text: "#15292E",
  textSecondary: "#475569",
  primary: PALETTE.mint,
  accent: PALETTE.goldSoft,
} as const;

const DARK = {
  bg: PALETTE.deepTeal,
  cardBg: PALETTE.teal,
  text: "#EAF7F6",
  textSecondary: "#9FB8B6",
  primary: PALETTE.mint,
  accent: PALETTE.goldSoft,
} as const;

// --- CONTENT ---
const quotes = [
  { text: "Small steps lead to big changes.", author: "Fred DeVito" },
  {
    text: "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu",
  },
  {
    text: "Success is the sum of small efforts, repeated day-in and day-out.",
    author: "Robert Collier",
  },
  { text: "Little by little, one travels far.", author: "J.R.R. Tolkien" },
  { text: "Consistency is more important than perfection.", author: "Unknown" },
];

const CELEBRATION_PHRASES = [
  "Great Job!",
  "Way To Go!",
  "You Did It!",
  "Awesome!",
  "Fantastic!",
  "Amazing!",
  "Well Done!",
  "Keep It Up!",
  "You Rock!",
  "Crushing It!",
  "On Fire!",
  "Unstoppable!",
  "Nailed It!",
  "Perfect!",
  "Incredible!",
];

export default function HomeScreen() {
  const darkMode = useColorScheme() === "dark";
  const theme = darkMode ? DARK : LIGHT;

  const {
    habits = [],
    goals = [],
    pro,
    updateHabit,
    toggleHabit, // <--- Destructured here
    deleteHabit,
    updateGoal,
    deleteGoal,
    addHabit,
    addGoal,
  } = useApp() as StoreData;

  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [dailyQuote, setDailyQuote] = useState(quotes[0]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  useEffect(() => {
    setDailyQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const today = useMemo(() => getLocalDate(), []);

  const completedToday = useMemo(() => {
    // Check if the completedDates array includes today
    return habits.filter((h) => h.completedDates?.includes(today)).length;
  }, [habits, today]);

  const handleToggleDone = (habitId: string) => {
    // This calls the new store action to toggle the date in the array
    toggleHabit(habitId, today);
  };

  const handleEditHabit = (habit: Habit) => {
    setSelectedHabit(habit);
    setShowAddHabit(true);
  };

  const handleCloseHabitModal = () => {
    setSelectedHabit(null);
    setShowAddHabit(false);
  };

  const handleSaveHabit = (partial: Partial<Habit>) => {
    if (partial.id) {
      updateHabit(partial.id, partial);
    } else {
      addHabit({
        name: partial.name ?? "",
        color: partial.color ?? "#1DA27E",
        reminderTime: partial.reminderTime,
      });
    }
    handleCloseHabitModal();
  };

  const handleDeleteHabit = (habitId: string) => {
    deleteHabit(habitId);
    handleCloseHabitModal();
  };

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowAddGoal(true);
  };

  const handleCloseGoalModal = () => {
    setSelectedGoal(null);
    setShowAddGoal(false);
  };

  const handleSaveGoal = (partial: Partial<Goal>) => {
    if (partial.id) {
      updateGoal(partial.id, partial);
    } else {
      addGoal({
        title: partial.title ?? "",
        color: partial.color ?? "#F1C453",
        dueDate: partial.dueDate,
      });
    }
    handleCloseGoalModal();
  };

  const handleDeleteGoal = (goalId: string) => {
    deleteGoal(goalId);
    handleCloseGoalModal();
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.bg }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>
              Small Steps
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Daily Quote */}
        <View style={[styles.quoteCard, { backgroundColor: theme.cardBg }]}>
          <Text style={styles.quoteIcon}>"</Text>
          <Text style={[styles.quoteText, { color: PALETTE.goldSoft }]}>
            "{dailyQuote.text}"
          </Text>
          <Text style={[styles.author, { color: PALETTE.goldSoft }]}>
            — {dailyQuote.author}
          </Text>
        </View>

        {/* Habits Progress */}
        {habits.length > 0 && (
          <View
            style={[styles.progressCard, { backgroundColor: theme.cardBg }]}
          >
            <Text style={[styles.progressTitle, { color: theme.text }]}>
              Habits Completed Today
            </Text>
            <Text style={[styles.progressNumber, { color: theme.primary }]}>
              {completedToday}/{habits.length}
            </Text>
          </View>
        )}

        {/* Habits Section */}
        <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Daily Habits
            </Text>
            <Pressable
              onPress={() => {
                setSelectedHabit(null);
                setShowAddHabit(true);
              }}
              style={({ pressed }) => [
                styles.addButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </Pressable>
          </View>

          {habits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No habits yet. Start by adding your first small step!
              </Text>
            </View>
          ) : (
            habits.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                date={today}
                darkMode={darkMode}
                onToggleDone={handleToggleDone} // Updated Handler
                onEdit={handleEditHabit}
                celebrationPhrases={CELEBRATION_PHRASES}
              />
            ))
          )}
        </View>

        {/* Goals Section */}
        <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Goals
            </Text>
            <Pressable
              onPress={() => {
                setSelectedGoal(null);
                setShowAddGoal(true);
              }}
              style={({ pressed }) => [
                styles.addButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </Pressable>
          </View>

          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Set a goal to work towards!
              </Text>
            </View>
          ) : (
            goals.map((goal) => (
              <GoalItem
                key={goal.id}
                goal={goal}
                darkMode={darkMode}
                onEdit={handleEditGoal}
              />
            ))
          )}
        </View>

        {/* Pro CTA */}
        {!pro && (
          <View style={[styles.proCard, { backgroundColor: theme.accent }]}>
            <Text style={[styles.proTitle, { color: PALETTE.deepTeal }]}>
              🌟 Upgrade to Pro
            </Text>
            <Text style={[styles.proText, { color: PALETTE.deepTeal }]}>
              Unlock unlimited habits, advanced analytics, and more!
            </Text>
            <Pressable style={styles.proButton}>
              <Text style={[styles.proButtonText, { color: theme.accent }]}>
                Learn More
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <AddHabitModal
        visible={showAddHabit}
        onClose={handleCloseHabitModal}
        darkMode={darkMode}
        habit={selectedHabit}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
      />

      <AddGoalModal
        visible={showAddGoal}
        onClose={handleCloseGoalModal}
        darkMode={darkMode}
        goal={selectedGoal}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 32, fontWeight: "bold" },
  subtitle: { fontSize: 14, marginTop: 4 },

  // Quote Card
  quoteCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quoteIcon: {
    fontSize: 46,
    lineHeight: 46,
    marginTop: -10,
    marginBottom: -10,
    color: PALETTE.goldSoft,
    fontWeight: "bold",
  },
  quoteText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    opacity: 0.8,
  },

  // Progress Card
  progressCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  progressNumber: {
    fontSize: 34,
    fontWeight: "bold",
  },

  // Section Styles
  section: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  emptyState: {
    paddingVertical: 30,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
  },

  // Pro Card
  proCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  proTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  proText: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 16,
    lineHeight: 20,
  },
  proButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  proButtonText: {
    fontWeight: "bold",
    fontSize: 14,
  },
});
