import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME, MOUNTAIN_PALETTE } from '../../src/theme';

export default function TabsLayout() {
  const NAVY_BG = APP_THEME.solidBackground; 
  const ACTIVE_PEACH = MOUNTAIN_PALETTE[0]; 
  const INACTIVE_BLUE = "#318fb5"; 

  return (
    <View style={{ flex: 1, backgroundColor: NAVY_BG }}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
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
          tabBarIcon: ({ color, size, focused }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

            if (route.name === 'index') {
                iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'calendar') {
                iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'journal') {
                iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'badges') {
                iconName = focused ? 'medal' : 'medal-outline';
            } else if (route.name === 'settings') {
                iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
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