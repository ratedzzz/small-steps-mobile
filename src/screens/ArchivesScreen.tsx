import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../store';

const PALETTE = {
  tealBg: '#15292E',
  cardBg: '#074047',
  textLight: '#EAF7F6',
  accent: '#1DA27E',
  gold: '#E0A800'
};

export default function ArchivesScreen() {
  const scheme = useColorScheme();
  const theme = {
    bg: PALETTE.tealBg,
    cardBg: PALETTE.cardBg,
    text: PALETTE.textLight
  };

  const { entries = [], habits = [], goals = [] } = useApp();

  // Maps for habit and goal display names
  const habitName = useMemo(() => {
    const m = new Map();
    for (const h of habits) m.set(h.id, h.title ?? 'Habit');
    return m;
  }, [habits]);

  const goalName = useMemo(() => {
    const m = new Map();
    for (const g of goals) m.set(g.id, g.title ?? 'Goal');
    return m;
  }, [goals]);

  // Group entries
  const habitEntries = entries.filter(e => e.habitId);
  const journalEntries = entries.filter(e => !e.habitId);

  // Entries supporting goals
  const goalEntries: { goal: string; entry: typeof entries[0]; }[] = [];
  for (const goal of goals) {
    for (const entry of entries) {
      // Show journal entry if its habitId is related to the goal
      if (
        goal.relatedHabitIds &&
        entry.habitId &&
        goal.relatedHabitIds.includes(entry.habitId)
      ) {
        goalEntries.push({ goal: goal.title, entry });
      }
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={styles.sectionTitle}>Archives</Text>
          <Text style={styles.sectionDesc}>
            Review your completed habits, goals, and journal entries.
          </Text>
        </View>

        {habitEntries.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
            <Text style={styles.listTitle}>Habit Entries</Text>
            {habitEntries.map(entry => (
              <View key={entry.id} style={styles.entryBox}>
                <Text style={styles.entryName}>{habitName.get(entry.habitId!) ?? 'Habit'}</Text>
                <Text style={styles.entryDate}>
                  {new Date(entry.date).toLocaleDateString()}
                </Text>
                <Text style={styles.entryText}>{entry.text}</Text>
              </View>
            ))}
          </View>
        )}

        {goalEntries.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
            <Text style={styles.listTitle}>Goal Entries</Text>
            {goalEntries.map(({ goal, entry }) => (
              <View key={entry.id + goal} style={styles.entryBox}>
                <Text style={styles.entryName}>{goal}</Text>
                <Text style={styles.entryDate}>
                  {new Date(entry.date).toLocaleDateString()}
                </Text>
                <Text style={styles.entryText}>{entry.text}</Text>
              </View>
            ))}
          </View>
        )}

        {journalEntries.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
            <Text style={styles.listTitle}>Journal Entries</Text>
            {journalEntries.map(entry => (
              <View key={entry.id} style={styles.entryBox}>
                <Text style={styles.entryDate}>
                  {new Date(entry.date).toLocaleDateString()}
                </Text>
                <Text style={styles.entryText}>{entry.text}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  sectionTitle: { fontSize: 28, fontWeight: 'bold', color: PALETTE.textLight, marginBottom: 8 },
  sectionDesc: { fontSize: 16, color: PALETTE.textLight },
  listTitle: { fontSize: 21, fontWeight: 'bold', color: PALETTE.gold, marginBottom: 10 },
  entryBox: {
    backgroundColor: 'rgba(0,0,0,0.07)',
    borderRadius: 10,
    marginBottom: 12,
    padding: 10
  },
  entryName: { fontSize: 16, fontWeight: 'bold', color: PALETTE.textLight },
  entryDate: { fontSize: 13, color: PALETTE.textLight, marginBottom: 4 },
  entryText: { fontSize: 14, color: PALETTE.textLight }
});
