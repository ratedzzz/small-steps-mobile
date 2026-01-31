import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useApp } from '../src/store';
import { APP_THEME } from '../src/theme';
import { scheduleDailyLocalNotification, cancelAll } from '../src/notifications';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../src/lib/firebase';

function parseTimeString(input?: string): { hour: number; minute: number } | null {
  if (!input) return null;
  const s = input.toUpperCase().trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/);
  if (!m) return null;
  let hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const ap = m[3] as 'AM' | 'PM' | undefined;
  if (Number.isNaN(hh) || Number.isNaN(mm) || mm < 0 || mm > 59) return null;
  if (ap) hh = ap === 'AM' ? (hh === 12 ? 0 : hh % 12) : (hh === 12 ? 12 : (hh % 12) + 12);
  else hh = Math.max(0, Math.min(23, hh));
  return { hour: hh, minute: mm };
}

export default function RootLayout() {
  const { habits = [], setUser } = useApp();
  const [initializing, setInitializing] = useState(true);
  const [user, setAuthUser] = useState<User | null>(null);
  
  const segments = useSegments();
  const router = useRouter();

  // 1. Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setAuthUser(authUser);
      
      if (authUser) {
        setUser(authUser.uid, authUser.displayName || "Friend", authUser.photoURL);
      } else {
        setUser(null, "Friend", null);
      }

      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  // 2. Routing Logic (Gatekeeper)
  useEffect(() => {
    if (initializing) return;

    // TS Fix: Cast segments to string to avoid "no overlap" error
    const inTabsGroup = (segments[0] as string) === '(tabs)';

    if (user && !inTabsGroup) {
      // Redirect to Tabs if logged in
      router.replace('/(tabs)');
    } else if (!user && inTabsGroup) {
      // Redirect to Login if not logged in
      // TS Fix: Cast route to 'any' to bypass strict typing for now
      router.replace('/login' as any);
    }
  }, [user, initializing, segments]);

  // 3. Notification Scheduler
  useEffect(() => {
    (async () => {
      try {
        await cancelAll();
        for (const habit of habits) {
          if (!habit?.reminderTime) continue;
          const t = parseTimeString(habit.reminderTime);
          if (!t) continue;
          await scheduleDailyLocalNotification(t.hour, t.minute, {
            title: 'Small Steps Reminder 🌟',
            body: `Time for: ${habit.name}`,
          });
        }
      } catch (e) {
        console.log("Notification error:", e);
      }
    })();
  }, [habits]);

  // 4. Loading Indicator
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: APP_THEME.solidBackground }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  // 5. Main Layout
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: APP_THEME.solidBackground }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}