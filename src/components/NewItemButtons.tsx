import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useApp } from '../store';

const Button = ({ title, onPress }: { title: string; onPress: () => void }) => (
  <Pressable onPress={onPress} style={{ backgroundColor: '#222', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, alignSelf: 'flex-start', marginTop: 8 }}>
    <Text style={{ color: '#fff', fontWeight: '600' }}>{title}</Text>
  </Pressable>
);

const Field = ({ label, value, onChangeText, placeholder }:{
  label: string; value: string; onChangeText: (t:string)=>void; placeholder?: string
}) => (
  <View style={{ marginTop: 8 }}>
    <Text style={{ fontWeight: '600', marginBottom: 4 }}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:8, minWidth:180 }}
    />
  </View>
);

export function AddHabitButton() {
  const { addHabit } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6fb3ff');
  const [time, setTime] = useState('07:30');

  if (!open) return <Button title="Add Habit" onPress={() => setOpen(true)} />;

  return (
    <View style={{ marginTop: 8, padding: 12, borderWidth:1, borderColor:'#eee', borderRadius:12, backgroundColor:'#fafafa' }}>
      <Text style={{ fontSize:16, fontWeight:'700' }}>New Habit</Text>
      <Field label="Name" value={name} onChangeText={setName} />
      <Field label="Color" value={color} onChangeText={setColor} placeholder="#6fb3ff" />
      <Field label="Reminder time" value={time} onChangeText={setTime} placeholder="HH:MM" />
      <View style={{ flexDirection:'row', gap:8, marginTop:10 }}>
        <Button title="Cancel" onPress={()=> setOpen(false)} />
        <Button title="Save" onPress={()=>{
          addHabit({ name, color, reminderTime: time });
          setOpen(false);
          setName(''); setColor('#6fb3ff'); setTime('07:30');
        }} />
      </View>
    </View>
  );
}

export function AddGoalButton() {
  const { addGoal } = useApp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#ff4d4d');
  const [due, setDue] = useState('');

  if (!open) return <Button title="Add Goal" onPress={() => setOpen(true)} />;

  return (
    <View style={{ marginTop: 8, padding: 12, borderWidth:1, borderColor:'#eee', borderRadius:12, backgroundColor:'#fafafa' }}>
      <Text style={{ fontSize:16, fontWeight:'700' }}>New Goal</Text>
      <Field label="Title" value={title} onChangeText={setTitle} />
      <Field label="Color" value={color} onChangeText={setColor} placeholder="#ff4d4d" />
      <Field label="Due date" value={due} onChangeText={setDue} placeholder="YYYY-MM-DD" />
      <View style={{ flexDirection:'row', gap:8, marginTop:10 }}>
        <Button title="Cancel" onPress={()=> setOpen(false)} />
        <Button title="Save" onPress={()=>{
          addGoal({ title, color, dueDate: due });
          setOpen(false);
          setTitle(''); setColor('#ff4d4d'); setDue('');
        }} />
      </View>
    </View>
  );
}
