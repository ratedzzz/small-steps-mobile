// src/components/GoalItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Goal } from '../types';

/**
 * Props:
 * - goal: your Goal record
 * - darkMode?: optional flag from parent (e.g., useColorScheme() === 'dark')
 */
export default function GoalItem({
  goal,
  darkMode,
}: {
  goal: Goal;
  darkMode?: boolean;
}) {
  // Light/Dark tokens as plain objects (not StyleSheet.create)
  const theme = darkMode ? DARK : LIGHT;

  // Be flexible about label key (supports legacy 'title')
  const label = (goal as any).name ?? (goal as any).title ?? 'Goal';

  const progress = (goal as any).progress as number | undefined;
  const showProgress = typeof progress === 'number' && !Number.isNaN(progress);

  return (
    <View style={[styles.row, { borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
        {label}
      </Text>

      {showProgress && (
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          {Math.round(progress * 100)}%
        </Text>
      )}
    </View>
  );
}

/* ------------------------------ Theme ------------------------------ */

const LIGHT = {
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E5E7EB',
} as const;

const DARK = {
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#334155',
} as const;

/* ------------------------------ Styles ----------------------------- */

const styles = StyleSheet.create({
  row: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 16, fontWeight: '700' },
  sub: { fontSize: 12 },
});
