/// app/(tabs)/index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

import { useApp } from '../../src/store';
import { getMotivationalQuote } from '../../src/quotes';

import AddHabitModal from '../../src/components/AddHabitModal';
import AddGoalModal from '../../src/components/AddGoalModal';
import HabitItem from '../../src/components/HabitItem';
import GoalItem from '../../src/components/GoalItem';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const darkMode = scheme === 'dark';

  // ✅ Keep tokens as plain objects (NOT StyleSheet.create), so values are strings
  const theme = darkMode ? darkTheme : lightTheme;

  const { habits = [], goals = [], entries = [], pro } = useApp();
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [dailyQuote, setDailyQuote] = useState('');

  useEffect(() => {
    setDailyQuote(getMotivationalQuote());
  }, []);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const completedToday = useMemo(() => {
    const todayEntries = entries.filter((e) => e.date === today && e.habitId);
    return todayEntries.filter((e) => e.completed).length;
  }, [entries, today]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.primary }]}>Small Steps</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          {/* Quick links (→ /journal, /badges, /archives) */}
          <View style={styles.quickLinks}>
            <Link href="/journal" asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open Journal"
                style={[styles.quickLinkBtn, { borderColor: theme.primary }]}
              >
                <Text style={[styles.quickLinkText, { color: theme.primary }]}>Journal</Text>
              </Pressable>
            </Link>
            <Link href="/badges" asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View Badges"
                style={[styles.quickLinkBtn, { borderColor: theme.primary }]}
              >
                <Text style={[styles.quickLinkText, { color: theme.primary }]}>Badges</Text>
              </Pressable>
            </Link>
            <Link href="/archives" asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open Archives"
                style={[styles.quickLinkBtn, { borderColor: theme.primary }]}
              >
                <Text style={[styles.quickLinkText, { color: theme.primary }]}>Archives</Text>
              </Pressable>
            </Link>
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
          <View style={[styles.progressCard, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.progressTitle, { color: theme.text }]}>Today's Progress</Text>
            <View style={styles.progressCircle}>
              <Text style={[styles.progressNumber, { color: theme.primary }]}>
                {completedToday}/{habits.length}
              </Text>
              <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                completed
              </Text>
            </View>
          </View>
        )}

        {/* Habits */}
        <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Habits</Text>
            <Pressable
              onPress={() => setShowAddHabit(true)}
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
              <HabitItem key={habit.id} habit={habit} date={today} darkMode={darkMode} />
            ))
          )}
        </View>

        {/* Goals */}
        <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Goals</Text>
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
            goals.map((goal) => <GoalItem key={goal.id} goal={goal} darkMode={darkMode} />)
          )}
        </View>

        {/* Pro CTA */}
        {!pro && (
          <Link href="/settings" asChild>
            <Pressable style={[styles.proCard, { backgroundColor: theme.primary }]}>
              <Text style={styles.proTitle}>🌟 Upgrade to Pro</Text>
              <Text style={styles.proText}>
                Unlock unlimited habits, advanced analytics, and more!
              </Text>
              <View style={styles.proButton}>
                <Text style={styles.proButtonText}>Learn More</Text>
              </View>
            </Pressable>
          </Link>
        )}
      </ScrollView>

      {/* Modals */}
      <AddHabitModal
        visible={showAddHabit}
        onClose={() => setShowAddHabit(false)}
        darkMode={darkMode}
      />
      <AddGoalModal
        visible={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        darkMode={darkMode}
      />
    </SafeAreaView>
  );
}

/** Light/Dark tokens kept as plain objects (avoid StyleSheet.create here) */
const lightTheme = {
  bg: '#F8FAFC',
  cardBg: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  primary: '#6366F1',
} as const;

const darkTheme = {
  bg: '#0F172A',
  cardBg: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  primary: '#818CF8',
} as const;

/** Styles (only real RN style objects in here) */
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 32, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },

  quickLinks: {
    flexDirection: 'row',
    gap: 8,
  },
  quickLinkBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickLinkText: { fontWeight: '600', fontSize: 12 },

  quoteCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quoteIcon: { fontSize: 40, marginBottom: 12 },
  quoteText: { fontSize: 16, fontStyle: 'italic', textAlign: 'center', lineHeight: 24 },

  progressCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  progressCircle: { alignItems: 'center' },
  progressNumber: { fontSize: 48, fontWeight: 'bold' },
  progressLabel: { fontSize: 14, marginTop: 4 },

  section: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },

  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },

  emptyState: { paddingVertical: 32, alignItems: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center' },

  proCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  proTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  proText: { fontSize: 14, color: '#E0E7FF', marginBottom: 16 },
  proButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  proButtonText: { color: '#6366F1', fontWeight: 'bold', fontSize: 14 },
});
