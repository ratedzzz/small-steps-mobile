// app/(tabs)/journal.tsx
import React from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import your existing Journal screen logic/UI
import JournalScreen from "../../src/screens/JournalScreen";


// Light/Dark theme tokens – keep in sync with calendar.tsx
const lightTheme = {
  bg: "#F8FAFC", // soft light background
  cardBg: "#FFFFFF", // white card
  text: "#0F172A", // dark navy text
  textSecondary: "#64748B",
  primary: "#0F766E", // teal-ish accent
} as const;

const darkTheme = {
  bg: "#020617", // very dark blue/black
  cardBg: "#0F172A", // deep slate/blue
  text: "#E5E7EB", // light gray text
  textSecondary: "#9CA3AF",
  primary: "#14B8A6", // teal accent
} as const;

export default function JournalTab() {
  const systemTheme = useColorScheme();
  const darkMode = systemTheme === "dark";
  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {/* Your existing JournalScreen handles its own content */}
        <JournalScreen />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
