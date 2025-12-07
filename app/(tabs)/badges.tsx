// app/(tabs)/badges.tsx
import React, { useMemo } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  useColorScheme, 
  Dimensions 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../src/store";
import { evalBadges, BadgeWithIcon } from "../../src/badges"; // Import the logic

// --- THEME ---
const PALETTE = {
  deepTeal: '#15292E',
  teal: '#074047',
  mint: '#1DA27E',
  gold: '#E0A800',
  goldSoft: '#F1C453',
  lockedBg: '#E2E8F0',
  lockedText: '#94A3B8',
  grey: '#94A3B8',
} as const;

const LIGHT = {
  bg: '#FFF9EC',
  text: '#15292E',
  cardBg: '#FFFFFF',
};

const DARK = {
  bg: PALETTE.deepTeal,
  text: '#EAF7F6',
  cardBg: PALETTE.teal,
};

// --- COMPONENT: SINGLE BADGE ---
const { width } = Dimensions.get('window');
const BADGE_SIZE = (width / 3) - 24; 

function BadgeItem({ 
  badge, 
  theme,
  darkMode
}: { 
  badge: BadgeWithIcon; 
  theme: typeof LIGHT;
  darkMode: boolean;
}) {
  const isUnlocked = !!badge.unlockedAt;

  return (
    <View style={styles.badgeWrapper}>
      {/* The Medal/Circle */}
      <View style={[
        styles.medalCircle,
        { 
          backgroundColor: isUnlocked 
            ? PALETTE.goldSoft 
            : (darkMode ? '#334155' : PALETTE.lockedBg),
          borderColor: isUnlocked ? PALETTE.gold : 'transparent',
          borderWidth: isUnlocked ? 3 : 0,
          shadowColor: isUnlocked ? PALETTE.gold : "#000",
          shadowOpacity: isUnlocked ? 0.4 : 0,
          shadowRadius: 8,
          elevation: isUnlocked ? 5 : 0,
        }
      ]}>
        <Ionicons 
          // We use the icon string from our new badges.ts
          name={(isUnlocked ? badge.icon : "lock-closed") as any} 
          size={32} 
          color={isUnlocked ? PALETTE.deepTeal : PALETTE.lockedText} 
        />
      </View>

      {/* Text Info */}
      <View style={styles.textContainer}>
        <Text style={[
          styles.badgeTitle, 
          { color: isUnlocked ? theme.text : PALETTE.grey }
        ]}>
          {badge.name}
        </Text>
        <Text style={[
          styles.badgeDesc,
          { color: isUnlocked ? theme.text : PALETTE.grey, opacity: 0.7 }
        ]}>
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

// --- MAIN SCREEN ---
export default function BadgesTab() {
  const darkMode = useColorScheme() === 'dark';
  const theme = darkMode ? DARK : LIGHT;
  
  // Get real data from your store
  const { habits = [], goals = [], badges = [] } = useApp();

  // CALCULATE BADGES LIVE
  // We pass the raw data into evalBadges to get the latest status including icons
  const processedBadges = useMemo(() => {
    // Note: If you have a 'journalEntries' array in your store, pass it here too!
    // For now I passed [] for entries as I didn't see it in your previous snippet.
    return evalBadges(habits, goals, [], badges);
  }, [habits, goals, badges]);

  const unlockedCount = processedBadges.filter(b => b.unlockedAt).length;
  const totalCount = processedBadges.length;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Hall of Fame</Text>
          <Text style={[styles.headerSubtitle, { color: theme.text }]}>
            You have unlocked {unlockedCount} of {totalCount} badges
          </Text>
          
          {/* Progress Bar */}
          <View style={[styles.progressBarBg, { backgroundColor: darkMode ? '#334155' : '#E2E8F0' }]}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progressPercent}%`, backgroundColor: PALETTE.mint }
              ]} 
            />
          </View>
        </View>

        {/* Badges Grid */}
        <View style={styles.grid}>
          {processedBadges.map((badge) => (
            <BadgeItem 
              key={badge.id} 
              badge={badge} 
              theme={theme}
              darkMode={darkMode}
            />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 20,
  },
  progressBarBg: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
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
  textContainer: {
    alignItems: 'center',
  },
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
  },
  dateText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: PALETTE.mint,
  }
});