// src/screens/ArchivesScreen.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../store';

type Tokens = {
  bg: string;
  cardBg: string;
  text: string;
  textSecondary: string;
  primary: string;
};

const LIGHT: Tokens = {
  bg: '#F8FAFC',
  cardBg: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  primary: '#6366F1',
};

const DARK: Tokens = {
  bg: '#0F172A',
  cardBg: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  primary: '#818CF8',
};

export default function ArchivesScreen() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const theme = dark ? DARK : LIGHT;

  const { entries = [], habits = [], goals = [] } = useApp();

  // Map IDs -> names for friendlier archive lists
  const habitName = useMemo(() => {
    const m = new Map<string, string>();
    for (const h of habits) m.set(h.id, (h as any).name ?? (h as any).title ?? 'Habit');
    return m;
  }, [habits]);

  const goalName = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of goals) m.set(g.id, (g as any).name ?? (g as any).title ?? 'Goal');
    return m;
  }, [goals]);

  // Group entries by date descending
  const byDate = useMemo(() => {
    const groups = new Map<string, any[]>();
    for (const e of entries) {
      const key = e?.date ?? 'unknown';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e);
    }
    return [...groups.entries()]
      .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0)); // newest first
  }, [entries]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Archives</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Past journal entries and habit/goal updates
          </Text>
        </View>

        {byDate.length === 0 ? (
          <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.empty, { color: theme.textSecondary }]}>
              Nothing archived yet. Come back after you’ve logged some progress!
            </Text>
          </View>
        ) : (
          byDate.map(([date, list]) => (
            <View key={date} style={[styles.card, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.date, { color: theme.primary }]}>
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>

              {list.map((e, idx) => {
                const isJournal = !e.habitId && !e.goalId;
                const title = isJournal
                  ? 'Journal'
                  : e.habitId
                  ? `Habit • ${habitName.get(e.habitId) ?? e.habitId}`
                  : e.goalId
                  ? `Goal • ${goalName.get(e.goalId) ?? e.goalId}`
                  : 'Entry';

                const detail =
                  typeof e.text === 'string' && e.text.trim().length > 0
                    ? e.text.trim()
                    : e.completed !== undefined
                    ? (e.completed ? 'Completed' : 'Not completed')
                    : '';

                return (
                  <View key={e.id ?? idx} style={styles.row}>
                    <Text style={[styles.rowTitle, { color: theme.text }]} numberOfLines={1}>
                      {title}
                    </Text>
                    {detail ? (
                      <Text style={[styles.rowDetail, { color: theme.textSecondary }]} numberOfLines={2}>
                        {detail}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 100 },

  header: { marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 13 },

  card: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },

  date: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  row: { marginBottom: 10 },
  rowTitle: { fontSize: 16, fontWeight: '700' },
  rowDetail: { fontSize: 13, marginTop: 2, lineHeight: 18 },

  empty: { textAlign: 'center', paddingVertical: 12, fontSize: 14 },
});
