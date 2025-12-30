import React, { useState, useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View, Animated, Modal, Dimensions } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { Habit } from "../types";
import { getHabitBackgroundColor, getTextColorForBackground } from "../theme";

interface HabitItemProps {
  habit: Habit;
  date: string;
  darkMode: boolean;
  onToggleDone: (habitId: string, doneForDay: boolean) => void;
  onEdit: (habit: Habit) => void;
  celebrationPhrases?: string[];
  index: number;         // <--- New Prop
  totalHabits: number;   // <--- New Prop
}

const { width, height } = Dimensions.get("window");

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
  index,
  totalHabits,
}: HabitItemProps) {
  const isCompleted = isHabitCompleted(habit, date);
  const [showCelebration, setShowCelebration] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // 1. Calculate Dynamic Colors
  const cardBackgroundColor = getHabitBackgroundColor(index, totalHabits);
  const textColor = getTextColorForBackground(cardBackgroundColor);

  const handleToggle = () => {
    const wasCompleted = isCompleted;
    if (!wasCompleted) {
      setShowCelebration(true);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
      ]).start();
    }
    onToggleDone(habit.id, wasCompleted);
  };

  const closeCelebration = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 200, useNativeDriver: true }),
    ]).start(() => setShowCelebration(false));
  };

  useEffect(() => {
    if (!showCelebration) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [showCelebration]);

  return (
    <>
      <View style={[styles.container, { backgroundColor: cardBackgroundColor }]}>
        <Pressable
          onPress={() => onEdit(habit)}
          style={styles.contentArea}
          android_ripple={{ color: textColor === "#FFFFFF" ? "#ffffff33" : "#00000033" }}
        >
          {/* Dot color matches text for high contrast, or keep habit.color if you prefer */}
          <View style={[styles.dot, { backgroundColor: habit.color }]} />
          
          <Text
            style={[
              styles.name, 
              { color: textColor }, 
              isCompleted && styles.nameCompleted
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {habit.name}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleToggle}
          style={styles.checkboxArea}
          hitSlop={10}
        >
          <View
            style={[
              styles.checkboxOuter,
              { borderColor: textColor }, // Border matches text
              isCompleted && { backgroundColor: textColor }, // Fill matches text when done
            ]}
          >
            {isCompleted && (
              // The "Checkmark" is actually the card background color, creating a cutout effect
              <View style={[styles.checkboxInner, { backgroundColor: cardBackgroundColor }]} />
            )}
          </View>
        </Pressable>
      </View>

      {/* Celebration Modal (Kept exactly as you had it) */}
      <Modal
        visible={showCelebration}
        transparent={true}
        animationType="none"
        onRequestClose={closeCelebration}
      >
        <Pressable style={styles.celebrationOverlay} onPress={closeCelebration}>
          <Animated.View
            style={[
              styles.celebrationContent,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
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
            <Text style={styles.celebrationTitle}>Congratulations!</Text>
            <Text style={styles.celebrationSubtitle}>Habit Complete</Text>

            <Pressable onPress={closeCelebration} style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </Pressable>
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
    borderRadius: 16, // Slightly rounder for the new look
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  contentArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    flexShrink: 1,
  },
  nameCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  checkboxArea: {
    marginLeft: 10,
    padding: 5,
  },
  checkboxOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  // Modal Styles
  celebrationOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  celebrationContent: {
    alignItems: "center",
    padding: 40,
    width: '80%',
  },
  confettiContainer: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    width: width, height: height,
  },
  celebrationTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#F1C453",
    textAlign: "center",
    marginBottom: 10,
  },
  celebrationSubtitle: {
    fontSize: 20,
    color: "#FFF",
    textAlign: "center",
  },
  continueButton: {
    marginTop: 40,
    backgroundColor: "#1DA27E",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    zIndex: 20,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});