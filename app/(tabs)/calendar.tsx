import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Alert
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

// --- AD BANNER ---
const AdBanner = () => (
  <View style={styles.adContainer}>
    <View style={styles.adContent}>
      <Text style={styles.adText}>ADVERTISEMENT</Text>
    </View>
  </View>
);

// --- HELPER TO GET JOURNAL PREVIEW ---
const getJournalPreview = (text: string) => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  return words.slice(0, 2).join(" ") + (words.length > 2 ? "..." : "");
};

export default function CalendarScreen() {
  const router = useRouter();
  // Fixed: Changed 'journals' to 'entries' to match your store
  const { habits, goals, entries, deleteHabit, updateHabit, deleteGoal, updateGoal } = useApp();
  
  // State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // --- FILTER DATA FOR SELECTED DATE ---
  const completedHabits = habits.filter(h => h.completedDates?.includes(selectedDate) && !h.archived);
  const uncompletedHabits = habits.filter(h => !h.completedDates?.includes(selectedDate) && !h.archived);
  const journalEntry = entries.find(j => j.date === selectedDate);

  // --- CUSTOM DAY COMPONENT ---
  const CustomDay = ({ date, state }: { date?: DateData; state?: string }) => {
    if (!date) return <View />;
    
    const isSelected = date.dateString === selectedDate;
    const isToday = date.dateString === new Date().toISOString().split("T")[0];
    
    // Habit Dots
    const habitDots = habits
      .filter(h => h.completedDates?.includes(date.dateString) && !h.archived)
      .map(h => h.color);
      
    // Goal Logic: [ Start, ] End, - Middle
    const activeGoals = goals.filter(g => !g.archived && g.dueDate);
    const goalMarkers = activeGoals.map(g => {
        // 1. If this is the Due Date -> `]`
        if (g.dueDate === date.dateString) return { char: ']', color: g.color };
        
        // 2. If this is the Creation Date (fallback to Today if missing) -> `[`
        const createdDate = g.createdAt ? g.createdAt.split('T')[0] : '';
        if (createdDate === date.dateString) return { char: '[', color: g.color };

        // 3. If in between -> `-` (Slash/Dash)
        if (createdDate && g.dueDate) {
            if (date.dateString > createdDate && date.dateString < g.dueDate) {
                return { char: '—', color: g.color };
            }
        }
        return null;
    }).filter(Boolean) as { char: string, color: string }[];

    // Limit goal markers to avoid UI explosion (max 3)
    const displayGoals = goalMarkers.slice(0, 3); 

    return (
      <TouchableOpacity 
        onPress={() => setSelectedDate(date.dateString)}
        style={[
            styles.dayContainer, 
            isSelected && styles.daySelected,
            isToday && !isSelected && styles.dayToday
        ]}
      >
        {/* Goal Markers Above */}
        <View style={styles.goalOverlay}>
            {displayGoals.map((m, i) => (
                <Text key={i} style={{ color: m.color, fontSize: 10, fontWeight: 'bold', lineHeight: 10 }}>
                    {m.char}
                </Text>
            ))}
        </View>

        <Text style={[
            styles.dayText, 
            state === 'disabled' ? styles.dayTextDisabled : {},
            isSelected ? styles.dayTextSelected : {}
        ]}>
          {date.day}
        </Text>

        {/* Habit Dots Below */}
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* 1. CALENDAR BOX */}
            <View style={styles.calendarWrapper}>
                <Calendar
                    current={selectedDate}
                    onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                    dayComponent={({ date, state }: any) => <CustomDay date={date} state={state} />}
                    theme={{
                        calendarBackground: 'transparent',
                        textSectionTitleColor: '#22d3ee', // Cyan headers
                        monthTextColor: '#FFFFFF',
                        arrowColor: '#22d3ee',
                        textDayHeaderFontWeight: 'bold'
                    }}
                    enableSwipeMonths
                />
            </View>

            {/* 2. HABITS COMPLETED TODAY */}
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
                            <Ionicons name="checkmark-circle" size={20} color={h.color} />
                        </Pressable>
                    ))
                )}
            </View>

            {/* 3. JOURNAL ENTRY BOX */}
            <TouchableOpacity 
                style={styles.journalBox}
                onPress={() => {
                   router.push('/journal'); 
                }}
            >
                <View style={styles.journalHeader}>
                    <Text style={styles.journalTitle}>Today's Journal</Text>
                    <Ionicons name="pencil" size={16} color="#22d3ee" />
                </View>
                {/* Fixed: Use .content instead of .text */}
                <Text style={styles.journalPreview}>
                    {journalEntry 
                        ? `"${getJournalPreview(journalEntry.content)}"` 
                        : "No journal entry today"}
                </Text>
            </TouchableOpacity>

            {/* 4. HABITS NOT COMPLETED */}
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
                            {/* Empty circle for uncompleted */}
                            <View style={[styles.circleOutline, { borderColor: h.color }]} />
                        </Pressable>
                    ))
                )}
            </View>

            {/* 5. LEGEND */}
            <View style={styles.legendBox}>
                <Text style={styles.legendHeader}>LEGEND</Text>
                
                <View style={styles.legendRow}>
                    {/* Column 1: Habits */}
                    <View style={styles.legendCol}>
                        <Text style={styles.legendSubHeader}>Habits</Text>
                        <View style={styles.legendItem}>
                            <View style={[styles.dot, { backgroundColor: '#F1C453', width: 8, height: 8 }]} />
                            <Text style={styles.legendText}>Completed</Text>
                        </View>
                        {/* Dot under Day explanation */}
                        <View style={styles.legendItem}>
                            <View style={[styles.dot, { backgroundColor: '#F1C453', width: 4, height: 4, marginTop: 4 }]} />
                            <Text style={styles.legendText}>Under Date = Done</Text>
                        </View>
                    </View>

                    {/* Column 2: Goals */}
                    <View style={styles.legendCol}>
                        <Text style={styles.legendSubHeader}>Goals</Text>
                        <View style={styles.legendItem}>
                            <Text style={[styles.legendSymbol, { color: '#22C55E' }]}>[</Text>
                            <Text style={styles.legendText}>Start</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <Text style={[styles.legendSymbol, { color: '#22C55E' }]}>—</Text>
                            <Text style={styles.legendText}>In Progress</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <Text style={[styles.legendSymbol, { color: '#22C55E' }]}>]</Text>
                            <Text style={styles.legendText}>Completed/Due</Text>
                        </View>
                    </View>
                </View>
            </View>

        </ScrollView>
        
        {/* AD BANNER */}
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
        />

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "transparent" },
  scrollContent: { padding: 16, paddingBottom: 100 }, // Space for Ad
  
  // Custom Calendar Styling
  calendarWrapper: {
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderRadius: 16,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#22d3ee",
  },
  dayContainer: {
    width: 32,
    height: 44, // Taller to fit markers above/below
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)', // Cyan tint
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22d3ee'
  },
  dayToday: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  dayText: {
    color: '#E2E8F0',
    fontWeight: '600',
    fontSize: 14,
  },
  dayTextSelected: {
    color: '#22d3ee',
    fontWeight: 'bold',
  },
  dayTextDisabled: {
    color: '#475569',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
    height: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  goalOverlay: {
    flexDirection: 'row',
    position: 'absolute',
    top: 2,
    gap: 1,
  },

  // Section Boxes (Consistent with Home)
  sectionBox: {
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#22d3ee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  emptyText: {
    color: '#94A3B8',
    fontStyle: 'italic',
    fontSize: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemText: {
    flex: 1,
    color: '#FFF',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  largeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  circleOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },

  // Journal Box (Specific Style)
  journalBox: {
    backgroundColor: '#F1C453', // Yellow accent from your palette
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
    elevation: 3,
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  journalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#001244',
  },
  journalPreview: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#001244',
    opacity: 0.8,
  },

  // Legend
  legendBox: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#475569',
  },
  legendHeader: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 1,
  },
  legendRow: {
    flexDirection: 'row',
  },
  legendCol: {
    flex: 1,
  },
  legendSubHeader: {
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    height: 20,
  },
  legendText: {
    color: '#CBD5E1',
    fontSize: 12,
    marginLeft: 8,
  },
  legendSymbol: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 15,
    textAlign: 'center',
  },

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
  adText: {
    color: '#94a3b8',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1
  }
});