import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { LogBox, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function RootLayout() {
  useEffect(() => {
    // Satisfy the NotificationBehavior type for SDK 53+
    const behavior: Notifications.NotificationBehavior = {
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      // iOS-specific (types require these fields)
      shouldShowBanner: true,
      shouldShowList: true,
    };

    Notifications.setNotificationHandler({
      handleNotification: async () => behavior,
    });

    // Android local channel (no-op on iOS)
    // @ts-ignore
    Notifications.setNotificationChannelAsync?.('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });

    // Ignore Expo Go remote-push warning (we only use local notifications)
    LogBox.ignoreLogs([/expo-notifications: Android Push notifications/i]);
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
