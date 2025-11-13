/// src/components/HabitItem.tsx
import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { Habit } from '../types';
import { useApp, newId } from '../store';

export default function HabitItem({
  habit,
  date,
  darkMode,
}: {
  habit: Habit;
  date: string;        // e.g. "2025-11-12"
  darkMode?: boolean;
}) {
  const { entries = [], upsertEntry } = useApp();

  const theme = darkMode ? DARK : LIGHT;

  // Find today's entry for this habit (if any)
  const todayEntry = useMemo(
    () => entries.find((e: any) => e?.date === date && e?.habitId === habit.id),
    [entries, date, habit.id]
  );

  const completed = !!todayEntry?.completed;

  const toggle = () => {
    upsertEntry({
      id: todayEntry?.id ?? newId(),
      date,
      habitId: habit.id,
      completed: !completed,
    });
  };

  const label = (habit as any).name ?? (habit as any).title ?? 'Habit';

  return (
    <View style={[styles.row, { borderColor: theme.border }]}>
      <Pressable onPress={toggle} style={[styles.checkbox, { borderColor: theme.border }]}>
        {completed ? <Text style={[styles.check, { color: theme.primary }]}>✓</Text> : null}
      </Pressable>

      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {label}
        </Text>
        {(habit as any).notes ? (
          <Text style={[styles.sub, { color: theme.textSecondary }]} numberOfLines={1}>
            {(habit as any).notes}
          </Text>
        ) : null}
      </View>

      {/* If you later add an Edit screen, reintroduce a button here that navigates there */}
    </View>
  );
}

/* ------------------------------ Theme ------------------------------ */

const LIGHT = {
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E5E7EB',
  primary: '#6366F1',
} as const;

const DARK = {
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#334155',
  primary: '#818CF8',
} as const;

/* ------------------------------ Styles ----------------------------- */

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { fontSize: 16, fontWeight: '900' },
  textWrap: { flex: 1, minWidth: 0 },
  title: { fontSize: 16, fontWeight: '700' },
  sub: { fontSize: 12 },
});
