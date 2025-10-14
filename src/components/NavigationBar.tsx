import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface Props {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export default function NavigationBar({ currentScreen, onNavigate }: Props) {
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'calendar', icon: '📅', label: 'Calendar' },
    { id: 'journal', icon: '📝', label: 'Journal' },
    { id: 'badges', icon: '🏆', label: 'Badges' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <Pressable
          key={tab.id}
          onPress={() => onNavigate(tab.id)}
          style={[
            styles.tab,
            currentScreen === tab.id && styles.tabActive,
          ]}
        >
          <Text style={styles.icon}>{tab.icon}</Text>
          <Text style={[
            styles.label,
            currentScreen === tab.id && styles.labelActive,
          ]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabActive: {
    borderTopWidth: 2,
    borderTopColor: '#6366F1',
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    color: '#6B7280',
  },
  labelActive: {
    color: '#6366F1',
    fontWeight: 'bold',
  },
});