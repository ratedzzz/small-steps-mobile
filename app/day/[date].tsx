import { useLocalSearchParams, Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Switch, StyleSheet, ScrollView } from 'react-native';
import { useApp, newId } from '../../src/store';
import { quoteForDate } from '../../src/quotes';
import { aiTipsForDay } from '../../src/suggestions';

export default function DayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const d = typeof date === 'string' ? date : new Date().toISOString().slice(0,10);
  const { habits, entries, upsertEntry } = useApp();
  const [note, setNote] = useState(entries.find(e=>e.date===d && !e.habitId)?.text ?? '');

  const q = useMemo(() => quoteForDate(d), [d]);
  const tips = useMemo(() => aiTipsForDay(d, habits, entries), [d, habits, entries]);

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Stack.Screen options={{ title: d }} />
      <Text style={styles.quote}>“{q.text}” — {q.author}</Text>

      <Text style={styles.h2}>Habits today</Text>
      {habits.map(h => {
        const e = entries.find(x=>x.date===d && x.habitId===h.id);
        const done = !!e?.completed;
        return (
          <View key={h.id} style={styles.habitRow}>
            <View style={[styles.colorBox,{backgroundColor:h.color}]} />
            <Text style={styles.habitName}>{h.name}</Text>
            <Switch
              value={done}
              onValueChange={(v)=> upsertEntry({ id: e?.id ?? newId(), date: d, habitId: h.id, completed: v, text: e?.text ?? '' })}
            />
          </View>
        );
      })}

      <Text style={styles.h2}>Journal</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        onBlur={()=> upsertEntry({ id: entries.find(e=>e.date===d && !e.habitId)?.id ?? newId(), date: d, text: note })}
        placeholder="How did the day go?"
        style={styles.textarea}
        multiline
      />

      {tips.length>0 && (
        <View style={styles.tips}>
          <Text style={styles.h2}>AI Suggestions</Text>
          {tips.map((t,i)=> <Text key={i} style={styles.tip}>• {t}</Text>)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 16, gap: 12 },
  quote: { fontStyle: 'italic', color: '#444' },
  h2: { fontSize: 18, fontWeight: '700', marginTop: 8, marginBottom: 6 },
  habitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  colorBox: { width: 14, height: 14, borderRadius: 3 },
  habitName: { flex: 1, fontSize: 16 },
  textarea: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, minHeight: 120, textAlignVertical: 'top' },
  tips: { backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 10 },
  tip: { marginVertical: 2 },
});
