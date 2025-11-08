// src/components/HabitItem.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Habit } from '../types';
import { useApp, newId } from '../store';

interface HabitItemProps {
  habit: Habit;
  date: string;
  darkMode: boolean;
}

export default function HabitItem({ habit, date, darkMode }: HabitItemProps) {
  const { entries, upsertEntry, archiveHabit, deleteHabit } = useApp();
  const theme = darkMode ? darkTheme : lightTheme;

  // Check if habit is completed today
  const entry = entries.find(
    e => e.date === date && e.habitId === habit.id
  );
  const isCompleted = entry?.completed || false;

  const showCompletionPrompt = () => {
    Alert.alert(
      'Habit Completed! 🎉',
      `Great job completing "${habit.name}"! What would you like to do with this habit?`,
      [
        {
          text: 'Keep',
          onPress: () => {
            // Just mark as complete, do nothing else
          },
        },
        {
          text: 'Archive',
          onPress: () => {
            archiveHabit(habit.id);
            Alert.alert('Archived', `"${habit.name}" has been moved to archives.`);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteHabit(habit.id);
            Alert.alert('Deleted', `"${habit.name}" has been deleted.`);
          },
        },
      ]
    );
  };

  const toggleCompletion = () => {
    if (!isCompleted) {
      // Mark as complete
      upsertEntry({
        id: entry?.id || newId(),
        date,
        habitId: habit.id,
        completed: true,
      });
      // Show prompt
      showCompletionPrompt();
    } else {
      // Unmark completion
      upsertEntry({
        id: entry?.id || newId(),
        date,
        habitId: habit.id,
        completed: false,
      });
    }
  };

  return (
    <Pressable
      onPress={toggleCompletion}
      style={styles.container}
    >
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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  name: {
    flex: 1,
    fontSize: 16,
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

const lightTheme = {
  text: '#0F172A',
};

const darkTheme = {
  text: '#F1F5F9',
};