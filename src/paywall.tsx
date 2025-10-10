import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useApp } from './store';

export function Paywall({ children }: { children: React.ReactNode }) {
  const { pro, setPro, habits, goals } = useApp();
  if (pro) return <>{children}</>;
  const overFree = habits.length > 3 || goals.length > 1;
  if (!overFree) return <>{children}</>;
  return (
    <View style={{ padding: 20, gap: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>SmallSteps Pro</Text>
      <Text>Unlock unlimited habits/goals, multi‑reminders, and AI tips.</Text>
      <Pressable onPress={()=> setPro(true)} style={{ backgroundColor:'#222', padding:10, borderRadius:10, marginTop:8 }}>
        <Text style={{ color:'#fff', textAlign:'center', fontWeight:'700' }}>Simulate Purchase (dev)</Text>
      </Pressable>
    </View>
  );
}
