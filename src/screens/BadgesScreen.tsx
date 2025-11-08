// src/screens/BadgesScreen.tsx
import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ViewStyle,
  TextStyle, // added
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../store';

// Static badge definitions without unlock logic
const ALL_BADGE_DEFINITIONS = [
  {
    id: 'first-habit',
    icon: '🌱',
    name: 'First Step',
    description: 'Complete your first habit',
  },
  {
    id: 'three-days',
    icon: '🔥',
    name: '3 Day Streak',
    description: 'Complete habits 3 days in a row',
  },
  {
    id: 'week-warrior',
    icon: '⭐',
    name: 'Week Warrior',
    description: 'Complete habits 7 days in a row',
  },
  {
    id: 'month-master',
    icon: '🏆',
    name: 'Month Master',
    description: 'Complete habits 30 days in a row',
  },
  {
    id: 'dedication',
    icon: '👑',
    name: 'Dedication',
    description: 'Complete habits 100 days in a row',
  },
  {
    id: 'century',
    icon: '💯',
    name: 'Century Club',
    description: 'Complete 100 habits total',
  },
  {
    id: 'consistency',
    icon: '💪',
    name: 'Consistency King',
    description: 'Complete 500 habits total',
  },
];

export default function BadgesScreen() {
  const systemTheme = useColorScheme();
  const darkMode = systemTheme === 'dark';
  // theme is now a plain object of color strings (not a StyleSheet)
  const theme = darkMode ? darkTheme : lightTheme;
  
  const { badges, entries, habits } = useApp();
  
  // Calculate stats for display
  const completedHabits = entries.filter(e => e.completed && e.habitId).length;
  const uniqueDates = new Set(entries.filter(e => e.completed).map(e => e.date)).size;

  // Use badges from store as single source of truth
  const unlockedBadgeIds = new Set(badges.map(b => b.id));

  const unlockedBadges = ALL_BADGE_DEFINITIONS.filter(b => unlockedBadgeIds.has(b.id));
  const lockedBadges = ALL_BADGE_DEFINITIONS.filter(b => !unlockedBadgeIds.has(b.id));

  const showBadgeDetails = (badge: typeof ALL_BADGE_DEFINITIONS[0]) => {
    const isUnlocked = unlockedBadgeIds.has(badge.id);
    const status = isUnlocked ? '✓ Unlocked' : '🔒 Locked';
    Alert.alert(
      `${badge.icon} ${badge.name}`,
      `${status}\n\n${badge.description}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }] as StyleProp<ViewStyle>}>
      <ScrollView contentContainerStyle={styles.scrollContent as StyleProp<ViewStyle>}>
        <Text style={[styles.title, { color: theme.text }]}>Achievements</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {unlockedBadges.length} of {ALL_BADGE_DEFINITIONS.length} badges earned
        </Text>

        {/* Stats Card */}
        <View style={[styles.statsCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>
              {completedHabits}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Total Completions
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>
              {uniqueDates}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Active Days
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>
              {habits.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Total Habits
            </Text>
          </View>
        </View>

        {/* Unlocked Badges */}
        {unlockedBadges.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Earned Badges
            </Text>
            <View style={styles.badgeGrid}>
              {unlockedBadges.map(badge => (
                <Pressable
                  key={badge.id}
                  onPress={() => showBadgeDetails(badge)}
                  style={[styles.badge, { backgroundColor: theme.primary }]}
                >
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeDesc}>{badge.description}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Locked Badges
            </Text>
            <View style={styles.badgeGrid}>
              {lockedBadges.map(badge => (
                <Pressable
                  key={badge.id}
                  onPress={() => showBadgeDetails(badge)}
                  style={[styles.badge, styles.badgeLocked, {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border,
                  }]}
                >
                  <Text style={[styles.badgeIcon, styles.badgeIconLocked]}>
                    {badge.icon}
                  </Text>
                  <Text style={[styles.badgeName, { color: theme.textSecondary }]}>
                    {badge.name}
                  </Text>
                  <Text style={[styles.badgeDesc, { color: theme.textSecondary }]}>
                    {badge.description}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const baseStyles = {
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 32, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  badge: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  badgeLocked: {
    opacity: 0.5,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  badgeIcon: { fontSize: 32, marginBottom: 8 },
  badgeIconLocked: { opacity: 0.3 },
  badgeName: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#FFFFFF', 
    textAlign: 'center', 
    marginBottom: 4 
  },
  badgeDesc: { 
    fontSize: 9, 
    color: '#FFFFFF', 
    textAlign: 'center', 
    opacity: 0.8 
  },
};

// Theme color objects (plain JS) — only strings, so using them in inline styles is type-safe
const lightTheme = {
  bg: '#F8FAFC',
  cardBg: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  primary: '#6366F1',
} as const;

const darkTheme = {
  bg: '#0F172A',
  cardBg: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#334155',
  primary: '#818CF8',
} as const;

const styles = StyleSheet.create<{
  container: ViewStyle;
  scrollContent: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  statsCard: ViewStyle;
  statItem: ViewStyle;
  statNumber: TextStyle;
  statLabel: TextStyle;
  sectionTitle: TextStyle;
  badgeGrid: ViewStyle;
  badge: ViewStyle;
  badgeLocked: ViewStyle;
  badgeIcon: TextStyle;
  badgeIconLocked: TextStyle;
  badgeName: TextStyle;
  badgeDesc: TextStyle;
}>(baseStyles);