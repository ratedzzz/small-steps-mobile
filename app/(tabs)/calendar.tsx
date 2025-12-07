
// app/(tabs)/calendar.tsx
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

// --- HELPER: Get dates between two dates ---
function getDatesInRange(startDate: Date, endDate: Date) {
  const date = new Date(startDate.getTime());
  const dates = [];
  while (date <= endDate) {
    dates.push(date.toISOString().split('T')[0]);
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

export default function CalendarTab() {
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === 'dark';
  const theme = darkMode ? DARK : LIGHT;

  // Access data from store
  const { entries = [], habits = [], goals = [] } = useApp();

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // --- 1. CALCULATE MARKED DATES ---
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    // Helper to safely add a dot to a date
    const addDot = (date: string, color: string, key: string) => {
      if (!marks[date]) {
        marks[date] = { dots: [] };
      }
      // Avoid duplicate dots for the same item on the same day
      if (!marks[date].dots.find((d: any) => d.key === key)) {
        marks[date].dots.push({ key, color });
      }
    };

    // A. Map Habits (Completed History)
    // Note: This logic assumes your Habit type has a 'completedDates' array. 
    // If it only has 'doneDate' (singular), it will only show the most recent one.
    habits.forEach((habit: Habit) => {
      const datesToCheck = (habit as any).completedDates || (habit.doneDate ? [habit.doneDate] : []);
      
      datesToCheck.forEach((dateString: string) => {
        addDot(dateString, habit.color, `habit-${habit.id}`);
      });
    });

    // B. Map Goals (Duration)
    goals.forEach((goal: Goal) => {
      // Use createdAt or default to today if missing
      const start = (goal as any).createdAt ? new Date((goal as any).createdAt) : new Date();
      
      // If no dueDate, we cap it at 1 year from now to prevent infinite loop crashing
      const end = goal.dueDate 
        ? new Date(goal.dueDate) 
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1));

      const range = getDatesInRange(start, end);
      range.forEach((dateString) => {
        addDot(dateString, goal.color, `goal-${goal.id}`);
      });
    });

    // C. Map Journal Entries (Optional, using a standard generic color)
    (entries as JournalEntry[]).forEach((e) => {
      if (e.date) {
        addDot(e.date, darkMode ? '#FFF' : '#333', `entry-${e.id}`);
      }
    });

    // D. Highlight Selected Date
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: PALETTE.gold,
      selectedTextColor: '#15292E',
    };

    return marks;
  }, [entries, habits, goals, selectedDate, darkMode]);

  // --- 2. FILTER DATA FOR SELECTED DAY ---
  const activeItemsOnDay = useMemo(() => {
    const dayHabits = habits.filter(h => {
      const dates = (h as any).completedDates || (h.doneDate ? [h.doneDate] : []);
      return dates.includes(selectedDate);
    });

    const dayGoals = goals.filter(g => {
      const start = (g as any).createdAt ? new Date((g as any).createdAt) : new Date(0); // default to past
      // Normalize dates to remove time info for comparison
      const check = new Date(selectedDate);
      const end = g.dueDate ? new Date(g.dueDate) : new Date(8640000000000000); // max date
      return check >= start && check <= end;
    });

    const dayEntries = entries.filter(e => e.date === selectedDate);

    return { dayHabits, dayGoals, dayEntries };
  }, [selectedDate, habits, goals, entries]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* CALENDAR */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Calendar
            current={selectedDate}
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            markingType={'multi-dot'}
            theme={{
              backgroundColor: theme.cardBg,
              calendarBackground: theme.cardBg,
              monthTextColor: theme.text,
              dayTextColor: theme.text,
              todayTextColor: PALETTE.gold,
              arrowColor: PALETTE.gold,
              textDisabledColor: '#6B7280',
              selectedDayBackgroundColor: PALETTE.gold,
              selectedDayTextColor: '#15292E',
              dotStyle: { width: 6, height: 6, marginTop: 1 },
            }}
          />
        </View>

        {/* DETAILS FOR SELECTED DATE */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {new Date(selectedDate).toLocaleDateString(undefined, {
              weekday: 'long', month: 'long', day: 'numeric'
            })}
          </Text>

          {/* Empty State */}
          {activeItemsOnDay.dayHabits.length === 0 && 
           activeItemsOnDay.dayGoals.length === 0 && 
           activeItemsOnDay.dayEntries.length === 0 && (
             <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>
               No activity recorded for this day.
             </Text>
          )}

          {/* Habits Done */}
          {activeItemsOnDay.dayHabits.map(h => (
            <View key={h.id} style={styles.itemRow}>
              <View style={[styles.dot, { backgroundColor: h.color }]} />
              <Text style={[styles.itemText, { color: theme.text }]}>Completed: {h.name}</Text>
            </View>
          ))}

          {/* Goals Active */}
          {activeItemsOnDay.dayGoals.map(g => (
            <View key={g.id} style={styles.itemRow}>
              <View style={[styles.dot, { backgroundColor: g.color }]} />
              <Text style={[styles.itemText, { color: theme.text }]}>Goal Active: {g.title}</Text>
            </View>
          ))}

           {/* Journal Entries */}
           {activeItemsOnDay.dayEntries.map((e, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={[styles.dot, { backgroundColor: darkMode ? '#FFF' : '#333' }]} />
              <Text style={[styles.itemText, { color: theme.text }]}>Journal Entry</Text>
            </View>
          ))}
        </View>

        {/* LEGEND / KEY */}
        <View style={[styles.card, { backgroundColor: theme.cardBg, marginTop: 10 }]}>
          <Text style={[styles.legendTitle, { color: theme.textSecondary }]}>Legend</Text>
          
          <View style={styles.legendGrid}>
            {habits.map(h => (
              <View key={h.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: h.color }]} />
                <Text style={[styles.legendText, { color: theme.text }]} numberOfLines={1}>
                  {h.name}
                </Text>
              </View>
            ))}
            {goals.map(g => (
              <View key={g.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: g.color }]} />
                <Text style={[styles.legendText, { color: theme.text }]} numberOfLines={1}>
                  {g.title}
                </Text>
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
  itemText: {
    fontSize: 15,
  },
  
  // Legend Styles
  legendTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%', // roughly 2 columns
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4, // slightly squarish for legend
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
  }
});