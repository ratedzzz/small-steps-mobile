
// app/(tabs)/calendar.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateObject } from 'react-native-calendars';
import { useApp } from '../../src/store';

export default function CalendarScreen() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const { habits = [], goals = [], entries = [] } = useApp();
  const theme = dark ? DARK : LIGHT;

  // Build markings: habits as dots, goals as colored squares
  const marked = useMemo<Record<string, any>>(() => {
    const map: Record<string, any> = {};
    // Completed habit dots
    entries.forEach((e: any) => {
      if (!e?.date) return;
      if (!map[e.date]) map[e.date] = { dots: [], customStyles: {} };
      if (e.habitId && e.completed) {
        const h = habits.find((x: any) => x.id === e.habitId);
        if (h) {
          map[e.date].dots.push({
            key: `h-${h.id}`,
            color: h.color,
            selectedDotColor: h.color,
          });
        }
      }
    });
    // Goal squares (customStyles)
    goals.forEach((g: any) => {
      if (!g?.targetDate) return; // adjust if your field name differs
      const date = g.targetDate; // YYYY-MM-DD
      if (!map[date]) map[date] = { dots: [], customStyles: {} };
      map[date].customStyles = {
        container: {
          backgroundColor: g.color || '#64748B',
          borderRadius: 3,
          width: 18,
          height: 18,
          alignItems: 'center',
          justifyContent: 'center',
        },
        text: { color: '#fff', fontSize: 12, fontWeight: '700' },
      };
    });
    return map;
  }, [entries, habits, goals]);

  const onDayPress = (_d: DateObject) => {
    // optional: handle selection
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text }]}>Calendar</Text>
      <Calendar
        style={{ flex: 1 }}
        // Use "custom" so customStyles render while still allowing dots
        markingType="custom"
        markedDates={marked}
        theme={{
          calendarBackground: theme.bg,
          dayTextColor: theme.text,
          monthTextColor: theme.text,
          textSectionTitleColor: theme.textSecondary,
          selectedDayBackgroundColor: theme.primary,
          todayTextColor: theme.primary,
          arrowColor: theme.primary,
        }}
        onDayPress={onDayPress}
        enableSwipeMonths
      />
      <View style={{ height: 16 }} />
      <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
        • Dots = completed habits • Colored squares = goal dates
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
});

const LIGHT = {
  bg: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#64748B',
  primary: '#6366F1',
};
const DARK = {
  bg: '#0F172A',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  primary: '#818CF8',
};
