// Dead.Alive — Notification Service
// Handles persistent check-in notifications and action categories

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const PERSISTENT_NOTIFICATION_ID = 'dead-alive-quick-checkin';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotificationCategories(): Promise<void> {
  await Notifications.setNotificationCategoryAsync('quick_actions', [
    {
      identifier: 'CHECK_IN',
      buttonTitle: 'Check In ✓',
      options: { opensAppToForeground: false },
    },
    {
      identifier: 'SOS',
      buttonTitle: 'SOS 🚨',
      options: { opensAppToForeground: true, isDestructive: true },
    },
  ]);
}

export async function showPersistentCheckInNotification(
  streak: number
): Promise<void> {
  // Dismiss existing notification first
  await dismissPersistentNotification();

  await Notifications.scheduleNotificationAsync({
    identifier: PERSISTENT_NOTIFICATION_ID,
    content: {
      title: 'Dead.Alive',
      body: `🔥 Streak: ${streak} days — Tap to check in`,
      data: { action: 'check_in' },
      sticky: Platform.OS === 'android', // Android-only: persistent
      priority: Notifications.AndroidNotificationPriority.LOW,
      categoryIdentifier: 'quick_actions',
    },
    trigger: null, // immediate
  });
}

export async function dismissPersistentNotification(): Promise<void> {
  await Notifications.dismissNotificationAsync(PERSISTENT_NOTIFICATION_ID);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
