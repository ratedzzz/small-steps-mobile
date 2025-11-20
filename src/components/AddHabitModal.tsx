// src/components/AddHabitModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import ColorPicker, { Swatches } from 'reanimated-color-picker';
import { useApp } from '../store';
import { Habit } from '../types';

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
  darkMode: boolean;
  habit?: Habit | null;
  onSave?: (habit: Partial<Habit>) => void;
  onDelete?: (habitId: string) => void;
}

const PALETTE = {
  deepTeal: '#15292E',
  teal: '#074047',
  aqua: '#1C8585',
  mint: '#1DA27E',
  goldSoft: '#F1C453',
};

const lightTheme = {
  bg: '#FFF9EC',
  text: '#15292E',
  inputBg: '#FFFFFF',
  border: '#E2E8F0',
  placeholder: '#94A3B8',
  primary: PALETTE.mint,
  cancelBg: PALETTE.teal,
  cancelText: '#FFFFFF',
  deleteBg: '#EF4444',
};

const darkTheme = {
  bg: PALETTE.teal,
  text: '#EAF7F6',
  inputBg: PALETTE.deepTeal,
  border: PALETTE.aqua,
  placeholder: '#9FB8B6',
  primary: PALETTE.mint,
  cancelBg: PALETTE.deepTeal,
  cancelText: '#EAF7F6',
  deleteBg: '#EF4444',
};

export default function AddHabitModal({ 
  visible, 
  onClose, 
  darkMode, 
  habit,
  onSave,
  onDelete,
}: AddHabitModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#1DA27E');
  const [reminderTime, setReminderTime] = useState('');
  const [amPm, setAmPm] = useState<'AM' | 'PM'>('AM');
  const { addHabit } = useApp();
  const theme = darkMode ? darkTheme : lightTheme;

  const isEditing = habit !== null && habit !== undefined;

  // Populate fields when editing
  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setColor(habit.color);
      if (habit.reminderTime) {
        const [hours, minutes] = habit.reminderTime.split(':').map(Number);
        const isPM = hours >= 12;
        const displayHours = hours % 12 || 12;
        setReminderTime(`${displayHours}:${minutes.toString().padStart(2, '0')}`);
        setAmPm(isPM ? 'PM' : 'AM');
      } else {
        setReminderTime('');
        setAmPm('AM');
      }
    } else {
      // Reset for new habit
      setName('');
      setColor('#1DA27E');
      setReminderTime('');
      setAmPm('AM');
    }
  }, [habit, visible]);

  const convertTo24Hour = (time: string, period: 'AM' | 'PM'): string => {
    if (!time) return '';
    
    const [hoursStr, minutesStr] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr || '00';
    
    if (isNaN(hours)) return '';
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (name.trim()) {
      const time24 = reminderTime ? convertTo24Hour(reminderTime, amPm) : undefined;
      
      if (isEditing && onSave) {
        // Update existing habit
        onSave({
          id: habit.id,
          name: name.trim(),
          color,
          reminderTime: time24,
        });
      } else {
        // Add new habit
        addHabit({ name: name.trim(), color, reminderTime: time24 });
        onClose();
      }
    }
  };

  const handleDelete = () => {
    if (isEditing && onDelete) {
      Alert.alert(
        'Delete Habit',
        `Are you sure you want to delete "${habit.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => onDelete(habit.id),
          },
        ]
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
          <ScrollView>
            <Text style={[styles.title, { color: theme.text }]}>
              {isEditing ? 'Edit Habit' : 'Add New Habit'}
            </Text>

            <Text style={[styles.label, { color: theme.text }]}>Habit Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Drink water, Exercise..."
              placeholderTextColor={theme.placeholder}
              style={[styles.input, { 
                backgroundColor: theme.inputBg, 
                color: theme.text,
                borderColor: theme.border,
              }]}
            />

            <Text style={[styles.label, { color: theme.text }]}>
              Color
            </Text>
            <ColorPicker
              value={color}
              onComplete={(colors) => setColor(colors.hex)}
              style={styles.colorPicker}
            >
              <Swatches
                colors={[
                  '#1DA27E', '#1C8585', '#074047', '#15292E',
                  '#F1C453', '#F59E0B', '#EF4444', '#8B5CF6',
                ]}
              />
            </ColorPicker>

            <Text style={[styles.label, { color: theme.text }]}>
              Reminder Time (Optional)
            </Text>
            <View style={styles.timeRow}>
              <TextInput
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="HH:MM (e.g., 09:00)"
                placeholderTextColor={theme.placeholder}
                keyboardType="default"
                style={[styles.timeInput, {
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  borderColor: theme.border,
                }]}
              />
              <View style={styles.amPmContainer}>
                <Pressable
                  onPress={() => setAmPm('AM')}
                  style={[
                    styles.amPmButton,
                    amPm === 'AM' && { backgroundColor: theme.primary },
                    amPm !== 'AM' && { backgroundColor: theme.inputBg, borderColor: theme.border, borderWidth: 1 },
                  ]}
                >
                  <Text style={[
                    styles.amPmText,
                    amPm === 'AM' ? { color: '#FFFFFF' } : { color: theme.text },
                  ]}>
                    AM
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setAmPm('PM')}
                  style={[
                    styles.amPmButton,
                    amPm === 'PM' && { backgroundColor: theme.primary },
                    amPm !== 'PM' && { backgroundColor: theme.inputBg, borderColor: theme.border, borderWidth: 1 },
                  ]}
                >
                  <Text style={[
                    styles.amPmText,
                    amPm === 'PM' ? { color: '#FFFFFF' } : { color: theme.text },
                  ]}>
                    PM
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                onPress={onClose}
                style={[styles.button, { backgroundColor: theme.cancelBg }]}
              >
                <Text style={[styles.buttonText, { color: theme.cancelText }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                style={[styles.button, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.buttonText}>
                  {isEditing ? 'Update' : 'Save Habit'}
                </Text>
              </Pressable>
            </View>

            {isEditing && (
              <Pressable
                onPress={handleDelete}
                style={[styles.deleteButton, { backgroundColor: theme.deleteBg }]}
              >
                <Text style={styles.buttonText}>Delete Habit</Text>
              </Pressable>
            )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  amPmContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  amPmButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amPmText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  colorPicker: {
    width: '100%',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  deleteButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
});
