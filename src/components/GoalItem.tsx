// src/components/GoalItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Goal } from '../types';

interface Props {
  goal: Goal;
  darkMode: boolean;
}

export default function GoalItem({ goal, darkMode }: Props) {
  const theme = darkMode ? darkTheme : lightTheme;
  
  // Mock progress - in real app, calculate from related habits
  const progress = Math.floor(Math.random() * 100);

  return (
    <View style={styles.container}>
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
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