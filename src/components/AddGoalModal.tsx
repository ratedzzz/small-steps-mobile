import React, { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Goal } from "../types";

// Removed useApp/addGoal from here to prevent duplicates. 
// The Home Screen handles the saving now.

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  darkMode: boolean;
  goal?: Goal | null;
  onSave?: (goal: Partial<Goal>) => void;
  onDelete?: (goalId: string) => void;
}

const COLORS = [
  "#1DA27E", "#F1C453", "#3B82F6", "#EC4899",
  "#F97316", "#22C55E", "#FFD600", "#0FF0FC",
  "#FF3DFC", "#82FF58", "#3856FF", "#FC2347",
];

// Updated Theme: Dark Slate with Cyan Accents (Matches Home)
const THEME = {
  bg: "#1e293b",       // Slate 800 (Complimentary to Home's Slate 900)
  text: "#FFFFFF",
  inputBg: "#334155",  // Slate 700
  border: "#475569",   // Slate 600
  placeholder: "#94A3B8",
  primary: "#22d3ee",  // Cyan (High Contrast)
  primaryText: "#0f172a", // Dark text on Cyan button
  cancelBg: "#475569",
};

function toDisplayDate(raw?: string): string {
  if (!raw) return "";
  const parts = raw.split("-");
  if (parts.length !== 3) return raw;
  const [y, m, d] = parts;
  return `${m}-${d}-${y}`;
}

function toStoreDate(display: string): string | undefined {
  const digits = display.replace(/[^\d]/g, "");
  if (digits.length !== 8) return undefined;
  const mm = digits.slice(0, 2);
  const dd = digits.slice(2, 4);
  const yyyy = digits.slice(4);
  return `${yyyy}-${mm}-${dd}`;
}

export default function AddGoalModal({ visible, onClose, goal, onSave, onDelete }: AddGoalModalProps) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#F1C453");
  const [dueDisplay, setDueDisplay] = useState(""); 
  
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

  const handleDateChange = (text: string) => {
    // Auto-formatting MM-DD-YYYY
    const cleaned = text.replace(/[^0-9]/g, "");
    let formatted = "";
    if (cleaned.length > 0) {
      formatted += cleaned.substring(0, 2);
      if (cleaned.length > 2) formatted += "-" + cleaned.substring(2, 4);
      if (cleaned.length > 4) formatted += "-" + cleaned.substring(4, 8);
    }
    setDueDisplay(formatted);
  };

  const handleSave = () => {
    if (!title.trim()) return Alert.alert("Title Required", "Please enter a goal title.");
    
    let storedDate = undefined;
    if (dueDisplay.length > 0) {
      if (dueDisplay.replace(/[^0-9]/g, "").length !== 8) {
        return Alert.alert("Invalid Date", "Format must be MM-DD-YYYY");
      }
      storedDate = toStoreDate(dueDisplay);

      // --- VALIDATION: Check for Past Date ---
      if (storedDate) {
        const today = new Date().toISOString().split('T')[0];
        if (storedDate < today) {
          return Alert.alert("Invalid Date", "You cannot set a goal target in the past! Time travel isn't supported yet.");
        }
      }
    }

    const payload = { title: title.trim(), color, dueDate: storedDate };

    if (onSave) {
      if (isEditing && goal) {
        onSave({ id: goal.id, ...payload });
      } else {
        onSave(payload);
      }
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: THEME.bg }]}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { color: THEME.text }]}>{isEditing ? "Edit Goal" : "New Goal"}</Text>

            <Text style={[styles.label, { color: THEME.text }]}>Goal Title</Text>
            <TextInput
              value={title} 
              onChangeText={setTitle} 
              placeholder="Read 12 Books" 
              placeholderTextColor={THEME.placeholder}
              style={[styles.input, { backgroundColor: THEME.inputBg, borderColor: THEME.border, color: THEME.text }]}
            />

            <Text style={[styles.label, { color: THEME.text }]}>Color</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
              {COLORS.map((swatch) => (
                <Pressable
                  key={swatch} onPress={() => setColor(swatch)}
                  style={{
                    margin: 8, width: 40, height: 40, borderRadius: 20, backgroundColor: swatch,
                    borderWidth: color === swatch ? 3 : 1, borderColor: color === swatch ? "#FFF" : "transparent",
                  }}
                />
              ))}
            </View>

            <Text style={[styles.label, { color: THEME.text }]}>Target Date (MM-DD-YYYY)</Text>
            <TextInput
              value={dueDisplay} 
              onChangeText={handleDateChange} 
              placeholder="12-31-2025" 
              placeholderTextColor={THEME.placeholder}
              keyboardType="number-pad" 
              maxLength={10}
              style={[styles.input, { backgroundColor: THEME.inputBg, borderColor: THEME.border, color: THEME.text }]}
            />

            <View style={styles.buttonRow}>
              <Pressable onPress={onClose} style={[styles.button, { backgroundColor: THEME.cancelBg }]}>
                <Text style={{ color: "#FFF", fontWeight: "bold" }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSave} style={[styles.button, { backgroundColor: THEME.primary }]}>
                <Text style={{ color: THEME.primaryText, fontWeight: "bold" }}>Save</Text>
              </Pressable>
            </View>

            {isEditing && onDelete && goal && (
              <Pressable onPress={() => onDelete(goal.id)} style={[styles.deleteButton, { backgroundColor: "#EF4444" }]}>
                <Text style={{ color: "#FFF", fontWeight: "bold" }}>Delete Goal</Text>
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
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: 16 },
  container: { borderRadius: 24, padding: 24, maxHeight: "90%", width: '100%' },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 8 },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 24 },
  button: { flex: 1, padding: 16, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  deleteButton: { padding: 16, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 12 },
});