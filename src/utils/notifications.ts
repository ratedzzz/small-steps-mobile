// src/utils/notifications.ts
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export type HabitForReminder = {
  id: string;
  name: string;
  reminderTime?: string | null; // "HH:MM" (24h)
};

// One-time setup: permissions + Android channel + handler
export async function configureNotifications() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habits-default', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      // These two are required by the newer type defs
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

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

/** Schedule (or reschedule) a daily notification for a habit */
export async function scheduleHabitReminder(habit: HabitForReminder) {
  const parsed = parseHHMM(habit.reminderTime);
  if (!parsed) return;

  // Clear previous schedule for this habit (ignore if it doesn't exist)
  try {
    await Notifications.cancelScheduledNotificationAsync(habitTriggerId(habit.id));
  } catch {}

  await Notifications.scheduleNotificationAsync({
    identifier: habitTriggerId(habit.id),
    content: {
      title: 'Small Steps',
      body: `Time for: ${habit.name}`,
      sound: 'default',
    },
    // Calendar trigger MUST include a "type" field for TS
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: parsed.hour,
      minute: parsed.minute,
      repeats: true,
      // channelId is Android-only
      channelId: Platform.OS === 'android' ? 'habits-default' : undefined,
    } as Notifications.CalendarTriggerInput,
  });
}

/** Cancel a habit’s scheduled reminder */
export async function cancelHabitReminder(habitId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(habitTriggerId(habitId));
  } catch {}
}

/** Reschedule all habit reminders (use after app start or bulk edits) */
export async function rescheduleAll(habits: HabitForReminder[]) {
  for (const h of habits) {
    if (h.reminderTime) {
      await scheduleHabitReminder(h);
    } else {
      await cancelHabitReminder(h.id);
    }
  }
}