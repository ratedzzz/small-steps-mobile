import React, { useMemo } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Dimensions 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../src/store";
import { evalBadges, BadgeWithIcon } from "../../src/badges";
import { APP_THEME } from "../../src/theme";
import PageFlower from "../../src/components/PageFlower"; // IMPORTED

const { width } = Dimensions.get('window');
const BADGE_SIZE = (width / 3) - 24; 

function BadgeItem({ badge }: { badge: BadgeWithIcon }) {
  const isUnlocked = !!badge.unlockedAt;

  return (
    <View style={styles.badgeWrapper}>
      <View style={[
        styles.medalCircle,
        { 
          backgroundColor: isUnlocked ? '#F1C453' : 'rgba(0,0,0,0.3)',
          borderColor: isUnlocked ? '#E0A800' : 'rgba(255,255,255,0.1)',
          borderWidth: isUnlocked ? 3 : 1,
        }
      ]}>
        <Ionicons 
          name={(isUnlocked ? badge.icon : "lock-closed") as any} 
          size={32} 
          color={isUnlocked ? '#15292E' : 'rgba(255,255,255,0.4)'} 
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.badgeTitle, { color: isUnlocked ? '#001244' : 'rgba(0,18,68,0.5)' }]}>
          {badge.name}
        </Text>
        <Text style={[styles.badgeDesc, { color: '#005086' }]}>
          {badge.description}
        </Text>
        {isUnlocked && (
          <Text style={styles.dateText}>
             {new Date(badge.unlockedAt!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function BadgesTab() {
  const { habits = [], goals = [], entries = [], badges = [] } = useApp();

  const processedBadges = useMemo(() => {
    return evalBadges(habits, goals, entries, badges); 
  }, [habits, goals, entries, badges]);

  const unlockedCount = processedBadges.filter(b => b.unlockedAt).length;
  const totalCount = processedBadges.length;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <LinearGradient colors={APP_THEME.mainGradient} style={{ flex: 1 }}>
      {/* ADDED FLOWER HERE */}
      <PageFlower screen="badges" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Hall of Fame</Text>
            <Text style={styles.headerSubtitle}>
              You have unlocked {unlockedCount} of {totalCount} badges
            </Text>
            
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${progressPercent}%`, backgroundColor: '#001244' } 
                ]} 
              />
            </View>
          </View>

          <View style={styles.grid}>
            {processedBadges.map((badge) => (
              <BadgeItem key={badge.id} badge={badge} />
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { padding: 24, alignItems: 'center' },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    color: '#001244',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#005086',
    marginBottom: 20,
    fontWeight: '600',
  },
  progressBarBg: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 5 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    paddingHorizontal: 10,
  },
  badgeWrapper: {
    width: BADGE_SIZE,
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 4,
  },
  medalCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  textContainer: { alignItems: 'center' },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 2,
    opacity: 0.8,
  },
  dateText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#001244',
    marginTop: 2,
  }
});