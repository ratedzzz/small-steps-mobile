import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Goal } from "../types";

interface Props {
  goal: Goal;
  darkMode: boolean;
  onEdit?: (goal: Goal) => void;
}

// MATCHING HABIT ITEM COLOR (Dark Blue)
const ITEM_BG_COLOR = "#055a8c";

export default function GoalItem({ goal, darkMode, onEdit }: Props) {
  // We force the theme to match HabitItem (Dark Blue background, White text)
  const theme = { 
    bg: ITEM_BG_COLOR, 
    text: "#FFFFFF" 
  };

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
      // White ripple because the background is dark
      android_ripple={{ color: "#ffffff33" }}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: goal.color },
        ]}
      />
      <Text
        style={[styles.name, { color: theme.text }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {goal.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    // 1. Matched to HabitItem
    borderRadius: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    // 2. Matched Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  dot: {
    // 3. Matched Dot Size
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  name: {
    // 4. Matched Font Size
    fontSize: 18,
    fontWeight: "600",
    flexShrink: 1,
  },
});