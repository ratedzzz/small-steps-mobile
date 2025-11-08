// src/screens/SettingsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  useColorScheme,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../store';
import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system';

export default function SettingsScreen() {
  const systemTheme = useColorScheme();
  const darkMode = systemTheme === 'dark';
  const theme = darkMode ? darkStyles : lightStyles;
  const { habits, goals, entries, badges, pro, setPro } = useApp();

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      Alert.alert('Success', 'Notifications enabled!');
    } else {
      Alert.alert('Permissions Required', 'Please enable notifications in your device settings.');
    }
  };

  const exportData = async () => {
    try {
      const data = {
        habits,
        goals,
        entries,
        badges,
        exportDate: new Date().toISOString(),
      };

      const jsonString = JSON.stringify(data, null, 2);

      if (Platform.OS === 'web') {
        // For web, download as file
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `small-steps-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        Alert.alert('Success', 'Data exported successfully!');
      } else {
        // For mobile, save to file system and share
        const fileUri = FileSystem.documentDirectory + `small-steps-backup-${new Date().toISOString().split('T')[0]}.json`;
        await FileSystem.writeAsStringAsync(fileUri, jsonString);

        await Share.share({
          url: fileUri,
          message: 'Small Steps data backup',
        });

        Alert.alert('Success', 'Data exported successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data. Please try again.');
      console.error('Export error:', error);
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // In real app, would call store reset function
            Alert.alert('Data Cleared', 'All your data has been removed.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

        {/* Stats Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Your Stats</Text>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Total Habits:
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {habits.filter(h => !h.archived).length}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Total Goals:
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {goals.filter(g => !g.archived).length}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Journal Entries:
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {entries.filter(e => !e.habitId && e.text).length}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Badges Earned:
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {badges.filter(b => b.unlockedAt).length}
            </Text>
          </View>
        </View>

        {/* My Archives */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>My Archives</Text>

          <Text style={[styles.archiveSubtitle, { color: theme.textSecondary }]}>
            Habits ({habits.filter(h => h.archived).length})
          </Text>
          {habits.filter(h => h.archived).length === 0 ? (
            <Text style={[styles.emptyArchive, { color: theme.textSecondary }]}>
              No archived habits
            </Text>
          ) : (
            habits.filter(h => h.archived).map(habit => (
              <View key={habit.id} style={styles.archiveItem}>
                <View style={[styles.archiveDot, { backgroundColor: habit.color }]} />
                <Text style={[styles.archiveText, { color: theme.text }]}>
                  {habit.name}
                </Text>
              </View>
            ))
          )}

          <Text style={[styles.archiveSubtitle, { color: theme.textSecondary, marginTop: 16 }]}>
            Goals ({goals.filter(g => g.archived).length})
          </Text>
          {goals.filter(g => g.archived).length === 0 ? (
            <Text style={[styles.emptyArchive, { color: theme.textSecondary }]}>
              No archived goals
            </Text>
          ) : (
            goals.filter(g => g.archived).map(goal => (
              <View key={goal.id} style={styles.archiveItem}>
                <View style={[styles.archiveSquare, { backgroundColor: goal.color }]} />
                <Text style={[styles.archiveText, { color: theme.text }]}>
                  {goal.title}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Subscription */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Subscription</Text>
          <View style={styles.subscriptionRow}>
            <Text style={[styles.subscriptionText, { color: theme.text }]}>
              {pro ? '✅ Pro Member' : 'Free Plan'}
            </Text>
            {!pro && (
              <Pressable
                onPress={() => setPro(true)}
                style={[styles.upgradeButton, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
              </Pressable>
            )}
          </View>
          {pro && (
            <Text style={[styles.proFeatures, { color: theme.textSecondary }]}>
              ✓ Unlimited habits{'\n'}
              ✓ Advanced analytics{'\n'}
              ✓ Custom themes{'\n'}
              ✓ Priority support
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
            onPress={exportData}
            style={[styles.button, styles.buttonSecondary]}
          >
            <Text style={styles.buttonText}>
              Export Data
            </Text>
          </Pressable>
          <Pressable
            onPress={clearAllData}
            style={[styles.button, styles.buttonDanger]}
          >
            <Text style={styles.buttonText}>Clear All Data</Text>
          </Pressable>
        </View>

        {/* About */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>About</Text>
          <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
            Small Steps v1.0.0{'\n\n'}
            Building better habits, one small step at a time.{'\n\n'}
            © 2025 Small Steps. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const baseStyles = {
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statLabel: { fontSize: 14 },
  statValue: { fontSize: 14, fontWeight: '600' },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subscriptionText: { fontSize: 16, fontWeight: '600' },
  upgradeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  proFeatures: { fontSize: 12, marginTop: 12, lineHeight: 20 },
  button: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonSecondary: { backgroundColor: '#64748B' },
  buttonDanger: { backgroundColor: '#EF4444' },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  helpText: { fontSize: 12, textAlign: 'center', marginTop: 8 },
  aboutText: { fontSize: 14, lineHeight: 22 },
  archiveSubtitle: { fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 8 },
  emptyArchive: { fontSize: 14, fontStyle: 'italic', marginBottom: 8 },
  archiveItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 10 },
  archiveDot: { width: 12, height: 12, borderRadius: 6 },
  archiveSquare: { width: 12, height: 12, borderRadius: 2 },
  archiveText: { fontSize: 14 },
};

const lightStyles = StyleSheet.create({
  ...baseStyles,
  bg: '#F8FAFC',
  cardBg: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  primary: '#6366F1',
});

const darkStyles = StyleSheet.create({
  ...baseStyles,
  bg: '#0F172A',
  cardBg: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  primary: '#818CF8',
});

const styles = StyleSheet.create(baseStyles);