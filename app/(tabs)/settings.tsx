import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ensureLocalPermission } from "../../src/notifications";
import { useApp } from "../../src/store";
// UPDATED IMPORT:
import { APP_THEME } from "../../src/theme";

export default function SettingsScreen() {
  const { habits, goals, entries, badges, pro, setPro } = useApp();

  const requestNotificationPermissions = async () => {
    const granted = await ensureLocalPermission();
    if (granted) Alert.alert("Success", "Notifications enabled!");
    else Alert.alert("Permissions Required", "Please enable notifications in settings.");
  };

  const clearAllData = () => {
    Alert.alert("Clear All Data", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => Alert.alert("Data Cleared", "Reset Logic here") },
    ]);
  };

  return (
    // UPDATED PROP: colors={APP_THEME.mainGradient}
    <LinearGradient colors={APP_THEME.mainGradient} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Settings</Text>

          {/* Stats Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Stats</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Habits:</Text>
              <Text style={styles.statValue}>{habits.length}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Goals:</Text>
              <Text style={styles.statValue}>{goals.length}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Badges Earned:</Text>
              <Text style={styles.statValue}>{badges.filter(b => b.unlockedAt).length}</Text>
            </View>
          </View>

          {/* Subscription */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Subscription</Text>
            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionText}>{pro ? "✅ Pro Member" : "Free Plan"}</Text>
              {!pro && (
                <Pressable onPress={() => setPro(true)} style={styles.upgradeButton}>
                  <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Notifications */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notifications</Text>
            <Pressable onPress={requestNotificationPermissions} style={styles.button}>
              <Text style={styles.buttonText}>Enable Notifications</Text>
            </Pressable>
          </View>

          {/* Data Management */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Data Management</Text>
            <Pressable onPress={clearAllData} style={[styles.button, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.buttonText}>Clear All Data</Text>
            </Pressable>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 20, color: '#001244' },

  // Glass Card Style
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.6)", // Semi-transparent white
    shadowColor: "#001244",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: '#001244' },
  
  statRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  statLabel: { fontSize: 14, color: '#005086' },
  statValue: { fontSize: 14, fontWeight: "600", color: '#001244' },

  subscriptionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  subscriptionText: { fontSize: 16, fontWeight: "600", color: '#001244' },
  upgradeButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#001244' },
  upgradeButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },

  button: { padding: 14, borderRadius: 12, alignItems: "center", marginBottom: 8, backgroundColor: '#001244' },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },
});