import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Button,
  Alert,
  useColorScheme,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../../../src/store';
import { cancelHabitReminder, scheduleHabitReminder } from '../../../src/utils/notifications';

const COLOR_OPTIONS = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // teal
  '#84CC16', // lime
  '#6366F1', // indigo
  '#000000', // black
];

const lightTheme = {
  bg: '#FFFFFF',
  text: '#0F172A',
  inputBg: '#F8FAFC',
  border: '#E2E8F0',
  placeholder: '#94A3B8',
};
const darkTheme = {
  bg: '#1E293B',
  text: '#F1F5F9',
  inputBg: '#0F172A',
  border: '#334155',
  placeholder: '#64748B',
};

// 24-hour HH:MM check/normalize
function normalizeHHMM(s: string): string | null {
  const m = /^([0-1]?\d|2[0-3]):([0-5]\d)$/.exec(s.trim());
  if (!m) return null;
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}

export default function EditHabitScreen() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getHabitById, updateHabit } = useApp();
  const habit = useMemo(() => (id ? getHabitById(String(id)) : undefined), [id, getHabitById]);

  const [name, setName] = useState<string>('');
  const [color, setColor] = useState<string>('#6366F1');
  const [reminderTime, setReminderTime] = useState<string>(''); // "HH:MM" or ''

  useEffect(() => {
    if (habit) {
      setName(habit.name ?? '');
      setColor(habit.color ?? '#6366F1');
      setReminderTime(habit.reminderTime ?? '');
    }
  }, [habit]);

  if (!habit) {
    return (
      <View style={[styles.center, { flex: 1, backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.text, opacity: 0.7 }}>Habit not found.</Text>
        <View style={{ height: 12 }} />
        <Button title="Back" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} />
      </View>
    );
  }

  async function onSave() {
    if (!habit) return;

    const trimmed = reminderTime.trim();
    const nextReminder: string | null = trimmed === '' ? null : normalizeHHMM(trimmed);

    if (trimmed !== '' && nextReminder == null) {
      Alert.alert('Invalid time', 'Please enter a time in HH:MM 24-hour format (e.g., 07:30 or 19:45).');
      return;
    }

    // Update notification if changed
    const oldTime = habit.reminderTime ?? null;
    if (nextReminder !== oldTime) {
      await cancelHabitReminder(habit.id);
      if (nextReminder) {
        await scheduleHabitReminder({
          id: habit.id,
          name: name,
          reminderTime: nextReminder,
        });
      }
    }

    await updateHabit(habit.id, { name, color, reminderTime: nextReminder });

    if (Platform.OS === 'android') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { ToastAndroid } = require('react-native');
      ToastAndroid.show('Habit saved', ToastAndroid.SHORT);
    }

    router.canGoBack() ? router.back() : router.replace('/');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: theme.text }]}>Edit Habit</Text>

      {/* Name */}
      <Text style={[styles.label, { color: theme.text }]}>Habit Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g., Drink water, Exercise…"
        placeholderTextColor={theme.placeholder}
        style={[
          styles.input,
          { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border },
        ]}
        returnKeyType="done"
      />

      {/* Color (swatch grid) */}
      <Text style={[styles.label, { color: theme.text }]}>Color</Text>
      <View style={styles.colorGrid}>
        {COLOR_OPTIONS.map((c) => {
          const selected = c.toLowerCase() === (color ?? '').toLowerCase();
          return (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorSwatch,
                {
                  backgroundColor: c,
                  borderColor: selected ? '#333' : '#fff',
                  borderWidth: selected ? 3 : 2,
                },
              ]}
              onPress={() => setColor(c)}
              accessible
              accessibilityRole="button"
              accessibilityState={{ selected }}
            />
          );
        })}
      </View>
      <View style={styles.previewRow}>
        <Text style={[styles.previewText, { color: theme.text }]}>Selected:</Text>
        <View
          style={[
            styles.previewSwatch,
            { backgroundColor: color, borderColor: theme.border },
          ]}
        />
      </View>

      {/* Reminder time */}
      <Text style={[styles.label, { color: theme.text }]}>Reminder Time (Optional)</Text>
      <TextInput
        value={reminderTime}
        onChangeText={setReminderTime}
        placeholder="HH:MM (e.g., 09:00)"
        placeholderTextColor={theme.placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          styles.input,
          { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border },
        ]}
        keyboardType="numeric"
        maxLength={5}
        returnKeyType="done"
      />

      <View style={{ height: 8 }} />
      <Button title="Save" onPress={onSave} />
      <View style={{ height: 16 }} />
      <Button
        title="Cancel"
        color={Platform.OS === 'ios' ? '#999' : undefined}
        onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
      />
      <View style={{ height: 16 }} />
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  center: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    elevation: 2,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  previewText: { fontSize: 14, fontWeight: '500' },
  previewSwatch: { width: 28, height: 28, borderRadius: 14, borderWidth: 1 },
});
