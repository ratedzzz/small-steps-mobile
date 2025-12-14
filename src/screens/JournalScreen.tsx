// src/screens/JournalScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp, newId } from '../store';
import { getLocalDate } from '../utils';



const PALETTE = {
  tealBg: '#15292E',
  cardBg: '#074047',
  textLight: '#EAF7F6',
  textDark: '#0F172A',
  accent: '#1DA27E'
};

export default function JournalScreen() {
  const systemTheme = useColorScheme();
  const darkMode = systemTheme === 'dark';
  const theme = {
    bg: PALETTE.tealBg,
    cardBg: PALETTE.cardBg,
    text: PALETTE.textLight,
    inputBg: PALETTE.tealBg
  };

  const { entries = [], upsertEntry } = useApp();
  const today = useMemo(() => getLocalDate(), []);
  const [journalText, setJournalText] = useState('');
  const todaysJournal = useMemo(
    () => entries.find((e: any) => e?.date === today && !e?.habitId && !e?.goalId),
    [entries, today]
  );

  useEffect(() => {
    if (todaysJournal?.text) setJournalText(todaysJournal.text);
  }, [todaysJournal]);

  const saveJournal = () => {
    upsertEntry({
      id: todaysJournal?.id ?? newId(),
      date: today,
      text: journalText
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={styles.title}>Daily Journal</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          <Text style={styles.promptTitle}>How are you feeling about your progress?</Text>
          <TextInput
            style={[
              styles.journalInput,
              { backgroundColor: theme.inputBg, color: theme.text }
            ]}
            multiline
            value={journalText}
            onChangeText={setJournalText}
            placeholder="Reflect on your habits, challenges, and victories..."
            placeholderTextColor={PALETTE.textLight}
          />
          <Pressable style={[styles.saveButton, { backgroundColor: PALETTE.accent }]} onPress={saveJournal}>
            <Text style={styles.saveButtonText}>Save Entry</Text>
          </Pressable>
        </View>
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={styles.promptTitle}>Prompts to consider:</Text>
          <Text style={styles.promptText}>
            • What habit felt easiest today?{'\n'}
            • What challenged you?{'\n'}
            • What are you grateful for?{'\n'}
            • What’s one small win from today?{'\n'}
            • What will you focus on tomorrow?
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 4, color: PALETTE.textLight },
  subtitle: { fontSize: 14, marginBottom: 20, color: PALETTE.textLight },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  promptTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: PALETTE.textLight },
  journalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 250,
    marginBottom: 16
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  promptText: { fontSize: 14, lineHeight: 24, color: PALETTE.textLight }
});
