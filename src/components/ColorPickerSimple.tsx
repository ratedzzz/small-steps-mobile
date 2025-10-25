// src/components/ColorPickerSimple.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

export type ColorPickerSimpleProps = {
  value: string;
  onChange: (color: string) => void;
};

// You can edit this palette to your brand colors
const COLORS = [
  '#FF6B6B', // red-ish
  '#FFD166', // yellow/gold
  '#06D6A0', // green
  '#4ECDC4', // teal
  '#118AB2', // blue
  '#9B5DE5', // purple
  '#FF9F1C', // orange
  '#C0C0C0', // gray
];

export default function ColorPickerSimple({ value, onChange }: ColorPickerSimpleProps) {
  return (
    <View style={styles.row}>
      {COLORS.map((c) => {
        const isSelected = c.toLowerCase() === value?.toLowerCase();
        return (
          <TouchableOpacity
            key={c}
            style={[
              styles.swatch,
              { backgroundColor: c },
              isSelected && styles.selected,
            ]}
            onPress={() => onChange(c)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
    elevation: 2,
  },
  selected: {
    borderColor: '#000',
    borderWidth: 3,
  },
});