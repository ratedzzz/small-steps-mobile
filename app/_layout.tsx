// app/_layout.tsx
import React, { useEffect, useRef } from 'react';
import { Platform, InteractionManager } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { useApp } from '../src/store';
import { initSchema } from '../src/utils/storage';
import { configureNotifications } from '../src/utils/notifications';

try { SplashScreen.preventAutoHideAsync(); } catch {}

export default function RootLayout() {
  const loadFromDB = useApp((s) => s.loadFromDB);
  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    let mounted = true;
    (async () => {
      await new Promise<void>((r) => InteractionManager.runAfterInteractions(() => r()));

      try { await initSchema(); } 
      catch (e) { console.warn('[AppInit] initSchema failed:', e); }
      if (!mounted) return;

      try { await loadFromDB(); } 
      catch (e) { console.warn('[AppInit] loadFromDB failed:', e); }
      if (!mounted) return;

      try {
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
          await configureNotifications();
        }
      } catch (e) {
        console.warn('[AppInit] notifications failed:', e);
      }

      try { await SplashScreen.hideAsync(); } catch {}
    })();

    return () => { mounted = false; };
  }, [loadFromDB]);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="edit/habit/[id]" />
        <Stack.Screen name="edit/goal/[id]" />
      </Stack>
    </SafeAreaProvider>
  );
}
