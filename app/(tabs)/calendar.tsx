import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars';

// Import Store, Types, and Utils
import { useApp } from '../../src/store';
import { Habit, Goal, JournalEntry } from '../../src/types';
import { getLocalDate } from '../../src/utils'; // <--- The Timezone Fix

// Import Modals for Interactivity
import AddHabitModal from '../../src/components/AddHabitModal';
import AddGoalModal from '../../src/components/AddGoalModal';

// --- THEME ---
const PALETTE = {
  deepTeal: '#15292E',
  teal: '#074047',
  textLight: '#EAF7F6',
  textSecondary: '#9FB8B6',
  gold: '#F1C453',
  mint: '#1DA27E',
};

const LIGHT = {
  bg: '#FFF9EC',
  cardBg: '#FFFFFF',
  text: '#15292E',
  textSecondary: '#475569',
};

const DARK = {
  bg: PALETTE.deepTeal,
  cardBg: PALETTE.teal,
  text: PALETTE.textLight,
  textSecondary: PALETTE.textSecondary,
};

export default function CalendarTab() {
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === 'dark';
  const theme = darkMode ? DARK : LIGHT;

  const { 
    entries = [], 
    habits = [], 
    goals = [],
    updateHabit,
    deleteHabit,
    updateGoal,
    deleteGoal,
    addHabit, // Needed for Modal props
    addGoal   // Needed for Modal props
  } = useApp();
  
  // FIXED: Use local date so "Today" is accurate to the user
  const today = useMemo(() => getLocalDate(), []);
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // --- MODAL STATE ---
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // --- 1. CALCULATE MARKED DATES (CUSTOM SHAPES) ---
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    const initDate = (date: string) => {
      if (!marks[date]) {
        marks[date] = { 
          dots: [], 
          customStyles: { container: {}, text: {} }
        };
      }
    };

    // A. Habits -> DOTS
    habits.forEach((habit: Habit) => {
      // Check the history array primarily
      const datesToCheck = habit.completedDates || (habit.doneDate ? [habit.doneDate] : []);
      datesToCheck.forEach((dateString: string) => {
        initDate(dateString);
        // Avoid duplicate dots of the same color
        const exists = marks[dateString].dots.some((d: any) => d.key === `habit-${habit.id}`);
        if (!exists) {
          marks[dateString].dots.push({ key: `habit-${habit.id}`, color: habit.color });
        }
      });
    });

    // B. Goals -> SQUARES
    goals.forEach((goal: Goal) => {
      const start = goal.createdAt ? goal.createdAt.split('T')[0] : today;
      const end = goal.dueDate;

      initDate(start);
      marks[start].customStyles.container = {
        backgroundColor: goal.color,
        borderRadius: 0,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        borderTopRightRadius: 2,
        borderBottomRightRadius: 2,
        width: '100%',
      };
      marks[start].customStyles.text = { color: 'white', fontWeight: 'bold' };

      if (end) {
        initDate(end);
        if (start === end) {
          marks[end].customStyles.container = {
            backgroundColor: goal.color,
            borderRadius: 8,
            width: '100%',
          };
        } else {
          marks[end].customStyles.container = {
            backgroundColor: goal.color,
            borderRadius: 0,
            borderTopLeftRadius: 2,
            borderBottomLeftRadius: 2,
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
            width: '100%',
          };
        }
        marks[end].customStyles.text = { color: 'white', fontWeight: 'bold' };
      }
    });

    // C. Selection Highlight
    initDate(selectedDate);
    const existingContainer = marks[selectedDate].customStyles.container;
    marks[selectedDate].customStyles.container = {
      ...existingContainer,
      borderWidth: 2,
      borderColor: PALETTE.gold,
    };

    return marks;
  }, [habits, goals, selectedDate, darkMode, today]);

  // --- 2. FILTER DATA FOR SELECTED DAY ---
  const activeItemsOnDay = useMemo(() => {
    // Habits
    const dayHabits = habits.filter(h => {
      const dates = h.completedDates || [];
      return dates.includes(selectedDate);
    });

    // Goals
    const dayGoals = goals.filter(g => {
      const start = g.createdAt ? g.createdAt.split('T')[0] : today;
      const end = g.dueDate;
      const isStart = start === selectedDate;
      const isEnd = end === selectedDate;
      
      const startD = new Date(start);
      const endD = end ? new Date(end) : new Date(8640000000000000);
      const check = new Date(selectedDate);
      const isActive = check >= startD && check <= endD;

      return isStart || isEnd || isActive;
    });

    // Journal Entry for this day (General Note)
    const journalEntry = entries.find(e => e.date === selectedDate && !e.habitId);

    return { dayHabits, dayGoals, journalEntry };
  }, [selectedDate, habits, goals, entries, today]);

  // --- HANDLERS ---
  const handleHabitClick = (h: Habit) => {
    setSelectedHabit(h);
    setShowHabitModal(true);
  };

  const handleGoalClick = (g: Goal) => {
    setSelectedGoal(g);
    setShowGoalModal(true);
  };

  const handleSaveHabit = (partial: Partial<Habit>) => {
    if (partial.id) updateHabit(partial.id, partial);
    else addHabit(partial);
    setShowHabitModal(false);
  };

  const handleSaveGoal = (partial: Partial<Goal>) => {
    if (partial.id) updateGoal(partial.id, partial);
    else addGoal(partial);
    setShowGoalModal(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* CALENDAR */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Calendar
            current={selectedDate}
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            markingType={'custom'}
            markedDates={markedDates}
            theme={{
              backgroundColor: theme.cardBg,
              calendarBackground: theme.cardBg,
              monthTextColor: theme.text,
              dayTextColor: theme.text,
              todayTextColor: PALETTE.gold,
              arrowColor: PALETTE.gold,
              textDisabledColor: '#6B7280',
            }}
          />
        </View>

        {/* DETAILS SECTION */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {new Date(selectedDate).toLocaleDateString(undefined, {
              weekday: 'long', month: 'long', day: 'numeric'
            })}
          </Text>

          {activeItemsOnDay.dayHabits.length === 0 && 
           activeItemsOnDay.dayGoals.length === 0 && 
           !activeItemsOnDay.journalEntry && (
            <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>
              No activity recorded.
            </Text>
          )}

          {/* Habits List */}
          {activeItemsOnDay.dayHabits.map(h => (
            <Pressable 
              key={h.id} 
              style={({pressed}) => [styles.itemRow, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => handleHabitClick(h)}
            >
              <View style={[styles.dot, { backgroundColor: h.color }]} />
              <Text style={[styles.itemText, { color: theme.text }]}>
                Completed: <Text style={{fontWeight: 'bold'}}>{h.name}</Text>
              </Text>
            </Pressable>
          ))}

          {/* Goals List */}
          {activeItemsOnDay.dayGoals.map(g => {
            const start = g.createdAt ? g.createdAt.split('T')[0] : today;
            let label = "Active Goal";
            if (start === selectedDate) label = "START";
            if (g.dueDate === selectedDate) label = "DUE";

            return (
              <Pressable 
                key={g.id} 
                style={({pressed}) => [styles.itemRow, { opacity: pressed ? 0.7 : 1 }]}
                onPress={() => handleGoalClick(g)}
              >
                <View style={[styles.square, { backgroundColor: g.color }]} />
                <Text style={[styles.itemText, { color: theme.text }]}>
                  {label}: <Text style={{fontWeight: 'bold'}}>{g.title}</Text>
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* JOURNAL PREVIEW */}
        {activeItemsOnDay.journalEntry && (
          <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.textSecondary, borderWidth: 0.5 }]}>
            <Text style={[styles.legendTitle, { color: theme.textSecondary }]}>Journal Entry</Text>
            <Text style={[styles.itemText, { color: theme.text, fontStyle: 'italic' }]} numberOfLines={2}>
              "{activeItemsOnDay.journalEntry.text}"
            </Text>
          </View>
        )}

        {/* LEGEND */}
        <View style={[styles.card, { backgroundColor: theme.cardBg, marginTop: 10 }]}>
          <Text style={[styles.legendTitle, { color: theme.textSecondary }]}>Habits (Dots)</Text>
          <View style={styles.legendGrid}>
            {habits.map(h => (
              <View key={h.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: h.color }]} />
                <Text style={[styles.legendText, { color: theme.text }]} numberOfLines={1}>{h.name}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 16 }} />

          <Text style={[styles.legendTitle, { color: theme.textSecondary }]}>Goals (Start/End)</Text>
          <View style={styles.legendGrid}>
            {goals.map(g => (
              <View key={g.id} style={styles.legendItem}>
                <View style={[styles.legendSquare, { backgroundColor: g.color }]} />
                <Text style={[styles.legendText, { color: theme.text }]} numberOfLines={1}>{g.title}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* EDIT MODALS */}
      <AddHabitModal
        visible={showHabitModal}
        onClose={() => setShowHabitModal(false)}
        darkMode={darkMode}
        habit={selectedHabit}
        onSave={handleSaveHabit}
        onDelete={(id) => { deleteHabit(id); setShowHabitModal(false); }}
      />
      
      <AddGoalModal
        visible={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        darkMode={darkMode}
        goal={selectedGoal}
        onSave={handleSaveGoal}
        onDelete={(id) => { deleteGoal(id); setShowGoalModal(false); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100, gap: 16 },
  card: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // Increased spacing slightly
    paddingVertical: 4, // Added touch target area
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  square: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 10,
  },
  itemText: {
    fontSize: 15,
  },
  
  // Legend
  legendTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 16, // FIXED: Adds spacing between columns
    rowGap: 8,     // FIXED: Adds spacing between rows
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%', // Keeps them 2-per-row, but Gap handles the spacing now
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6, 
    marginRight: 8,
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 3, 
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    flexShrink: 1, // Ensures text truncates if too long
  }
});