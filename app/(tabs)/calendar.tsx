import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Alert, 
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, DateData } from "react-native-calendars";
import { useRouter } from "expo-router"; 
import { Ionicons } from '@expo/vector-icons';

// Components & Store
import PageFlower from "../../src/components/PageFlower";
import { useApp } from "../../src/store";
import { APP_THEME } from "../../src/theme";
import AddHabitModal from "../../src/components/AddHabitModal";
import AddGoalModal from "../../src/components/AddGoalModal";
import { Habit, Goal } from "../../src/types";

// --- HELPER: ROBUST DATE MATCHING ---
const isSameDay = (dateString1: string, dateString2: string) => {
  if (!dateString1 || !dateString2) return false;
  return dateString1.split('T')[0] === dateString2.split('T')[0];
};

const getLocalDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- HELPER: Journal Preview ---
const getJournalPreview = (text: string) => {
  if (!text || text.trim() === "") return null;
  const words = text.trim().split(/\s+/);
  return words.slice(0, 2).join(" ") + (words.length > 2 ? "..." : "");
};

// --- COMPONENTS ---
const AdBanner = () => (
  <View style={styles.adContainer}>
    <View style={styles.adContent}>
      <Text style={styles.adText}>ADVERTISEMENT</Text>
    </View>
  </View>
);

