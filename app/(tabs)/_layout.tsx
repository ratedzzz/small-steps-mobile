// app/(tabs)/_layout.tsx
import React, { useEffect } from 'react';
import { View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/store';
import {
  setupNotificationHandler,
  getPushTokenSafely,
  scheduleDailyLocalNotification,
  cancelAll,
} from '../../src/notifications';

const PALETTE = {
  deepTeal: '#15292E',
  teal: '#074047',
  aqua: '#1C8585',
  mint: '#1DA27E',
  gold: '#E0A800',
  goldSoft: '#F1C453',
  goldPale: '#F6D88B',
} as const;

const LIGHT = {
  bg: '#FFF9EC',
  cardBg: '#FFFFFF',
  textLight: '#15292E',
  textSecondary: '#475569',
  primary: PALETTE.mint,
  accent: PALETTE.goldSoft,
  border: '#E5E7EB',
} as const;

const DARK = {
  bg: PALETTE.deepTeal,
  cardBg: PALETTE.teal,
  textLight: '#EAF7F6',
  textSecondary: '#9FB8B6',
  primary: PALETTE.mint,
  accent: PALETTE.goldSoft,
  border: '#2A3C40',
} as const;

// Parses reminderTime string for notification scheduling
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

function TabsInner() {
  const darkMode = useColorScheme() === 'dark';
  const theme = darkMode ? DARK : LIGHT;
  const GOLD = theme.accent;
  const GOLD_INACTIVE = 'rgba(241, 196, 83, 0.75)';

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: GOLD,
          tabBarInactiveTintColor: GOLD_INACTIVE,
          tabBarStyle: {
            backgroundColor: theme.cardBg,
            borderTopColor: theme.border,
            borderTopWidth: 1,
            paddingBottom: 8,
            height: 64,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
          tabBarIcon: ({ color, size, focused }) => {
            let icon: any = 'home-outline';
            if (route.name === 'index') icon = focused ? 'home' : 'home-outline';
            else if (route.name === 'calendar') icon = focused ? 'calendar' : 'calendar-outline';
            else if (route.name === 'journal') icon = focused ? 'book' : 'book-outline';
            else if (route.name === 'badges') icon = focused ? 'medal' : 'medal-outline';
            else if (route.name === 'settings') icon = focused ? 'settings' : 'settings-outline';
            return <Ionicons name={icon} size={size} color={color} />;
          },
        })}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
        <Tabs.Screen name="journal" options={{ title: 'Journal' }} />
        <Tabs.Screen name="badges" options={{ title: 'Badges' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>
    </View>
  );
}

export default function RootLayout() {
  const darkMode = useColorScheme() === 'dark';
  const theme = darkMode ? DARK : LIGHT;
  const { habits = [] } = useApp();

  useEffect(() => {
    (async () => {
      await setupNotificationHandler();
      await getPushTokenSafely();
    })();
  }, []);

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
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <TabsInner />
      </View>
    </SafeAreaProvider>
  );
}
