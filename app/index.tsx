import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  FlatList,
  TextInput,
  Switch,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useApp } from '../src/store';


const COLOR_SWATCHES = [
  '#00BCD4', // Blue
  '#8BC34A', // Green
  '#F44336', // Red
  '#9C27B0', // Purple
  '#FFC107', // Amber
  '#607D8B', // Slate
];

export default function HomeScreen() {
  const systemTheme = useColorScheme();
  const [darkTheme, setDarkTheme] = useState(systemTheme === 'dark');
  const theme = darkTheme ? darkStyles : lightStyles;

  const [habitName, setHabitName] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [selectedHabitColor, setSelectedHabitColor] = useState(COLOR_SWATCHES[0]);
  const [selectedGoalColor, setSelectedGoalColor] = useState(COLOR_SWATCHES[2]);

  const { habits, goals, addHabit, addGoal } = useApp();

  return (
    <SafeAreaView style={theme.container}>
      <View style={theme.row}>
        <Text style={theme.title}>Small Steps</Text>
        <View style={theme.switchRow}>
          <Text style={theme.text}>Dark Theme</Text>
          <Switch
            value={darkTheme}
            onValueChange={setDarkTheme}
            thumbColor={darkTheme ? '#009688' : '#eee'}
          />
        </View>
      </View>

      <ScrollView>
        {/* Add Habit */}
        <View style={theme.block}>
          <Text style={theme.blockTitle}>Add a Habit</Text>
          <TextInput
            placeholder="Describe your habit"
            value={habitName}
            onChangeText={setHabitName}
            style={theme.input}
            placeholderTextColor={darkTheme ? '#bbb' : '#888'}
          />
          <Text style={theme.text}>Choose a color:</Text>
          <View style={theme.swatchRow}>
            {COLOR_SWATCHES.map((color) => (
              <Pressable
                key={color}
                style={[
                  theme.swatch,
                  { backgroundColor: color },
                  color === selectedHabitColor && theme.swatchSelected,
                ]}
                onPress={() => setSelectedHabitColor(color)}
              />
            ))}
          </View>
          <Pressable
            style={theme.button}
            onPress={() => {
              if (habitName) {
                addHabit({ name: habitName, color: selectedHabitColor });
                setHabitName('');
              }
            }}
          >
            <Text style={theme.buttonText}>Add Habit</Text>
          </Pressable>
        </View>

        {/* Habits List */}
        <View style={theme.block}>
          <Text style={theme.blockTitle}>Your Habits</Text>
          <FlatList
            data={habits}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <View style={[theme.card, { backgroundColor: item.color }]}>
                <Text style={theme.cardText}>{item.name}</Text>
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Add Goal */}
        <View style={theme.block}>
          <Text style={theme.blockTitle}>Add a Goal</Text>
          <TextInput
            placeholder="Describe your goal"
            value={goalTitle}
            onChangeText={setGoalTitle}
            style={theme.input}
            placeholderTextColor={darkTheme ? '#bbb' : '#888'}
          />
          <Text style={theme.text}>Choose a color:</Text>
          <View style={theme.swatchRow}>
            {COLOR_SWATCHES.map((color) => (
              <Pressable
                key={color}
                style={[
                  theme.swatch,
                  { backgroundColor: color },
                  color === selectedGoalColor && theme.swatchSelected,
                ]}
                onPress={() => setSelectedGoalColor(color)}
              />
            ))}
          </View>
          <Pressable
            style={theme.button}
            onPress={() => {
              if (goalTitle) {
                addGoal({ title: goalTitle, color: selectedGoalColor });
                setGoalTitle('');
              }
            }}
          >
            <Text style={theme.buttonText}>Add Goal</Text>
          </Pressable>
        </View>

        {/* Goals List */}
        <View style={theme.block}>
          <Text style={theme.blockTitle}>Your Goals</Text>
          <FlatList
            data={goals}
            keyExtractor={(item) => item.title}
            renderItem={({ item }) => (
              <View style={[theme.card, { backgroundColor: item.color }]}>
                <Text style={theme.cardText}>{item.title}</Text>
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Calendar */}
        <View style={theme.block}>
          <Text style={theme.blockTitle}>Habit & Goal Calendar</Text>
          <Calendar
            markingType="multi-dot"
            markedDates={{}}
            theme={{
              backgroundColor: theme.container.backgroundColor,
              calendarBackground: theme.container.backgroundColor,
              textSectionTitleColor: darkTheme ? '#FFE082' : '#90CAF9',
              dayTextColor: darkTheme ? '#fff' : '#333',
              todayTextColor: '#009688',
              selectedDayBackgroundColor: '#80DEEA',
              selectedDayTextColor: '#fff',
              dotColor: '#009688',
              arrowColor: '#009688',
              monthTextColor: darkTheme ? '#fff' : '#333',
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingBottom: 10,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, gap: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#009688', padding: 8 },
  text: { fontSize: 16, color: '#333', marginVertical: 4 },
  block: { margin: 12, backgroundColor: '#FAFAFA', borderRadius: 12, padding: 12, elevation: 2 },
  blockTitle: { fontSize: 18, fontWeight: 'bold', color: '#009688', marginBottom: 6 },
  input: { fontSize: 16, color: '#222', backgroundColor: '#f0f0f0', padding: 8, borderRadius: 6, marginBottom: 8 },
  swatchRow: { flexDirection: 'row', gap: 8, marginVertical: 4 },
  swatch: { width: 32, height: 32, borderRadius: 16, margin: 4, borderWidth: 2, borderColor: '#e0e0e0' },
  swatchSelected: { borderColor: '#009688', borderWidth: 3 },
  button: { backgroundColor: '#009688', borderRadius: 8, padding: 10, marginTop: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { padding: 12, borderRadius: 10, marginRight: 8, minWidth: 100, alignItems: 'center', elevation: 2 },
  cardText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

const darkStyles = StyleSheet.create({
  ...lightStyles,
  container: {
    flex: 1,
    backgroundColor: '#181A20',
    paddingTop: 10,
    paddingBottom: 10,
  },
  block: {
    backgroundColor: '#23252b',
    borderRadius: 12,
    margin: 12,
    padding: 12,
    elevation: 2,
  },
  card: {
    padding: 12,
    borderRadius: 10,
    marginRight: 8,
    minWidth: 100,
    alignItems: 'center',
    elevation: 2,
  },
  cardText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  button: { backgroundColor: '#009688', borderRadius: 8, padding: 10, marginTop: 6, alignItems: 'center' },
  input: { fontSize: 16, color: '#fff', backgroundColor: '#32334b', padding: 8, borderRadius: 6, marginBottom: 8 },
  blockTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFE082', marginBottom: 6 },
  text: { fontSize: 16, color: '#fff', marginVertical: 4 },
  swatch: { width: 32, height: 32, borderRadius: 16, margin: 4, borderWidth: 2, borderColor: '#32334b' },
  swatchSelected: { borderColor: '#FFE082', borderWidth: 3 },
});
