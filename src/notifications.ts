import { Platform } from 'react-native';

export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  title: string,
  body: string
) {
  try {
    // Load only when needed (keeps Expo Go quieter)
    const Notifications = await import('expo-notifications');

    // Permissions
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      if (req.status !== 'granted') return;
    }

    // Android channel (no-op on iOS)
    // @ts-ignore (optional chaining not typed in all SDKs)
    await Notifications.setNotificationChannelAsync?.('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });

    // Build a daily-at-time trigger; cast to 'any' to satisfy SDK 53+ typings
    const trigger: any =
      Platform.OS === 'ios'
        ? { hour, minute } // iOS daily time
        : { hour, minute, channelId: 'default' }; // Android daily time

    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: false },
      trigger, // cast above avoids TS error while working at runtime
    });
  } catch {
    // In Expo Go, notifications may be limited; ignore errors so app keeps running
    return;
  }
}
