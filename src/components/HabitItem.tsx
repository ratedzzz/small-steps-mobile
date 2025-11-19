import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ColorDot } from "./ColorDot";
import { Habit } from "../types";

interface HabitItemProps {
  habit: Habit;
  onToggleDone: (habitId: string, doneForDay: boolean) => void;
  onEdit: (habit: Habit) => void;
  date?: string;
  darkMode?: boolean;
}


const HabitItem: React.FC<HabitItemProps> = ({ habit, onToggleDone, onEdit }) => {
  const [isDone, setIsDone] = useState(false);

  // Utility to get string yyyy-mm-dd for today's date
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // On load, determine if the habit is done for today based on habit.doneDate string
  useEffect(() => {
    if (habit.doneDate === getTodayString()) {
      setIsDone(true);
    } else {
      setIsDone(false);
    }
  }, [habit.doneDate]);

  // Handler for toggling done state
  const toggleDone = () => {
    const newDoneState = !isDone;
    setIsDone(newDoneState);
    onToggleDone(habit.id, newDoneState);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onEdit(habit)}>
      <View style={styles.left}>
        <ColorDot color={habit.color} />
        <Text style={styles.text}>{habit.title}</Text>
      </View>

      <TouchableOpacity
        style={[styles.checkBox, isDone && styles.checkedBox]}
        onPress={toggleDone}
        activeOpacity={0.7}
      >
        {isDone && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    marginLeft: 12,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
  },
  checkmark: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default HabitItem;
