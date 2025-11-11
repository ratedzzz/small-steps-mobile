import React, { useMemo } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

type Props = {
  value: string;                 // e.g., "07:30 AM" or "19:30"
  onChange: (v: string) => void; // normalized string
  use12h?: boolean;              // show AM/PM if true
  dark?: boolean;
};

function normalize(input: string, use12h: boolean): string {
  let v = (input || '').toUpperCase().replace(/\s+/g, '');
  const ampmMatch = v.match(/(AM|PM)$/);
  const ampm = ampmMatch?.[1] as 'AM' | 'PM' | undefined;
  v = v.replace(/(AM|PM)$/, '');

  if (!v.includes(':')) {
    if (v.length >= 3) v = `${v.slice(0, v.length - 2)}:${v.slice(-2)}`;
  }

  const [hhRaw = '', mmRaw = ''] = v.split(':');
  let hh = parseInt(hhRaw || '0', 10);
  let mm = parseInt(mmRaw || '0', 10);
  if (Number.isNaN(hh)) hh = 0;
  if (Number.isNaN(mm)) mm = 0;
  mm = Math.max(0, Math.min(59, mm));

  if (use12h) {
    if (hh <= 0) hh = 12;
    if (hh > 12) hh = ((hh - 1) % 12) + 1;
    const ap = ampm ?? 'AM';
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${ap}`;
  } else {
    if (hh < 0) hh = 0;
    if (hh > 23) hh = hh % 24;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }
}

export default function TimeField({ value, onChange, use12h = true, dark }: Props) {
  const themed = dark ? DARK : LIGHT;
  const is12h = use12h;
  const display = useMemo(() => normalize(value || '', is12h), [value, is12h]);
  const hasAm = /\bAM\b/i.test(display);
  const hasPm = /\bPM\b/i.test(display);

  return (
    <View style={styles.row}>
      <View style={[styles.inputWrap, { borderColor: themed.border, backgroundColor: themed.inputBg }]}>
        <TextInput
          value={display.replace(/\b(AM|PM)\b/i, '').trim()}
          onChangeText={(t) => onChange(normalize(t, is12h))}
          placeholder="hh:mm"
          placeholderTextColor={themed.placeholder}
          keyboardType="default" // full keyboard so ':' is available
          autoCapitalize="characters"
          style={[styles.input, { color: themed.text }]}
        />
      </View>

      {is12h && (
        <View style={styles.segment}>
          <Pressable
            onPress={() => onChange(normalize(display.replace(/(AM|PM)/, '') + ' AM', true))}
            style={[
              styles.segBtn,
              { borderColor: themed.border, backgroundColor: hasAm ? themed.primary : themed.cardBg, marginRight: 8 },
            ]}
          >
            <Text style={[styles.segText, { color: hasAm ? '#fff' : themed.text }]}>AM</Text>
          </Pressable>
          <Pressable
            onPress={() => onChange(normalize(display.replace(/(AM|PM)/, '') + ' PM', true))}
            style={[
              styles.segBtn,
              { borderColor: themed.border, backgroundColor: hasPm ? themed.primary : themed.cardBg },
            ]}
          >
            <Text style={[styles.segText, { color: hasPm ? '#fff' : themed.text }]}>PM</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const base = {
  cardBg: '#FFFFFF',
  inputBg: '#F8FAFC',
  text: '#0F172A',
  border: '#E2E8F0',
  placeholder: '#94A3B8',
  primary: '#6366F1',
};
const LIGHT = base;
const DARK = {
  ...base,
  cardBg: '#1E293B',
  inputBg: '#0F172A',
  text: '#F1F5F9',
  border: '#334155',
  placeholder: '#64748B',
  primary: '#818CF8',
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  inputWrap: {
    flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginRight: 12,
  },
  input: { fontSize: 16 },
  segment: { flexDirection: 'row', alignItems: 'center' },
  segBtn: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  segText: { fontSize: 14, fontWeight: '600' },
});
