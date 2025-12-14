// src/components/HabitItem.tsx

import React, { useState, useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View, Animated, Modal, Dimensions } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { Habit } from "../types";

interface HabitItemProps {
  habit: Habit;
  date: string;
  darkMode: boolean;
  onToggleDone: (habitId: string, doneForDay: boolean) => void;
  onEdit: (habit: Habit) => void;
  celebrationPhrases?: string[];
}

const { width, height } = Dimensions.get("window");

// Check if habit is completed today
const isHabitCompleted = (habit: Habit, date: string) => {
  return habit.completedDates?.includes(date) || habit.doneDate === date;
};

export default function HabitItem({
  habit,
  date,
  darkMode,
  onToggleDone,
  onEdit,
  celebrationPhrases = ["Great Job!", "Way To Go!", "You Did It!"],
}: HabitItemProps) {
  const isCompleted = isHabitCompleted(habit, date);
  const [showCelebration, setShowCelebration] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const handleToggle = () => {
    const wasCompleted = isCompleted;
    
    // Trigger celebration popup if checking off (not unchecking)
    if (!wasCompleted) {
      setShowCelebration(true);

      // Animate popup in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    onToggleDone(habit.id, wasCompleted);
  };

  const handleEdit = () => onEdit(habit);

  const closeCelebration = () => {
    // Animate popup out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowCelebration(false);
    });
  };

  // Reset animation values when celebration is hidden
  useEffect(() => {
    if (!showCelebration) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [showCelebration, fadeAnim, scaleAnim]);

  return (
    <>
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

      {/* Full-screen celebration modal */}
      <Modal
        visible={showCelebration}
        transparent={true}
        animationType="none"
        onRequestClose={closeCelebration}
      >
        <Pressable
          style={styles.celebrationOverlay}
          onPress={closeCelebration}
        >
          <Animated.View
            style={[
              styles.celebrationContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Confetti explosion from center */}
            <View style={styles.confettiContainer}>
              <ConfettiCannon
                count={200}
                origin={{ x: width / 2, y: height / 2 }}
                autoStart={true}
                fadeOut={true}
                fallSpeed={2500}
                explosionSpeed={400}
              />
            </View>

            {/* Celebration text */}
            <Text style={styles.celebrationTitle}>Congratulations on</Text>
            <Text style={styles.celebrationTitle}>completing your</Text>
            <Text style={styles.celebrationTitle}>habit for today!</Text>

            {/* Continue button */}
            <Pressable
              onPress={closeCelebration}
              style={styles.continueButton}
              android_ripple={{ color: "#ffffff44" }}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </Pressable>

            {/* Tap anywhere hint */}
            <Text style={styles.tapHint}>Tap anywhere to close</Text>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
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
  celebrationOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  celebrationContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
  },
  celebrationTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#F1C453",
    textAlign: "center",
    marginVertical: 4,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    zIndex: 10,
  },
  continueButton: {
    marginTop: 40,
    backgroundColor: "#1DA27E",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  tapHint: {
    marginTop: 20,
    fontSize: 14,
    color: "#9FB8B6",
    fontStyle: "italic",
    zIndex: 10,
  },
});
