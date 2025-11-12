import React, { useEffect } from 'react';
import { View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Slot } from 'expo-router';

// correct from app/(tabs)/_layout.tsx
import { useApp } from '../../src/store';
import {
  setupNotificationHandler,
  getPushTokenSafely,
  scheduleDailyLocalNotification,
  cancelAll,
} from '../../src/notifications';


// Parse "07:30" or "07:30 AM"/"7:30 pm" -> { hour: 0..23, minute: 0..59 }
function parseTimeString(input?: string): { hour: number; minute: number } | null {
  if (!input) return null;
  const s = input.toUpperCase().trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/);
  if (!m) return null;

  let hh = parseInt(m[1], 10);
  let mm = parseInt(m[2], 10);
  const ap = m[3] as 'AM' | 'PM' | undefined;

  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  if (mm < 0 || mm > 59) return null;

  if (ap) {
    // 12-hour to 24-hour
    if (ap === 'AM') {
      if (hh === 12) hh = 0;
    } else {
      if (hh !== 12) hh = (hh % 12) + 12;
    }
  } else {
    // clamp 24h just in case
    hh = Math.max(0, Math.min(23, hh));
  }

  return { hour: hh, minute: mm };
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const { habits = [] } = useApp();

  // One-time notification handler + token (safe in Expo Go)
  useEffect(() => {
    (async () => {
      await setupNotificationHandler();
      await getPushTokenSafely();
    })();
  }, []);

  // Reschedule daily reminders whenever habits (or their times) change
  useEffect(() => {
    (async () => {
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
    })();
  }, [habits]);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: dark ? '#0F172A' : '#FFFFFF' }}>
        {/* All routes (including your tabs) render inside this Slot */}
        <Slot />
      </View>
    </SafeAreaProvider>
  );
}
