import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Modal, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useApp } from "../store";
import { Habit } from "../types";
import { MOUNTAIN_PALETTE } from "../theme";

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
  darkMode: boolean;
  habit?: Habit | null;
  onSave?: (habit: Partial<Habit>) => void;
  onDelete?: (habitId: string) => void;
}

const COLORS = [
  "#1DA27E", "#F1C453", "#3B82F6", "#EC4899",
  "#F97316", "#22C55E", "#FFD600", "#0FF0FC",
  "#FF3DFC", "#82FF58", "#3856FF", "#FC2347"
];

// Force Dark Navy Theme
const THEME = {
  bg: MOUNTAIN_PALETTE[4], // #001244
  text: "#FFFFFF",
  inputBg: "#002a5c",      // Lighter Navy input
  border: "#005086",       // Border color
  placeholder: "#94A3B8",
  primary: "#1DA27E",      // Mint Green Button
  cancelBg: "#334155",
};

function formatTimeInput(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length <= 2) return digits;
  const h = digits.slice(0, digits.length - 2);
  const m = digits.slice(-2);
  return `${parseInt(h, 10)}:${m}`;
}

export default function AddHabitModal({ visible, onClose, habit, onSave, onDelete }: AddHabitModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#1DA27E");
  const [reminderTime, setReminderTime] = useState("");
  const [amPm, setAmPm] = useState<"AM" | "PM">("AM");
  const { addHabit } = useApp();
  const isEditing = !!habit;

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setColor(habit.color);
      if (habit.reminderTime) {
        const [hours, minutes] = habit.reminderTime.split(":").map(Number);
        const isPM = hours >= 12;
        const displayHours = hours % 12 || 12;
        setReminderTime(`${displayHours}:${minutes.toString().padStart(2, "0")}`);
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
    if (Number.isNaN(hours)) return undefined;
    if (period === "PM" && hours !== 12) hours += 12;
    else if (period === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutesStr.padStart(2, "0").slice(0, 2)}`;
  };

  const handleSave = () => {
    if (!name.trim()) return Alert.alert("Name required", "Please enter a habit name.");
    const time24 = convertTo24Hour(reminderTime, amPm);
    const payload = { name: name.trim(), color, reminderTime: time24 };
    
    if (isEditing && onSave && habit) onSave({ id: habit.id, ...payload });
    else {
      const created = addHabit(payload);
      if (onSave && created) onSave(created);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: THEME.bg }]}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={[styles.title, { color: THEME.text }]}>{isEditing ? "Edit Habit" : "New Habit"}</Text>

            <Text style={[styles.label, { color: THEME.text }]}>Name</Text>
            <TextInput
              value={name} onChangeText={setName} placeholder="Drink water" placeholderTextColor={THEME.placeholder}
              style={[styles.input, { backgroundColor: THEME.inputBg, borderColor: THEME.border, color: THEME.text }]}
            />

            <Text style={[styles.label, { color: THEME.text }]}>Color</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
              {COLORS.map((swatch) => (
                <Pressable
                  key={swatch} onPress={() => setColor(swatch)}
                  style={{
                    margin: 8, width: 40, height: 40, borderRadius: 20, backgroundColor: swatch,
                    borderWidth: color === swatch ? 3 : 1, borderColor: color === swatch ? "#FFF" : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </View>

            <Text style={[styles.label, { color: THEME.text }]}>Reminder Time</Text>
            <View style={styles.timeRow}>
              <TextInput
                value={reminderTime} onChangeText={(t) => setReminderTime(formatTimeInput(t))}
                placeholder="7:30" placeholderTextColor={THEME.placeholder} keyboardType="number-pad"
                style={[styles.timeInput, { backgroundColor: THEME.inputBg, borderColor: THEME.border, color: THEME.text }]}
              />
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["AM", "PM"].map((p) => (
                  <Pressable key={p} onPress={() => setAmPm(p as any)}
                    style={[styles.amPmButton, { backgroundColor: amPm === p ? THEME.primary : THEME.inputBg, borderColor: THEME.border }]}>
                    <Text style={{ color: amPm === p ? "#FFF" : THEME.text, fontWeight: "bold" }}>{p}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.buttonRow}>
              <Pressable onPress={onClose} style={[styles.button, { backgroundColor: THEME.cancelBg }]}>
                <Text style={{ color: "#FFF", fontWeight: "bold" }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSave} style={[styles.button, { backgroundColor: THEME.primary }]}>
                <Text style={{ color: "#FFF", fontWeight: "bold" }}>Save</Text>
              </Pressable>
            </View>

            {isEditing && onDelete && habit && (
              <Pressable onPress={() => onDelete(habit.id)} style={[styles.deleteButton, { backgroundColor: "#EF4444" }]}>
                <Text style={{ color: "#FFF", fontWeight: "bold" }}>Delete Habit</Text>
              </Pressable>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)", justifyContent: "flex-end" },
  container: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90%" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 8 },
  timeRow: { flexDirection: "row", gap: 12, marginBottom: 8, alignItems: "center" },
  timeInput: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
  amPmButton: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 24 },
  button: { flex: 1, padding: 16, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  deleteButton: { padding: 16, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 12 },
});