// src/utils/notifications.ts

import { Platform } from 'react-native';

/**
 * We can't safely import expo-notifications at the top level in Expo Go Android (SDK 53+)
 * because just touching the module tries to set up push tokens, which crashes.
 *
 * So we try to require() it at runtime. If that fails or we're in a known-broken
 * environment (Expo Go on Android), we fall back to a no-op shim.
 */

let Notifications: typeof import('expo-notifications') | null = null;

function getNotificationsModule() {
  if (Notifications) return Notifications;

  try {
    // Dynamically load the module.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Notifications = require('expo-notifications');
  } catch (e) {
    Notifications = null;
  }

  return Notifications;
}

/**
 * Detect an environment where scheduling real push/local notifications
 * will either throw or spam errors (Expo Go on Android after SDK 53).
 *
 * In that environment we "pretend" to succeed so the rest of the app UI can run.
 */
function notificationsBlockedInThisEnv() {
  // Android + dev mode is the main trouble spot for Expo Go.
  // This lets you preview the app UI without crashing.
  if (Platform.OS === 'android' && __DEV__) {
    return true;
  }
  return false;
}

// --------------------------------------------------
// Types
// --------------------------------------------------

export type HabitForReminder = {
  id: string;
  name: string;
  reminderTime?: string | null; // "HH:MM" 24h
};

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function parseHHMM(s?: string | null): { hour: number; minute: number } | null {
  if (!s) return null;
  const ok = /^\d{2}:\d{2}$/.test(s);
  if (!ok) return null;
  const [h, m] = s.split(':').map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { hour: h, minute: m };
}

function habitTriggerId(habitId: string) {
  return `habit-${habitId}-daily`;
}

// --------------------------------------------------
// Public API
// --------------------------------------------------

/**
 * configureNotifications()
 *
 * - Ask permission (iOS and Android dev builds)
 * - Create Android channel
 * - Set global notification handler (sound, banner, etc)
 *
 * Safe to call at app startup.
 */
export async function configureNotifications() {
  // If we're in an env that can't really do notifications, just no-op
  if (notificationsBlockedInThisEnv()) {
    return;
  }

  const N = getNotificationsModule();
  if (!N) {
    return;
  }

  // Permissions
  const settings = await N.getPermissionsAsync();
  if (settings.status !== 'granted') {
    await N.requestPermissionsAsync();
  }

  // Android channel (local notifications need a channel on Android)
  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync('habits-default', {
      name: 'Habit Reminders',
      importance: N.AndroidImportance.DEFAULT,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: N.AndroidNotificationVisibility.PUBLIC,
    });
  }

  // Global handler (how notifications behave when received in foreground)
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      // newer SDK types:
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * scheduleHabitReminder(habit)
 *
 * Sets up (or re-sets up) a repeating daily reminder at HH:MM for that habit.
 * If habit.reminderTime is invalid or missing, we silently skip.
 */
export async function scheduleHabitReminder(habit: HabitForReminder) {
  if (notificationsBlockedInThisEnv()) {
    // Pretend success in Expo Go Android dev.
    return;
  }

  const N = getNotificationsModule();
  if (!N) {
    return;
  }

  const parsed = parseHHMM(habit.reminderTime);
  if (!parsed) return;

  // First, try to cancel any previous instance using the same identifier.
  try {
    await N.cancelScheduledNotificationAsync(habitTriggerId(habit.id));
  } catch {
    // ignore if it didn't exist yet
  }

  await N.scheduleNotificationAsync({
    // identifier: stable id so we can cancel/reschedule later
    identifier: habitTriggerId(habit.id),
    content: {
      title: 'Small Steps',
      body: `Time for: ${habit.name}`,
      sound: 'default',
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.CALENDAR,
      hour: parsed.hour,
      minute: parsed.minute,
      repeats: true,
      channelId: Platform.OS === 'android' ? 'habits-default' : undefined,
    } as import('expo-notifications').CalendarTriggerInput,
  });
}

/**
 * cancelHabitReminder(habitId)
 *
 * Removes a scheduled daily reminder for a habit.
 */
export async function cancelHabitReminder(habitId: string) {
  if (notificationsBlockedInThisEnv()) {
    return;
  }

  const N = getNotificationsModule();
  if (!N) {
    return;
  }

  try {
    await N.cancelScheduledNotificationAsync(habitTriggerId(habitId));
  } catch {
    // it's fine if it wasn't scheduled
  }
}

/**
 * rescheduleAll(habits)
 *
 * Convenience: loop through all habits at app start or after bulk edits.
 * - If a habit has a reminderTime, schedule it.
 * - If not, cancel its reminder.
 */
export async function rescheduleAll(habits: HabitForReminder[]) {
  for (const h of habits) {
    if (h.reminderTime) {
      await scheduleHabitReminder(h);
    } else {
      await cancelHabitReminder(h.id);
    }
  }
}
