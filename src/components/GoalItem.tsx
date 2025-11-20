// src/components/GoalItem.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Goal } from '../types';
import { useApp } from '../store';

interface Props {
  goal: Goal;
  darkMode: boolean;
  onEdit?: (goal: Goal) => void;
}

export default function GoalItem({ goal, darkMode, onEdit }: Props) {
  const { archiveGoal, deleteGoal } = useApp();
  const theme = darkMode ? darkTheme : lightTheme;

  // Mock progress - in real app, calculate from related habits
  const progress = Math.floor(Math.random() * 100);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(goal);
    } else {
      // Fallback: show options modal
      Alert.alert(
        goal.title,
        'What would you like to do?',
        [
          { text: 'Cancel', style: 'cancel' },
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
              Alert.alert(
                'Delete Goal',
                `Are you sure you want to delete "${goal.title}"?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      deleteGoal(goal.id);
                    },
                  },
                ]
              );
            },
          },
        ]
      );
    }
  };

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
      {/* Tappable content area for editing */}
      <Pressable onPress={handleEdit} style={styles.contentArea}>
        <View style={[styles.dot, { backgroundColor: goal.color }]} />
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>
            {goal.title}
          </Text>
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
      </Pressable>

      {/* Complete button */}
      <Pressable
        onPress={handleCompleteGoal}
        style={[styles.completeButton, { backgroundColor: goal.color }]}
      >
        <Text style={styles.completeText}>✓</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contentArea: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  completeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
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
  text: '#15292E',
  textSecondary: '#475569',
  progressBg: '#E5E7EB',
};

const darkTheme = {
  text: '#EAF7F6',
  textSecondary: '#9FB8B6',
  progressBg: '#334155',
};
