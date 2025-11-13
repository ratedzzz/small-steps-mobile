import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditHabitRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>
          Edit Habit (coming soon)
        </Text>
        <Text style={{ marginTop: 8, opacity: 0.7 }}>
          This is a placeholder screen so the router types compile.
        </Text>
      </View>
    </SafeAreaView>
  );
}
