// app/_layout.tsx

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useApp } from '../src/store';
import { initSchema } from '../src/utils/storage';
import { configureNotifications } from '../src/utils/notifications';

export default function RootLayout() {
  // We grab loadFromDB from the store so we can call it on startup.
  const loadFromDB = useApp((s) => s.loadFromDB);

  useEffect(() => {
    // 1. Make sure our tables exist. Safe to call multiple times.
    initSchema();

    // 2. Hydrate Zustand from SQLite (habits, goals, badges)
    //    This also reschedules notifications for habits with reminderTime.
    loadFromDB();

    // 3. Prepare notifications: permissions, channels, handler.
    configureNotifications();
  }, [loadFromDB]);

  return (
    <SafeAreaProvider>
      {/* expo-router stack. We hide the native header and draw our own UI instead. */}
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
