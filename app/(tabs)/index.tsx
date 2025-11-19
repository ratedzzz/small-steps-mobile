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

import { getMotivationalQuote } from "../../src/quotes";
import { useApp } from "../../src/store";
import { Habit } from "../../src/types";

import AddGoalModal from "../../src/components/AddGoalModal";
import AddHabitModal from "../../src/components/AddHabitModal";
import GoalItem from "../../src/components/GoalItem";
import HabitItem from "../../src/components/HabitItem";

// Palette (matches _layout)
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

export default function HomeScreen() {
  const darkMode = useColorScheme() === "dark";
  const theme = darkMode ? DARK : LIGHT;

  const {
    habits = [],
    goals = [],
    entries = [],
    pro,
    updateHabit,
    deleteHabit,
  } = useApp();

  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [dailyQuote, setDailyQuote] = useState("");

  // Track which habit is currently being edited; null means adding new
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  useEffect(() => {
    setDailyQuote(getMotivationalQuote());
  }, []);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const completedToday = useMemo(() => {
    const todayEntries = entries.filter(
      (e: any) => e?.date === today && e?.habitId
    );
    return todayEntries.filter((e: any) => e?.completed).length;
  }, [entries, today]);

  const handleToggleDone = (habitId: string, doneForDay: boolean) => {
    const newDoneDate = doneForDay ? today : undefined;
    updateHabit(habitId, { doneDate: newDoneDate });
  };

  const handleEditHabit = (habit: Habit) => {
    setSelectedHabit(habit);
    setShowAddHabit(true);
  };

  const handleCloseModal = () => {
    setSelectedHabit(null);
    setShowAddHabit(false);
  };

  const handleSaveHabit = (habit: Partial<Habit>) => {
    if (habit.id) {
      updateHabit(habit.id, habit);
    } else {
      // Add habit logic (not included here, you can extend as needed)
    }
    handleCloseModal();
  };

  const handleDeleteHabit = (habitId: string) => {
    deleteHabit(habitId);
    handleCloseModal();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.primary }]}>
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
          <Text style={styles.quoteIcon}>✨</Text>
          <Text style={[styles.quoteText, { color: theme.text }]}>
            "{dailyQuote}"
          </Text>
        </View>

        {/* Today's Progress */}
        {habits.length > 0 && (
          <View
            style={[styles.progressCard, { backgroundColor: theme.cardBg }]}
          >
            <Text style={[styles.progressTitle, { color: theme.text }]}>
              Today's Progress
            </Text>
            <View style={styles.progressCircle}>
              <Text style={[styles.progressNumber, { color: theme.primary }]}>
                {completedToday}/{habits.length}
              </Text>
              <Text
                style={[styles.progressLabel, { color: theme.textSecondary }]}
              >
                completed
              </Text>
            </View>
          </View>
        )}

        {/* Habits */}
        <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Daily Habits
            </Text>
            <Pressable
              onPress={() => {
                setSelectedHabit(null); // Adding new habit
                setShowAddHabit(true);
              }}
              style={[styles.addButton, { backgroundColor: theme.primary }]}
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
                onToggleDone={handleToggleDone}
                onEdit={handleEditHabit}
              />
            ))
          )}
        </View>

        {/* Goals */}
        <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Goals
            </Text>
            <Pressable
              onPress={() => setShowAddGoal(true)}
              style={[styles.addButton, { backgroundColor: theme.primary }]}
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
              <GoalItem key={goal.id} goal={goal} darkMode={darkMode} />
            ))
          )}
        </View>

        {/* Pro CTA */}
        {!pro && (
          <Pressable
            style={[styles.proCard, { backgroundColor: theme.accent }]}
          >
            <Text style={styles.proTitle}>🌟 Upgrade to Pro</Text>
            <Text style={styles.proText}>
              Unlock unlimited habits, advanced analytics, and more!
            </Text>
            <View style={styles.proButton}>
              <Text style={[styles.proButtonText, { color: theme.accent }]}>
                Learn More
              </Text>
            </View>
          </Pressable>
        )}
      </ScrollView>

      {/* Modals */}
      <AddHabitModal
        visible={showAddHabit}
        onClose={handleCloseModal}
        darkMode={darkMode}
        habit={selectedHabit}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
      />
      <AddGoalModal
        visible={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        darkMode={darkMode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },

  quoteCard: {
    padding: 20,
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
    fontSize: 40,
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 24,
  },

  progressCard: {
    padding: 20,
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
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  progressCircle: {
    alignItems: "center",
  },
  progressNumber: {
    fontSize: 48,
    fontWeight: "bold",
  },
  progressLabel: {
    fontSize: 14,
    marginTop: 4,
  },

  section: {
    padding: 16,
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },

  proCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  proTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  proText: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.9,
    marginBottom: 16,
  },
  proButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  proButtonText: {
    fontWeight: "bold",
    fontSize: 14,
  },
});
