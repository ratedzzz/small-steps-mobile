import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../src/lib/firebase"; 
import { useApp } from "../src/store";

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const segments = useSegments();
  const { setUser: setStoreUser } = useApp();

  // 1. Listen for authentication state changes
  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (authUser) {
        // Sync Firebase User to our Zustand Store
        setStoreUser(authUser.uid, authUser.displayName || "Friend", authUser.photoURL);
      }
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  // 2. Protect Routes
  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === "(tabs)";
    
    if (!user && inAuthGroup) {
      // If not logged in, go to Login
      router.replace("/login");
    } else if (user && segments[0] === "login") {
      // If logged in and on Login page, go to Home
      router.replace("/(tabs)");
    }
  }, [user, initializing, segments]);

  // 3. Show loading spinner while checking auth
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#2E3440" }}>
        <ActivityIndicator size="large" color="#88C0D0" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}