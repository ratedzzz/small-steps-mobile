
// app/(tabs)/calendar.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { useApp } from '../../src/store';

// Some versions don’t export DateObject — keep a local fallback
type DateObject = {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
};

// Looser entry shape used just in this screen
type EntryLike = {
  id?: string;
  date?: string;
  text?: string;
  completed?: boolean;
  habitId?: string;
  goalId?: string; // <- optional here
};

const LIGHT = {
  bg: '#F8FAFC',
  cardBg: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  primary: '#6366F1',
} as const;

const DARK = {
  bg: '#0F172A',
  cardBg: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  primary: '#818CF8',
} as const;

export default function CalendarScreen() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const theme = dark ? DARK : LIGHT;

  const { entries = [], habits = [], goals = [] } = useApp();
  const entriesLoose = entries as EntryLike[];

  const [selected, setSelected] = useState<string>(() =>
    new Date().toISOString().split('T')[0]
  );

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    for (const e of entriesLoose) {
      if (!e?.date) continue;
      marks[e.date] = {
        ...marks[e.date],
        marked: true,
        dotColor: theme.primary,
      };
    }
    if (selected) {
      marks[selected] = { ...(marks[selected] || {}), selected: true, selectedColor: theme.primary };
    }
    return marks;
  }, [entriesLoose, selected, theme.primary]);

  const itemsForSelected = useMemo(
    () => entriesLoose.filter((e) => e?.date === selected),
    [entriesLoose, selected]
  );

  const nameForHabit = useMemo(() => {
    const m = new Map<string, string>();
    for (const h of habits) m.set(h.id, (h as any).name ?? (h as any).title ?? 'Habit');
    return m;
  }, [habits]);

  const nameForGoal = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of goals) m.set(g.id, (g as any).name ?? (g as any).title ?? 'Goal');
    return m;
  }, [goals]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
        <Calendar
          onDayPress={(d: DateData) => setSelected(d.dateString)}
          markedDates={markedDates}
          theme={{
            calendarBackground: theme.cardBg,
            dayTextColor: theme.text,
            monthTextColor: theme.text,
            textDisabledColor: theme.textSecondary,
            arrowColor: theme.primary,
            todayTextColor: theme.primary,
          }}
        />
      </View>

      <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.heading, { color: theme.text }]}>
          {new Date(selected).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>

        {itemsForSelected.length === 0 ? (
          <Text style={{ color: theme.textSecondary }}>No entries.</Text>
        ) : (
          itemsForSelected.map((e, i) => {
            const title =
              e.habitId
                ? `Habit • ${nameForHabit.get(e.habitId) ?? e.habitId}`
                : e.goalId
                ? `Goal • ${nameForGoal.get(e.goalId) ?? e.goalId}`
                : 'Journal';

            const detail =
              typeof e.text === 'string' && e.text.trim()
                ? e.text.trim()
                : e.completed !== undefined
                ? e.completed ? 'Completed' : 'Not completed'
                : '';

            return (
              <View key={e.id ?? i} style={styles.row}>
                <Text style={[styles.rowTitle, { color: theme.text }]} numberOfLines={1}>
                  {title}
                </Text>
                {!!detail && (
                  <Text style={{ color: theme.textSecondary }} numberOfLines={2}>
                    {detail}
                  </Text>
                )}
              </View>
            );
          })
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  heading: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  row: { marginBottom: 8 },
  rowTitle: { fontSize: 14, fontWeight: '700' },
});
