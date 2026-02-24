// Dead.Alive -- Fake Call Screen
// Schedule and execute fake incoming calls to escape uncomfortable situations

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '../stores/useStore';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../theme';

interface FakeCallScreenProps {
  navigation: any;
}

type ScreenState = 'setup' | 'countdown' | 'incoming';

const DELAY_OPTIONS = [5, 10, 15, 30, 60];
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FakeCallScreen({ navigation }: FakeCallScreenProps) {
  const { fakeCallConfig, updateFakeCallConfig } = useStore();

  const [screenState, setScreenState] = useState<ScreenState>('setup');
  const [callerName, setCallerName] = useState(fakeCallConfig.callerName);
  const [callerNumber, setCallerNumber] = useState(fakeCallConfig.callerNumber);
  const [selectedDelay, setSelectedDelay] = useState(fakeCallConfig.delaySeconds);
  const [countdown, setCountdown] = useState(0);

  // Animated values
  const countdownPulse = useRef(new Animated.Value(1)).current;
  const incomingSlide = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dotOpacity1 = useRef(new Animated.Value(0)).current;
  const dotOpacity2 = useRef(new Animated.Value(0)).current;
  const dotOpacity3 = useRef(new Animated.Value(0)).current;
  const ringPulse = useRef(new Animated.Value(1)).current;

  // Refs
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // Countdown pulse animation
  useEffect(() => {
    if (screenState === 'countdown') {
      pulseAnimRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(countdownPulse, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(countdownPulse, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimRef.current.start();

      return () => {
        pulseAnimRef.current?.stop();
      };
    }
  }, [screenState]);

  // Incoming call animations
  useEffect(() => {
    if (screenState === 'incoming') {
      // Slide in the incoming call screen
      Animated.spring(incomingSlide, {
        toValue: 0,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }).start();

      // Animate dots in sequence
      const dotLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(dotOpacity1, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity2, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity3, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(dotOpacity1, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dotOpacity2, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dotOpacity3, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      dotLoop.start();

      // Ring pulse
      const ringLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(ringPulse, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(ringPulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      ringLoop.start();

      // Trigger haptic vibration pattern
      const hapticInterval = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 1500);

      return () => {
        dotLoop.stop();
        ringLoop.stop();
        clearInterval(hapticInterval);
      };
    }
  }, [screenState]);

  const handleSchedule = useCallback(() => {
    // Save config
    updateFakeCallConfig({
      callerName: callerName.trim() || 'Mom',
      callerNumber: callerNumber.trim() || '+1 (555) 123-4567',
      delaySeconds: selectedDelay,
    });

    // Start countdown
    setCountdown(selectedDelay);
    setScreenState('countdown');

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Timer hit 0 -- show incoming call
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          setScreenState('incoming');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [callerName, callerNumber, selectedDelay, updateFakeCallConfig]);

  const handleCancelCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setScreenState('setup');
    setCountdown(0);
  }, []);

  const handleDismissCall = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    incomingSlide.setValue(SCREEN_HEIGHT);
    setScreenState('setup');
  }, [incomingSlide]);

  const getInitial = (name: string): string => {
    return (name.trim().charAt(0) || 'M').toUpperCase();
  };

  // ---- Incoming Call Full-Screen UI ----
  if (screenState === 'incoming') {
    const displayName = callerName.trim() || 'Mom';
    const displayNumber = callerNumber.trim() || '+1 (555) 123-4567';

    return (
      <Animated.View
        style={[
          styles.incomingContainer,
          { transform: [{ translateY: incomingSlide }] },
        ]}
      >
        {/* Caller avatar */}
        <Animated.View
          style={[
            styles.incomingAvatarOuter,
            { transform: [{ scale: ringPulse }] },
          ]}
        >
          <View style={styles.incomingAvatar}>
            <Text style={styles.incomingAvatarText}>
              {getInitial(displayName)}
            </Text>
          </View>
        </Animated.View>

        {/* Caller info */}
        <Text style={styles.incomingName}>{displayName}</Text>
        <Text style={styles.incomingNumber}>{displayNumber}</Text>

        {/* Incoming Call text with animated dots */}
        <View style={styles.incomingStatusRow}>
          <Text style={styles.incomingStatusText}>Incoming Call</Text>
          <Animated.Text style={[styles.incomingDot, { opacity: dotOpacity1 }]}>
            .
          </Animated.Text>
          <Animated.Text style={[styles.incomingDot, { opacity: dotOpacity2 }]}>
            .
          </Animated.Text>
          <Animated.Text style={[styles.incomingDot, { opacity: dotOpacity3 }]}>
            .
          </Animated.Text>
        </View>

        {/* Answer / Decline buttons */}
        <View style={styles.incomingActions}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={handleDismissCall}
            activeOpacity={0.7}
          >
            <Text style={styles.callActionIcon}>{'\u{1F4F5}'}</Text>
            <Text style={styles.callActionLabel}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleDismissCall}
            activeOpacity={0.7}
          >
            <Text style={styles.callActionIcon}>{'\u{1F4DE}'}</Text>
            <Text style={styles.callActionLabel}>Accept</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  // ---- Countdown View ----
  if (screenState === 'countdown') {
    return (
      <View style={styles.container}>
        <View style={styles.countdownContainer}>
          <Animated.View
            style={[
              styles.countdownCircle,
              { transform: [{ scale: countdownPulse }] },
            ]}
          >
            <Text style={styles.countdownNumber}>{countdown}</Text>
          </Animated.View>

          <Text style={styles.countdownLabel}>
            Incoming call in {countdown} second{countdown !== 1 ? 's' : ''}...
          </Text>

          <Text style={styles.countdownCaller}>
            From: {callerName.trim() || 'Mom'}
          </Text>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelCountdown}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ---- Setup View ----
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Row with Close Button */}
        <View style={styles.headerRow}>
          <Text style={styles.headerRowTitle}>Fake Call</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeX}>{'\u2715'}</Text>
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{'\u{1F4DE}'} Fake Call</Text>
          <Text style={styles.headerSubtitle}>
            Schedule a fake incoming call to escape uncomfortable situations
          </Text>
        </View>

        {/* Caller Settings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Caller Settings</Text>

          <Text style={styles.inputLabel}>Caller Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Mom"
            placeholderTextColor={Colors.textMuted}
            value={callerName}
            onChangeText={setCallerName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
            Caller Number
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="+1 (555) 123-4567"
            placeholderTextColor={Colors.textMuted}
            value={callerNumber}
            onChangeText={setCallerNumber}
            keyboardType="phone-pad"
          />
        </View>

        {/* Delay Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Call in...</Text>

          <View style={styles.delayRow}>
            {DELAY_OPTIONS.map((delay) => (
              <TouchableOpacity
                key={delay}
                style={[
                  styles.delayOption,
                  selectedDelay === delay && styles.delayOptionSelected,
                ]}
                onPress={() => setSelectedDelay(delay)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.delayOptionText,
                    selectedDelay === delay && styles.delayOptionTextSelected,
                  ]}
                >
                  {delay}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Schedule Button */}
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={handleSchedule}
          activeOpacity={0.7}
        >
          <Text style={styles.scheduleButtonText}>Schedule Call</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBg,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 0,
    paddingBottom: 40,
  },

  // Header Row (close button)
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 12,
  },
  headerRowTitle: {
    fontSize: 18,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeX: {
    fontSize: 16,
    color: Colors.textMuted,
  },

  // Header
  header: {
    marginBottom: Spacing.xl,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },

  headerSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Card
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },

  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  // Inputs
  inputLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: FontWeight.medium,
  },

  textInput: {
    backgroundColor: Colors.darkBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },

  // Delay options
  delayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },

  delayOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.darkBg,
  },

  delayOptionSelected: {
    borderColor: Colors.alive,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },

  delayOptionText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },

  delayOptionTextSelected: {
    color: Colors.alive,
  },

  // Schedule button
  scheduleButton: {
    backgroundColor: Colors.alive,
    paddingVertical: 18,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },

  scheduleButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },

  // ---- Countdown View ----
  countdownContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },

  countdownCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: Colors.alive,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
    marginBottom: Spacing.xl,
  },

  countdownNumber: {
    fontSize: 64,
    fontWeight: FontWeight.black,
    color: Colors.alive,
  },

  countdownLabel: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  countdownCaller: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },

  cancelButton: {
    borderWidth: 1.5,
    borderColor: Colors.dead,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'transparent',
  },

  cancelButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.dead,
  },

  // ---- Incoming Call View ----
  incomingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#0F1A14',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    zIndex: 100,
  },

  incomingAvatarOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 136, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },

  incomingAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  incomingAvatarText: {
    fontSize: 44,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },

  incomingName: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },

  incomingNumber: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },

  incomingStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },

  incomingStatusText: {
    fontSize: FontSize.md,
    color: Colors.alive,
    fontWeight: FontWeight.medium,
  },

  incomingDot: {
    fontSize: 24,
    color: Colors.alive,
    fontWeight: FontWeight.bold,
    marginLeft: 2,
  },

  incomingActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    position: 'absolute',
    bottom: 100,
  },

  declineButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.dead,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dead,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },

  acceptButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.alive,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.alive,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },

  callActionIcon: {
    fontSize: 28,
  },

  callActionLabel: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
    marginTop: 4,
    position: 'absolute',
    bottom: -24,
  },
});
