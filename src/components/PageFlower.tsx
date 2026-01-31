// src/components/PageFlower.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ImageSourcePropType, View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// 1. Map screens to your specific files (assumes you renamed them to lowercase)
const FLOWER_IMAGES: Record<string, ImageSourcePropType> = {
  home: require('../../assets/images/flower_home.png'),
  calendar: require('../../assets/images/flower_calendar.png'),
  journal: require('../../assets/images/flower_journal.png'),
  badges: require('../../assets/images/flower_badges.png'),
  settings: require('../../assets/images/flower_settings.png'),
};

type ScreenType = 'home' | 'calendar' | 'journal' | 'badges' | 'settings';

interface PageFlowerProps {
  screen: ScreenType;
}

export default function PageFlower({ screen }: PageFlowerProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Determine if this is a foreground or background flower
  const isForeground = screen === 'calendar' || screen === 'journal';
  
  // UPDATED: Opacity 0.4 for foreground (as requested), 0.7 for background
  const targetOpacity = isForeground ? 0.4 : 0.7;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: targetOpacity,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, targetOpacity]);

  const imageSource = FLOWER_IMAGES[screen];

  const positionStyle = isForeground 
    ? styles.foregroundPos 
    : styles.backgroundPos;

  if (!imageSource) return null;

  return (
    <View 
      style={[styles.container, positionStyle]} 
      pointerEvents="none" 
    >
      <Animated.Image
        source={imageSource}
        style={[
          styles.flowerImage,
          { opacity: fadeAnim }
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundPos: {
    // UPDATED: Changed from -1 to 0. 
    // This brings it out from behind the app window.
    // Because it is the first child in your screen files, it will still be behind the text.
    zIndex: 0, 
  },
  foregroundPos: {
    zIndex: 20, // Sits on top
  },
  flowerImage: {
    width: width * 0.85, 
    height: width * 0.85,
  },
});