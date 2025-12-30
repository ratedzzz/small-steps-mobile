import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars';
import { useApp } from '../../src/store';
import { Habit, Goal } from '../../src/types';
import { getLocalDate } from '../../src/utils';
// UPDATED IMPORT:
import { APP_THEME } from '../../src/theme';

import AddHabitModal from '../../src/components/AddHabitModal';
import AddGoalModal from '../../src/components/AddGoalModal';

// --- THEME CONFIG ---
const THEME = {
  bg: APP_THEME.solidBackground, // UPDATED: Deep Navy
  cardBg: "#002a5c",       
  text: "#FFFFFF",
  textSecondary: "#b0cac7", 
  gold: "#F1C453",
};

export default function CalendarTab() {
  const darkMode = true; 

  const { 
    entries = [], 
    habits = [], 
    goals = [],
    updateHabit,
    deleteHabit,
    updateGoal,
    deleteGoal,
    addHabit,
    addGoal
  } = useApp();
  
  const today = useMemo(() => getLocalDate(), []);
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // --- MODAL STATE ---
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // --- 1. CALCULATE MARKED DATES ---
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    const initDate = (date: string) => {
      if (!marks[date]) {
        marks[date] = { 
          dots: [], 
          customStyles: { container: {}, text: {} }
        };
      }
    };

    // A. Habits -> DOTS
    habits.forEach((habit: Habit) => {
      const datesToCheck = habit.completedDates || (habit.doneDate ? [habit.doneDate] : []);
      datesToCheck.forEach((dateString: string) => {
        initDate(dateString);
        const exists = marks[dateString].dots.some((d: any) => d.key === `habit-${habit.id}`);
        if (!exists) {
          marks[dateString].dots.push({ key: `habit-${habit.id}`, color: habit.color });
        }
      });
    });

    // B. Goals -> SQUARES
    goals.forEach((goal: Goal) => {
      const start = goal.createdAt ? goal.createdAt.split('T')[0] : today;
      const end = goal.dueDate;

      initDate(start);
      marks[start].customStyles.container = {
        backgroundColor: goal.color,
        borderRadius: 4, 
        width: '100%',
      };
      marks[start].customStyles.text = { color: 'black', fontWeight: 'bold' };

      if (end) {
        initDate(end);
        marks[end].customStyles.container = {
          backgroundColor: goal.color,
          borderRadius: 4,
          width: '100%',
        };
        marks[end].customStyles.text = { color: 'black', fontWeight: 'bold' };
      }
    });

    // C. Selection Highlight
    initDate(selectedDate);
    const existingContainer = marks[selectedDate].customStyles.container;
    marks[selectedDate].customStyles.container = {
      ...existingContainer,
      borderWidth: 2,
      borderColor: THEME.gold,
    };

    return marks;
  }, [habits, goals, selectedDate, today]);

  // --- 2. FILTER DATA FOR SELECTED DAY ---
  const activeItemsOnDay = useMemo(() => {
    const dayHabits = habits.filter(h => {
      const dates = h.completedDates || [];
      return dates.includes(selectedDate);
    });

    const dayGoals = goals.filter(g => {
      const start = g.createdAt ? g.createdAt.split('T')[0] : today;
      const end = g.dueDate;
      const isStart = start === selectedDate;
      const isEnd = end === selectedDate;
      return isStart || isEnd;
    });

    const journalEntry = entries.find(e => e.date === selectedDate && !e.habitId);

    return { dayHabits, dayGoals, journalEntry };
  }, [selectedDate, habits, goals, entries, today]);

  // --- HANDLERS ---
  const handleHabitClick = (h: Habit) => {
    setSelectedHabit(h);
    setShowHabitModal(true);
  };

  const handleGoalClick = (g: Goal) => {
    setSelectedGoal(g);
    setShowGoalModal(true);
  };

  const handleSaveHabit = (partial: Partial<Habit>) => {
    if (partial.id) updateHabit(partial.id, partial);
    else addHabit(partial);
    setShowHabitModal(false);
  };

  const handleSaveGoal = (partial: Partial<Goal>) => {
    if (partial.id) updateGoal(partial.id, partial);
    else addGoal(partial);
    setShowGoalModal(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: THEME.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* CALENDAR CARD */}
        <View style={[styles.card, { backgroundColor: THEME.cardBg }]}>
          <Calendar
            current={selectedDate}
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            markingType={'custom'}
            markedDates={markedDates}
            theme={{
              backgroundColor: THEME.cardBg,
              calendarBackground: THEME.cardBg,
              monthTextColor: THEME.text,
              dayTextColor: THEME.text,
              todayTextColor: THEME.gold,
              arrowColor: THEME.gold,
              textDisabledColor: '#475569',
            }}
          />
        </View>

        {/* DETAILS SECTION */}
        <View style={[styles.card, { backgroundColor: THEME.cardBg }]}>
          <Text style={[styles.sectionTitle, { color: THEME.text }]}>
            {new Date(selectedDate).toLocaleDateString(undefined, {
              weekday: 'long', month: 'long', day: 'numeric'
            })}
          </Text>

          {activeItemsOnDay.dayHabits.length === 0 && 
           activeItemsOnDay.dayGoals.length === 0 && 
           !activeItemsOnDay.journalEntry && (
            <Text style={{ color: THEME.textSecondary, fontStyle: 'italic' }}>
              No activity recorded.
            </Text>
          )}

          {/* Habits List */}
          {activeItemsOnDay.dayHabits.map(h => (
            <Pressable 
              key={h.id} 
              style={({pressed}) => [styles.itemRow, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => handleHabitClick(h)}
            >
              <View style={[styles.dot, { backgroundColor: h.color }]} />
              <Text style={[styles.itemText, { color: THEME.text }]}>
                Completed: <Text style={{fontWeight: 'bold'}}>{h.name}</Text>
              </Text>
            </Pressable>
          ))}

          {/* Goals List */}
          {activeItemsOnDay.dayGoals.map(g => {
            let label = "Active Goal";
            if (g.createdAt?.startsWith(selectedDate)) label = "START";
            if (g.dueDate === selectedDate) label = "DUE";

            return (
              <Pressable 
                key={g.id} 
                style={({pressed}) => [styles.itemRow, { opacity: pressed ? 0.7 : 1 }]}
                onPress={() => handleGoalClick(g)}
              >
                <View style={[styles.square, { backgroundColor: g.color }]} />
                <Text style={[styles.itemText, { color: THEME.text }]}>
                  {label}: <Text style={{fontWeight: 'bold'}}>{g.title}</Text>
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* JOURNAL PREVIEW */}
        {activeItemsOnDay.journalEntry && (
          <View style={[styles.card, { backgroundColor: THEME.cardBg, borderColor: THEME.textSecondary, borderWidth: 0.5 }]}>
            <Text style={[styles.legendTitle, { color: THEME.textSecondary }]}>Journal Entry</Text>
            <Text style={[styles.itemText, { color: THEME.text, fontStyle: 'italic' }]} numberOfLines={2}>
              "{activeItemsOnDay.journalEntry.text}"
            </Text>
          </View>
        )}

      </ScrollView>

      {/* EDIT MODALS */}
      <AddHabitModal
        visible={showHabitModal}
        onClose={() => setShowHabitModal(false)}
        darkMode={darkMode}
        habit={selectedHabit}
        onSave={handleSaveHabit}
        onDelete={(id) => { deleteHabit(id); setShowHabitModal(false); }}
      />
      
      <AddGoalModal
        visible={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        darkMode={darkMode}
        goal={selectedGoal}
        onSave={handleSaveGoal}
        onDelete={(id) => { deleteGoal(id); setShowGoalModal(false); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100, gap: 16 },
  card: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  square: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 10,
  },
  itemText: {
    fontSize: 15,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
});