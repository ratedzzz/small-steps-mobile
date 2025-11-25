// src/components/AddGoalModal.tsx

import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useApp } from "../store";
import { Goal } from "../types";

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  darkMode: boolean;
  goal?: Goal | null;
  onSave?: (goal: Partial<Goal>) => void;
  onDelete?: (goalId: string) => void;
}

const PALETTE = {
  deepTeal: "#15292E",
  teal: "#074047",
  aqua: "#1C8585",
  mint: "#1DA27E",
  goldSoft: "#F1C453",
};

const lightTheme = {
  bg: "#FFF9EC",
  text: "#15292E",
  inputBg: "#FFFFFF",
  border: "#E2E8F0",
  placeholder: "#94A3B8",
  primary: PALETTE.goldSoft,
  cancelBg: PALETTE.teal,
  cancelText: "#FFFFFF",
};

const darkTheme = {
  bg: PALETTE.teal,
  text: "#EAF7F6",
  inputBg: PALETTE.deepTeal,
  border: PALETTE.aqua,
  placeholder: "#9FB8B6",
  primary: PALETTE.goldSoft,
  cancelBg: PALETTE.deepTeal,
  cancelText: "#EAF7F6",
};

// "YYYY-MM-DD" -> "MM-DD-YYYY"
function toDisplayDate(raw?: string): string {
  if (!raw) return "";
  const parts = raw.split("-");
  if (parts.length !== 3) return raw;
  const [y, m, d] = parts;
  return `${m}-${d}-${y}`;
}

// "MM-DD-YYYY" -> "YYYY-MM-DD"
function toStoreDate(display: string): string | undefined {
  const digits = display.replace(/[^\d]/g, "");
  if (digits.length !== 8) return undefined;
  const mm = digits.slice(0, 2);
  const dd = digits.slice(2, 4);
  const yyyy = digits.slice(4);
  return `${yyyy}-${mm}-${dd}`;
}

// Auto insert '-' as user types: "12252025" -> "12-25-2025"
function formatDisplayDate(input: string): string {
  const digits = input.replace(/[^\d]/g, "").slice(0, 8);
  const len = digits.length;
  if (len <= 2) return digits;
  if (len <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

export default function AddGoalModal({
  visible,
  onClose,
  darkMode,
  goal,
  onSave,
  onDelete,
}: AddGoalModalProps) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#F1C453");
  const [dueDisplay, setDueDisplay] = useState(""); // MM-DD-YYYY
  const { addGoal } = useApp();
  const theme = darkMode ? darkTheme : lightTheme;
  const isEditing = goal !== null && goal !== undefined;

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setColor(goal.color);
      setDueDisplay(toDisplayDate(goal.dueDate));
    } else {
      setTitle("");
      setColor("#F1C453");
      setDueDisplay("");
    }
  }, [goal, visible]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a goal title.");
      return;
    }

    const storedDate = toStoreDate(dueDisplay);

    if (isEditing && goal && onSave) {
      onSave({
        id: goal.id,
        title: title.trim(),
        color,
        dueDate: storedDate,
      });
    } else if (!isEditing) {
      const created = addGoal({
        title: title.trim(),
        color,
        dueDate: storedDate,
      });
      if (onSave && created) {
        onSave(created);
      }
    }

    onClose();
  };

  const handleDelete = () => {
    if (isEditing && goal && onDelete) {
      Alert.alert(
        "Delete Goal",
        `Are you sure you want to delete "${goal.title}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => onDelete(goal.id),
          },
        ]
      );
    }
  };

  const handleDateChange = (text: string) => {
    setDueDisplay(formatDisplayDate(text));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.title, { color: theme.text }]}>
              {isEditing ? "Edit Goal" : "Add New Goal"}
            </Text>

            {/* Goal title */}
            <Text style={[styles.label, { color: theme.text }]}>
              Goal Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Run a 5K"
              placeholderTextColor={theme.placeholder}
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
            />

            {/* Color - Only one 12-swatch row remains! */}
            <Text style={[styles.label, { color: theme.text }]}>Color</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
              {[
                "#1DA27E", "#F1C453", "#3B82F6", "#EC4899",
                "#F97316", "#22C55E", "#FFD600", "#0FF0FC",
                "#FF3DFC", "#82FF58", "#3856FF", "#FC2347"
              ].map((swatch) => (
                <Pressable
                  key={swatch}
                  onPress={() => setColor(swatch)}
                  style={{
                    margin: 8,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: swatch,
                    borderWidth: color === swatch ? 3 : 1,
                    borderColor: color === swatch ? "#333" : "#ccc",
                    opacity: color === swatch ? 1 : 0.75,
                    transform: [{ scale: color === swatch ? 1.15 : 1 }]
                  }}
                  android_ripple={{ color: "#aaa" }}
                />
              ))}
            </View>

            {/* Due date with auto mm-dd-yyyy formatting */}
            <Text style={[styles.label, { color: theme.text }]}>
              Due Date (Optional)
            </Text>
            <TextInput
              value={dueDisplay}
              onChangeText={handleDateChange}
              placeholder="MM-DD-YYYY"
              placeholderTextColor={theme.placeholder}
              keyboardType="number-pad"
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              maxLength={10}
            />

            {/* Buttons */}
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
                <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                  {isEditing ? "Save Changes" : "Save Goal"}
                </Text>
              </Pressable>
            </View>

            {isEditing && (
              <Pressable
                onPress={handleDelete}
                style={[styles.deleteButton, { backgroundColor: "#EF4444" }]}
              >
                <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                  Delete Goal
                </Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
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
    width: "100%",
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
});
