import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient'; 
import { Calendar, DateData } from 'react-native-calendars';
import { format, parse } from 'date-fns';

import { useApp } from '../../src/store';
import { Habit, Goal } from '../../src/types'; // Using the restored types file
import { APP_THEME } from '../../src/theme'; 

// Import your custom components
import AddHabitModal from '../../src/components/AddHabitModal';
import AddGoalModal from '../../src/components/AddGoalModal';
import PageFlower from '../../src/components/PageFlower';

export default function CalendarTab() {
  const darkMode = true; // Defaulting to dark mode
  const { entries = [], habits = [], goals = [], updateHabit, deleteHabit, updateGoal, deleteGoal, addHabit, addGoal } = useApp();
  
  // Helper for today's date
  const getLocalDate = () => new Date().toISOString().split('T')[0];
  const today = useMemo(() => getLocalDate(), []);
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // Modals State
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // --- HELPER: Format Date for Display ---
  const formattedDateTitle = useMemo(() => {
    try {
      const dateObj = parse(selectedDate, 'yyyy-MM-dd', new Date());
      return format(dateObj, 'EEEE, MMMM d');
    } catch (e) {
      return selectedDate;
    }
  }, [selectedDate]);

  // --- 1. CALCULATE MARKED DATES ---
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    const initDate = (date: string) => {
      if (!marks[date]) marks[date] = { dots: [], goalColor: null };
    };

    // Habits -> Dots
    habits.forEach((habit: Habit) => {
      const dates = habit.completedDates || [];
      dates.forEach((d: string) => {
        initDate(d);
        if (!marks[d].dots.some((dot: any) => dot.key === habit.id)) {
          marks[d].dots.push({ key: habit.id, color: habit.color });
        }
      });
    });

    // Goals -> Background Color
    goals.forEach((goal: Goal) => {
      const start = goal.createdAt ? goal.createdAt.split('T')[0] : today;
      const end = goal.dueDate;
      
      initDate(start);
      marks[start].goalColor = goal.color;
      
      if (end) {
        initDate(end);
        marks[end].goalColor = goal.color;
      }
    });

    return marks;
  }, [habits, goals, today]);

  // --- 2. FILTER DATA FOR SELECTED DAY ---
  const activeItems = useMemo(() => {
    const dayHabits = habits.filter(h => (h.completedDates || []).includes(selectedDate));
    const dayGoals = goals.filter(g => {
      const start = g.createdAt ? g.createdAt.split('T')[0] : today;
      return start === selectedDate || g.dueDate === selectedDate;
    });
    const journalEntry = entries.find(e => e.date === selectedDate && !e.habitId);
    return { dayHabits, dayGoals, journalEntry };
  }, [selectedDate, habits, goals, entries, today]);

  // --- 3. CUSTOM DAY COMPONENT ---
  const CustomDay = ({ date, state, marking }: { date?: DateData, state?: string, marking?: any }) => {
    if (!date) return <View />;

    const isSelected = date.dateString === selectedDate;
    const isToday = date.dateString === today;
    const goalColor = marking?.goalColor;
    const dots = marking?.dots || [];

    // Fallback colors
    const accentColor = APP_THEME.accent || '#88C0D0'; 
    const textColor = goalColor ? '#000000' : (state === 'disabled' ? '#475569' : '#FFFFFF');

    return (
      <TouchableOpacity 
        onPress={() => setSelectedDate(date.dateString)}
        activeOpacity={0.7}
        style={[
          styles.dayContainer,
          goalColor && { backgroundColor: goalColor },
          isSelected && { borderWidth: 2, borderColor: accentColor },
        ]}
      >
        <Text style={[
          styles.dayText,
          { color: textColor },
          isToday && !goalColor && { color: accentColor, fontWeight: 'bold' }
        ]}>
          {date.day}
        </Text>

        <View style={styles.dotsRow}>
          {dots.map((dot: any, index: number) => (
            <View 
              key={index} 
              style={[
                styles.miniDot, 
                { backgroundColor: dot.color },
                goalColor && { borderColor: 'rgba(0,0,0,0.2)', borderWidth: 0.5 } 
              ]} 
            />
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={APP_THEME.mainGradient || ['#2E3440', '#3B4252']} style={{ flex: 1 }}>
      
      {/* FLOWER COMPONENT */}
      <PageFlower screen="calendar" />

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* CALENDAR CARD */}
          <View style={[styles.card, { backgroundColor: APP_THEME.solidBackground || '#2E3440' }]}>
            <Calendar
              current={selectedDate}
              dayComponent={({ date, state, marking }) => (
                <CustomDay date={date} state={state} marking={marking} />
              )}
              markedDates={markedDates}
              theme={{
                calendarBackground: 'transparent',
                textSectionTitleColor: '#b6c1cd',
                arrowColor: APP_THEME.accent || '#88C0D0', 
                monthTextColor: '#ffffff',
                textMonthFontWeight: 'bold',
                textMonthFontSize: 16,
              }}
            />
          </View>

          {/* DETAILS CARD */}
          <View style={[styles.card, { backgroundColor: APP_THEME.solidBackground || '#2E3440' }]}>
            <Text style={[styles.sectionTitle, { color: '#FFF' }]}>
              {formattedDateTitle}
            </Text>

            {activeItems.dayHabits.length === 0 && activeItems.dayGoals.length === 0 && !activeItems.journalEntry && (
              <Text style={{ color: "#b4d2cf", fontStyle: 'italic', marginBottom: 10 }}>No activity recorded.</Text>
            )}

            {activeItems.dayHabits.map(h => (
              <Pressable 
                key={h.id} 
                style={[styles.itemRow, { backgroundColor: 'rgba(255,255,255,0.05)' }]} 
                onPress={() => { setSelectedHabit(h); setShowHabitModal(true); }}
              >
                <View style={[styles.dot, { backgroundColor: h.color }]} />
                <Text style={[styles.itemText, { color: '#FFF' }]}>{h.name}</Text>
                <Text style={styles.checkMark}>✓</Text>
              </Pressable>
            ))}

            {activeItems.dayGoals.map(g => (
              <Pressable 
                key={g.id} 
                style={[styles.itemRow, { backgroundColor: 'rgba(255,255,255,0.05)' }]} 
                onPress={() => { setSelectedGoal(g); setShowGoalModal(true); }}
              >
                <View style={[styles.square, { backgroundColor: g.color }]} />
                <Text style={[styles.itemText, { color: '#FFF' }]}>{g.title}</Text>
                <Text style={styles.goalLabel}>GOAL</Text>
              </Pressable>
            ))}
          </View>
          
          {/* JOURNAL ENTRY */}
          {activeItems.journalEntry && (
            <View style={[styles.card, { backgroundColor: APP_THEME.solidBackground || '#2E3440' }]}>
              <Text style={{ color: APP_THEME.accent || '#88C0D0', fontWeight: 'bold', marginBottom: 8, fontSize: 16 }}>Today's Journal</Text>
              <Text style={{ color: '#FFF', fontStyle: 'italic', lineHeight: 22 }}>
                "{activeItems.journalEntry.text}"
              </Text>
            </View>
          )}

          {/* LEGEND SECTION */}
          {(habits.length > 0 || goals.length > 0) && (
            <View style={[styles.card, { backgroundColor: APP_THEME.solidBackground || '#2E3440', marginTop: 10 }]}>
              <Text style={[styles.legendTitle, { color: APP_THEME.accent || '#88C0D0' }]}>Legend</Text>
              <View style={styles.legendContainer}>
                {habits.map(h => (
                  <View key={h.id} style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: h.color, width: 8, height: 8 }]} />
                    <Text style={[styles.legendText, { color: '#b4d2cf' }]} numberOfLines={1}>{h.name}</Text>
                  </View>
                ))}
                {goals.map(g => (
                  <View key={g.id} style={styles.legendItem}>
                    <View style={[styles.square, { backgroundColor: g.color, width: 8, height: 8 }]} />
                    <Text style={[styles.legendText, { color: '#b4d2cf' }]} numberOfLines={1}>{g.title}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        </ScrollView>

        {/* MODALS connected to Store Actions */}
        <AddHabitModal 
          visible={showHabitModal} 
          onClose={() => setShowHabitModal(false)} 
          darkMode={darkMode} 
          habit={selectedHabit} 
          onSave={(p: any) => { 
            if(p.id) updateHabit(p.id, p); 
            else addHabit(p); 
            setShowHabitModal(false); 
          }} 
          onDelete={(id: string) => { 
            deleteHabit(id); 
            setShowHabitModal(false); 
          }} 
        />

        <AddGoalModal 
          visible={showGoalModal} 
          onClose={() => setShowGoalModal(false)} 
          darkMode={darkMode} 
          goal={selectedGoal} 
          onSave={(p: any) => { 
            if(p.id) updateGoal(p.id, p); 
            else addGoal(p); 
            setShowGoalModal(false); 
          }} 
          onDelete={(id: string) => { 
            deleteGoal(id); 
            setShowGoalModal(false); 
          }} 
        />

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100, gap: 16 },
  
  card: { 
    borderRadius: 20, 
    padding: 16, 
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowRadius: 8, 
    shadowOffset: { width: 0, height: 4 },
    elevation: 4 
  },
  
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16, letterSpacing: 0.5 },
  
  itemRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
  },
  
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  square: { width: 12, height: 12, borderRadius: 3, marginRight: 12 },
  itemText: { fontSize: 16, fontWeight: '600', flex: 1 },
  checkMark: { color: '#4ade80', fontWeight: 'bold', fontSize: 16 },
  goalLabel: { color: '#F1C453', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

  dayContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2, 
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    position: 'absolute',
    bottom: 3,
  },
  miniDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    minWidth: '40%',
  },
  legendText: {
    fontSize: 12,
    marginLeft: 6,
  },
});