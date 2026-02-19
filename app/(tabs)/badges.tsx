import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp, BADGE_DEFINITIONS } from '../../src/store';
import { APP_THEME } from '../../src/theme'; 
import { Ionicons } from '@expo/vector-icons';
import PageFlower from '../../src/components/PageFlower'; 

export default function BadgesScreen() {
  const { badges, checkBadges } = useApp();

  // Force a check when the screen loads to ensure badges are up to date
  useEffect(() => {
    checkBadges();
  }, []);

  const unlockedIds = badges.map(b => b.id);

  const renderBadge = ({ item }: { item: any }) => {
    const isUnlocked = unlockedIds.includes(item.id);

    return (
      <View style={[styles.badgeCard, !isUnlocked && styles.lockedCard]}>
        <View style={[styles.iconContainer, isUnlocked ? styles.unlockedIcon : styles.lockedIcon]}>
          <Ionicons 
            name={item.icon || "trophy"} 
            size={32} 
            color={isUnlocked ? "#FFF" : "#A0A0A0"} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.badgeName, !isUnlocked && styles.lockedText]}>
            {item.name}
          </Text>
          <Text style={styles.badgeDesc}>
            {isUnlocked ? item.description : "Keep playing to unlock..."}
          </Text>
          {isUnlocked && (
            <View style={styles.tag}>
                <Text style={styles.tagText}>EARNED</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. The Mandala Flower (Background) */}
      <PageFlower screen="badges" />

      {/* 2. Gradient Overlay for Header */}
      <LinearGradient
        colors={[APP_THEME.mainGradient[0], 'transparent']}
        style={styles.headerGradient}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.subtitle}>{badges.length} / {BADGE_DEFINITIONS.length} Unlocked</Text>
      </View>

      <FlatList
        data={BADGE_DEFINITIONS}
        renderItem={renderBadge}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME.solidBackground, // Navy Blue
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 150,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FDF6E3', // Cream/White
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8AB4F8', // Light Blue
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  badgeCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Glassmorphism effect
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  lockedCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Darker when locked
    borderColor: 'transparent',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  unlockedIcon: {
    backgroundColor: '#F1C453', // Gold
    shadowColor: "#F1C453",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  lockedIcon: {
    backgroundColor: '#3A4050', // Gray-Blue
  },
  textContainer: {
    flex: 1,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  lockedText: {
    color: '#A0A0A0',
  },
  badgeDesc: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
  },
  tag: {
    marginTop: 8,
    backgroundColor: '#1DA27E', // Green
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  }
});