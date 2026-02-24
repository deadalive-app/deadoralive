// Dead.Alive — Dead Man's Switch Screen (Premium)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useStore } from '../stores/useStore';

// ─── Helpers ────────────────────────────────────────────────────────────────

const THRESHOLD_OPTIONS = [6, 12, 24, 48, 72] as const;

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const formatHoursRemaining = (lastActivity: number, intervalHours: number): string => {
  const triggerTime = lastActivity + intervalHours * 3600000;
  const remaining = triggerTime - Date.now();
  if (remaining <= 0) return '0h 0m';
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};

const getProgressPercent = (lastActivity: number, intervalHours: number): number => {
  const totalMs = intervalHours * 3600000;
  const elapsed = Date.now() - lastActivity;
  const percent = Math.min((elapsed / totalMs) * 100, 100);
  return percent;
};

// ─── Component ──────────────────────────────────────────────────────────────

interface DeadMansSwitchScreenProps {
  navigation: any;
}

const DeadMansSwitchScreen: React.FC<DeadMansSwitchScreenProps> = ({ navigation }) => {
  const { deadMansSwitch, updateDeadMansSwitch, isPremium, emergencyContacts } = useStore();

  const [alertMessage, setAlertMessage] = useState(deadMansSwitch.alertMessage);

  // Sync local alert message with store when it changes externally
  useEffect(() => {
    setAlertMessage(deadMansSwitch.alertMessage);
  }, [deadMansSwitch.alertMessage]);

  // Save alert message on blur
  const handleAlertMessageBlur = useCallback(() => {
    if (alertMessage.trim() !== deadMansSwitch.alertMessage) {
      updateDeadMansSwitch({ alertMessage: alertMessage.trim() });
    }
  }, [alertMessage, deadMansSwitch.alertMessage, updateDeadMansSwitch]);

  // Toggle enabled
  const handleToggleEnabled = useCallback(
    (value: boolean) => {
      updateDeadMansSwitch({ enabled: value });
    },
    [updateDeadMansSwitch]
  );

  // Select threshold
  const handleSelectThreshold = useCallback(
    (hours: number) => {
      updateDeadMansSwitch({ intervalHours: hours });
    },
    [updateDeadMansSwitch]
  );

  // Arm / Disarm switch
  const handleToggleArm = useCallback(() => {
    if (!deadMansSwitch.isArmed) {
      // Arming
      if (emergencyContacts.length === 0) {
        Alert.alert(
          'No Contacts',
          'Add at least one emergency contact before arming the Dead Man\'s Switch.',
          [{ text: 'OK' }]
        );
        return;
      }
      updateDeadMansSwitch({
        isArmed: true,
        lastActivity: Date.now(),
      });
    } else {
      // Disarming
      updateDeadMansSwitch({ isArmed: false });
    }
  }, [deadMansSwitch.isArmed, emergencyContacts.length, updateDeadMansSwitch]);

  // Test alert
  const handleTestAlert = useCallback(() => {
    Alert.alert(
      'Test Alert Sent',
      `A test alert would be sent to ${emergencyContacts.length} contact(s) with the message:\n\n"${deadMansSwitch.alertMessage}"`,
      [{ text: 'OK' }]
    );
  }, [emergencyContacts.length, deadMansSwitch.alertMessage]);

  // ─── Premium Gate ───────────────────────────────────────────────────────
  if (!isPremium) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Row with Back Button */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.backArrow}>{'\u2190'}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dead Man's Switch</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Header */}
          <Text style={styles.title}>{'\uD83D\uDC80'} Dead Man's Switch</Text>
          <Text style={styles.subtitle}>If you go silent, we sound the alarm</Text>

          {/* Premium Banner */}
          <View style={styles.premiumBanner}>
            <Text style={styles.premiumBannerIcon}>{'\uD83D\uDD12'}</Text>
            <Text style={styles.premiumBannerTitle}>Premium Feature</Text>
            <Text style={styles.premiumBannerDescription}>
              Automatically alert your contacts if you go inactive for a set period
            </Text>
            <TouchableOpacity
              style={styles.premiumUpgradeButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Premium')}
            >
              <Text style={styles.premiumUpgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─── Premium Content ──────────────────────────────────────────────────
  const progress = deadMansSwitch.isArmed
    ? getProgressPercent(deadMansSwitch.lastActivity, deadMansSwitch.intervalHours)
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Row with Back Button */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backArrow}>{'\u2190'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dead Man's Switch</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Header */}
        <Text style={styles.title}>{'\uD83D\uDC80'} Dead Man's Switch</Text>
        <Text style={styles.subtitle}>If you go silent, we sound the alarm</Text>

        {/* Enable Toggle Card */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelContainer}>
              <Text style={styles.cardTitle}>Dead Man's Switch</Text>
              <Text style={styles.cardDescription}>
                When enabled, if you don't interact with the app for the set period, alerts will be
                sent automatically
              </Text>
            </View>
            <Switch
              value={deadMansSwitch.enabled}
              onValueChange={handleToggleEnabled}
              trackColor={{ false: '#2A2A40', true: '#00FF88' }}
              thumbColor={deadMansSwitch.enabled ? '#FFFFFF' : '#555570'}
              ios_backgroundColor="#2A2A40"
            />
          </View>
        </View>

        {/* Timer Setting Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inactivity Threshold</Text>
          <View style={styles.thresholdRow}>
            {THRESHOLD_OPTIONS.map((hours) => (
              <TouchableOpacity
                key={hours}
                style={[
                  styles.thresholdButton,
                  deadMansSwitch.intervalHours === hours && styles.thresholdButtonSelected,
                ]}
                activeOpacity={0.7}
                onPress={() => handleSelectThreshold(hours)}
              >
                <Text
                  style={[
                    styles.thresholdButtonText,
                    deadMansSwitch.intervalHours === hours && styles.thresholdButtonTextSelected,
                  ]}
                >
                  {hours}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.cardDescription}>
            Alert triggers after {deadMansSwitch.intervalHours} hours of inactivity
          </Text>
        </View>

        {/* Alert Message Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Alert Message</Text>
          <TextInput
            style={styles.messageInput}
            value={alertMessage}
            onChangeText={setAlertMessage}
            onBlur={handleAlertMessageBlur}
            placeholder="Enter your alert message..."
            placeholderTextColor="#555570"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={300}
          />
          <Text style={styles.charCount}>{alertMessage.length}/300</Text>
        </View>

        {/* Status Card */}
        <View style={styles.card}>
          {deadMansSwitch.isArmed ? (
            <>
              <Text style={styles.statusArmed}>
                {'\uD83D\uDFE2'} Switch is ARMED
              </Text>
              <Text style={styles.statusDetail}>
                Last activity: {formatTimeAgo(deadMansSwitch.lastActivity)}
              </Text>

              {/* Timer Visualization */}
              <View style={styles.timerContainer}>
                <View style={styles.timerBarBackground}>
                  <View
                    style={[
                      styles.timerBarFill,
                      {
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: progress > 80 ? '#FF3B5C' : progress > 50 ? '#FFB800' : '#00FF88',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.timerText}>
                  {formatHoursRemaining(deadMansSwitch.lastActivity, deadMansSwitch.intervalHours)}{' '}
                  remaining before trigger
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.statusDisarmed}>
              {'\u26AA'} Switch is DISARMED
            </Text>
          )}
        </View>

        {/* Arm / Disarm Button */}
        <TouchableOpacity
          style={[
            styles.armButton,
            deadMansSwitch.isArmed ? styles.armButtonDisarm : styles.armButtonArm,
          ]}
          activeOpacity={0.8}
          onPress={handleToggleArm}
        >
          <Text
            style={[
              styles.armButtonText,
              deadMansSwitch.isArmed ? styles.armButtonTextDisarm : styles.armButtonTextArm,
            ]}
          >
            {deadMansSwitch.isArmed ? 'Disarm Switch' : 'Arm Switch'}
          </Text>
        </TouchableOpacity>

        {/* Test Button */}
        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={handleTestAlert}
        >
          <Text style={styles.testButtonText}>Send Test Alert</Text>
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingHorizontal: 20,
  },

  // Header Row (back button)
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#141420',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A40',
  },
  backArrow: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Header
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#9999B0',
    marginBottom: 28,
  },

  // Premium Banner
  premiumBanner: {
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
    padding: 28,
    alignItems: 'center',
    marginTop: 20,
  },
  premiumBannerIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  premiumBannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 10,
  },
  premiumBannerDescription: {
    fontSize: 15,
    color: '#9999B0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  premiumUpgradeButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  premiumUpgradeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0F',
  },

  // Cards
  card: {
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 13,
    color: '#9999B0',
    lineHeight: 18,
    marginTop: 4,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  toggleLabelContainer: {
    flex: 1,
    marginRight: 16,
  },

  // Threshold Options
  thresholdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 4,
  },
  thresholdButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A40',
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
  },
  thresholdButtonSelected: {
    borderColor: '#00FF88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  thresholdButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555570',
  },
  thresholdButtonTextSelected: {
    color: '#00FF88',
  },

  // Alert Message
  messageInput: {
    backgroundColor: '#141420',
    borderWidth: 1,
    borderColor: '#2A2A40',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 15,
    minHeight: 100,
    lineHeight: 22,
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
    color: '#555570',
    textAlign: 'right',
    marginTop: 6,
  },

  // Status
  statusArmed: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00FF88',
    marginBottom: 8,
  },
  statusDisarmed: {
    fontSize: 18,
    fontWeight: '700',
    color: '#555570',
  },
  statusDetail: {
    fontSize: 14,
    color: '#9999B0',
    marginBottom: 16,
  },

  // Timer
  timerContainer: {
    marginTop: 4,
  },
  timerBarBackground: {
    height: 8,
    backgroundColor: '#2A2A40',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  timerBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  timerText: {
    fontSize: 13,
    color: '#9999B0',
  },

  // Arm Button
  armButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  armButtonArm: {
    backgroundColor: '#00FF88',
  },
  armButtonDisarm: {
    backgroundColor: '#FF3B5C',
  },
  armButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
  armButtonTextArm: {
    color: '#0A0A0F',
  },
  armButtonTextDisarm: {
    color: '#FFFFFF',
  },

  // Test Button
  testButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A40',
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  testButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9999B0',
  },

  // Bottom
  bottomSpacer: {
    height: 100,
  },
});

export default DeadMansSwitchScreen;
