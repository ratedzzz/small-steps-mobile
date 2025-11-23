// src/components/GoalItem.tsx

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Goal } from "../types";

interface Props {
  goal: Goal;
  darkMode: boolean;
  onEdit?: (goal: Goal) => void;
}

const lightTheme = {
  text: "#15292E",
  textSecondary: "#475569",
  progressBg: "#E5E7EB",
};

const darkTheme = {
  text: "#EAF7F6",
  textSecondary: "#9FB8B6",
  progressBg: "#334155",
};

export default function GoalItem({ goal, darkMode, onEdit }: Props) {
  const theme = darkMode ? darkTheme : lightTheme;

  // Mock progress - in real app, calculate from related habits
  const progress = Math.floor(Math.random() * 100);

  const handlePress = () => {
    if (onEdit) {
      onEdit(goal);
    }
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {/* Tappable content area for editing */}
      <View style={styles.contentArea}>
        <View
          style={[
            styles.dot,
            { backgroundColor: goal.color || "#F1C453" },
          ]}
        />
        <View style={styles.content}>
          <Text
            style={[styles.title, { color: theme.text }]}
            numberOfLines={1}
          >
            {goal.title}
          </Text>
          {goal.dueDate && (
            <Text
              style={[styles.dueDate, { color: theme.textSecondary }]}
            >
              Due:{" "}
              {new Date(goal.dueDate).toLocaleDateString("en-US")}
            </Text>
          )}
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.progressBg },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: goal.color },
              ]}
            />
          </View>
          <Text
            style={[styles.progressText, { color: theme.textSecondary }]}
          >
            {progress}% complete
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  contentArea: {
    flex: 1,
    flexDirection: "row",
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
    fontWeight: "600",
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
  },
  progressText: {
    fontSize: 12,
  },
});
