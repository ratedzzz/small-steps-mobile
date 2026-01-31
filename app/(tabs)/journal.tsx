import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient"; 
import { APP_THEME } from "../../src/theme";
import PageFlower from "../../src/components/PageFlower"; // <--- IMPORT THIS


// Import your existing Journal screen logic
import JournalScreen from "../../src/screens/JournalScreen";

export default function JournalTab() {
  return (
    <LinearGradient 
      colors={APP_THEME.mainGradient} 
      style={{ flex: 1 }}
    >
      {/* Foreground Flower */}
      <PageFlower screen="journal" />

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.container}>
          <JournalScreen />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Let gradient show
  },
});