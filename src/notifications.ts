// src/notifications.ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Dynamic import to avoid Expo Go Android crash with expo-notifications (SDK 53+)
type NotificationsNS = typeof import('expo-notifications');
type CalendarTriggerInput = import('expo-notifications').CalendarTriggerInput;
type TimeIntervalTriggerInput = import('expo-notifications').TimeIntervalTriggerInput;

export const isExpoGo = Constants.appOwnership === 'expo';

async function load(): Promise<NotificationsNS | null> {
  if (isExpoGo && Platform.OS === 'android') {
    // In Expo Go on Android, avoid loading the module altogether.
    return null;
  }
  const mod = await import('expo-notifications');
  return mod;
}

/** Set the global notification handler (no deprecated flags). */
export async function setupNotificationHandler() {
  const Notifications = await load();
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Ask for local notification permission. */
export async function ensureLocalPermission(): Promise<boolean> {
  const Notifications = await load();
  if (!Notifications) return false;

  const settings = await Notifications.getPermissionsAsync();
  if (settings.status === 'granted') return true;

  const req = await Notifications.requestPermissionsAsync();
  return req.status === 'granted';
}

/** Ensure Android has a default channel (no-op elsewhere). */
export async function setupAndroidChannel() {
  const Notifications = await load();
  if (!Notifications) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

/** Daily local notification, cross-platform & Expo-Go-safe. */
export async function scheduleDailyLocalNotification(
  hour: number,
  minute: number,
  content: { title: string; body?: string } = { title: 'Reminder' }
) {
  const Notifications = await load();
  if (!Notifications) return;

  const granted = await ensureLocalPermission();
  if (!granted) return;

  await setupAndroidChannel();

  if (Platform.OS === 'ios') {
    const trigger: CalendarTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    };
    await Notifications.scheduleNotificationAsync({ content, trigger });
    return;
  }

  // Android: emulate daily schedule with a repeating time-interval trigger.
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const seconds = Math.max(1, Math.round((next.getTime() - now.getTime()) / 1000));

  const trigger: TimeIntervalTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds,
    repeats: true,
  };

  await Notifications.scheduleNotificationAsync({ content, trigger });
}

/** Get Expo push token; returns null in Expo Go or on failure. */
export async function getPushTokenSafely(): Promise<string | null> {
  const Notifications = await load();
  if (!Notifications) return null;

  const granted = await ensureLocalPermission();
  if (!granted) return null;

  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return typeof token === 'string' ? token : (token as any)?.data ?? null;
  } catch {
    return null;
  }
}

/** Cancel all scheduled local notifications (no-op in Expo Go Android). */
export async function cancelAll() {
  const Notifications = await load();
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
