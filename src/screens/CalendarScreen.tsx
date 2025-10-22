// src/screens/CalendarScreen.tsx
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../store';

export default function CalendarScreen() {
  const systemTheme = useColorScheme();
  const darkMode = systemTheme === 'dark';
  
  // Define theme colors separately (not in StyleSheet)
  const theme = darkMode ? {
    bg: '#0F172A',
    cardBg: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    primary: '#818CF8',
  } : {
    bg: '#F8FAFC',
    cardBg: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#64748B',
    primary: '#6366F1',
  };
  
  const { habits, goals, entries } = useApp();
  const [selectedDate, setSelectedDate] = useState('');

  // Build marked dates object for the calendar
  const markedDates: Record<string, any> = {};
  
  entries.forEach(entry => {
    if (entry.completed && entry.habitId) {
      const habit = habits.find(h => h.id === entry.habitId);
      if (habit && !markedDates[entry.date]) {
        markedDates[entry.date] = { dots: [] };
      }
      if (habit && markedDates[entry.date]) {
        markedDates[entry.date].dots.push({
          key: habit.id,
          color: habit.color,
        });
      }
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.text }]}>Calendar</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
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
            <Text style={[styles.detailsTitle, { color: theme.text }]}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            
            {selectedEntries.length > 0 ? (
              <>
                <Text style={[styles.detailsSubtitle, { color: theme.textSecondary }]}>
                  Completed Habits:
                </Text>
                {selectedEntries.map(entry => {
                  const habit = habits.find(h => h.id === entry.habitId);
                  return habit ? (
                    <View key={entry.id} style={styles.habitRow}>
                      <View
                        style={[styles.habitDot, { backgroundColor: habit.color }]}
                      />
                      <Text style={[styles.habitName, { color: theme.text }]}>
                        {habit.name}
                      </Text>
                    </View>
                  ) : null;
                })}
              </>
            ) : (
              <Text style={[styles.noData, { color: theme.textSecondary }]}>
                No habits completed on this day
              </Text>
            )}
          </View>
        )}

        {/* Legend */}
        <View style={[styles.legendCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.legendTitle, { color: theme.text }]}>Legend</Text>
          {habits.map(habit => (
            <View key={habit.id} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: habit.color }]} />
              <Text style={[styles.legendText, { color: theme.text }]}>
                {habit.name}
              </Text>
            </View>
          ))}
          {habits.length === 0 && (
            <Text style={[styles.noData, { color: theme.textSecondary }]}>
              Add habits to see them here
            </Text>
          )}
        </View>
      </ScrollView>
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
  legendText: {
    fontSize: 16,
  },
});