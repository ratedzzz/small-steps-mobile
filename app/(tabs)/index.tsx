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
import { LinearGradient } from "expo-linear-gradient";
import AddGoalModal from "../../src/components/AddGoalModal";
import AddHabitModal from "../../src/components/AddHabitModal";
import GoalItem from "../../src/components/GoalItem";
import HabitItem from "../../src/components/HabitItem";
import { useApp } from "../../src/store";
import { Goal, Habit } from "../../src/types";
import { getLocalDate } from "../../src/utils";
// UPDATED IMPORT:
import { APP_THEME } from "../../src/theme"; 

// --- TYPES ---
interface StoreData {
  habits: Habit[];
  goals: Goal[];
  pro: boolean;
  updateHabit: (id: string, data: Partial<Habit>) => void;
  toggleHabit: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addHabit: (data: Partial<Habit>) => void;
  addGoal: (data: Partial<Goal>) => void;
}

// --- CONTENT ---
const quotes = [
  { text: "Small steps lead to big changes.", author: "Fred DeVito" },
  { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { text: "Success is the sum of small efforts.", author: "Robert Collier" },
  { text: "Little by little, one travels far.", author: "J.R.R. Tolkien" },
  { text: "Consistency is more important than perfection.", author: "Unknown" },
];

const CELEBRATION_PHRASES = [
  "Great Job!", "Way To Go!", "You Did It!", "Awesome!", "Fantastic!",
];

export default function HomeScreen() {
  const darkMode = useColorScheme() === "dark";

  const {
    habits = [],
    goals = [],
    pro,
    updateHabit,
    toggleHabit,
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
    return habits.filter((h) => h.completedDates?.includes(today)).length;
  }, [habits, today]);

  const handleToggleDone = (habitId: string) => {
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
    // UPDATED PROP: colors={APP_THEME.mainGradient}
    <LinearGradient colors={APP_THEME.mainGradient} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: "#001244" }]}>
                Small Steps
              </Text>
              <Text style={[styles.subtitle, { color: "#005086" }]}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>

          {/* Daily Quote - Glass Effect */}
          <View style={styles.glassCard}>
            <Text style={styles.quoteIcon}>"</Text>
            <Text style={styles.quoteText}>"{dailyQuote.text}"</Text>
            <Text style={styles.author}>— {dailyQuote.author}</Text>
          </View>

          {/* Habits Progress - Glass Effect */}
          {habits.length > 0 && (
            <View style={styles.glassCard}>
              <Text style={styles.progressTitle}>Habits Completed Today</Text>
              <Text style={styles.progressNumber}>
                {completedToday}/{habits.length}
              </Text>
            </View>
          )}

          {/* Habits Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily Habits</Text>
              <Pressable
                onPress={() => {
                  setSelectedHabit(null);
                  setShowAddHabit(true);
                }}
                style={({ pressed }) => [
                  styles.addButton,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </Pressable>
            </View>

            {habits.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No habits yet. Start by adding your first small step!
                </Text>
              </View>
            ) : (
              habits.map((habit, index) => (
                <HabitItem
                  key={habit.id}
                  habit={habit}
                  date={today}
                  darkMode={darkMode}
                  onToggleDone={handleToggleDone}
                  onEdit={handleEditHabit}
                  celebrationPhrases={CELEBRATION_PHRASES}
                  index={index}
                  totalHabits={habits.length}
                />
              ))
            )}
          </View>

          {/* Goals Section - Glass Effect */}
          <View style={[styles.glassCard, { marginTop: 10 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Goals</Text>
              <Pressable
                onPress={() => {
                  setSelectedGoal(null);
                  setShowAddGoal(true);
                }}
                style={({ pressed }) => [
                  styles.addButton,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </Pressable>
            </View>

            {goals.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
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
            <View style={styles.proCard}>
              <Text style={styles.proTitle}>🌟 Upgrade to Pro</Text>
              <Text style={styles.proText}>
                Unlock unlimited habits, advanced analytics, and more!
              </Text>
              <Pressable style={styles.proButton}>
                <Text style={styles.proButtonText}>Learn More</Text>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "transparent" },
  scrollContent: { padding: 16, paddingBottom: 100 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 10,
  },
  title: { fontSize: 34, fontWeight: "800", letterSpacing: 0.5 },
  subtitle: { fontSize: 16, marginTop: 4, fontWeight: "600" },

  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.45)", 
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#001244",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  
  quoteIcon: {
    fontSize: 40,
    lineHeight: 40,
    color: "#001244",
    opacity: 0.5,
    marginBottom: -10,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 6,
    color: "#001244",
  },
  author: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
    color: "#005086",
  },

  progressTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    color: "#001244",
  },
  progressNumber: {
    fontSize: 36,
    fontWeight: "800",
    color: "#005086",
  },

  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#001244",
  },
  addButton: {
    backgroundColor: "#001244",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#001244",
    opacity: 0.6,
  },

  proCard: {
    backgroundColor: "#F1C453",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  proTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#001244",
  },
  proText: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
    color: "#001244",
    opacity: 0.8,
  },
  proButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  proButtonText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#001244",
  },
});