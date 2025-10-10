import { Link } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../src/store';
import { buildMarkedDates } from '../src/utils/calendar';
import { scheduleDailyReminder } from '../src/notifications';


// ---------- inline UI pieces ----------
type ButtonProps = { title: string; onPress: () => void };
const Button = ({ title, onPress }: ButtonProps) => (
  <Pressable onPress={onPress} style={styles.btn}>
    <Text style={styles.btnTxt}>{title}</Text>
  </Pressable>
);

type FieldProps = { label: string; value: string; onChangeText: (t: string) => void; placeholder?: string };
const Field = ({ label, value, onChangeText, placeholder }: FieldProps) => (
  <View style={{ marginTop: 8 }}>
    <Text style={{ fontWeight: '600', marginBottom: 4 }}>{label}</Text>
    <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} style={styles.input} />
  </View>
);

// Color wheel picker (reanimated-color-picker)
// @ts-ignore – lib ships without full TS types
import ColorPicker, { Panel1, Swatches, Preview, OpacitySlider, HueSlider } from 'reanimated-color-picker';
function ColorPickerField({ value, onChange }: { value: string; onChange: (c:string)=>void }) {
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={{ fontWeight: '600', marginBottom: 4 }}>Color</Text>
      <ColorPicker
        value={value}
        onComplete={(c: any) => onChange(c.hex)}
        style={{ width: 220 }}
      >
        <Preview />
        <Panel1 />
        <HueSlider />
        <OpacitySlider />
        <Swatches />
      </ColorPicker>
    </View>
  );
}

// Legend chip
function LegendRow({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color, marginRight: 6 }} />
      <Text style={{ fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function AddHabitInline() {
  const { addHabit } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6fb3ff');
  const [time, setTime] = useState('07:30');
  if (!open) return <Button title="Add Habit" onPress={() => setOpen(true)} />;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>New Habit</Text>
      <Field label="Name" value={name} onChangeText={setName} />
      <ColorPickerField value={color} onChange={setColor} />
      <Field label="Reminder time" value={time} onChangeText={setTime} placeholder="HH:MM" />
      <View style={styles.rowH}>
        <Button title="Cancel" onPress={() => setOpen(false)} />
        <Button
          title="Save"
          onPress={() => {
            addHabit({ name, color, reminderTime: time });
            setOpen(false);
            setName('');
            setColor('#6fb3ff');
            setTime('07:30');
          }}
        />
      </View>
    </View>
  );
}

function AddGoalInline() {
  const { addGoal } = useApp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#ff4d4d');
  const [due, setDue] = useState('');
  if (!open) return <Button title="Add Goal" onPress={() => setOpen(true)} />;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>New Goal</Text>
      <Field label="Title" value={title} onChangeText={setTitle} />
      <ColorPickerField value={color} onChange={setColor} />
      <Field label="Due date" value={due} onChangeText={setDue} placeholder="YYYY-MM-DD" />
      <View style={styles.rowH}>
        <Button title="Cancel" onPress={() => setOpen(false)} />
        <Button
          title="Save"
          onPress={() => {
            addGoal({ title, color, dueDate: due });
            setOpen(false);
            setTitle('');
            setColor('#ff4d4d');
            setDue('');
          }}
        />
      </View>
    </View>
  );
}

type RowItem = { id: string; color: string; name?: string; title?: string };
function Row({ item }: { item: RowItem }) {
  return (
    <View style={styles.listRow}>
      <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: item.color, marginRight: 6 }} />
      <Text style={styles.rowTxt}>{item.name ?? item.title}</Text>
    </View>
  );
}

