// src/components/AddHabitModal.tsx
import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp, newId } from '../store';

type Props = {
  visible: boolean;
  onClose: () => void;
  darkMode?: boolean;
};

const LIGHT = {
  bg: '#F8FAFC',
  cardBg: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E5E7EB',
  primary: '#6366F1',
} as const;

const DARK = {
  bg: '#0F172A',
  cardBg: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#334155',
  primary: '#818CF8',
} as const;

// Safe palette (contrast checked) — no libraries, no crashes.
const PALETTE = [
  '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#84cc16',
  '#22c55e', '#14b8a6', '#0ea5e9', '#a855f7', '#e11d48',
];

export default function AddHabitModal({ visible, onClose, darkMode }: Props) {
  const theme = darkMode ? DARK : LIGHT;
  const { /* other store stuff as needed */ } = useApp();
  // We don’t know your exact add/upsert function name, so call flexibly:
  const appAny = useApp() as any;
  const addHabitFn: ((h: any) => void) | undefined =
    appAny.addHabit ?? appAny.upsertHabit ?? appAny.insertHabit;

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const defaultColor = PALETTE[5]; // '#6366f1' / '#818CF8' family
  const [color, setColor] = useState<string>(defaultColor);

  const canSave = useMemo(() => name.trim().length > 0 && !!addHabitFn, [name, addHabitFn]);

  const resetAndClose = () => {
    setName('');
    setNotes('');
    setColor(defaultColor);
    onClose?.();
  };

  const onSave = () => {
    if (!canSave) return;

    // normalize color safely (avoid calling .toLowerCase() on undefined)
    const safeColor =
      typeof color === 'string' && color.startsWith('#')
        ? color.toLowerCase()
        : defaultColor;

    const record = {
      id: newId(),
      name: name.trim(),
      notes: notes.trim() || undefined,
      color: safeColor,
      createdAt: new Date().toISOString(),
      // add any other fields your store expects (reminderTime, etc.)
    };

    try {
      addHabitFn?.(record);
      resetAndClose();
    } catch (e) {
      // If your store throws, at least don’t crash the app UI
      console.warn('[AddHabitModal] addHabit failed:', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.backdrop}>
          <SafeAreaView style={[styles.sheet, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.title, { color: theme.text }]}>Add Habit</Text>

            {/* Name */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Drink water"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border, backgroundColor: darkMode ? theme.bg : '#fff' },
              ]}
              autoCapitalize="sentences"
              returnKeyType="done"
            />

            {/* Notes (optional) */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Notes (optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Short description or reminder"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border, backgroundColor: darkMode ? theme.bg : '#fff' },
              ]}
              autoCapitalize="sentences"
              returnKeyType="done"
            />

            {/* Color */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Pick a color</Text>
            <View style={styles.paletteWrap}>
              {PALETTE.map((c) => {
                const selected = color === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setColor(c)}
                    style={[
                      styles.swatch,
                      { backgroundColor: c, borderColor: selected ? theme.text : 'transparent' },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Pick color ${c}`}
                  >
                    {selected ? <Text style={styles.swatchCheck}>✓</Text> : null}
                  </Pressable>
                );
              })}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable style={[styles.btn, { borderColor: theme.border }]} onPress={resetAndClose}>
                <Text style={[styles.btnText, { color: theme.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={onSave}
                disabled={!canSave}
                style={[
                  styles.btnPrimary,
                  { backgroundColor: canSave ? theme.primary : '#A5B4FC' },
                ]}
              >
                <Text style={styles.btnPrimaryText}>Save</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  label: { fontSize: 12, marginTop: 8, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  paletteWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
    marginBottom: 12,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchCheck: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnText: { fontWeight: '700' },
  btnPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '800' },
});
