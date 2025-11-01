/// src/utils/notifications.ts
import { Platform } from 'react-native';

/**
 * We load expo-notifications lazily at runtime to avoid crashes
 * in Expo Go on Android (SDK 53+).
 */
let Notifications: typeof import('expo-notifications') | null = null;

function getNotificationsModule() {
  if (Notifications) return Notifications;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Notifications = require('expo-notifications');
  } catch {
    Notifications = null;
  }
  return Notifications;
}

/**
 * In Expo Go on Android (especially in dev), notifications can be unreliable.
 * When blocked, we no-op so the rest of the app works.
 */
function notificationsBlockedInThisEnv() {
  // You can tighten/relax this rule if you build a dev client.
  if (Platform.OS === 'android' && __DEV__) return true;
  return false;
}

// --------------------------------------------------
// Types
// --------------------------------------------------

export type HabitForReminder = {
  id: string;
  name: string;
  /**
   * "HH:MM" (24-hour). If missing/invalid => no reminder.
   */
  reminderTime?: string | null;
};

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function parseHHMM(s?: string | null): { hour: number; minute: number } | null {
  if (!s) return null;
  // allow "7:05" or "07:05"
  const m = /^([0-1]?\d|2[0-3]):([0-5]\d)$/.exec(s.trim());
  if (!m) return null;
  const hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  return { hour, minute };
}

/**
 * Compare a parsed time with a calendar trigger (best-effort).
 */
function triggerMatchesTime(
  trig: any,
  hour: number,
  minute: number
): boolean {
  if (!trig) return false;
  // Calendar triggers typically have hour/minute + repeats: true
  if (typeof trig.hour === 'number' && typeof trig.minute === 'number') {
    return trig.hour === hour && trig.minute === minute && !!trig.repeats;
  }
  return false;
}

// --------------------------------------------------
// Public API
// --------------------------------------------------

/**
 * Call once at startup (e.g., in app/_layout.tsx useEffect).
 * - Requests permission
 * - Creates Android channel
 * - Sets a foreground handler
 */
export async function configureNotifications() {
  if (notificationsBlockedInThisEnv()) return;

  const N = getNotificationsModule();
  if (!N) return;

  // Ask for permissions
  const { status } = await N.getPermissionsAsync();
  if (status !== 'granted') {
    await N.requestPermissionsAsync();
  }

  // Android channel
  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync('habits-default', {
      name: 'Habit Reminders',
      importance: N.AndroidImportance.DEFAULT,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: N.AndroidNotificationVisibility.PUBLIC,
    });
  }

  // Foreground behavior
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      // Newer SDK flags (ignored where unsupported)
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Schedules (or re-schedules) a daily reminder for a habit at HH:MM.
 * We tag it with content.data.hId so we can find & cancel it later.
 */
export async function scheduleHabitReminder(habit: HabitForReminder) {
  if (notificationsBlockedInThisEnv()) return;

  const N = getNotificationsModule();
  if (!N) return;

  const parsed = parseHHMM(habit.reminderTime);
  if (!parsed) return;

  // Cancel any existing reminders for this habit first (based on hId tag)
  await cancelHabitReminder(habit.id);

  await N.scheduleNotificationAsync({
    content: {
      title: 'Small Steps',
      body: `Time for: ${habit.name}`,
      sound: 'default',
      data: { hId: habit.id, kind: 'habit' }, // <-- tag for future lookups
    },
    // Calendar trigger that repeats every day at hour:minute
    trigger: {
      hour: parsed.hour,
      minute: parsed.minute,
      repeats: true,
      ...(Platform.OS === 'android' ? { channelId: 'habits-default' } : {}),
    } as import('expo-notifications').CalendarTriggerInput,
  });
}

/**
 * Cancels scheduled reminders for a specific habit by scanning
 * scheduled notifications that carry data.hId === habitId.
 */
export async function cancelHabitReminder(habitId: string) {
  if (notificationsBlockedInThisEnv()) return;

  const N = getNotificationsModule();
  if (!N) return;

  try {
    const scheduled = await N.getAllScheduledNotificationsAsync();
    for (const item of scheduled) {
      const hId = (item as any)?.content?.data?.hId;
      if (hId === habitId) {
        await N.cancelScheduledNotificationAsync(item.identifier);
      }
    }
  } catch {
    // Ignore
  }
}

/**
 * Bulk rebuild. For each habit:
 * - if it has a valid time => ensure exactly one scheduled reminder at that time
 * - if no/invalid time => cancel any existing
 */
export async function rescheduleAll(habits: HabitForReminder[]) {
  if (notificationsBlockedInThisEnv()) return;

  const N = getNotificationsModule();
  if (!N) return;

  try {
    const scheduled = await N.getAllScheduledNotificationsAsync();

    // Index existing by habitId
    const byHabit: Record<string, typeof scheduled> = {};
    for (const item of scheduled) {
      const hId = (item as any)?.content?.data?.hId;
      if (typeof hId === 'string') {
        (byHabit[hId] ||= []).push(item);
      }
    }

    // For each habit in state, reconcile
    for (const h of habits) {
      const parsed = parseHHMM(h.reminderTime);

      const existing = byHabit[h.id] || [];

      if (!parsed) {
        // Should have none -> cancel any existing
        for (const item of existing) {
          await N.cancelScheduledNotificationAsync(item.identifier);
        }
        continue;
      }

      // Keep exactly one that matches hour/minute; cancel extras/different times
      let hasCorrect = false;
      for (const item of existing) {
        if (triggerMatchesTime((item as any).trigger, parsed.hour, parsed.minute)) {
          if (!hasCorrect) {
            hasCorrect = true; // keep the first match
          } else {
            await N.cancelScheduledNotificationAsync(item.identifier); // duplicates
          }
        } else {
          await N.cancelScheduledNotificationAsync(item.identifier); // wrong time
        }
      }

      if (!hasCorrect) {
        // schedule fresh
        await N.scheduleNotificationAsync({
          content: {
            title: 'Small Steps',
            body: `Time for: ${h.name}`,
            sound: 'default',
            data: { hId: h.id, kind: 'habit' },
          },
          trigger: {
            hour: parsed.hour,
            minute: parsed.minute,
            repeats: true,
            ...(Platform.OS === 'android' ? { channelId: 'habits-default' } : {}),
          } as import('expo-notifications').CalendarTriggerInput,
        });
      }
    }
  } catch {
    // Ignore; best-effort
  }
}
