// src/components/GoalItem.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Goal } from '../types';
import { useApp } from '../store';

interface Props {
  goal: Goal;
  darkMode: boolean;
}

export default function GoalItem({ goal, darkMode }: Props) {
  const { archiveGoal, deleteGoal } = useApp();
  const theme = darkMode ? darkTheme : lightTheme;

  // Mock progress - in real app, calculate from related habits
  const progress = Math.floor(Math.random() * 100);

  const handleCompleteGoal = () => {
    Alert.alert(
      'Goal Completed! 🎉',
      `Congratulations on completing "${goal.title}"! What would you like to do with this goal?`,
      [
        {
          text: 'Keep',
          onPress: () => {
            // Just keep the goal as is
          },
        },
        {
          text: 'Archive',
          onPress: () => {
            archiveGoal(goal.id);
            Alert.alert('Archived', `"${goal.title}" has been moved to archives.`);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteGoal(goal.id);
            Alert.alert('Deleted', `"${goal.title}" has been deleted.`);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: goal.color }]} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text }]}>
            {goal.title}
          </Text>
          <Pressable
            onPress={handleCompleteGoal}
            style={[styles.completeButton, { backgroundColor: goal.color }]}
          >
            <Text style={styles.completeText}>✓</Text>
          </Pressable>
        </View>
        {goal.dueDate && (
          <Text style={[styles.dueDate, { color: theme.textSecondary }]}>
            Due: {new Date(goal.dueDate).toLocaleDateString()}
          </Text>
        )}
        <View style={[styles.progressBar, { backgroundColor: theme.progressBg }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: goal.color },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
          {progress}% complete
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dueDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
  },
});

const lightTheme = {
  text: '#0F172A',
  textSecondary: '#64748B',
  progressBg: '#E5E7EB',
};

const darkTheme = {
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  progressBg: '#334155',
};