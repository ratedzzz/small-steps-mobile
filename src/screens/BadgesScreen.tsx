// src/screens/BadgesScreen.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../store';
import { Badge } from '../types';

export default function BadgesScreen() {
  const { badges } = useApp();

  const unlockedBadges: Badge[] = badges.filter(b => !!b.unlockedAt);
  const lockedBadges:   Badge[] = badges.filter(b => !b.unlockedAt);

  // simple palette (NOT part of StyleSheet.create)
  const palette = {
    bg: '#0a0a0a',
    cardBg: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#c7c7c7',
    border: '#333333',
    primary: '#6ee7b7',
  } as const;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Badges</Text>

        {/* Stats card */}
        <View style={[styles.statsCard, { backgroundColor: palette.cardBg }]}>
          <View style={[styles.statBox, { borderColor: palette.border }]}>
            <Text style={[styles.statNumber, { color: palette.primary }]}>
              {unlockedBadges.length}
            </Text>
            <Text style={[styles.statLabel, { color: palette.textSecondary }]}>
              Earned
            </Text>
          </View>
          <View style={[styles.statBox, { borderColor: palette.border }]}>
            <Text style={[styles.statNumber, { color: palette.text }]}>
              {lockedBadges.length}
            </Text>
            <Text style={[styles.statLabel, { color: palette.textSecondary }]}>
              Locked
            </Text>
          </View>
        </View>

        {/* Unlocked */}
        {unlockedBadges.length > 0 && (
          <>
            <Text style={[styles.subtitle, { color: palette.text }]}>Earned Badges</Text>
            {unlockedBadges.map((badge: Badge) => (
              <View
                key={badge.id}
                style={[
                  styles.badgeItem,
                  {
                    backgroundColor: palette.cardBg,
                    borderColor: palette.border,
                  },
                ]}
              >
                <Text style={[styles.badgeTitle, { color: palette.text }]}>
                  {badge.title ?? badge.name}
                </Text>
                <Text style={[styles.badgeDesc, { color: palette.textSecondary }]}>
                  {badge.description}
                </Text>
                {badge.unlockedAt && (
                  <Text style={[styles.badgeMeta, { color: palette.textSecondary }]}>
                    Unlocked: {new Date(badge.unlockedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* Locked */}
        {lockedBadges.length > 0 && (
          <>
            <Text style={[styles.subtitle, { color: palette.text }]}>Locked Badges</Text>
            {lockedBadges.map((badge: Badge) => (
              <View
                key={badge.id}
                style={[
                  styles.badgeItem,
                  {
                    backgroundColor: palette.cardBg,
                    borderColor: palette.border,
                  },
                ]}
              >
                <Text style={[styles.badgeTitle, { color: palette.text }]}>
                  {badge.title ?? badge.name}
                </Text>
                <Text style={[styles.badgeDesc, { color: palette.textSecondary }]}>
                  {badge.description}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as const,
  scrollContent: { padding: 16, paddingBottom: 32 } as const,

  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 } as const,
  subtitle: { fontSize: 18, marginTop: 16, marginBottom: 8 } as const,

  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  } as const,

  statBox: {
    flex: 1,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  } as const,

  statNumber: { fontSize: 22, fontWeight: '700' } as const,
  statLabel: { fontSize: 12, marginTop: 2 } as const,

  badgeItem: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  } as const,

  badgeTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 } as const,
  badgeDesc: { fontSize: 14 } as const,
  badgeMeta: { fontSize: 12, marginTop: 4 } as const,
});