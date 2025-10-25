// app/index.tsx

import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

// Screens
import HomeScreen from '../src/screens/HomeScreen';
import CalendarScreen from '../src/screens/CalendarScreen';
import JournalScreen from '../src/screens/JournalScreen';
import BadgesScreen from '../src/screens/BadgesScreen';
import SettingsScreen from '../src/screens/SettingsScreen';

// Bottom navigation bar + its types
import NavigationBar, { TabKey } from '../src/components/NavigationBar';

export default function IndexRoute() {
  const [currentTab, setCurrentTab] = useState<TabKey>('home');

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
    <View style={styles.container}>
      <View style={styles.content}>
        {ActiveScreen}
      </View>

      <NavigationBar
        current={currentTab}
        onChange={(nextTab: TabKey) => setCurrentTab(nextTab)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});
