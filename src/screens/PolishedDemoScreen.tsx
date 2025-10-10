// PolishedDemoScreen.tsx
import React from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

type Item = { id: string; name: string; color: string };

const sampleHabits: Item[] = [
  { id: "h1", name: "Eat less sweets", color: "#60A5FA" },
  { id: "h2", name: "Hgggsgsgs", color: "#93C5FD" },
  { id: "h3", name: "Egydhddh", color: "#38BDF8" },
];

const sampleGoals: Item[] = [
  { id: "g1", name: "Lose 20 lbs", color: "#F87171" },
  { id: "g2", name: "7rururdpjoudyodd9y", color: "#FCA5A5" },
];

export default function PolishedDemoScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* HABITS */}
        <View style={styles.card}>
          <Text style={styles.h1}>My Habits</Text>
          <View style={styles.list}>
            {sampleHabits.map((h) => (
              <View key={h.id} style={styles.itemRow}>
                <View style={[styles.dot, { backgroundColor: h.color }]} />
                <Text style={styles.itemText}>{h.name}</Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => {}}
            android_ripple={{ color: "#DBEAFE" }}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.primaryBtnText}>Add Habit</Text>
          </Pressable>
        </View>

        {/* GOALS */}
        <View style={styles.card}>
          <Text style={styles.h1}>My Goals</Text>
          <View style={styles.list}>
            {sampleGoals.map((g) => (
              <View key={g.id} style={styles.itemRow}>
                <View style={[styles.dot, { backgroundColor: g.color }]} />
                <Text style={styles.itemText}>{g.name}</Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => {}}
            android_ripple={{ color: "#DBEAFE" }}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.primaryBtnText}>Add Goal</Text>
          </Pressable>
        </View>

        {/* CALENDAR CONTAINER (style only; drop your existing calendar component inside) */}
        <View style={styles.card}>
          <Text style={styles.h1}>Calendar</Text>
          <View style={styles.calendarPlaceholder}>
            <Text style={styles.muted}>Place your calendar component here</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Base layout and background
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC", // slate-50
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    gap: 16,
  },

  // Cards give structure and breathing room
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0", // slate-200
    // Subtle shadow (Android + iOS)
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // Typography
  h1: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: "#0F172A", // slate-900
    marginBottom: 8,
  },
  itemText: {
    fontSize: 16,
    color: "#0F172A",
    flexShrink: 1,
  },
  muted: {
    color: "#64748B", // slate-500
    fontSize: 14,
  },

  // Lists
  list: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  // Buttons
  primaryBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#2563EB", // primary blue
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  // Calendar shell (replace with your actual calendar component)
  calendarPlaceholder: {
    height: 320,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
  },
});
