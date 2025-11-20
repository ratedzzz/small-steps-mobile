// src/components/HabitItem.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Habit } from '../types';

interface HabitItemProps {
  habit: Habit;
  date: string;
  darkMode: boolean;
  onToggleDone: (habitId: string, doneForDay: boolean) => void;
  onEdit: (habit: Habit) => void;
}

export default function HabitItem({ 
  habit, 
  date, 
  darkMode, 
  onToggleDone, 
  onEdit 
}: HabitItemProps) {
  // Check if habit is completed today - resets at midnight automatically
  // because we compare against today's date
  const isCompleted = habit.doneDate === date;

  const handleToggle = () => {
    onToggleDone(habit.id, !isCompleted);
  };

  const handleEdit = () => {
    onEdit(habit);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: darkMode ? '#074047' : '#1DA27E' }
      ]}
    >
      {/* Tappable area for editing - the main content */}
      <Pressable 
        onPress={handleEdit}
        style={styles.contentArea}
      >
        <View style={[styles.dot, { backgroundColor: habit.color }]} />
        <Text
          style={[
            styles.name,
            isCompleted && styles.nameCompleted,
          ]}
        >
          {habit.name}
        </Text>
      </Pressable>

      {/* Separate tappable checkbox */}
      <Pressable onPress={handleToggle} style={styles.checkboxArea}>
        <View
          style={[
            styles.checkbox,
            { borderColor: '#FFFFFF' },
            isCompleted && { backgroundColor: '#FFFFFF' },
          ]}
        >
          {isCompleted && (
            <Text style={[styles.checkmark, { color: darkMode ? '#074047' : '#1DA27E' }]}>
              ✓
            </Text>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  contentArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 12,
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
    fontWeight: '500',
    color: '#FFFFFF',
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  checkboxArea: {
    padding: 12,
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
    fontSize: 14,
    fontWeight: 'bold',
  },
});
