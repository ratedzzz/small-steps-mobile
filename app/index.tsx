// app/index.tsx
import React, { useMemo, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

// Screens
import BadgesScreen from '../src/screens/BadgesScreen';
import CalendarScreen from '../src/screens/CalendarScreen';
import JournalScreen from '../src/screens/JournalScreen';
import SettingsScreen from '../src/screens/SettingsScreen';
import HomeScreen from './HomeScreen';

// Bottom navigation bar + its types
import NavigationBar, { TabKey } from '../src/components/NavigationBar';

export default function Index() {
  const [currentTab, setCurrentTab] = useState<TabKey>('home');
  const scheme = useColorScheme();
  const bgColor = scheme === 'dark' ? '#1e293b' : '#fff';

  const ActiveScreen = useMemo(() => {
    switch (currentTab) {
      case 'home':
        return <HomeScreen />;
      case 'calendar':
        return <CalendarScreen />;
      case 'journal':
        return <JournalScreen />;
      case 'badges':
        return <BadgesScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  }, [currentTab]);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.content}>{ActiveScreen}</View>
      <NavigationBar current={currentTab} onChange={(next: TabKey) => setCurrentTab(next)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
