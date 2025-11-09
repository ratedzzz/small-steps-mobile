import React, { useState } from 'react';
import { RegisteredStyle, ScrollView, StyleSheet, Text, TextStyle, useColorScheme, View, ViewStyle } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../store';

// Add small local types for calendar markings
type CalendarDot = {
  key: string;
  color: string;
};
type CalendarMarkedDate = {
  dots?: CalendarDot[];
  selected?: boolean;
  selectedColor?: string;
};

// Add a simple Theme type for color tokens
type Theme = {
  bg: string;
  cardBg: string;
  text: string;
  textSecondary: string;
  primary: string;
};

export default function CalendarScreen() {
  const systemTheme = useColorScheme();
  const darkMode = systemTheme === 'dark';
  // Use plain theme objects (strings) so theme.primary is typed as string
  const theme: Theme = darkMode ? darkTheme : lightTheme;
  
  const { habits, goals, entries } = useApp();
  const [selectedDate, setSelectedDate] = useState('');

  // Build marked dates object for the calendar
  const markedDates: Record<string, CalendarMarkedDate> = {};

  entries.forEach(entry => {
    if (entry.completed && entry.habitId) {
      const habit = habits.find(h => h.id === entry.habitId);
      if (habit) {
        const dateKey = entry.date;
        if (!markedDates[dateKey]) {
          markedDates[dateKey] = { dots: [] };
        }
        if (!markedDates[dateKey].dots) {
          markedDates[dateKey].dots = [];
        }
        // non-null assertion used because we've ensured dots exists above
        markedDates[dateKey].dots!.push({
          key: `habit-${habit.id}`,
          color: habit.color,
        });
      }
    }
  });

  // Add goals to calendar (as dots with square indicator)
  goals.forEach(goal => {
    if (goal.dueDate) {
      const dateKey = goal.dueDate;
      if (!markedDates[dateKey]) {
        markedDates[dateKey] = { dots: [] };
      }
      if (!markedDates[dateKey].dots) {
        markedDates[dateKey].dots = [];
      }
      // non-null assertion used because we've ensured dots exists above
      markedDates[dateKey].dots!.push({
        key: `goal-${goal.id}`,
        color: goal.color,
      });
    }
  });

  // Add selection styling if a date is selected
  if (selectedDate && markedDates[selectedDate]) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: theme.primary,
    };
  } else if (selectedDate) {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: theme.primary,
    };
  }

  // Get entries for selected date
  const selectedEntries = selectedDate
    ? entries.filter(e => e.date === selectedDate && e.habitId && e.completed)
    : [];

  // Get goals for selected date
  const selectedGoals = selectedDate
    ? goals.filter(g => g.dueDate === selectedDate)
    : [];

  return (
    <SafeAreaView style={[styles.container as RegisteredStyle<ViewStyle>, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent as RegisteredStyle<ViewStyle>}>
        <Text style={[styles.title as RegisteredStyle<TextStyle>, { color: theme.text }]}>Calendar</Text>
        <Text style={[styles.subtitle as RegisteredStyle<TextStyle>, { color: theme.textSecondary }]}>
          Track your progress over time
        </Text>

        {/* Calendar */}
        <View style={[styles.calendarCard, { backgroundColor: theme.cardBg }]}>
          <Calendar
            markingType="multi-dot"
            markedDates={markedDates}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            theme={{
              backgroundColor: theme.cardBg,
              calendarBackground: theme.cardBg,
              textSectionTitleColor: theme.text,
              selectedDayBackgroundColor: theme.primary,
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: theme.primary,
              dayTextColor: theme.text,
              textDisabledColor: theme.textSecondary,
              dotColor: theme.primary,
              selectedDotColor: '#FFFFFF',
              arrowColor: theme.primary,
              monthTextColor: theme.text,
              indicatorColor: theme.primary,
              textDayFontWeight: '400',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        {/* Selected Date Details */}
        {selectedDate && (
          <View style={[styles.detailsCard, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.detailsTitle as RegisteredStyle<TextStyle>, { color: theme.text }]}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            
            {selectedEntries.length > 0 && (
              <>
                <Text style={[styles.detailsSubtitle as RegisteredStyle<TextStyle>, { color: theme.textSecondary }]}>
                  Completed Habits:
                </Text>
                {selectedEntries.map(entry => {
                  const habit = habits.find(h => h.id === entry.habitId);
                  return habit ? (
                    <View key={entry.id} style={styles.habitRow}>
                      <View
                        style={[styles.habitDot, { backgroundColor: habit.color }]}
                      />
                      <Text style={[styles.habitName as RegisteredStyle<TextStyle>, { color: theme.text }]}>
                        {habit.name}
                      </Text>
                    </View>
                  ) : null;
                })}
              </>
            )}

            {selectedGoals.length > 0 && (
              <>
                <Text style={[styles.detailsSubtitle as RegisteredStyle<TextStyle>, { color: theme.textSecondary, marginTop: 12 }]}>
                  Goals Due:
                </Text>
                {selectedGoals.map(goal => (
                  <View key={goal.id} style={styles.habitRow}>
                    <View
                      style={[styles.goalSquare, { backgroundColor: goal.color }]}
                    />
                    <Text style={[styles.habitName as RegisteredStyle<TextStyle>, { color: theme.text }]}>
                      {goal.title}
                    </Text>
                  </View>
                ))}
              </>
            )}

            {selectedEntries.length === 0 && selectedGoals.length === 0 && (
              <Text style={[styles.noData as RegisteredStyle<TextStyle>, { color: theme.textSecondary }]}>
                No habits completed or goals due on this day
              </Text>
            )}
          </View>
        )}

        {/* Legend */}
        <View style={[styles.legendCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.legendTitle as RegisteredStyle<TextStyle>, { color: theme.text }]}>Legend</Text>

          {habits.length > 0 && (
            <>
              <Text style={[styles.legendSubtitle as RegisteredStyle<TextStyle>, { color: theme.textSecondary }]}>
                Habits (Circles)
              </Text>
              {habits.map(habit => (
                <View key={habit.id} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: habit.color }]} />
                  <Text style={[styles.legendText as RegisteredStyle<TextStyle>, { color: theme.text }]}>
                    {habit.name}
                  </Text>
                </View>
              ))}
            </>
          )}

          {goals.length > 0 && (
            <>
              <Text style={[styles.legendSubtitle as RegisteredStyle<TextStyle>, { color: theme.textSecondary, marginTop: 12 }]}>
                Goals (Squares)
              </Text>
              {goals.map(goal => (
                <View key={goal.id} style={styles.legendRow}>
                  <View style={[styles.legendSquare, { backgroundColor: goal.color }]} />
                  <Text style={[styles.legendText as RegisteredStyle<TextStyle>, { color: theme.text }]}>
                    {goal.title}
                  </Text>
                </View>
              ))}
            </>
          )}

          {habits.length === 0 && goals.length === 0 && (
            <Text style={[styles.noData as RegisteredStyle<TextStyle>, { color: theme.textSecondary }]}>
              Add habits and goals to see them here
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Replace the untyped baseStyles with a typed Styles interface and typed baseStyles
interface Styles {
  container: ViewStyle;
  scrollContent: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  calendarCard: ViewStyle;
  detailsCard: ViewStyle;
  detailsTitle: TextStyle;
  detailsSubtitle: TextStyle;
  habitRow: ViewStyle;
  habitDot: ViewStyle;
  goalSquare: ViewStyle;
  habitName: TextStyle;
  noData: TextStyle;
  legendCard: ViewStyle;
  legendTitle: TextStyle;
  legendSubtitle: TextStyle;
  legendRow: ViewStyle;
  legendDot: ViewStyle;
  legendSquare: ViewStyle;
  legendText: TextStyle;
}

const baseStyles: Styles = {
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  calendarCard: {
    borderRadius: 16,
    padding: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailsSubtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  habitDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  goalSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  habitName: {
    fontSize: 16,
  },
  noData: {
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  legendCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  legendSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendSquare: {
    width: 16,
    height: 16,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 16,
  },
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

// Replace the explicit generic usage with a non-generic call and a permissive cast
const styles = StyleSheet.create(baseStyles as Record<string, any>);