import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../src/lib/firebase';
import { useApp } from '../src/store';
import { APP_THEME } from '../src/theme';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser, pushLocalToFirebase, syncFromFirebase } = useApp();

  const handleAuth = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill in all fields");
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOG IN ---
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const user = cred.user;
        
        // 1. Update Local Store
        setUser(user.uid, user.displayName || "Friend", user.photoURL);
        
        // 2. Wipe local data and pull from Cloud
        await syncFromFirebase(user.uid);
        
        router.replace('/'); // Go to Tabs
      } else {
        // --- SIGN UP ---
        if (!name) {
            setLoading(false);
            return Alert.alert("Error", "Please enter your name");
        }
        
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const user = cred.user;

        // Set Display Name in Firebase
        await updateProfile(user, { displayName: name });

        // 1. Update Local Store
        setUser(user.uid, name, null);
        
        // 2. Upload current "Guest" data to new account
        await pushLocalToFirebase(user.uid);
        
        router.replace('/');
      }
    } catch (err: any) {
      Alert.alert("Authentication Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={APP_THEME.mainGradient} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{isLogin ? "Welcome Back" : "Join Small Steps"}</Text>
          <Text style={styles.subtitle}>{isLogin ? "Sign in to continue your journey." : "Create an account to save your progress."}</Text>

          {!isLogin && (
            <TextInput
              placeholder="Your Name"
              placeholderTextColor="#005086"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          )}

          <TextInput
            placeholder="Email"
            placeholderTextColor="#005086"
            style={styles.input}
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          
          <TextInput
            placeholder="Password"
            placeholderTextColor="#005086"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <Pressable onPress={handleAuth} style={styles.button}>
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <Text style={styles.buttonText}>{isLogin ? "Sign In" : "Sign Up"}</Text>
            )}
          </Pressable>

          <Pressable onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
            <Text style={styles.switchText}>
              {isLogin ? "New here? Create Account" : "Already have an account? Sign In"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#001244', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#005086', marginBottom: 24, textAlign: 'center' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#001244',
    borderWidth: 1,
    borderColor: '#e1e1e1'
  },
  button: {
    backgroundColor: '#001244',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  switchButton: { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#005086', fontSize: 14, fontWeight: '600' },
});