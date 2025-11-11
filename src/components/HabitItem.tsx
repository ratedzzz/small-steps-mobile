import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Habit } from '../types';
import { useApp, newId } from '../store';

interface HabitItemProps {
  habit: Habit;
  date: string;
  darkMode: boolean;
}

export default function HabitItem({ habit, date, darkMode }: HabitItemProps) {
  const { entries, upsertEntry } = useApp();
  const theme = darkMode ? darkTheme : lightTheme;

  const entry = entries.find(e => e.date === date && e.habitId === habit.id);
  const isCompleted = entry?.completed || false;

  const toggleCompletion = () => {
    upsertEntry({
      id: entry?.id || newId(),
      date,
      habitId: habit.id,
      completed: !isCompleted,
    });
  };

  return (
    <Pressable onPress={toggleCompletion} style={styles.container}>
      <View style={[styles.dot, { backgroundColor: habit.color }]} />
      <Text
        style={[
          styles.name,
          { color: theme.text },
          isCompleted && styles.nameCompleted,
        ]}
      >
        {habit.name}
      </Text>
      <View
        style={[
          styles.checkbox,
          { borderColor: habit.color },
          isCompleted && { backgroundColor: habit.color },
        ]}
      >
        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  name: { flex: 1, fontSize: 16, marginRight: 12 },
  nameCompleted: { textDecorationLine: 'line-through', opacity: 0.6 },
  checkbox: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
});

const lightTheme = { text: '#0F172A' };
const darkTheme = { text: '#F1F5F9' };
