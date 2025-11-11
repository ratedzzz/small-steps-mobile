// app/app.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import NavigationBar from '../src/components/NavigationBar';
import BadgesScreen from '../src/screens/BadgesScreen';
import CalendarScreen from '../src/screens/CalendarScreen';
import HomeScreen from '../src/screens/HomeScreen';
import JournalScreen from '../src/screens/JournalScreen';
import SettingsScreen from '../src/screens/SettingsScreen';
import { useApp } from '../src/store';

import {
  setupNotificationHandler,
  getPushTokenSafely,
  scheduleDailyLocalNotification,
  cancelAll,
} from '../src/notifications';

type Screen = 'home' | 'calendar' | 'journal' | 'badges' | 'settings';
const isScreen = (s: string): s is Screen =>
  s === 'home' || s === 'calendar' || s === 'journal' || s === 'badges' || s === 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const { habits } = useApp();

  useEffect(() => {
    // Set handler and (if supported) try to fetch a push token
    (async () => {
      await setupNotificationHandler();
      await getPushTokenSafely(); // no-op in Expo Go Android
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await cancelAll(); // avoid stacking duplicates
      for (const habit of habits) {
        if (!habit.reminderTime) continue;
        const [hour, minute] = habit.reminderTime.split(':').map((n) => Number(n) || 0);
        await scheduleDailyLocalNotification(hour, minute, {
          title: 'Small Steps Reminder 🌟',
          body: `Time for: ${habit.name}`,
        });
      }
    })();
  }, [habits]);

  const renderScreen = () => {
    switch (currentScreen) {
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
  };

  const handleNavigate = (screen: string) => {
    if (isScreen(screen)) setCurrentScreen(screen);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {renderScreen()}
        <NavigationBar currentScreen={currentScreen} onNavigate={handleNavigate} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
