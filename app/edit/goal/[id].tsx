import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useApp } from '../../../src/store';

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

function isValidISODate(dateString: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test((dateString || '').trim());
}

export default function EditGoalScreen() {
  const scheme = useColorScheme();
  const theme = useMemo(() => (scheme === 'dark' ? darkTheme : lightTheme), [scheme]);

  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();

  // Normalize `id` (Expo Router can deliver arrays)
  const goalId = useMemo(() => (Array.isArray(id) ? id[0] : id) ?? '', [id]);

  // Pull selectors/actions + hydration flag from the store
  const getGoalById = useApp((s) => s.getGoalById);
const updateGoal  = useApp((s) => s.updateGoal);
const _hydrated   = useApp((s) => (s as any)._hydrated ?? true);


  const goal = useMemo(
    () => (goalId ? getGoalById(goalId) : undefined),
    [goalId, getGoalById]
  );

  const [title, setTitle] = useState<string>('');
  const [color, setColor] = useState<string>('#10B981');
  const [dueDate, setDueDate] = useState<string>(''); // blank or YYYY-MM-DD

  // Seed form fields when goal is available
  useEffect(() => {
    if (goal) {
      setTitle(goal.title ?? '');
      setColor(goal.color ?? '#10B981');
      setDueDate(goal.dueDate ?? '');
    }
  }, [goal]);

  // If we haven't hydrated yet, show a tiny loader instead of "Goal not found"
  if (!_hydrated) {
    return (
      <View style={[styles.center, { flex: 1, backgroundColor: theme.bg }]}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: theme.text, opacity: 0.7 }}>
          Loading…
        </Text>
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={[styles.center, { flex: 1, backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.text, opacity: 0.7 }}>Goal not found.</Text>
        <View style={{ height: 12 }} />
        <Button
          title="Back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
      </View>
    );
  }

  async function onSave() {
    // Ensure `goal` is present before using it (fixes "possibly undefined" compile error)
    if (!goal) {
      Alert.alert('Error', 'Goal not found.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Title required', 'Goal title cannot be empty.');
      return;
    }
    if (dueDate.trim() && !isValidISODate(dueDate)) {
      Alert.alert('Invalid date', 'Due date must be YYYY-MM-DD (e.g., 2025-12-31).');
      return;
    }

    await updateGoal(goal.id, {
      title: title.trim(),
      color,
      dueDate: dueDate.trim() || undefined,
    });

    if (Platform.OS === 'android') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { ToastAndroid } = require('react-native');
      ToastAndroid.show('Goal saved', ToastAndroid.SHORT);
    }
    router.canGoBack() ? router.back() : router.replace('/');
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: theme.text }]}>Edit Goal</Text>

        {/* Title */}
        <Text style={[styles.label, { color: theme.text }]}>Goal Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Run a marathon…"
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
                key={`goal-color:${c}`}
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

        {/* Due Date */}
        <Text style={[styles.label, { color: theme.text }]}>Due Date (Optional)</Text>
        <TextInput
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD (e.g., 2025-12-31)"
          placeholderTextColor={theme.placeholder}
          style={[
            styles.input,
            { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border },
          ]}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numeric"
          maxLength={10}
          returnKeyType="done"
        />

        <View style={{ height: 8 }} />
        <Button title="Save" onPress={onSave} />
        <View style={{ height: 16 }} />
        <Button
          title="Cancel"
          color={Platform.OS === 'ios' ? '#999' : undefined}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
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
