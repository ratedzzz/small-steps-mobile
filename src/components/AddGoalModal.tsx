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
  inputDark: "#052e33",
  borderDark: "#1C8585",
  mint: "#1DA27E",
  red: "#EF4444",
};

const COLORS = [
  "#1DA27E",
  "#F1C453",
  "#3B82F6",
  "#EC4899",
  "#F97316",
  "#22C55E",
  "#FFD600",
  "#0FF0FC",
  "#FF3DFC",
  "#82FF58",
  "#3856FF",
  "#FC2347",
];

const lightTheme = {
  bg: "#FFF9EC",
  text: "#15292E",
  inputBg: "#FFFFFF",
  border: "#E2E8F0",
  placeholder: "#94A3B8",
  primary: PALETTE.mint,
  cancelBg: PALETTE.teal,
  cancelText: "#FFFFFF",
};

const darkTheme = {
  bg: PALETTE.teal,
  text: "#EAF7F6",
  inputBg: PALETTE.inputDark,
  border: PALETTE.borderDark,
  placeholder: "#9FB8B6",
  primary: PALETTE.mint,
  cancelBg: PALETTE.deepTeal,
  cancelText: "#EAF7F6",
};

// HELPER: Convert "YYYY-MM-DD" -> "MM-DD-YYYY"
function toDisplayDate(raw?: string): string {
  if (!raw) return "";
  const parts = raw.split("-");
  if (parts.length !== 3) return raw;
  const [y, m, d] = parts;
  return `${m}-${d}-${y}`;
}

// HELPER: Convert "MM-DD-YYYY" -> "YYYY-MM-DD"
function toStoreDate(display: string): string | undefined {
  const digits = display.replace(/[^\d]/g, "");
  if (digits.length !== 8) return undefined;
  const mm = digits.slice(0, 2);
  const dd = digits.slice(2, 4);
  const yyyy = digits.slice(4);
  return `${yyyy}-${mm}-${dd}`;
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
  const isEditing = !!goal;

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

  // --- STRICT INPUT MASKING (Year must start with 2) ---
  const handleDateChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    let formatted = "";

    // Month (First 2 digits)
    if (cleaned.length > 0) {
      const m1 = parseInt(cleaned[0]);
      if (m1 > 1) return;
      formatted += cleaned[0];

      if (cleaned.length > 1) {
        const month = parseInt(cleaned.substring(0, 2));
        if (month < 1 || month > 12) return;
        formatted += cleaned[1] + "-";

        // Day
        if (cleaned.length > 2) {
          const d1 = parseInt(cleaned[2]);
          if (d1 > 3) return;
          formatted += cleaned[2];

          if (cleaned.length > 3) {
            const day = parseInt(cleaned.substring(2, 4));
            if (day < 1 || day > 31) return;
            formatted += cleaned[3] + "-";

            // Year (Strict 2000-2999)
            if (cleaned.length > 4) {
              const y1 = parseInt(cleaned[4]);
              if (y1 !== 2) return;
              formatted += cleaned[4];
              if (cleaned.length > 5) formatted += cleaned.substring(5, 8);
            }
          }
        }
      }
    }
    setDueDisplay(formatted);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Title Required", "Please enter a goal title.");
      return;
    }

    let storedDate = undefined;
    if (dueDisplay.length > 0) {
      if (dueDisplay.replace(/[^0-9]/g, "").length !== 8) {
        Alert.alert(
          "Incomplete Date",
          "Please finish entering the date (MM-DD-YYYY)."
        );
        return;
      }
      storedDate = toStoreDate(dueDisplay);
      const d = new Date(storedDate!);
      if (isNaN(d.getTime())) {
        Alert.alert("Invalid Date", "This date does not exist.");
        return;
      }
    }

    const payload = {
      title: title.trim(),
      color,
      dueDate: storedDate,
    };

    if (isEditing && goal && onSave) {
      onSave({ id: goal.id, ...payload });
    } else if (!isEditing) {
      const newGoal = addGoal(payload);
      if (onSave && newGoal) {
        // @ts-ignore
        onSave(newGoal);
      }
    }
    onClose();
  };

  const handleDelete = () => {
    if (isEditing && goal && onDelete) {
      Alert.alert("Delete Goal", "Are you sure? This cannot be undone.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(goal.id),
        },
      ]);
    }
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
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.title, { color: theme.text }]}>
              {isEditing ? "Edit Goal" : "New Goal"}
            </Text>

            {/* TITLE */}
            <Text style={[styles.label, { color: theme.text }]}>
              Goal Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Read 12 Books"
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

            {/* COLOR PICKER (Identical Fixed Size to Habit) */}
            <Text style={[styles.label, { color: theme.text }]}>Color</Text>
            <View style={styles.colorContainer}>
              {COLORS.map((swatch) => (
                <Pressable
                  key={swatch}
                  onPress={() => setColor(swatch)}
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: swatch,
                      borderColor:
                        color === swatch ? theme.text : "transparent",
                      borderWidth: color === swatch ? 2 : 0,
                      transform: [{ scale: color === swatch ? 1.15 : 1 }],
                    },
                  ]}
                />
              ))}
            </View>

            {/* DATE */}
            <Text style={[styles.label, { color: theme.text }]}>
              Target Date (Optional)
            </Text>
            <TextInput
              value={dueDisplay}
              onChangeText={handleDateChange}
              placeholder="MM-DD-YYYY"
              placeholderTextColor={theme.placeholder}
              keyboardType="number-pad"
              maxLength={10}
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
            />
            <Text
              style={{
                fontSize: 11,
                color: theme.placeholder,
                marginTop: -4,
                marginBottom: 24,
              }}
            >
              Format: MM-DD-YYYY
            </Text>

            {/* BUTTONS (Unified Style) */}
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
                  {isEditing ? "Save Changes" : "Save"}
                </Text>
              </Pressable>
            </View>

            {/* DELETE BUTTON */}
            {isEditing && (
              <Pressable
                onPress={handleDelete}
                style={[styles.deleteButton, { backgroundColor: PALETTE.red }]}
              >
                <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                  Delete Goal
                </Text>
              </Pressable>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 8,
  },

  // FIXED Color Swatches (Exactly 40x40, no flex sizing)
  colorContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
  },

  // Unified Buttons
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 24 },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 16, fontWeight: "bold" },
  deleteButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
});
