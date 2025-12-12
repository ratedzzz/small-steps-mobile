
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars';

// Import your store and types
import { useApp } from '../../src/store';
import { Habit, Goal, JournalEntry } from '../../src/types';

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

  const { entries = [], habits = [], goals = [] } = useApp();
  
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // --- 1. CALCULATE MARKED DATES (CUSTOM SHAPES) ---
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    // Helper: Ensure date object exists
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
      const datesToCheck = (habit as any).completedDates || (habit.doneDate ? [habit.doneDate] : []);
      datesToCheck.forEach((dateString: string) => {
        initDate(dateString);
        // Add a dot for the habit
        marks[dateString].dots.push({ key: `habit-${habit.id}`, color: habit.color });
      });
    });

    // B. Goals -> SQUARES (Start & End only)
    goals.forEach((goal: Goal) => {
      // Start Date
      const start = (goal as any).createdAt ? new Date((goal as any).createdAt).toISOString().split('T')[0] : today;
      // End Date (if exists)
      const end = goal.dueDate;

      // Draw START shape (Left Rounded)
      initDate(start);
      marks[start].customStyles.container = {
        backgroundColor: goal.color,
        borderRadius: 0,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        borderTopRightRadius: 2, // Slight curve, mostly flat
        borderBottomRightRadius: 2,
        width: '100%', // Fills the cell
      };
      marks[start].customStyles.text = { color: 'white', fontWeight: 'bold' };

      // Draw END shape (Right Rounded)
      if (end) {
        initDate(end);
        
        // If start == end, make it a full rounded square
        if (start === end) {
          marks[end].customStyles.container = {
            backgroundColor: goal.color,
            borderRadius: 8,
            width: '100%',
          };
        } else {
          // Standard End Shape
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
    // We merge selection style on top of existing styles
    const existingContainer = marks[selectedDate].customStyles.container;
    marks[selectedDate].customStyles.container = {
      ...existingContainer,
      borderWidth: 2,
      borderColor: PALETTE.gold, // Gold border for selection
    };

    return marks;
  }, [entries, habits, goals, selectedDate, darkMode]);

  // --- 2. FILTER DATA FOR SELECTED DAY ---
  const activeItemsOnDay = useMemo(() => {
    // Habits
    const dayHabits = habits.filter(h => {
      const dates = (h as any).completedDates || [];
      return dates.includes(selectedDate);
    });

    // Goals (Is it Start, End, or Active?)
    const dayGoals = goals.filter(g => {
      const start = (g as any).createdAt ? new Date((g as any).createdAt).toISOString().split('T')[0] : today;
      const end = g.dueDate;

      const isStart = start === selectedDate;
      const isEnd = end === selectedDate;
      
      // We also check if it's "Active" (between start/end) even if we don't draw it
      const startD = new Date(start);
      const endD = end ? new Date(end) : new Date(8640000000000000);
      const check = new Date(selectedDate);
      const isActive = check >= startD && check <= endD;

      if (isStart) return true;
      if (isEnd) return true;
      if (isActive) return true; 
      return false;
    });

    return { dayHabits, dayGoals };
  }, [selectedDate, habits, goals]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* CALENDAR */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Calendar
            current={selectedDate}
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            markingType={'custom'} // <--- CRITICAL CHANGE
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

        {/* DETAILS */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {new Date(selectedDate).toLocaleDateString(undefined, {
              weekday: 'long', month: 'long', day: 'numeric'
            })}
          </Text>

          {activeItemsOnDay.dayHabits.length === 0 && activeItemsOnDay.dayGoals.length === 0 && (
            <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>
              No activity recorded.
            </Text>
          )}

          {/* Habits */}
          {activeItemsOnDay.dayHabits.map(h => (
            <View key={h.id} style={styles.itemRow}>
              {/* Habits = Circles */}
              <View style={[styles.dot, { backgroundColor: h.color }]} />
              <Text style={[styles.itemText, { color: theme.text }]}>Completed: {h.name}</Text>
            </View>
          ))}

          {/* Goals */}
          {activeItemsOnDay.dayGoals.map(g => {
            const start = (g as any).createdAt ? new Date((g as any).createdAt).toISOString().split('T')[0] : today;
            let label = "Active Goal";
            if (start === selectedDate) label = "START: Goal";
            if (g.dueDate === selectedDate) label = "END: Goal";

            return (
              <View key={g.id} style={styles.itemRow}>
                 {/* Goals = Squares */}
                <View style={[styles.square, { backgroundColor: g.color }]} />
                <Text style={[styles.itemText, { color: theme.text }]}>{label}: {g.title}</Text>
              </View>
            );
          })}
        </View>

        {/* LEGEND (Split) */}
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
    marginBottom: 8,
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
    borderRadius: 2, // Slightly rounded square
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
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
    marginBottom: 4,
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
  }
});