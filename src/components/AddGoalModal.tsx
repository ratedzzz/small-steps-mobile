// src/components/AddGoalModal.tsx
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

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export default function AddGoalModal({ visible, onClose, darkMode }: AddGoalModalProps) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#10B981');
  const [dueDate, setDueDate] = useState('');
  const { addGoal } = useApp();
  const theme = darkMode ? darkTheme : lightTheme;

  const handleSave = () => {
    if (title.trim()) {
      addGoal({ title, color, dueDate: dueDate || undefined });
      setTitle('');
      setColor('#10B981');
      setDueDate('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
          <ScrollView>
            <Text style={[styles.title, { color: theme.text }]}>
              Add New Goal
            </Text>

            <Text style={[styles.label, { color: theme.text }]}>Goal Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Lose 10 lbs, Read 12 books..."
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
              <Panel1 />
              <HueSlider />
              <Swatches
                colors={[
                  '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
                  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
                ]}
              />
            </ColorPicker>

            <Text style={[styles.label, { color: theme.text }]}>
              Due Date (Optional)
            </Text>
            <TextInput
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD (e.g., 2025-12-31)"
              placeholderTextColor={theme.placeholder}
              style={[styles.input, { 
                backgroundColor: theme.inputBg, 
                color: theme.text,
                borderColor: theme.border,
              }]}
            />

            <View style={styles.buttonRow}>
              <Pressable
                onPress={onClose}
                style={[styles.button, styles.buttonSecondary]}
              >
                <Text style={[styles.buttonText, { color: theme.text }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                style={[styles.button, { backgroundColor: color }]}
              >
                <Text style={styles.buttonText}>Save Goal</Text>
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
  buttonSecondary: {
    backgroundColor: '#E5E7EB',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
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