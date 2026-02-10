import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// FIX: Adjust import path to step back from "screens" to "src"
import { useApp } from '../store'; 
// FIX: Import types explicitly to solve "implicit any" errors
import { Habit, Goal } from '../types';

export default function ArchivesScreen() {
  const router = useRouter();
  
  // 1. Grab data and update functions from the store
  const { habits, goals, updateHabit, updateGoal } = useApp();

  // 2. Filter for archived items only
  // Explicitly typing (h: Habit) ensures TypeScript knows what this is
  const archivedHabits = habits.filter((h: Habit) => h.archived);
  const archivedGoals = goals.filter((g: Goal) => g.archived);

  // Helper to un-archive a habit
  const handleRestoreHabit = (id: string) => {
    updateHabit(id, { archived: false });
  };

  // Helper to un-archive a goal
  const handleRestoreGoal = (id: string) => {
    updateGoal(id, { archived: false });
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4 shadow-sm flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Archives</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        
        {/* --- HABITS SECTION --- */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-600 mb-3">Archived Habits</Text>
          
          {archivedHabits.length === 0 ? (
            <View className="bg-white p-6 rounded-xl items-center border border-dashed border-gray-300">
              <Text className="text-gray-400">No archived habits.</Text>
            </View>
          ) : (
            archivedHabits.map((habit: Habit) => (
              <View 
                key={habit.id} 
                className="bg-white p-4 rounded-xl mb-3 flex-row items-center justify-between shadow-sm border border-gray-100"
              >
                <View className="flex-row items-center flex-1">
                  <View 
                    style={{ backgroundColor: habit.color }} 
                    className="w-4 h-12 rounded-full mr-4" 
                  />
                  <View>
                    <Text className="text-lg font-semibold text-gray-800">{habit.name}</Text>
                    <Text className="text-gray-400 text-xs">
                       Completed: {habit.completedDates.length} times
                    </Text>
                  </View>
                </View>

                {/* Restore Button */}
                <TouchableOpacity 
                  onPress={() => handleRestoreHabit(habit.id)}
                  className="bg-gray-100 p-2 rounded-full"
                >
                  <Ionicons name="refresh" size={20} color="#4B5563" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* --- GOALS SECTION --- */}
        <View className="mb-20">
          <Text className="text-lg font-bold text-gray-600 mb-3">Archived Goals</Text>

          {archivedGoals.length === 0 ? (
            <View className="bg-white p-6 rounded-xl items-center border border-dashed border-gray-300">
              <Text className="text-gray-400">No archived goals.</Text>
            </View>
          ) : (
            archivedGoals.map((goal: Goal) => (
              <View 
                key={goal.id} 
                className="bg-white p-4 rounded-xl mb-3 flex-row items-center justify-between shadow-sm border border-gray-100"
              >
                <View className="flex-row items-center flex-1">
                  <View 
                    style={{ backgroundColor: goal.color }} 
                    className="w-4 h-12 rounded-full mr-4" 
                  />
                  <View>
                    <Text className="text-lg font-semibold text-gray-800">{goal.title}</Text>
                    {goal.dueDate && (
                      <Text className="text-gray-400 text-xs">
                        Due: {new Date(goal.dueDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>

                 {/* Restore Button */}
                 <TouchableOpacity 
                  onPress={() => handleRestoreGoal(goal.id)}
                  className="bg-gray-100 p-2 rounded-full"
                >
                  <Ionicons name="refresh" size={20} color="#4B5563" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}