
// app/(tabs)/calendar.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars';

import { useApp } from '../../src/store';
import type { JournalEntry } from '../../src/types';

// Shared light/dark palette (matches new look)
const lightTheme = {
  bg: '#F5F7FB',
  cardBg: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#6B7280',
  accent: '#1DA27E', // teal
};

const darkTheme = {
  bg: '#050B18',          // deep navy
  cardBg: '#0F2233',      // lighter navy/teal card
  text: '#E5E7EB',
  textSecondary: '#9CA3AF',
  accent: '#1DA27E',      // teal
};

export default function CalendarTab() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  const { entries = [] } = useApp();

  const today = useMemo(
    () => new Date().toISOString().split('T')[0],
    []
  );
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // Entries for the currently selected date
  const entriesForDay = useMemo(
    () =>
      (entries as JournalEntry[]).filter(
        (e) => e.date === selectedDate && !(e as any).archived
      ),
    [entries, selectedDate]
  );

  // Mark any dates that have at least one entry
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    (entries as JournalEntry[]).forEach((e) => {
      if (!e.date) return;
      if (!marks[e.date]) {
        marks[e.date] = {
          marked: true,
          dots: [{ color: theme.accent }],
        };
      }
    });

    // Highlight the selected day
    if (!marks[selectedDate]) {
      marks[selectedDate] = {};
    }
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: theme.accent,
      selectedTextColor: scheme === 'dark' ? '#020617' : '#FFFFFF',
    };

    return marks;
  }, [entries, selectedDate, theme.accent, scheme]);

const handleDayPress = (day: DateData) => {
  setSelectedDate(day.dateString);
};


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Calendar card */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              backgroundColor: theme.cardBg,
              calendarBackground: theme.cardBg,
              monthTextColor: theme.text,
              dayTextColor: theme.text,
              todayTextColor: theme.accent,
              arrowColor: theme.accent,
              textDisabledColor: '#6B7280',
              selectedDayBackgroundColor: theme.accent,
              selectedDayTextColor: scheme === 'dark' ? '#020617' : '#FFFFFF',
            }}
            firstDay={0}
          />
        </View>

        {/* Entries for selected day */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.dayTitle, { color: theme.text }]}>
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>

          {entriesForDay.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No entries.
            </Text>
          ) : (
            entriesForDay.map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <View style={[styles.dot, { backgroundColor: theme.accent }]} />
                <View style={styles.entryTextContainer}>
                  <Text style={[styles.entryTitle, { color: theme.text }]}>
                    {(entry as any).title || 'Journal Entry'}
                  </Text>
                  {!!entry.text && (
                    <Text
                      style={[styles.entryBody, { color: theme.textSecondary }]}
                      numberOfLines={2}
                    >
                      {entry.text}
                    </Text>
                  )}
                </View>
              </View>
            ))
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
    gap: 16,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 10,
  },
  entryTextContainer: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  entryBody: {
    fontSize: 13,
  },
});
