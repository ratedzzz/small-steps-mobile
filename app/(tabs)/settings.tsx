import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ensureLocalPermission } from "../../src/notifications";
import { useApp } from "../../src/store";

const PALETTE = {
  tealBg: "#15292E",
  cardBg: "#074047",
  textLight: "#EAF7F6",
  textSecondary: "#9FB8B6",
  primary: "#1DA27E",
  gold: "#E0A800",
  danger: "#EF4444",
};

export default function SettingsScreen() {
  const systemTheme = useColorScheme();
  const theme = {
    bg: PALETTE.tealBg,
    cardBg: PALETTE.cardBg,
    text: PALETTE.textLight,
    textSecondary: PALETTE.textSecondary,
    primary: PALETTE.primary,
    gold: PALETTE.gold,
    danger: PALETTE.danger,
  };

  const { habits, goals, entries, badges, pro, setPro } = useApp();

  const requestNotificationPermissions = async () => {
    const granted = await ensureLocalPermission();
    if (granted) {
      Alert.alert("Success", "Notifications enabled!");
    } else {
      Alert.alert(
        "Permissions Required",
        "Please enable notifications in your device settings."
      );
    }
  };

  const clearAllData = () => {
    Alert.alert("Clear All Data", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          // TODO: hook this up to your real store reset if desired.
          Alert.alert("Data Cleared", "All your data has been removed.");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

        {/* Stats Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Your Stats
          </Text>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Total Habits:
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {habits.length}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Total Goals:
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {goals.length}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Journal Entries:
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {entries.filter((e) => !e.habitId && e.text).length}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Badges Earned:
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {badges.filter((b) => b.unlockedAt).length}
            </Text>
          </View>
        </View>

        {/* Subscription */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Subscription
          </Text>
          <View style={styles.subscriptionRow}>
            <Text style={[styles.subscriptionText, { color: theme.text }]}>
              {pro ? "✅ Pro Member" : "Free Plan"}
            </Text>
            {!pro && (
              <Pressable
                onPress={() => setPro(true)}
                style={[
                  styles.upgradeButton,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
              </Pressable>
            )}
          </View>
          {pro && (
            <Text style={[styles.proFeatures, { color: theme.textSecondary }]}>
              ✓ Unlimited habits{"\n"}✓ Advanced analytics{"\n"}✓ Custom themes
              {"\n"}✓ Priority support
            </Text>
          )}
        </View>

        {/* Notifications */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Notifications
          </Text>
          <Pressable
            onPress={requestNotificationPermissions}
            style={[styles.button, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.buttonText}>Enable Notifications</Text>
          </Pressable>
          <Text style={[styles.helpText, { color: theme.textSecondary }]}>
            Get daily reminders for your habits
          </Text>
        </View>

        {/* Data Management */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Data Management
          </Text>

          <Pressable
            onPress={() => Alert.alert("Export", "Export feature coming soon!")}
            style={[styles.button, { backgroundColor: "#1F2937" }]}
          >
            <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
              Export Data
            </Text>
          </Pressable>

          <Pressable
            onPress={clearAllData}
            style={[styles.button, { backgroundColor: theme.danger }]}
          >
            <Text style={styles.buttonText}>Clear All Data</Text>
          </Pressable>
        </View>

        {/* About */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>About</Text>
          <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
            Small Steps v1.0.0{"\n\n"}
            Building better habits, one small step at a time.{"\n\n"}© 2025
            Small Steps. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 20 },

  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  statLabel: { fontSize: 14 },
  statValue: { fontSize: 14, fontWeight: "600" },

  subscriptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subscriptionText: { fontSize: 16, fontWeight: "600" },
  upgradeButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  upgradeButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
  proFeatures: { fontSize: 12, marginTop: 12, lineHeight: 20 },

  button: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },
  helpText: { fontSize: 12, textAlign: "center", marginTop: 8 },
  aboutText: { fontSize: 14, lineHeight: 22 },
});
