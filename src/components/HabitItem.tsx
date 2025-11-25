import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Habit } from "../types";

interface HabitItemProps {
  habit: Habit;
  date: string;
  darkMode: boolean;
  onToggleDone: (habitId: string, doneForDay: boolean) => void;
  onEdit: (habit: Habit) => void;
}

// Check if habit is completed today
const isHabitCompleted = (habit: Habit, date: string) =>
  habit.doneDate === date;

export default function HabitItem({
  habit,
  date,
  darkMode,
  onToggleDone,
  onEdit,
}: HabitItemProps) {
  const isCompleted = isHabitCompleted(habit, date);

  const handleToggle = () => onToggleDone(habit.id, isCompleted);
  const handleEdit = () => onEdit(habit);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: darkMode ? "#074047" : "#1DA27E" },
      ]}
    >
      <Pressable
        onPress={handleEdit}
        style={styles.contentArea}
        android_ripple={{ color: "#33333322" }}
      >
        <View style={[styles.dot, { backgroundColor: habit.color }]} />
        <Text
          style={[styles.name, isCompleted && styles.nameCompleted]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {habit.name}
        </Text>
      </Pressable>

      {/* Checkbox is separate and does not affect modal */}
      <Pressable
        onPress={handleToggle}
        style={styles.checkboxArea}
        android_ripple={{ color: "#33333322" }}
      >
        <View
          style={[
            styles.checkboxOuter,
            isCompleted && styles.checkboxOuterDone,
          ]}
        >
          {isCompleted && <View style={styles.checkboxInner} />}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 44,
  },
  contentArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
    marginLeft: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginRight: 14,
    marginLeft: 2,
    flexShrink: 1,
  },
  nameCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  checkboxArea: {
    marginLeft: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOuterDone: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#1DA27E",
  },
});
