// PolishedDemoScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View,
  type ViewStyle,
  type TextStyle, // added TextStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddGoalModal from '../components/AddGoalModal';
import AddHabitModal from '../components/AddHabitModal';
import GoalItem from '../components/GoalItem';
import HabitItem from '../components/HabitItem';
import { getMotivationalQuote } from '../quotes';
import { useApp } from '../store';

export default function HomeScreen() {
  const systemTheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(systemTheme === 'dark');
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [dailyQuote, setDailyQuote] = useState('');
  
  const { habits, goals, entries, pro } = useApp();

  type Theme = {
    bg: string;
    cardBg: string;
    text: string;
    textSecondary: string;
    primary: string;
  };

  const lightTheme: Theme = {
    bg: '#F8FAFC',
    cardBg: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#64748B',
    primary: '#6366F1',
  };

  const darkTheme: Theme = {
    bg: '#0F172A',
    cardBg: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    primary: '#818CF8',
  };

  const theme: Theme = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    setDailyQuote(getMotivationalQuote());
  }, []);

  // Filter out archived items
  const activeHabits = habits.filter(h => !h.archived);
  const activeGoals = goals.filter(g => !g.archived);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Calculate completion for today (only active habits)
  const todayEntries = entries.filter(e => e.date === today && e.habitId);
  const completedToday = todayEntries.filter(e => e.completed).length;

  return (
    <SafeAreaView style={[styles.container as ViewStyle, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent as ViewStyle}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.primary }]}>Small Steps</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <View style={styles.themeToggle}>
            <Text style={[styles.themeLabel, { color: theme.text }]}>Dark</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
              thumbColor={darkMode ? '#fff' : '#fff'}
            />
          </View>
        </View>

        {/* Daily Quote Card */}
        <View style={[styles.quoteCard, { backgroundColor: theme.cardBg }]}>
          <Text style={styles.quoteIcon}>✨</Text>
          <Text style={[styles.quoteText, { color: theme.text }]}>
            "{dailyQuote}"
          </Text>
        </View>

        {/* Today's Progress */}
        {activeHabits.length > 0 && (
          <View style={[styles.progressCard, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.progressTitle, { color: theme.text }]}>
              Today's Progress
            </Text>
            <View style={styles.progressCircle}>
              <Text style={[styles.progressNumber, { color: theme.primary }]}>
                {completedToday}/{activeHabits.length}
              </Text>
              <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                completed
              </Text>
            </View>
          </View>
        )}

        {/* Habits Section */}
        <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Daily Habits
            </Text>
            <Pressable
              onPress={() => setShowAddHabit(true)}
              style={[styles.addButton, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </Pressable>
          </View>

          {activeHabits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No habits yet. Start by adding your first small step!
              </Text>
            </View>
          ) : (
            activeHabits.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                date={today}
                darkMode={darkMode}
              />
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

          {activeGoals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Set a goal to work towards!
              </Text>
            </View>
          ) : (
            activeGoals.map((goal) => (
              <GoalItem key={goal.id} goal={goal} darkMode={darkMode} />
            ))
          )}
        </View>

        {/* Pro Upgrade Banner */}
        {!pro && (
          <Pressable style={[styles.proCard, { backgroundColor: '#6366F1' }]}>
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

type Styles = {
  container: ViewStyle;
  scrollContent: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  themeToggle: ViewStyle;
  themeLabel: TextStyle;
  quoteCard: ViewStyle;
  quoteIcon: TextStyle;
  quoteText: TextStyle;
  progressCard: ViewStyle;
  progressTitle: TextStyle;
  progressCircle: ViewStyle;
  progressNumber: TextStyle;
  progressLabel: TextStyle;
  section: ViewStyle;
  sectionHeader: ViewStyle;
  sectionTitle: TextStyle;
  addButton: ViewStyle;
  addButtonText: TextStyle;
  emptyState: ViewStyle;
  emptyText: TextStyle;
  proCard: ViewStyle;
  proTitle: TextStyle;
  proText: TextStyle;
  proButton: ViewStyle;
  proButtonText: TextStyle;
};

const baseStyles: Styles = {
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
    marginRight: 8, // replaced gap with marginRight
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
};

const styles = StyleSheet.create<Styles>(baseStyles);