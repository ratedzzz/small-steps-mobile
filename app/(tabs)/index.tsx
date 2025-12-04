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
import ConfettiCannon from "react-native-confetti-cannon";
import { useApp } from "../../src/store";
import { Habit, Goal } from "../../src/types";
import AddGoalModal from "../../src/components/AddGoalModal";
import AddHabitModal from "../../src/components/AddHabitModal";
import GoalItem from "../../src/components/GoalItem";
import HabitItem from "../../src/components/HabitItem";

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

const quotes = [
  { text: "Small steps lead to big changes.", author: "Fred DeVito" },
  { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { text: "Success is the sum of small efforts, repeated day-in and day-out.", author: "Robert Collier" },
  { text: "Little by little, one travels far.", author: "J.R.R. Tolkien" },
  { text: "Consistency is more important than perfection.", author: "Unknown" },
];

export default function HomeScreen() {
  const darkMode = useColorScheme() === "dark";
  const theme = darkMode ? DARK : LIGHT;

  const {
    habits = [],
    goals = [],
    pro,
    updateHabit,
    deleteHabit,
    updateGoal,
    deleteGoal,
    addHabit,
    addGoal,
  } = useApp() as any;

  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [dailyQuote, setDailyQuote] = useState(quotes[0]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Confetti and phrase state
  const [showConfetti, setShowConfetti] = useState(false);
  const [completionPhrase, setCompletionPhrase] = useState("");

  useEffect(() => {
    setDailyQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  // YYYY-MM-DD string for "today"
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Update progress instantly based on habit.doneDate
  const completedToday = useMemo(() => {
    return habits.filter((h: Habit) => h.doneDate === today).length;
  }, [habits, today]);

  // Checkbox toggle (animation & phrase)
  const phrases = ["Great Job!", "You Did It!", "Way To Go!"];
  const handleToggleDone = (habitId: string, doneForDay: boolean) => {
    const newDoneDate = doneForDay ? undefined : today;
    updateHabit(habitId, { doneDate: newDoneDate });
    if (!doneForDay && newDoneDate === today) {
      setCompletionPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  // Habit modals
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

  // Goal modals
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
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={{ flex: 1 }}
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

        {/* Daily Quote - small, with huge gold “ */}
        <View
          style={[
            styles.quoteCard,
            { backgroundColor: theme.cardBg, padding: 6, minHeight: 28, marginBottom: 8 }
          ]}
        >
          <Text
            style={{
              fontSize: 46,
              marginBottom: 0,
              color: PALETTE.goldSoft,
              fontWeight: "bold",
            }}
          >“</Text>
          <Text style={[styles.quoteText, { color: PALETTE.goldSoft, fontSize: 13 }]}>
            "{dailyQuote.text}"
          </Text>
          <Text style={[styles.author, { color: PALETTE.goldSoft }]}>
            — {dailyQuote.author}
          </Text>
        </View>

        {/* Habits Completed Today / Progress - small, no "completed" word */}
        {habits.length > 0 && (
          <View
            style={[
              styles.progressCard,
              { backgroundColor: theme.cardBg, height: 70, marginBottom: 10, padding: 8 }
            ]}
          >
            <Text style={[styles.progressTitle, { color: theme.text, marginBottom: 4 }]}>
              Habits Completed Today
            </Text>
            <Text
              style={[
                styles.progressNumber,
                { color: theme.primary, fontSize: 34 },
              ]}
            >
              {completedToday}/{habits.length}
            </Text>
          </View>
        )}

        {/* Confetti animation - still global */}
        {showConfetti && (
          <View style={styles.confettiOverlay}>
            <Text style={styles.confettiPhrase}>{completionPhrase}</Text>
            <ConfettiCannon count={50} origin={{ x: 0, y: 0 }} fadeOut />
          </View>
        )}

        {/* Habits */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.cardBg },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Daily Habits
            </Text>
            <Pressable
              onPress={() => {
                setSelectedHabit(null);
                setShowAddHabit(true);
              }}
              style={[
                styles.addButton,
                { backgroundColor: theme.primary },
              ]}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </Pressable>
          </View>

          {habits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text
                style={[styles.emptyText, { color: theme.textSecondary }]}
              >
                No habits yet. Start by adding your first small step!
              </Text>
            </View>
          ) : (
            habits.map((habit: Habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                date={today}
                darkMode={darkMode}
                onToggleDone={handleToggleDone}
                onEdit={handleEditHabit}
              />
            ))
          )}
        </View>

        {/* Goals */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.cardBg },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Goals
            </Text>
            <Pressable
              onPress={() => {
                setSelectedGoal(null);
                setShowAddGoal(true);
              }}
              style={[
                styles.addButton,
                { backgroundColor: theme.primary },
              ]}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </Pressable>
          </View>

          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text
                style={[styles.emptyText, { color: theme.textSecondary }]}
              >
                Set a goal to work towards!
              </Text>
            </View>
          ) : (
            goals.map((goal: Goal) => (
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
          <View
            style={[
              styles.proCard,
              { backgroundColor: theme.accent },
            ]}
          >
            <Text style={styles.proTitle}>🌟 Upgrade to Pro</Text>
            <Text style={styles.proText}>
              Unlock unlimited habits, advanced analytics, and more!
            </Text>
            <Pressable style={styles.proButton}>
              <Text
                style={[
                  styles.proButtonText,
                  { color: PALETTE.deepTeal },
                ]}
              >
                Learn More
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Habit Modal (add/edit) */}
      <AddHabitModal
        visible={showAddHabit}
        onClose={handleCloseHabitModal}
        darkMode={darkMode}
        habit={selectedHabit}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
      />

      {/* Goal Modal (add/edit) */}
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
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 32, fontWeight: "bold" },
  subtitle: { fontSize: 14, marginTop: 4 },
  quoteCard: {
    padding: 8,
    minHeight: 38,
    borderRadius: 16,
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quoteIcon: { fontSize: 46, marginBottom: 0, color: PALETTE.goldSoft },
  quoteText: {
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 17,
    marginBottom: 2,
  },
  author: {
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 3,
    marginBottom: 1,
  },
  progressCard: {
    padding: 8,
    borderRadius: 16,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    height: 70,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  progressCircle: {
    alignItems: "center",
  },
  progressNumber: {
    fontSize: 34,
    fontWeight: "bold",
  },
  confettiOverlay: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
    pointerEvents: "none",
  },
  confettiPhrase: {
    fontSize: 22,
    color: PALETTE.goldSoft,
    fontWeight: "bold",
    padding: 4,
    textAlign: "center",
  },
  section: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 13,
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
    marginBottom: 9,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
  },
  addButton: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  emptyState: {
    paddingVertical: 28,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
  },
  proCard: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  proTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 7,
  },
  proText: {
    fontSize: 13,
    color: "#FFF",
    opacity: 0.9,
    marginBottom: 15,
  },
  proButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 9,
    paddingHorizontal: 17,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  proButtonText: {
    fontWeight: "bold",
    fontSize: 13,
  },
});