const SubscribeBox = () => (
  <View style={styles.subscribeContainer}>
    <View style={styles.subscribeContent}>
      <View>
        <Text style={styles.subscribeTitle}>Go Premium</Text>
        <Text style={styles.subscribeSubtitle}>Remove ads & unlock stats</Text>
      </View>
      <TouchableOpacity style={styles.subscribeButton} onPress={() => Alert.alert("Coming Soon!")}>
        <Text style={styles.subscribeButtonText}>Upgrade</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function CalendarScreen() {
  const router = useRouter();
  
  const { habits, goals, entries, deleteHabit, updateHabit, deleteGoal, updateGoal } = useApp();
  
  const [selectedDate, setSelectedDate] = useState(getLocalDateString()); 
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // --- FILTER DATA ---
  const completedHabits = habits.filter(h => 
    !h.archived && h.completedDates?.some(d => isSameDay(d, selectedDate))
  );
  
  const uncompletedHabits = habits.filter(h => 
    !h.archived && !h.completedDates?.some(d => isSameDay(d, selectedDate))
  );
  
  const journalEntry = entries.find(j => isSameDay(j.date, selectedDate));
  const journalText = journalEntry ? (journalEntry.content || (journalEntry as any).text || "") : "";
  const journalPreview = getJournalPreview(journalText);

  // --- CUSTOM DAY COMPONENT ---
  const CustomDay = ({ date, state }: { date?: DateData; state?: string }) => {
    if (!date) return <View />;
    
    const isSelected = date.dateString === selectedDate;
    const isToday = date.dateString === getLocalDateString();
    
    // 1. Goal Markers
    const activeGoals = goals.filter(g => !g.archived);
    const dayMarkers = activeGoals.map(g => {
        const start = g.createdAt ? g.createdAt.split('T')[0] : '';
        const end = g.dueDate || '';
        const current = date.dateString;

        if (start && end && current >= start && current <= end) {
            return {
                color: g.color,
                char: current === start ? '[' : (current === end ? ']' : '—'),
                isDash: current !== start && current !== end
            };
        }
        return null;
    }).filter(Boolean);

    // 2. Habit Dots
    const habitDots = habits
      .filter(h => !h.archived && h.completedDates?.some(d => isSameDay(d, date.dateString)))
      .map(h => h.color);

    return (
      <TouchableOpacity 
        onPress={() => setSelectedDate(date.dateString)}
        style={[
            styles.dayContainer, 
            isSelected && styles.daySelected,
            isToday && !isSelected && styles.dayToday
        ]}
      >
        {/* GOAL SYMBOLS (Stacked Above) */}
        <View style={styles.goalStack}>
            {dayMarkers.slice(0, 3).map((m, i) => {
                 if (!m) return null; // FIX: Safety check removes TS error
                 return (
                    <View key={i} style={styles.markerRow}>
                        {m.isDash ? (
                            <View style={[styles.dash, { backgroundColor: m.color }]} />
                        ) : (
                            <Text style={[styles.bracket, { color: m.color }]}>{m.char}</Text>
                        )}
                    </View>
                 );
            })}
        </View>

        <Text style={[
            styles.dayText, 
            state === 'disabled' ? styles.dayTextDisabled : {},
            isSelected ? styles.dayTextSelected : {}
        ]}>
            {date.day}
        </Text>

        {/* HABIT DOTS (Stacked Below) */}
        <View style={styles.dotRow}>
          {habitDots.slice(0, 4).map((color, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: color }]} />
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={APP_THEME.mainGradient} style={{ flex: 1 }}>
      <PageFlower screen="calendar" />
      
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* 1. CALENDAR BOX */}
            <View style={styles.calendarWrapper}>
                <Calendar
                    current={selectedDate}
                    onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                    dayComponent={({ date, state }: any) => <CustomDay date={date} state={state} />}
                    theme={{
                        calendarBackground: 'transparent',
                        textSectionTitleColor: '#22d3ee', 
                        monthTextColor: '#FFFFFF',
                        arrowColor: '#22d3ee',
                        textDayHeaderFontWeight: 'bold'
                    }}
                    enableSwipeMonths
                    style={{ height: 400 }} // Increased height
                />
            </View>

            {/* 2. HABITS COMPLETED */}
            <View style={styles.sectionBox}>
                <Text style={styles.sectionTitle}>Habits Completed Today</Text>
                {completedHabits.length === 0 ? (
                    <Text style={styles.emptyText}>Nothing completed yet.</Text>
                ) : (
                    completedHabits.map(h => (
                        <Pressable 
                            key={h.id} 
                            style={styles.itemRow}
                            onPress={() => { setSelectedHabit(h); setShowHabitModal(true); }}
                        >
                            <View style={[styles.largeDot, { backgroundColor: h.color }]} />
                            <Text style={styles.itemText}>
                                {h.title || (h as any).name || "Untitled"}
                            </Text>
                        </Pressable>
                    ))
                )}
            </View>

            {/* 3. HABITS NOT COMPLETED */}
            <View style={styles.sectionBox}>
                <Text style={styles.sectionTitle}>Habits Not Yet Completed</Text>
                {uncompletedHabits.length === 0 ? (
                    <Text style={styles.emptyText}>All done for the day!</Text>
                ) : (
                    uncompletedHabits.map(h => (
                        <Pressable 
                            key={h.id} 
                            style={styles.itemRow}
                            onPress={() => { setSelectedHabit(h); setShowHabitModal(true); }}
                        >
                            <View style={[styles.largeDot, { backgroundColor: h.color }]} />
                            <Text style={styles.itemText}>
                                {h.title || (h as any).name || "Untitled"}
                            </Text>
                        </Pressable>
                    ))
                )}
            </View>

            {/* 4. GOAL BOX */}
            <View style={styles.goalBox}>
                <Text style={styles.goalBoxTitle}>Goals</Text>
                {goals.filter(g => !g.archived).length === 0 ? (
                    <Text style={styles.emptyText}>No active goals</Text>
                ) : (
                    goals.filter(g => !g.archived).map((goal) => (
                        <View key={goal.id} style={styles.goalListRow}>
                            <Text style={styles.goalHeader}>{goal.title || "Untitled Goal"}</Text>
                            <View style={styles.goalLegendItems}>
                                <Text style={styles.goalLegendLine}>
                                    <Text style={{ color: goal.color, fontWeight: 'bold' }}>[ </Text> Start
                                </Text>
                                <Text style={styles.goalLegendLine}>
                                    <Text style={{ color: goal.color, fontWeight: 'bold' }}>] </Text> End
                                </Text>
                                <Text style={styles.goalLegendLine}>
                                    <Text style={{ color: goal.color, fontWeight: 'bold' }}>— </Text> In Progress
                                </Text>
                            </View>
                        </View>
                    ))
                )}
            </View>

            {/* 5. JOURNAL PREVIEW */}
            <TouchableOpacity 
                style={styles.journalBox}
                onPress={() => router.push('/journal')}
            >
                <View style={styles.journalHeader}>
                    <Text style={styles.journalTitle}>Today's Journal</Text>
                    <Ionicons name="pencil" size={16} color="#001244" />
                </View>
                <Text style={styles.journalPreview}>
                    {journalPreview ? `"${journalPreview}"` : "Tap here to write your first entry..."}
                </Text>
            </TouchableOpacity>

            {/* 6. SUBSCRIBE BOX */}
            <SubscribeBox />

        </ScrollView>
        <AdBanner />

        {/* MODALS */}
        <AddHabitModal
          visible={showHabitModal}
          onClose={() => setShowHabitModal(false)}
          darkMode={true}
          habit={selectedHabit}
          onSave={(updated) => {
            if (selectedHabit) updateHabit(selectedHabit.id, updated);
            setShowHabitModal(false);
          }}
          onDelete={(id) => { deleteHabit(id); setShowHabitModal(false); }}
          onArchive={(id) => { updateHabit(id, { archived: true }); setShowHabitModal(false); }}
        />
        <AddGoalModal
          visible={showGoalModal} 
          onClose={() => setShowGoalModal(false)}
          darkMode={true}
          goal={selectedGoal}
          onSave={(updated) => {
             if (selectedGoal) updateGoal(selectedGoal.id, updated);
             setShowGoalModal(false);
          }}
          onDelete={(id) => { deleteGoal(id); setShowGoalModal(false); }}
          onArchive={(id) => { updateGoal(id, { archived: true }); setShowGoalModal(false); }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "transparent" },
  scrollContent: { padding: 16, paddingBottom: 120 }, 
  
  // Calendar Styling
  calendarWrapper: {
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderRadius: 16,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#22d3ee",
  },
  dayContainer: {
    width: 44, // Wider
    height: 52, // Taller
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#22d3ee'
  },
  dayToday: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  dayText: {
    color: '#E2E8F0',
    fontWeight: '600',
    fontSize: 14,
    zIndex: 2,
    marginTop: 2
  },
  dayTextSelected: { color: '#22d3ee', fontWeight: 'bold' },
  dayTextDisabled: { color: '#475569' },

  // Markers
  goalStack: {
    position: 'absolute',
    top: 4,
    width: '100%',
    alignItems: 'center',
    gap: 1
  },
  markerRow: {
    flexDirection: 'row',
    height: 6, // Specific height for bracket/dash
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  bracket: {
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 10,
  },
  dash: {
    width: 12,
    height: 2,
    borderRadius: 1,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 2,
    position: 'absolute',
    bottom: 4
  },
  dot: { width: 4, height: 4, borderRadius: 2 },

  // Sections
  sectionBox: {
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#22d3ee",
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#FFFFFF", marginBottom: 12 },
  emptyText: { color: '#94A3B8', fontStyle: 'italic', fontSize: 14 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemText: { flex: 1, color: '#FFF', marginLeft: 10, fontSize: 16, fontWeight: '600' },
  largeDot: { width: 12, height: 12, borderRadius: 6 },

  // Journal
  journalBox: {
    backgroundColor: '#F1C453',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
    elevation: 3,
  },
  journalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  journalTitle: { fontSize: 18, fontWeight: '800', color: '#001244' },
  journalPreview: { fontSize: 16, fontStyle: 'italic', color: '#001244', opacity: 0.8 },

  // Goals
  goalBox: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#22d3ee',
  },
  goalBoxTitle: {
    color: '#22d3ee', fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center', letterSpacing: 1,
  },
  goalListRow: { marginBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 10 },
  goalHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#FFFFFF' },
  goalLegendItems: { flexDirection: 'row', justifyContent: 'space-between' },
  goalLegendLine: { color: '#CBD5E1', fontSize: 12 },

  // Subscribe Box
  subscribeContainer: { marginBottom: 20, padding: 16, backgroundColor: '#F1C453', borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 6 },
  subscribeContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subscribeTitle: { fontSize: 18, fontWeight: '800', color: '#001244' },
  subscribeSubtitle: { fontSize: 12, color: '#001244', marginTop: 2 },
  subscribeButton: { backgroundColor: '#001244', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  subscribeButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  // Ad Banner
  adContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopWidth: 1,
    borderColor: '#334155',
  },
  adContent: {
    height: 50,
    backgroundColor: '#334155',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
    borderStyle: 'dashed'
  },
  adText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 }
});