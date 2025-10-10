import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { Calendar } from 'react-native-big-calendar';
import { addHours, setHours, setMinutes } from 'date-fns';
import { useApp } from '../src/store';

// Type accepted by react-native-big-calendar
type Event = { title: string; start: Date; end: Date; color?: string };

export default function WeekView() {
  const { habits, entries, goals } = useApp();
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const anchor = focus ?? new Date().toISOString().slice(0,10);

  const events = useMemo<Event[]>(() => {
    const out: Event[] = [];
    // Habit completions -> colored blocks (default 1 hr at 9am)
    for (const e of entries) {
      if (!e.habitId || !e.completed) continue;
      const h = habits.find(x => x.id === e.habitId);
      if (!h) continue;
      const [y,m,d] = e.date.split('-').map(Number);
      const start = setMinutes(setHours(new Date(y, m-1, d), 9), 0);
      const end = addHours(start, 1);
      out.push({ title: h.name, start, end, color: h.color });
    }
    // Goal due dates -> red/goal-colored block at noon
    for (const g of goals) {
      if (!g.dueDate) continue;
      const [y,m,d] = g.dueDate.split('-').map(Number);
      const start = setMinutes(setHours(new Date(y, m-1, d), 12), 0);
      const end = addHours(start, 1);
      out.push({ title: `Goal: ${g.title}`, start, end, color: g.color || '#ff4d4d' });
    }
    return out;
  }, [entries, habits, goals]);

  return (
    <View style={{ flex:1 }}>
      <View style={styles.topBar}>
        <Link href="/" asChild>
          <Pressable style={styles.btn}><Text style={styles.btnTxt}>Month</Text></Pressable>
        </Link>
        <Text style={styles.title}>Week View</Text>
      </View>
      <Calendar
        mode="week"
        events={events}
        height={800}
        date={new Date(anchor)}
        eventCellStyle={(e) => ({ backgroundColor: e.color ?? '#6fb3ff', borderRadius: 8 })}
        hourRowHeight={48}
        swipeEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:12 },
  title: { fontSize:18, fontWeight:'700' },
  btn: { backgroundColor:'#222', paddingVertical:8, paddingHorizontal:12, borderRadius:10 },
  btnTxt: { color:'#fff', fontWeight:'700' },
});
