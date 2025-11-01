// app/_layout.tsx
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useApp } from '../src/store';
import { initSchema } from '../src/utils/storage';
import { configureNotifications } from '../src/utils/notifications';

export default function RootLayout() {
  // grab the action from the store
  const loadFromDB = useApp((s) => s.loadFromDB);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 1) Ensure DB tables exist (safe to call multiple times)
        await initSchema();

        if (cancelled) return;

        // 2) Hydrate Zustand from SQLite (also reschedules habit reminders)
        await loadFromDB();

        if (cancelled) return;

        // 3) Prepare notifications (permissions, Android channel, handler)
        await configureNotifications();
      } catch (err) {
        console.warn('App init failed:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadFromDB]);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* index route renders your tabbed UI (Home/Calendar/Journal/Badges/Settings) */}
        <Stack.Screen name="index" />

        {/* edit routes for Expo Router navigation */}
        <Stack.Screen name="edit/habit/[id]" />
        <Stack.Screen name="edit/goal/[id]" />
      </Stack>
    </SafeAreaProvider>
  );
}
