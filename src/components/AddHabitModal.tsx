// src/components/AddHabitModal.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import ColorPicker, { Swatches } from "reanimated-color-picker";
import { useApp } from "../store";
import { Habit } from "../types";

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
  darkMode: boolean;
  habit?: Habit | null;
  onSave?: (habit: Partial<Habit>) => void;
  onDelete?: (habitId: string) => void;
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
  primary: PALETTE.mint,
  cancelBg: PALETTE.teal,
  cancelText: "#FFFFFF",
  deleteBg: "#EF4444",
};

const darkTheme = {
  bg: PALETTE.teal,
  text: "#EAF7F6",
  inputBg: PALETTE.deepTeal,
  border: PALETTE.aqua,
  placeholder: "#9FB8B6",
  primary: PALETTE.mint,
  cancelBg: PALETTE.deepTeal,
  cancelText: "#EAF7F6",
  deleteBg: "#EF4444",
};

// Simple helper: when user types "730" => "7:30"
function formatTimeInput(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length <= 2) {
    return digits;
  }
  const h = digits.slice(0, digits.length - 2);
  const m = digits.slice(-2);
  return `${parseInt(h, 10)}:${m}`;
}

export default function AddHabitModal({
  visible,
  onClose,
  darkMode,
  habit,
  onSave,
  onDelete,
}: AddHabitModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#1DA27E");
  const [reminderTime, setReminderTime] = useState("");
  const [amPm, setAmPm] = useState<"AM" | "PM">("AM");
  const { addHabit } = useApp();
  const theme = darkMode ? darkTheme : lightTheme;
  const isEditing = habit !== null && habit !== undefined;

  // Populate fields when editing or reset when adding
  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setColor(habit.color);
      if (habit.reminderTime) {
        const [hours, minutes] = habit.reminderTime.split(":").map(Number);
        const isPM = hours >= 12;
        const displayHours = hours % 12 || 12;
        setReminderTime(
          `${displayHours}:${minutes.toString().padStart(2, "0")}`
        );
        setAmPm(isPM ? "PM" : "AM");
      } else {
        setReminderTime("");
        setAmPm("AM");
      }
    } else {
      setName("");
      setColor("#1DA27E");
      setReminderTime("");
      setAmPm("AM");
    }
  }, [habit, visible]);

  const convertTo24Hour = (time: string, period: "AM" | "PM"): string | undefined => {
    if (!time) return undefined;
    const parts = time.split(":");
    if (parts.length < 2) return undefined;
    const [hoursStr, minutesStr] = parts;
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr || "00";
    if (Number.isNaN(hours)) return undefined;

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes.padStart(2, "0").slice(0, 2)}`;
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter a habit name.");
      return;
    }

    const time24 = convertTo24Hour(reminderTime, amPm);

    if (isEditing && onSave && habit) {
      // Update existing habit
      onSave({
        id: habit.id,
        name: name.trim(),
        color,
        reminderTime: time24,
      });
    } else if (!isEditing) {
      // New habit creation
      const created = addHabit({
        name: name.trim(),
        color,
        reminderTime: time24,
      });
      if (onSave && created) {
        onSave(created);
      }
    }

    onClose();
  };

  const handleDelete = () => {
    if (isEditing && onDelete && habit) {
      Alert.alert(
        "Delete Habit",
        `Are you sure you want to delete "${habit.name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => onDelete(habit.id),
          },
        ]
      );
    }
  };

  const handleTimeChange = (text: string) => {
    setReminderTime(formatTimeInput(text));
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
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={[styles.title, { color: theme.text }]}>
              {isEditing ? "Edit Habit" : "Add New Habit"}
            </Text>

            {/* Habit name */}
            <Text style={[styles.label, { color: theme.text }]}>Habit Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Drink water"
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

            {/* Color */}
            <Text style={[styles.label, { color: theme.text }]}>Color</Text>
<View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
  {[
    "#1DA27E",
    "#F1C453",
    "#3B82F6",
    "#EC4899",
    "#F97316",
    "#22C55E"
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
        opacity: color === swatch ? 1 : 0.7,
        transform: [{ scale: color === swatch ? 1.15 : 1 }]
      }}
    />
  ))}
</View>


            {/* Reminder time with auto ':' and AM/PM */}
            <Text style={[styles.label, { color: theme.text }]}>
              Reminder Time (Optional)
            </Text>
            <View style={styles.timeRow}>
              <TextInput
                value={reminderTime}
                onChangeText={handleTimeChange}
                placeholder="7:30"
                placeholderTextColor={theme.placeholder}
                keyboardType="number-pad"
                style={[
                  styles.timeInput,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                maxLength={5} // e.g. "12:30"
              />
              <View style={styles.amPmContainer}>
                <Pressable
                  onPress={() => setAmPm("AM")}
                  style={[
                    styles.amPmButton,
                    {
                      backgroundColor:
                        amPm === "AM" ? theme.primary : theme.inputBg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.amPmText,
                      {
                        color: amPm === "AM" ? "#FFFFFF" : theme.text,
                      },
                    ]}
                  >
                    AM
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setAmPm("PM")}
                  style={[
                    styles.amPmButton,
                    {
                      backgroundColor:
                        amPm === "PM" ? theme.primary : theme.inputBg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.amPmText,
                      {
                        color: amPm === "PM" ? "#FFFFFF" : theme.text,
                      },
                    ]}
                  >
                    PM
                  </Text>
                </Pressable>
              </View>
            </View>


<View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
  {[
    "#1DA27E", // mint
    "#F1C453", // gold
    "#3B82F6", // blue
    "#EC4899", // pink
    "#F97316", // orange
    "#22C55E", // green
    "#FFD600", // bright yellow
    "#0FF0FC", // bright cyan
    "#FF3DFC", // magenta
    "#82FF58", // bright lime
    "#3856FF", // bright blue
    "#FC2347", // hot red
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
        transform: [{ scale: color === swatch ? 1.15 : 1 }],
      }}
      android_ripple={{ color: "#aaa" }}
    />
  ))}
</View>


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
                  {isEditing ? "Save Changes" : "Save Habit"}
                </Text>
              </Pressable>
            </View>

            {isEditing && (
              <Pressable
                onPress={handleDelete}
                style={[styles.deleteButton, { backgroundColor: theme.deleteBg }]}
              >
                <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                  Delete Habit
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
  timeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
    alignItems: "center",
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  amPmContainer: {
    flexDirection: "row",
    gap: 8,
  },
  amPmButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  amPmText: {
    fontSize: 16,
    fontWeight: "bold",
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