export default function Home() {
  const { width } = useWindowDimensions();
  const narrow = width < 700; // phones & small tablets

  const { habits, goals, entries } = useApp();
  const [selected, setSelected] = useState(new Date().toISOString().slice(0, 10));

  const days = useMemo(() => {
    const today = new Date(selected);
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const out: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      out.push(d.toISOString().slice(0, 10));
    }
    return out;
  }, [selected]);

  const marked = useMemo(() => buildMarkedDates(days, entries, goals, habits, selected), [days, entries, goals, habits, selected]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[styles.root, narrow && styles.rootNarrow]}>
        {/* LEFT SIDE */}
        <View style={[styles.left, narrow && styles.leftNarrow]}>
          <Text style={styles.title}>My Habits</Text>
          <FlatList
            data={habits as unknown as RowItem[]}
            keyExtractor={(h) => h.id}
            renderItem={({ item }) => <Row item={item} />}
            ListEmptyComponent={<Text style={styles.empty}>No habits yet</Text>}
            contentContainerStyle={{ paddingBottom: 8 }}
          />
          <AddHabitInline />

          <Text style={[styles.title, { marginTop: 16 }]}>My Goals</Text>
          <FlatList
            data={goals as unknown as RowItem[]}
            keyExtractor={(g) => g.id}
            renderItem={({ item }) => <Row item={item} />}
            ListEmptyComponent={<Text style={styles.empty}>No goals yet</Text>}
            contentContainerStyle={{ paddingBottom: 8 }}
          />
          <AddGoalInline />
        </View>

        {/* RIGHT SIDE */}
        <View style={[styles.right, narrow && styles.rightNarrow]}>
          <Calendar
            markedDates={marked}
            markingType="multi-dot"
            enableSwipeMonths
            style={{ alignSelf: 'stretch' }}
            theme={{ textMonthFontWeight: '700', textDayFontSize: 14, textDayHeaderFontSize: 12 }}
            onDayPress={(d) => setSelected(d.dateString)}
            initialDate={selected}
          />
          <View style={styles.dayBar}>
            <Text style={styles.dayText}>{selected}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Link href={{ pathname: '/week', params: { focus: selected } }} asChild>
                <Pressable style={styles.dayBtn}>
                  <Text style={styles.dayBtnTxt}>Week</Text>
                </Pressable>
              </Link>
              <Link href={{ pathname: '/day/[date]', params: { date: selected } }} asChild>
                <Pressable style={styles.dayBtn}>
                  <Text style={styles.dayBtnTxt}>Open Day</Text>
                </Pressable>
              </Link>
            </View>
          </View>

          {/* Legend */}
          <View style={{ marginTop: 10, flexDirection: 'row', flexWrap: 'wrap' }}>
            {habits.map((h) => (
              <LegendRow key={`h-${h.id}`} label={h.name} color={h.color} />
            ))}
            {goals.map((g) => (
              <LegendRow key={`g-${g.id}`} label={g.title} color={g.color || '#ff4d4d'} />
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // layout
  root: { flex: 1, flexDirection: 'row', backgroundColor: '#fff' },
  rootNarrow: { flexDirection: 'column' },
  left: { width: 260, padding: 12, borderRightWidth: 1, borderRightColor: '#eee', flexShrink: 0 },
  leftNarrow: { width: '100%', borderRightWidth: 0, borderBottomWidth: 1, borderBottomColor: '#eee' },
  right: { flex: 1, padding: 12 },
  rightNarrow: { width: '100%' },

  // lists/forms
  title: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  empty: { color: '#999', marginBottom: 8 },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  rowTxt: { marginLeft: 8, fontSize: 16 },

  // day bar
  dayBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  dayText: { fontSize: 16, fontWeight: '600' },
  dayBtn: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#222', borderRadius: 10 },
  dayBtnTxt: { color: '#fff', fontWeight: '600' },

  // buttons/inputs/cards
  btn: { backgroundColor: '#222', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, alignSelf: 'flex-start', marginTop: 8 },
  btnTxt: { color: '#fff', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, minWidth: 180 },
  card: { marginTop: 8, padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 12, backgroundColor: '#fafafa' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  rowH: { flexDirection: 'row', gap: 8, marginTop: 10 },
});
