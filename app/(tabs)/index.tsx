import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Image,
  Alert,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from 'expo-image-picker'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { updateProfile, signOut } from 'firebase/auth'; 
import { Ionicons } from '@expo/vector-icons'; 

// IMPORTS
import AddGoalModal from "../../src/components/AddGoalModal";
import AddHabitModal from "../../src/components/AddHabitModal";
import GoalItem from "../../src/components/GoalItem";
import HabitItem from "../../src/components/HabitItem";
import PageFlower from "../../src/components/PageFlower"; 

import { useApp } from "../../src/store";
import { Goal, Habit } from "../../src/types";
import { APP_THEME } from "../../src/theme"; 
import { auth, storage } from "../../src/lib/firebase"; 

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

// --- COMPONENTS ---
const AdBanner = () => (
  <View style={styles.adContainer}>
    <View style={styles.adContent}>
      <Text style={styles.adText}>ADVERTISEMENT</Text>
    </View>
  </View>
);

const SubscribeBox = ({ onPress }: { onPress: () => void }) => (
  <View style={styles.subscribeContainer}>
    <View style={styles.subscribeContent}>
      <View>
        <Text style={styles.subscribeTitle}>Go Premium</Text>
        <Text style={styles.subscribeSubtitle}>Remove ads & unlock stats</Text>
      </View>
      <TouchableOpacity style={styles.subscribeButton} onPress={onPress}>
        <Text style={styles.subscribeButtonText}>Upgrade</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const quotes = [
  { text: "Small steps lead to big changes.", author: "Fred DeVito" },
  { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { text: "Success is the sum of small efforts.", author: "Robert Collier" },
  { text: "Little by little, one travels far.", author: "J.R.R. Tolkien" },
  { text: "Consistency is more important than perfection.", author: "Unknown" },
];

export default function HomeScreen() {
  const darkMode = useColorScheme() === "dark";

  const {
    habits = [],
    goals = [],
    pro,
    userName,
    userAvatar,
    setUser, 
    updateHabit,
    toggleHabit,
    deleteHabit,
    updateGoal,
    deleteGoal,
    addHabit,
    addGoal,
  } = useApp();

  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [dailyQuote, setDailyQuote] = useState(quotes[0]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [uploading, setUploading] = useState(false); 

  useEffect(() => {
    setDailyQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const today = getLocalDateString();
  const activeHabits = habits.filter((h) => !h.archived);
  const activeGoals = goals.filter((g) => !g.archived);

  // FIXED: Sync Logic with Robust Date Match
  const completedToday = useMemo(() => {
    return activeHabits.filter((h) => h.completedDates?.some(d => isSameDay(d, today))).length;
  }, [activeHabits, today]);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert("Permission needed", "We need access to your photos.");
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!auth.currentUser) return;
    setUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `users/${auth.currentUser.uid}/avatar.jpg`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
      setUser(auth.currentUser.uid, auth.currentUser.displayName || userName, downloadURL);
      Alert.alert("Success", "Avatar updated!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) { console.error(e); }
  };

  const handleToggle = (habitId: string) => { toggleHabit(habitId); };

  const handleEditHabit = (habit: Habit) => {
    setSelectedHabit(habit);
    setShowAddHabit(true);
  };

  const handleArchiveHabit = (id: string) => {
    Alert.alert("Archive Habit", "Move to archives?", [
      { text: "Cancel", style: "cancel" },
      { text: "Archive", style: "destructive", onPress: () => updateHabit(id, { archived: true }) }
    ]);
  };

  const handleArchiveGoal = (id: string) => {
    Alert.alert("Archive Goal", "Move to archives?", [
      { text: "Cancel", style: "cancel" },
      { text: "Archive", style: "destructive", onPress: () => updateGoal(id, { archived: true }) }
    ]);
  };

  const handleSaveHabit = (partial: Partial<Habit>) => {
    if (partial.id) {
      updateHabit(partial.id, partial);
    } else {
      addHabit({
        title: partial.title ?? "New Habit", 
        color: partial.color ?? "#1DA27E",
        reminderTime: partial.reminderTime,
      });
    }
    setShowAddHabit(false);
    setSelectedHabit(null);
  };

  const handleSaveGoal = (partial: Partial<Goal>) => {
    if (partial.id) {
      updateGoal(partial.id, partial);
    } else {
      addGoal({
        title: partial.title ?? "New Goal",
        color: partial.color ?? "#F1C453",
        dueDate: partial.dueDate,
      });
    }
    setShowAddGoal(false);
    setSelectedGoal(null);
  };

  return (
    <LinearGradient colors={APP_THEME.mainGradient} style={{ flex: 1 }}>
      <PageFlower screen="home" />

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent} 
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Hi, {userName || "Friend"}!</Text>
              <Text style={styles.subtitle}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </Text>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Ionicons name="log-out-outline" size={16} color="#22d3ee" />
                <Text style={styles.logoutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handlePickAvatar} disabled={uploading}>
              <View style={styles.avatarContainer}>
                {uploading ? <ActivityIndicator color="#FFF" style={{ marginTop: 15 }} /> : 
                 userAvatar ? <Image source={{ uri: userAvatar }} style={styles.avatar} /> : 
                 <View style={styles.avatarPlaceholder}><Text style={styles.avatarInitials}>{(userName?.[0] || "U").toUpperCase()}</Text></View>}
                <View style={styles.cameraIcon}><Ionicons name="camera" size={12} color="#FFF" /></View>
              </View>
            </TouchableOpacity>
          </View>

          {/* QUOTE */}
          <View style={styles.quoteBox}>
            <Text style={styles.quoteIcon}>"</Text>
            <Text style={styles.quoteText}>"{dailyQuote.text}"</Text>
            <Text style={styles.author}>— {dailyQuote.author}</Text>
          </View>

          {/* PROGRESS */}
          {activeHabits.length > 0 && (
            <View style={styles.progressBox}>
              <Text style={styles.progressTitle}>Habits Completed Today</Text>
              <Text style={styles.progressNumber}>{completedToday}/{activeHabits.length}</Text>
            </View>
          )}

          {/* HABITS */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily Habits</Text>
              <Pressable onPress={() => { setSelectedHabit(null); setShowAddHabit(true); }} style={({ pressed }) => [styles.addButton, { opacity: pressed ? 0.8 : 1 }]}>
                <Text style={styles.addButtonText}>+ Add</Text>
              </Pressable>
            </View>
            {activeHabits.length === 0 ? (
              <View style={styles.emptyState}><Text style={styles.emptyText}>No habits yet. Start by adding your first small step!</Text></View>
            ) : (
              activeHabits.map((habit) => <HabitItem key={habit.id} habit={habit} onToggle={handleToggle} onEdit={handleEditHabit} onArchive={() => handleArchiveHabit(habit.id)} />)
            )}
          </View>

          {/* GOALS */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Goals</Text>
              <Pressable onPress={() => { setSelectedGoal(null); setShowAddGoal(true); }} style={({ pressed }) => [styles.addButton, { opacity: pressed ? 0.8 : 1 }]}>
                <Text style={styles.addButtonText}>+ Add</Text>
              </Pressable>
            </View>
            {activeGoals.length === 0 ? (
              <View style={styles.emptyState}><Text style={styles.emptyText}>Set a goal to work towards!</Text></View>
            ) : (
              activeGoals.map((goal) => <GoalItem key={goal.id} goal={goal} darkMode={darkMode} onEdit={(g) => { setSelectedGoal(g); setShowAddGoal(true); }} onArchive={() => handleArchiveGoal(goal.id)} />)
            )}
          </View>

          {/* SUBSCRIBE BOX */}
          <SubscribeBox onPress={() => Alert.alert("Coming Soon!")} />

        </ScrollView>
        <AdBanner />

        {/* MODALS - Updated with onArchive prop */}
        <AddHabitModal 
          visible={showAddHabit} 
          onClose={() => setShowAddHabit(false)} 
          darkMode={darkMode} 
          habit={selectedHabit} 
          onSave={handleSaveHabit} 
          onDelete={(id) => { deleteHabit(id); setShowAddHabit(false); }} 
          onArchive={(id) => { updateHabit(id, { archived: true }); setShowAddHabit(false); }}
        />
        <AddGoalModal 
          visible={showAddGoal} 
          onClose={() => setShowAddGoal(false)} 
          darkMode={darkMode} 
          goal={selectedGoal} 
          onSave={handleSaveGoal} 
          onDelete={(id) => { deleteGoal(id); setShowAddGoal(false); }} 
          onArchive={(id) => { updateGoal(id, { archived: true }); setShowAddGoal(false); }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "transparent" },
  scrollContent: { padding: 16, paddingBottom: 150 }, 
  
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 10, paddingHorizontal: 8 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: 0.5, color: "#FFFFFF" },
  subtitle: { fontSize: 16, marginTop: 4, fontWeight: "600", color: "#E2E8F0" },
  logoutButton: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(34, 211, 238, 0.1)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, alignSelf: 'flex-start' },
  logoutText: { fontSize: 12, color: '#22d3ee', fontWeight: 'bold' },
  
  avatarContainer: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden', borderWidth: 2, borderColor: '#22d3ee', elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: {width:0, height:2}, position: 'relative' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', width: '100%', height: 20, justifyContent: 'center', alignItems: 'center' },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: { width: '100%', height: '100%', backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },

  quoteBox: { backgroundColor: "rgba(15, 23, 42, 0.7)", padding: 16, borderRadius: 16, marginBottom: 16, alignItems: "center", borderWidth: 1.5, borderColor: "#22d3ee" },
  quoteIcon: { fontSize: 40, lineHeight: 40, color: "#22d3ee", opacity: 0.8, marginBottom: -10 },
  quoteText: { fontSize: 16, fontStyle: "italic", textAlign: "center", lineHeight: 22, marginBottom: 6, color: "#FFFFFF" },
  author: { fontSize: 13, fontWeight: '600', opacity: 0.8, color: "#22d3ee" },

  progressBox: { backgroundColor: "rgba(15, 23, 42, 0.7)", padding: 16, borderRadius: 16, marginBottom: 16, alignItems: "center", borderWidth: 1.5, borderColor: "#22d3ee" },
  progressTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4, color: "#FFFFFF" },
  progressNumber: { fontSize: 36, fontWeight: "800", color: "#22d3ee" },

  sectionBox: { backgroundColor: "rgba(15, 23, 42, 0.7)", padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1.5, borderColor: "#22d3ee", width: '100%' },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", textAlign: 'left' },
  addButton: { backgroundColor: "#22d3ee", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  addButtonText: { color: "#0f172a", fontWeight: "bold", fontSize: 14 },
  emptyState: { paddingVertical: 20, alignItems: "center" },
  emptyText: { fontSize: 16, textAlign: "center", color: "#E2E8F0", opacity: 0.8 },

  // Subscribe Box
  subscribeContainer: { marginBottom: 20, padding: 16, backgroundColor: '#F1C453', borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 6 },
  subscribeContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subscribeTitle: { fontSize: 18, fontWeight: '800', color: '#001244' },
  subscribeSubtitle: { fontSize: 12, color: '#001244', marginTop: 2 },
  subscribeButton: { backgroundColor: '#001244', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  subscribeButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  adContainer: { position: 'absolute', bottom: 0, width: '100%', padding: 10, backgroundColor: 'rgba(15, 23, 42, 0.95)', borderTopWidth: 1, borderColor: '#334155' },
  adContent: { height: 50, backgroundColor: '#334155', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#475569', borderStyle: 'dashed' },
  adText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 }
});