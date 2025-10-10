import { Stack } from 'expo-router';

export default function RootLayout() {
  // Keep _layout lean; no expo-notifications import here to avoid Expo Go log spam
  return <Stack screenOptions={{ headerShown: false }} />;
}
