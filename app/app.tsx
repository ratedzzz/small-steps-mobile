import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import NavigationBar from '../src/components/NavigationBar'; // Fixed path
import BadgesScreen from '../src/screens/BadgesScreen';      // Fixed path
import CalendarScreen from '../src/screens/CalendarScreen';  // Fixed path
import HomeScreen from '../src/screens/HomeScreen';          // Fixed path
import JournalScreen from '../src/screens/JournalScreen';    // Fixed path
import SettingsScreen from '../src/screens/SettingsScreen';  // Fixed path

import { useApp } from '../src/store';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const { habits } = useApp();

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    })();
  }, []);

  useEffect(() => {
    const scheduleNotifications = async () => {
      await Notifications.cancelAllScheduledNotificationsAsync();
      for (const habit of habits) {
        if (habit.reminderTime) {
          const [hours, minutes] = habit.reminderTime.split(':').map(Number);
          const trigger: Notifications.NotificationTriggerInput = {
            type: SchedulableTriggerInputTypes.CALENDAR,
            hour: hours,
            minute: minutes,
            repeats: true,
          };
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Small Steps Reminder',
              body: `Time for ${habit.name}`,
              sound: 'default',
            },
            trigger,
          });
        }
      }
    };
    scheduleNotifications();
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

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {renderScreen()}
        <NavigationBar currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
