// src/components/GoalItem.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp, newId } from '../store';
import type { Goal } from '../types';

interface Props {
  goal: Goal;
  darkMode: boolean;
}

export default function GoalItem({ goal, darkMode }: Props) {
  const router = useRouter();
  const { entries = [], upsertEntry } = useApp();
  const { archiveGoal, deleteGoal } = (useApp() as any);
  const theme = darkMode ? darkTheme : lightTheme;

  // Find today's goal progress entry (optional; adapt if you store goals differently)
  const today = new Date().toISOString().split('T')[0];
  const entry = entries.find((e: any) => e.date === today && e.goalId === goal.id);
  const isCompleted = !!entry?.completed;

  const afterTogglePrompt = () => {
    Alert.alert(
      'Goal Completed',
      'What would you like to do with this goal?',
      [
        { text: 'Keep', style: 'default' },
        {
          text: 'Archive',
          onPress: () => {
            if (typeof archiveGoal === 'function') archiveGoal(goal.id);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (typeof deleteGoal === 'function') deleteGoal(goal.id);
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
      date: today,
      goalId: goal.id,
      completed: willComplete,
    });
    if (willComplete) afterTogglePrompt();
  };

  const openEdit = () => {
    // Expo Router: navigate to /edit-goal?id=...
    router.push({ pathname: '/edit-goal', params: { id: goal.id } });
  };

  return (
    <Pressable onPress={toggleCompletion} onLongPress={openEdit} style={styles.container}>
      {/* colored square for goals */}
      <View style={[styles.square, { backgroundColor: goal.color }]} />
      <Text
        style={[
          styles.name,
          { color: theme.text },
          isCompleted && styles.nameCompleted,
        ]}
        numberOfLines={1}
      >
        {goal.name}
      </Text>
      <View
        style={[
          styles.checkbox,
          { borderColor: goal.color },
          isCompleted && { backgroundColor: goal.color },
        ]}
      >
        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  square: { width: 12, height: 12, borderRadius: 3, marginRight: 12 },
  name: { flex: 1, fontSize: 16, marginRight: 12 },
  nameCompleted: { textDecorationLine: 'line-through', opacity: 0.6 },
  checkbox: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
});

const lightTheme = { text: '#0F172A' };
const darkTheme = { text: '#F1F5F9' };
