import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApp, BADGE_DEFINITIONS } from '../../src/store'; 
import { Badge } from '../../src/types';  
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Optional for nicer look

export default function BadgesScreen() {
  // Get the *earned* badges from the store (which have an unlockedAt date)
  const { badges: earnedBadges } = useApp();

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Achievements</Text>
        <Text style={styles.subtitle}>Unlock badges by staying consistent!</Text>
        <Text style={styles.counter}>
          {earnedBadges.length} / {BADGE_DEFINITIONS.length} Unlocked
        </Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          
          {BADGE_DEFINITIONS.map((def) => {
            // Check if user has earned this badge
            const earned = earnedBadges.find(b => b.id === def.id);
            const isUnlocked = !!earned;

            return (
              <View 
                key={def.id} 
                style={[
                  styles.card, 
                  isUnlocked ? styles.cardUnlocked : styles.cardLocked
                ]}
              >
                <View style={[
                  styles.iconContainer,
                  isUnlocked ? styles.iconUnlocked : styles.iconLocked
                ]}>
                  <Ionicons 
                    name={def.icon as any || "ribbon"} 
                    size={32} 
                    color={isUnlocked ? '#4F46E5' : '#9CA3AF'} 
                  />
                </View>
                
                <Text style={[
                  styles.badgeName,
                  isUnlocked ? styles.textUnlocked : styles.textLocked
                ]}>
                  {def.name}
                </Text>
                
                <Text style={styles.badgeDesc}>
                  {def.description}
                </Text>

                {isUnlocked && (
                  <View style={styles.earnedBadge}>
                     <Text style={styles.earnedText}>EARNED</Text>
                  </View>
                )}
              </View>
            );
          })}

        </View>

        {/* Bottom Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  counter: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  scroll: {
    flex: 1,
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cardUnlocked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E7FF',
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconUnlocked: {
    backgroundColor: '#EEF2FF',
  },
  iconLocked: {
    backgroundColor: '#E2E8F0',
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  textUnlocked: {
    color: '#1E293B',
  },
  textLocked: {
    color: '#94A3B8',
  },
  badgeDesc: {
    fontSize: 11,
    textAlign: 'center',
    color: '#64748B',
    lineHeight: 14,
  },
  earnedBadge: {
    marginTop: 8,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  earnedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#166534',
  }
});