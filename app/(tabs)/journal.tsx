import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// UPDATED IMPORT:
import { APP_THEME } from "../../src/theme";

// Import your existing Journal screen logic/UI
import JournalScreen from "../../src/screens/JournalScreen";

export default function JournalTab() {
  // UPDATED: Use constant
  const NAVY_BG = APP_THEME.solidBackground; 

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: NAVY_BG }]}>
      <View style={[styles.container, { backgroundColor: NAVY_BG }]}>
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