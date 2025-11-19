// app/(tabs)/badges.tsx
import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import your existing Badges screen logic/UI
import BadgesScreen from '../../src/screens/BadgesScreen';

// Light/Dark theme tokens – keep in sync with calendar.tsx
const lightTheme = {
  bg: '#F8FAFC',
  cardBg: '#FFFFFF',
  textLight: '#0F172A',
  textSecondary: '#64748B',
  primary: '#0F766E',
} as const;

const darkTheme = {
  bg: '#020617',
  cardBg: '#0F172A',
  textLight: '#E5E7EB',
  textSecondary: '#9CA3AF',
  primary: '#14B8A6',
} as const;

export default function BadgesTab() {
  const systemTheme = useColorScheme();
  const darkMode = systemTheme === 'dark';
  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {/* Your existing BadgesScreen handles its own content */}
        <BadgesScreen />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
