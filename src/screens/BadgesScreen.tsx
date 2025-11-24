// src/screens/BadgesScreen.tsx

import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useApp } from "../store";
import { Badge } from "../types";

const PALETTE = {
  tealBg: "#15292E",
  cardBg: "#074047",
  textLight: "#EAF7F6",
  accent: "#1DA27E",
  gold: "#E0A800",
};

export default function BadgesScreen() {
  const { badges } = useApp();
  const unlockedBadges: Badge[] = badges.filter((b) => !!b.unlockedAt);
  const lockedBadges: Badge[] = badges.filter((b) => !b.unlockedAt);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: PALETTE.tealBg }}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={[styles.card, { backgroundColor: PALETTE.cardBg }]}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{unlockedBadges.length}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{lockedBadges.length}</Text>
            <Text style={styles.statLabel}>Locked</Text>
          </View>
        </View>
      </View>

      {!!unlockedBadges.length && (
        <View style={[styles.card, { backgroundColor: PALETTE.cardBg }]}>
          <Text style={styles.listTitle}>Earned Badges</Text>
          {unlockedBadges.map((badge) => (
            <View key={badge.id} style={styles.badgeBox}>
              <Text style={styles.badgeName}>{badge.name}</Text>
              <Text style={styles.badgeDesc}>{badge.description}</Text>
              <Text style={styles.badgeUnlocked}>
                Unlocked: {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString() : "?"}
              </Text>
            </View>
          ))}
        </View>
      )}
      {!!lockedBadges.length && (
        <View style={[styles.card, { backgroundColor: PALETTE.cardBg }]}>
          <Text style={styles.listTitle}>Locked Badges</Text>
          {lockedBadges.map((badge) => (
            <View key={badge.id} style={styles.badgeBox}>
              <Text style={styles.badgeName}>{badge.name}</Text>
              <Text style={styles.badgeDesc}>{badge.description}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 100 },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: PALETTE.textLight,
    marginBottom: 8,
  },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  statBox: { alignItems: "center", flex: 1 },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: PALETTE.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 15,
    color: PALETTE.textLight,
  },
  listTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: PALETTE.gold,
    marginBottom: 10,
  },
  badgeBox: {
    marginBottom: 14,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.07)",
  },
  badgeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: PALETTE.textLight,
  },
  badgeDesc: {
    fontSize: 14,
    color: PALETTE.textLight,
    marginBottom: 2,
  },
  badgeUnlocked: {
    fontSize: 13,
    color: PALETTE.textLight,
  },
});
