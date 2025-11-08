import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp, newId } from '../store';

export default function JournalScreen() {
  const systemTheme = useColorScheme();
  const darkMode = systemTheme === 'dark';
  const theme = darkMode ? darkStyles : lightStyles;
  
  const { entries, upsertEntry } = useApp();
  const today = new Date().toISOString().split('T')[0];

  const [journalText, setJournalText] = useState('');
  // Initialize entryId with a new ID, it will be overwritten if an entry exists
  // Use lazy initializer to only call newId() once
  const [entryId, setEntryId] = useState(() => newId());

  useEffect(() => {
    const todayEntry = entries.find(e => e.date === today && !e.habitId);
    if (todayEntry) {
      if (todayEntry.text !== journalText) {
        setJournalText(todayEntry.text || '');
      }
      if (todayEntry.id !== entryId) {
        setEntryId(todayEntry.id);
      }
    } else {
      // Reset text if no entry is found (e.g. date changes)
      if (journalText !== '') {
        setJournalText('');
      }
      // The ID is already set by useState initializer, no need to set it again
    }
  }, [entries, today, journalText, entryId]);

  const saveJournal = () => {
    if (journalText.trim()) {
      upsertEntry({
        id: entryId,
        date: today,
        text: journalText,
      });
      Alert.alert('Success', 'Journal entry saved!');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.text }]}>Daily Journal</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.promptTitle, { color: theme.text }]}>
            How are you feeling about your progress?
          </Text>
          <TextInput
            value={journalText}
            onChangeText={setJournalText}
            placeholder="Reflect on your habits, challenges, and victories..."
            placeholderTextColor={theme.placeholder}
            multiline
            numberOfLines={12}
            textAlignVertical="top"
            style={[styles.journalInput, { 
              backgroundColor: theme.inputBg, 
              color: theme.text,
              borderColor: theme.border,
            }]}
          />
          
          <Pressable
            onPress={saveJournal}
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.saveButtonText}>Save Entry</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.promptTitle, { color: theme.text }]}>
            Prompts to consider:
          </Text>
          <Text style={[styles.promptText, { color: theme.textSecondary }]}>
            • What habit felt easiest today?{'\n'}
            • What challenged you?{'\n'}
            • What are you grateful for?{'\n'}
            • What's one small win from today?{'\n'}
            • What will you focus on tomorrow?
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const baseStyles = {
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  promptTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  journalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 250,
    marginBottom: 16,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  promptText: { fontSize: 14, lineHeight: 24 },
};

const lightStyles = StyleSheet.create({
  ...baseStyles,
  bg: '#F8FAFC',
  cardBg: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  inputBg: '#F8FAFC',
  border: '#E2E8F0',
  placeholder: '#94A3B8',
  primary: '#6366F1',
});

const darkStyles = StyleSheet.create({
  ...baseStyles,
  bg: '#0F172A',
  cardBg: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  inputBg: '#0F172A',
  border: '#334155',
  placeholder: '#64748B',
  primary: '#818CF8',
});

const styles = StyleSheet.create(baseStyles);
