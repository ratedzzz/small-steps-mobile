import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Goal } from "../types";

interface Props {
  goal: Goal;
  darkMode: boolean;
  onEdit?: (goal: Goal) => void;
}

export default function GoalItem({ goal, darkMode, onEdit }: Props) {
  const theme = darkMode
    ? { bg: "#074047", text: "#EAF7F6" }
    : { bg: "#F1F3F4", text: "#15292E" };

  const handleEdit = () => {
    if (onEdit) onEdit(goal);
  };

  return (
    <Pressable
      onPress={handleEdit}
      style={[
        styles.container,
        { backgroundColor: theme.bg },
      ]}
      android_ripple={{ color: "#33333322" }}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: goal.color },
        ]}
      />
      <Text style={[styles.name, { color: theme.text }]}>
        {goal.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    elevation: 2,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
});
