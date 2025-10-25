// app/_layout.tsx

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// pull something from the store to ensure it initializes on app load
import { useApp } from '../src/store';

// our safe notifications setup
import { configureNotifications } from '../src/utils/notifications';

export default function RootLayout() {
  // We touch the store here so it hydrates when the app boots.
  // If you don't actually need habits here, it's still fine to read them.
  const { habits } = useApp();

  useEffect(() => {
    // Ask for notif permissions, set channel, etc.
    // This will gracefully no-op in Expo Go Android dev,
    // because we wrote notifications.ts to detect that case.
    configureNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      {/* 
        Stack is the navigator that expo-router uses to render routes
        from files in /app. headerShown: false = we’ll draw our own UI.
      */}
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
