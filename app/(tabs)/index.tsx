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

// --- AD BANNER COMPONENT ---
const AdBanner = () => (
  <View style={styles.adContainer}>
    <View style={styles.adContent}>
      <Text style={styles.adText}>ADVERTISEMENT</Text>
    </View>
  </View>
);

// --- CONTENT ---
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

  // Today's Date (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  const completedToday = useMemo(() => {
    return habits.filter((h) => h.completedDates?.includes(today)).length;
  }, [habits, today]);

  // --- AVATAR LOGIC ---
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
      // Update Store
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
      // The _layout.tsx will automatically detect this and send you to Login
    } catch (e) {
      console.error(e);
    }
  };

  // --- ITEM HANDLERS ---
  const handleToggle = (habitId: string) => {
    toggleHabit(habitId);
  };

  const handleEditHabit = (habit: Habit) => {
    setSelectedHabit(habit);
    setShowAddHabit(true);
  };

  const handleSaveHabit = (partial: Partial<Habit>) => {
    if (partial.id) {
      updateHabit(partial.id, partial);
    } else {
      addHabit({
        name: partial.name ?? "New Habit",
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
              <Text style={[styles.title, { color: "#001244", fontSize: 28 }]}>
                Hi, {userName || "Friend"}!
              </Text>
              <Text style={[styles.subtitle, { color: "#005086" }]}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              
              {/* LOGOUT BUTTON - More prominent now */}
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Ionicons name="log-out-outline" size={16} color="#005086" />
                <Text style={styles.logoutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
            
            {/* Avatar - TAP TO UPLOAD */}
            <TouchableOpacity onPress={handlePickAvatar} disabled={uploading}>
              <View style={styles.avatarContainer}>
                {uploading ? (
                  <ActivityIndicator color="#FFF" style={{ marginTop: 15 }} />
                ) : userAvatar ? (
                  <Image source={{ uri: userAvatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>
                      {(userName?.[0] || "U").toUpperCase()}
                    </Text>
                  </View>
                )}
                {/* Camera Icon Overlay */}
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={12} color="#FFF" />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Daily Quote */}
          <View style={styles.glassCard}>
            <Text style={styles.quoteIcon}>"</Text>
            <Text style={styles.quoteText}>"{dailyQuote.text}"</Text>
            <Text style={styles.author}>— {dailyQuote.author}</Text>
          </View>

          {/* Progress Summary */}
          {habits.length > 0 && (
            <View style={styles.glassCard}>
              <Text style={styles.progressTitle}>Habits Completed Today</Text>
              <Text style={styles.progressNumber}>
                {completedToday}/{habits.length}
              </Text>
            </View>
          )}

          {/* --- HABITS SECTION --- */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily Habits</Text>
              <Pressable
                onPress={() => {
                  setSelectedHabit(null);
                  setShowAddHabit(true);
                }}
                style={({ pressed }) => [
                  styles.addButton,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </Pressable>
            </View>

            {habits.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No habits yet. Start by adding your first small step!
                </Text>
              </View>
            ) : (
              habits.map((habit) => (
                <HabitItem
                  key={habit.id}
                  habit={habit}
                  onToggle={handleToggle}
                  onEdit={handleEditHabit} 
                />
              ))
            )}
          </View>

          {/* --- GOALS SECTION --- */}
          <View style={[styles.glassCard, { marginTop: 10 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Goals</Text>
              <Pressable
                onPress={() => {
                  setSelectedGoal(null);
                  setShowAddGoal(true);
                }}
                style={({ pressed }) => [
                  styles.addButton,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </Pressable>
            </View>

            {goals.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Set a goal to work towards!
                </Text>
              </View>
            ) : (
              goals.map((goal) => (
                <GoalItem
                  key={goal.id}
                  goal={goal}
                  darkMode={darkMode}
                  onEdit={(g: Goal) => {
                    setSelectedGoal(g);
                    setShowAddGoal(true);
                  }}
                />
              ))
            )}
          </View>

          {/* Pro CTA */}
          {!pro && (
            <View style={styles.proCard}>
              <Text style={styles.proTitle}>🌟 Upgrade to Pro</Text>
              <Text style={styles.proText}>
                Unlock unlimited habits, advanced analytics, and more!
              </Text>
              <Pressable style={styles.proButton} onPress={() => Alert.alert("Coming Soon!")}>
                <Text style={styles.proButtonText}>Learn More</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* --- AD BANNER (Fixed at bottom) --- */}
        <AdBanner />

        {/* --- MODALS --- */}
        <AddHabitModal
          visible={showAddHabit}
          onClose={() => setShowAddHabit(false)}
          darkMode={darkMode}
          habit={selectedHabit}
          onSave={handleSaveHabit}
          onDelete={(id) => { deleteHabit(id); setShowAddHabit(false); }}
        />

        <AddGoalModal
          visible={showAddGoal}
          onClose={() => setShowAddGoal(false)}
          darkMode={darkMode}
          goal={selectedGoal}
          onSave={handleSaveGoal}
          onDelete={(id) => { deleteGoal(id); setShowAddGoal(false); }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "transparent" },
  scrollContent: { padding: 16, paddingBottom: 20 }, // Less bottom padding since Ad is separate
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 10,
    paddingHorizontal: 8,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width:0, height:2},
    position: 'relative'
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#005086',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: { fontSize: 34, fontWeight: "800", letterSpacing: 0.5 },
  subtitle: { fontSize: 16, marginTop: 4, fontWeight: "600" },
  
  logoutButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 80, 134, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  logoutText: {
    fontSize: 12,
    color: '#005086',
    fontWeight: 'bold'
  },

  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.45)", 
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#001244",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  quoteIcon: {
    fontSize: 40,
    lineHeight: 40,
    color: "#001244",
    opacity: 0.5,
    marginBottom: -10,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 6,
    color: "#001244",
  },
  author: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
    color: "#005086",
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    color: "#001244",
  },
  progressNumber: {
    fontSize: 36,
    fontWeight: "800",
    color: "#005086",
  },
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#001244",
  },
  addButton: {
    backgroundColor: "#001244",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#001244",
    opacity: 0.6,
  },
  proCard: {
    backgroundColor: "#F1C453",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  proTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#001244",
  },
  proText: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
    color: "#001244",
    opacity: 0.8,
  },
  proButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  proButtonText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#001244",
  },
  // AD BANNER STYLES
  adContainer: {
    width: '100%',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  adContent: {
    height: 50,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
    borderStyle: 'dashed'
  },
  adText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1
  }
});