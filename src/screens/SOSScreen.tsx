// Dead.Alive -- Emergency SOS Screen
// Dramatic, urgent design with hold-to-activate SOS button

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '../stores/useStore';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../theme';

interface SOSScreenProps {
  navigation: any;
}

const HOLD_DURATION = 3000; // 3 seconds
const SOS_BUTTON_SIZE = 200;

export default function SOSScreen({ navigation }: SOSScreenProps) {
  const { emergencyContacts, triggerSOS, resolveAlert, alerts, user } = useStore();

  const [isHolding, setIsHolding] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);

  // Animated values
  const holdProgress = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  // Start pulsing glow animation on mount
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    glowLoop.start();

    return () => {
      pulseLoop.stop();
      glowLoop.stop();
    };
  }, []);

  const handlePressIn = useCallback(() => {
    setIsHolding(true);

    // Animate progress from 0 to 1 over HOLD_DURATION
    holdAnimRef.current = Animated.timing(holdProgress, {
      toValue: 1,
      duration: HOLD_DURATION,
      useNativeDriver: true,
    });
    holdAnimRef.current.start();

    // Set timer for SOS activation
    holdTimerRef.current = setTimeout(() => {
      // SOS activated!
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const alert = triggerSOS();
      setActiveAlertId(alert.id);
      setAlertSent(true);
      setIsHolding(false);
      holdProgress.setValue(0);
    }, HOLD_DURATION);
  }, [holdProgress, triggerSOS]);

  const handlePressOut = useCallback(() => {
    if (!alertSent) {
      setIsHolding(false);

      // Cancel timer and reset animation
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      if (holdAnimRef.current) {
        holdAnimRef.current.stop();
        holdAnimRef.current = null;
      }

      Animated.timing(holdProgress, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [alertSent, holdProgress]);

  const handleResolve = useCallback(() => {
    if (activeAlertId) {
      resolveAlert(activeAlertId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAlertSent(false);
      setActiveAlertId(null);
    }
  }, [activeAlertId, resolveAlert]);

  const handleCallEmergency = useCallback(() => {
    Alert.alert(
      'Emergency Services',
      'Would call 911',
      [{ text: 'OK', style: 'cancel' }]
    );
  }, []);

  // Interpolate hold progress into rotation degrees for the circular indicator
  const progressRotation = holdProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressOpacity = holdProgress.interpolate({
    inputRange: [0, 0.01, 1],
    outputRange: [0, 1, 1],
  });

  // ---- Alert Sent View ----
  if (alertSent) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.alertSentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.alertSentEmoji}>{'\u{1F6A8}'}</Text>
          <Text style={styles.alertSentTitle}>ALERT SENT</Text>
          <Text style={styles.alertSentSubtitle}>
            Alerts sent to {emergencyContacts.length} contact
            {emergencyContacts.length !== 1 ? 's' : ''}
          </Text>

          {/* List of contacted people */}
          <View style={styles.contactsListCard}>
            <Text style={styles.contactsListTitle}>Contacted:</Text>
            {emergencyContacts.length > 0 ? (
              emergencyContacts.map((contact) => (
                <View key={contact.id} style={styles.contactRow}>
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactAvatarText}>
                      {contact.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                  <Text style={styles.contactStatus}>{'\u2705'} Sent</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noContactsText}>
                No emergency contacts configured
              </Text>
            )}
          </View>

          {/* Action buttons */}
          <TouchableOpacity
            style={styles.safeButton}
            onPress={handleResolve}
            activeOpacity={0.7}
          >
            <Text style={styles.safeButtonText}>I'm Safe</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emergencyCallButton}
            onPress={handleCallEmergency}
            activeOpacity={0.7}
          >
            <Text style={styles.emergencyCallButtonText}>
              Call Emergency Services
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ---- Default SOS View ----
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{'\u{1F6A8}'} Emergency SOS</Text>
          <Text style={styles.headerSubtitle}>
            Hold the button for 3 seconds to send an emergency alert to all your
            contacts
          </Text>
        </View>

        {/* Giant SOS Button */}
        <View style={styles.sosButtonContainer}>
          <Animated.View
            style={[
              styles.sosGlow,
              {
                opacity: glowAnim,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />

          {/* Circular progress indicator */}
          <Animated.View
            style={[
              styles.progressRing,
              {
                opacity: progressOpacity,
                transform: [{ rotate: progressRotation }],
              },
            ]}
          >
            <View style={styles.progressArc} />
          </Animated.View>

          <TouchableOpacity
            style={styles.sosButton}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
          >
            <Text style={styles.sosButtonText}>SOS</Text>
            {isHolding && (
              <Text style={styles.holdingText}>Hold...</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>
              Your emergency contacts will receive:
            </Text>
            <View style={styles.previewMessage}>
              <Text style={styles.previewMessageText}>
                {'\u{1F6A8}'} SOS ALERT! {user?.name || 'User'} needs help
                immediately! Please check on them.
              </Text>
            </View>
            <Text style={styles.locationNote}>
              {'\u{1F4CD}'} Your location will be shared automatically
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0A0F',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: 'center',
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
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },

  // SOS Button
  sosButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xxl,
    height: SOS_BUTTON_SIZE + 40,
  },

  sosGlow: {
    position: 'absolute',
    width: SOS_BUTTON_SIZE + 60,
    height: SOS_BUTTON_SIZE + 60,
    borderRadius: (SOS_BUTTON_SIZE + 60) / 2,
    backgroundColor: Colors.sos,
  },

  progressRing: {
    position: 'absolute',
    width: SOS_BUTTON_SIZE + 20,
    height: SOS_BUTTON_SIZE + 20,
    borderRadius: (SOS_BUTTON_SIZE + 20) / 2,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: '#FFFFFF',
    borderRightColor: '#FFFFFF',
  },

  progressArc: {
    flex: 1,
  },

  sosButton: {
    width: SOS_BUTTON_SIZE,
    height: SOS_BUTTON_SIZE,
    borderRadius: SOS_BUTTON_SIZE / 2,
    backgroundColor: Colors.sos,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.sos,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 12,
  },

  sosButtonText: {
    fontSize: 48,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 4,
  },

  holdingText: {
    fontSize: FontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },

  // Bottom Section
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: Spacing.lg,
  },

  previewCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },

  previewLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },

  previewMessage: {
    backgroundColor: 'rgba(255, 0, 64, 0.1)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 64, 0.2)',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },

  previewMessageText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },

  locationNote: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // ---- Alert Sent View ----
  alertSentContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },

  alertSentEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },

  alertSentTitle: {
    fontSize: 36,
    fontWeight: FontWeight.black,
    color: Colors.sos,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },

  alertSentSubtitle: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },

  // Contacts list
  contactsListCard: {
    width: '100%',
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },

  contactsListTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },

  contactAvatarText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },

  contactInfo: {
    flex: 1,
  },

  contactName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },

  contactPhone: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },

  contactStatus: {
    fontSize: FontSize.sm,
    color: Colors.alive,
  },

  noContactsText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: Spacing.sm,
  },

  // Action buttons
  safeButton: {
    width: '100%',
    backgroundColor: Colors.alive,
    paddingVertical: 18,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },

  safeButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },

  emergencyCallButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.textPrimary,
    paddingVertical: 18,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emergencyCallButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
});
