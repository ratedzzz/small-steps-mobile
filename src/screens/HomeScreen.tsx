// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  useColorScheme,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../store';
import { getMotivationalQuote } from '../quotes';
import AddHabitModal from '../components/AddHabitModal';
import AddGoalModal from '../components/AddGoalModal';
import HabitItem from '../components/HabitItem';
import GoalItem from '../components/GoalItem';

type ThemeTokens = {
  bg: string;
  cardBg: string;
  text: string;
  textSecondary: string;
  primary: string;
};

const LIGHT: ThemeTokens = {
  bg: '#F8FAFC',
  cardBg: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  primary: '#6366F1',
};

const DARK: ThemeTokens = {
  bg: '#0F172A',
  cardBg: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  primary: '#818CF8',
};

export default function HomeScreen() {
  const systemTheme = useColorScheme();
  const [darkMode, setDarkMode] = useState<boolean>(systemTheme === 'dark');

  // Keep the toggle in sync if the user changes OS theme while app is running
  useEffect(() => {
    setDarkMode(systemTheme === 'dark');
  }, [systemTheme]);

  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [dailyQuote, setDailyQuote] = useState('');

  const { habits = [], goals = [], entries = [], pro } = useApp();
  const theme = darkMode ? DARK : LIGHT;

  useEffect(() => {
    setDailyQuote(getMotivationalQuote());
  }, []);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Calculate completion for today
  const todayEntries = (entries || []).filter((e: any) => e?.date === today && e?.habitId);
  const completedToday = todayEntries.filter((e: any) => e?.completed).length;

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

          <View style={styles.themeToggle}>
            <Text style={[styles.themeLabel, { color: theme.text, marginRight: 8 }]}>Dark</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#D1D5DB', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Daily Quote Card */}
        <View style={[styles.quoteCard, { backgroundColor: theme.cardBg }]}>
          <Text style={styles.quoteIcon}>✨</Text>
          <Text style={[styles.quoteText, { color: theme.text }]}>
            {dailyQuote ? `"${dailyQuote}"` : '“Small daily improvements lead to stunning results.”'}
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
              <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>completed</Text>
            </View>
          </View>
        )}

        {/* Habits Section */}
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
            habits.map((habit: any) => (
              <HabitItem key={habit.id} habit={habit} date={today} darkMode={darkMode} />
            ))
          )}
        </View>

        {/* Goals Section */}
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
            goals.map((goal: any) => <GoalItem key={goal.id} goal={goal} darkMode={darkMode} />)
          )}
        </View>

        {/* Pro Upgrade Banner */}
        {!pro && (
          <Pressable
            style={[styles.proCard, { backgroundColor: theme.primary }]}
            onPress={() => {
              // TODO: navigate to paywall or open modal
            }}
          >
            <Text style={styles.proTitle}>🌟 Upgrade to Pro</Text>
            <Text style={styles.proText}>
              Unlock unlimited habits, advanced analytics, and more!
            </Text>
            <View style={styles.proButton}>
              <Text style={styles.proButtonText}>Learn More</Text>
            </View>
          </Pressable>
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

/* ------------------------------------------------------------------ */
/* Styles - keep ONLY real style objects here (no color tokens)        */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeLabel: {
    fontSize: 14,
  },
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
  quoteIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
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
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  progressCircle: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 14,
    marginTop: 4,
  },
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
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
  proTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  proText: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 16,
  },
  proButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  proButtonText: {
    color: '#6366F1',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
