// Dead.Alive — Main App Entry
// Safety app for solo dwellers

import React, { useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import { useStore } from './src/stores/useStore';
import { useShakeDetection } from './src/hooks/useShakeDetection';
import {
  setupNotificationCategories,
  showPersistentCheckInNotification,
  dismissPersistentNotification,
} from './src/utils/notificationService';

// ─── Shake-to-SOS Detector (renderless) ─────────────────────────────────────

function ShakeDetector() {
  const shakeToSOS = useStore((s) => s.settings.shakeToSOS);
  const triggerSOS = useStore((s) => s.triggerSOS);
  const haptics = useStore((s) => s.settings.haptics);

  const handleShake = useCallback(() => {
    if (haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    Alert.alert(
      '🚨 Shake Detected',
      'Send SOS alert to all emergency contacts?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SOS',
          style: 'destructive',
          onPress: () => triggerSOS(),
        },
      ],
      { cancelable: true }
    );
  }, [triggerSOS, haptics]);

  useShakeDetection({
    enabled: shakeToSOS,
    onShake: handleShake,
  });

  return null;
}

// ─── Notification Handler (renderless) ───────────────────────────────────────

function NotificationHandler() {
  const performCheckIn = useStore((s) => s.performCheckIn);
  const triggerSOS = useStore((s) => s.triggerSOS);
  const persistentNotification = useStore((s) => s.settings.persistentNotification);
  const streak = useStore((s) => s.streak);

  // Set up notification categories on mount
  useEffect(() => {
    setupNotificationCategories();
  }, []);

  // Handle notification action responses
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const actionId = response.actionIdentifier;
        const data = response.notification.request.content.data;

        if (actionId === 'CHECK_IN' || data?.action === 'check_in') {
          performCheckIn();
          // Re-show notification with updated streak
          const currentState = useStore.getState();
          if (currentState.settings.persistentNotification) {
            showPersistentCheckInNotification(currentState.streak);
          }
        }

        if (actionId === 'SOS') {
          triggerSOS();
        }
      }
    );

    return () => subscription.remove();
  }, [performCheckIn, triggerSOS]);

  // Show/hide persistent notification based on setting
  useEffect(() => {
    if (persistentNotification) {
      showPersistentCheckInNotification(streak);
    } else {
      dismissPersistentNotification();
    }
  }, [persistentNotification, streak]);

  return null;
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <ShakeDetector />
      <NotificationHandler />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
});
