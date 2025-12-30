import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/store';
// UPDATED IMPORT:
import { APP_THEME, MOUNTAIN_PALETTE } from '../../src/theme';
import {
  scheduleDailyLocalNotification,
  cancelAll,
} from '../../src/notifications';

// Helper to parse time strings
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
  // UPDATED: Use APP_THEME constants
  const NAVY_BG = APP_THEME.solidBackground; 
  const ACTIVE_PEACH = MOUNTAIN_PALETTE[0]; 
  const INACTIVE_BLUE = "#318fb5"; 

  return (
    <View style={{ flex: 1, backgroundColor: NAVY_BG }}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          // Tab Bar Colors
          tabBarActiveTintColor: ACTIVE_PEACH,
          tabBarInactiveTintColor: INACTIVE_BLUE,
          tabBarStyle: {
            backgroundColor: NAVY_BG,
            borderTopColor: '#005086', 
            borderTopWidth: 1,
            paddingBottom: 20,
            height: 80, 
            elevation: 0, 
            shadowOpacity: 0, 
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          // Icons
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
  const { habits = [] } = useApp();

  // Schedule reminders
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
        console.log("Notification scheduling error:", e);
      }
    })();
  }, [habits]);

  return (
    <SafeAreaProvider>
      {/* Ensure the deep background is set here too */}
      <View style={{ flex: 1, backgroundColor: APP_THEME.solidBackground }}>
        <TabsInner />
      </View>
    </SafeAreaProvider>
  );
}