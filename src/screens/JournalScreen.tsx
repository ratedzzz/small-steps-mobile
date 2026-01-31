import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useApp, newId } from '../store';
import { getLocalDate } from '../utils';
import { APP_THEME, MOUNTAIN_PALETTE } from '../theme';

export default function JournalScreen() {
  const { entries = [], upsertEntry } = useApp();
  const today = useMemo(() => getLocalDate(), []);
  const [journalText, setJournalText] = useState('');
  
  const todaysJournal = useMemo(() => entries.find((e: any) => e?.date === today && !e?.habitId && !e?.goalId), [entries, today]);

  useEffect(() => { if (todaysJournal?.text) setJournalText(todaysJournal.text); }, [todaysJournal]);

  const saveJournal = () => {
    upsertEntry({ id: todaysJournal?.id ?? newId(), date: today, text: journalText });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      // CRITICAL: Set background to transparent so the Gradient Wrapper shows through
      style={[styles.container, { backgroundColor: 'transparent' }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Main Card: Solid Navy Container */}
        <View style={[styles.card, { backgroundColor: APP_THEME.containerBackground }]}>
          <Text style={[styles.title, { color: APP_THEME.text }]}>Daily Journal</Text>
          <Text style={[styles.subtitle, { color: MOUNTAIN_PALETTE[1] }]}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          
          <Text style={[styles.promptTitle, { color: APP_THEME.text }]}>How are you feeling about your progress?</Text>
          
          {/* Input Box: Uses the Dark Blue Item Color (#055a8c) for contrast */}
          <TextInput
            style={[
              styles.journalInput, 
              { 
                backgroundColor: APP_THEME.cardBackground, // Dark Blue
                color: APP_THEME.text, 
                borderColor: APP_THEME.cardBackground // Match bg so no border line is needed
              }
            ]}
            multiline
            value={journalText}
            onChangeText={setJournalText}
            placeholder="Reflect on your habits..."
            placeholderTextColor={MOUNTAIN_PALETTE[1]} // Mist Blue
            textAlignVertical="top" 
          />
          
          {/* Save Button: Peach Accent */}
          <Pressable 
            style={({pressed}) => [
              styles.saveButton, 
              { backgroundColor: APP_THEME.accent, opacity: pressed ? 0.8 : 1 }
            ]} 
            onPress={saveJournal}
          >
            <Text style={[styles.saveButtonText, { color: APP_THEME.solidBackground }]}>Save Entry</Text>
          </Pressable>
        </View>

        {/* Prompts Card: Solid Navy Container */}
        <View style={[styles.card, { backgroundColor: APP_THEME.containerBackground }]}>
          <Text style={[styles.promptTitle, { color: APP_THEME.text }]}>Prompts:</Text>
          <Text style={[styles.promptText, { color: MOUNTAIN_PALETTE[1] }]}>
            • What habit felt easiest today?{'\n'}
            • What challenged you?{'\n'}
            • What are you grateful for?
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  card: { 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 8, 
    elevation: 3 
  },
  promptTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  journalInput: { 
    borderWidth: 1, 
    borderRadius: 12, 
    padding: 16, 
    fontSize: 16, 
    minHeight: 250, 
    marginBottom: 16, 
    textAlignVertical: 'top' 
  },
  saveButton: { padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: 'bold' },
  promptText: { fontSize: 14, lineHeight: 24 }
});