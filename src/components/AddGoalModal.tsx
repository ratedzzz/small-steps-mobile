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
import ColorPicker, { Swatches } from 'reanimated-color-picker';
import { useApp } from '../store';

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  darkMode: boolean;
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
  primary: PALETTE.goldSoft,
  cancelBg: PALETTE.teal,
  cancelText: '#FFFFFF',
};

const darkTheme = {
  bg: PALETTE.teal,
  text: '#EAF7F6',
  inputBg: PALETTE.deepTeal,
  border: PALETTE.aqua,
  placeholder: '#9FB8B6',
  primary: PALETTE.goldSoft,
  cancelBg: PALETTE.deepTeal,
  cancelText: '#EAF7F6',
};

export default function AddGoalModal({ visible, onClose, darkMode }: AddGoalModalProps) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#F1C453');
  const [dueDate, setDueDate] = useState('');
  const { addGoal } = useApp();
  const theme = darkMode ? darkTheme : lightTheme;

  const handleSave = () => {
    if (title.trim()) {
      addGoal({ 
        title: title.trim(), 
        color, 
        dueDate: dueDate.trim() || undefined 
      });
      setTitle('');
      setColor('#F1C453');
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
              <Swatches
                colors={[
                  '#F1C453', '#F59E0B', '#1DA27E', '#1C8585',
                  '#074047', '#15292E', '#EF4444', '#8B5CF6',
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
                <Text style={[styles.buttonText, { color: '#15292E' }]}>Save Goal</Text>
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
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
