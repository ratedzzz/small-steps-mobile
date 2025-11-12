// src/components/HabitItem.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp, newId } from '../store';
import type { Habit } from '../types';

interface HabitItemProps {
  habit: Habit;
  date: string;
  darkMode: boolean;
}

export default function HabitItem({ habit, date, darkMode }: HabitItemProps) {
  const router = useRouter();
  const { entries = [], upsertEntry } = useApp();
  const { archiveHabit, deleteHabit } = (useApp() as any);
  const theme = darkMode ? darkTheme : lightTheme;

  const entry = entries.find((e: any) => e.date === date && e.habitId === habit.id);
  const isCompleted = !!entry?.completed;

  const afterTogglePrompt = () => {
    Alert.alert(
      'Habit Completed',
      'What would you like to do with this habit?',
      [
        { text: 'Keep', style: 'default' },
        {
          text: 'Archive',
          onPress: () => {
            if (typeof archiveHabit === 'function') archiveHabit(habit.id);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (typeof deleteHabit === 'function') deleteHabit(habit.id);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const toggleCompletion = () => {
    const willComplete = !isCompleted;
    upsertEntry({
      id: entry?.id || newId(),
      date,
      habitId: habit.id,
      completed: willComplete,
    });
    if (willComplete) afterTogglePrompt();
  };

  const openEdit = () => {
    router.push({ pathname: '/edit-habit', params: { id: habit.id } });
  };

  return (
    <Pressable onPress={toggleCompletion} onLongPress={openEdit} style={styles.container}>
      <View style={[styles.dot, { backgroundColor: habit.color }]} />
      <Text
        style={[
          styles.name,
          { color: theme.text },
          isCompleted && styles.nameCompleted,
        ]}
        numberOfLines={1}
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
