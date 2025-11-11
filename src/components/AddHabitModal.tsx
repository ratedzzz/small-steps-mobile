import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import ColorPicker, { Panel1, Swatches, HueSlider } from 'reanimated-color-picker';
import { useApp } from '../store';
import TimeField from './TimeField';

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export default function AddHabitModal({ visible, onClose, darkMode }: AddHabitModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366F1');
  const [reminderTime, setReminderTime] = useState(''); // e.g., "07:30 AM"
  const { addHabit } = useApp();
  const theme = darkMode ? darkTheme : lightTheme;

  const handleSave = () => {
    if (name.trim()) {
      addHabit({ name, color, reminderTime: reminderTime || undefined });
      setName('');
      setColor('#6366F1');
      setReminderTime('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
          <ScrollView>
            <Text style={[styles.title, { color: theme.text }]}>Add New Habit</Text>

            <Text style={[styles.label, { color: theme.text }]}>Habit Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Drink water, Exercise..."
              placeholderTextColor={theme.placeholder}
              style={[
                styles.input,
                { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border },
              ]}
            />

            <Text style={[styles.label, { color: theme.text }]}>Color</Text>
            <ColorPicker
              value={color}
              onComplete={(colors) => setColor(colors.hex)}
              style={styles.colorPicker}
            >
              <Panel1 />
              <HueSlider />
              <Swatches
                colors={[
                  '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
                  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
                ]}
              />
            </ColorPicker>

            <Text style={[styles.label, { color: theme.text }]}>Reminder Time (Optional)</Text>
            {/* Full keyboard + AM/PM toggle */}
            <TimeField value={reminderTime} onChange={setReminderTime} use12h dark={darkMode} />

            <View style={styles.buttonRow}>
              <Pressable
                onPress={onClose}
                style={[
                  styles.buttonOutline,
                  { borderColor: darkMode ? '#94A3B8' : '#64748B' },
                ]}
              >
                <Text style={{ color: darkMode ? '#E2E8F0' : '#0F172A', fontWeight: '600' }}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable onPress={handleSave} style={[styles.buttonFilled, { backgroundColor: color }]}>
                <Text style={styles.buttonFilledText}>Save Habit</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 8 },
  colorPicker: { width: '100%', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', marginTop: 24 },
  buttonOutline: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12, // instead of 'gap' for RN compatibility
  },
  buttonFilled: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonFilledText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
});

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
