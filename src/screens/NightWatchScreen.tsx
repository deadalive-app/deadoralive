// Dead.Alive — Night Watch Screen (Premium)

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

const QUICK_PRESETS = [
  { label: '10 PM', hour: 22, minute: 0 },
  { label: '11 PM', hour: 23, minute: 0 },
  { label: 'Midnight', hour: 0, minute: 0 },
  { label: '1 AM', hour: 1, minute: 0 },
  { label: '2 AM', hour: 2, minute: 0 },
] as const;

const formatTime12h = (timestamp: number): string => {
  if (timestamp === 0) return '11:00 PM';
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minuteStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${minuteStr} ${ampm}`;
};

const getReturnTimestamp = (hour: number, minute: number): number => {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);

  // If the target time is earlier than now, it means tomorrow
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime();
};

const formatCountdown = (targetTimestamp: number): string => {
  const now = Date.now();
  const diff = targetTimestamp - now;
  if (diff <= 0) return 'Overdue!';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

// ─── Component ──────────────────────────────────────────────────────────────

interface NightWatchScreenProps {
  navigation: any;
}

const NightWatchScreen: React.FC<NightWatchScreenProps> = ({ navigation }) => {
  const { nightWatch, updateNightWatch, isPremium } = useStore();

  const [alertMessage, setAlertMessage] = useState(nightWatch.alertMessage);
  const [selectedTime, setSelectedTime] = useState<number>(
    nightWatch.expectedReturnTime || getReturnTimestamp(23, 0)
  );
  const [countdownText, setCountdownText] = useState('');

  // Sync local alert message with store
  useEffect(() => {
    setAlertMessage(nightWatch.alertMessage);
  }, [nightWatch.alertMessage]);

  // Sync selected time with store
  useEffect(() => {
    if (nightWatch.expectedReturnTime > 0) {
      setSelectedTime(nightWatch.expectedReturnTime);
    }
  }, [nightWatch.expectedReturnTime]);

  // Update countdown every minute when active
  useEffect(() => {
    if (!nightWatch.isActive) return;

    const updateCountdown = () => {
      setCountdownText(formatCountdown(nightWatch.expectedReturnTime));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [nightWatch.isActive, nightWatch.expectedReturnTime]);

  // Save alert message on blur
  const handleAlertMessageBlur = useCallback(() => {
    if (alertMessage.trim() !== nightWatch.alertMessage) {
      updateNightWatch({ alertMessage: alertMessage.trim() });
    }
  }, [alertMessage, nightWatch.alertMessage, updateNightWatch]);

  // Toggle enabled
  const handleToggleEnabled = useCallback(
    (value: boolean) => {
      updateNightWatch({ enabled: value });
    },
    [updateNightWatch]
  );

  // Adjust time +/- 30 minutes
  const handleAdjustTime = useCallback(
    (direction: 'add' | 'subtract') => {
      const date = new Date(selectedTime);
      const adjustment = direction === 'add' ? 30 : -30;
      date.setMinutes(date.getMinutes() + adjustment);
      const newTime = date.getTime();
      setSelectedTime(newTime);
      updateNightWatch({ expectedReturnTime: newTime });
    },
    [selectedTime, updateNightWatch]
  );

  // Quick preset selection
  const handlePreset = useCallback(
    (hour: number, minute: number) => {
      const timestamp = getReturnTimestamp(hour, minute);
      setSelectedTime(timestamp);
      updateNightWatch({ expectedReturnTime: timestamp });
    },
    [updateNightWatch]
  );

  // Activate Night Watch
  const handleActivate = useCallback(() => {
    updateNightWatch({
      isActive: true,
      expectedReturnTime: selectedTime,
      startedAt: Date.now(),
    });
  }, [selectedTime, updateNightWatch]);

  // Deactivate — I'm Home Safe
  const handleDeactivate = useCallback(() => {
    updateNightWatch({
      isActive: false,
    });
    Alert.alert('Welcome Home!', 'Night Watch has been deactivated. Glad you\'re safe!', [
      { text: 'OK' },
    ]);
  }, [updateNightWatch]);

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
            <Text style={styles.headerTitle}>Night Watch</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Header */}
          <Text style={styles.title}>{'\uD83C\uDF19'} Night Watch</Text>
          <Text style={styles.subtitle}>Going out? Set a return timer.</Text>

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
          <Text style={styles.headerTitle}>Night Watch</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Header */}
        <Text style={styles.title}>{'\uD83C\uDF19'} Night Watch</Text>
        <Text style={styles.subtitle}>Going out? Set a return timer.</Text>

        {/* Enable Card */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelContainer}>
              <Text style={styles.cardTitle}>Night Watch</Text>
              <Text style={styles.cardDescription}>
                Set an expected return time. If you don't check in by then, your contacts will be
                alerted.
              </Text>
            </View>
            <Switch
              value={nightWatch.enabled}
              onValueChange={handleToggleEnabled}
              trackColor={{ false: '#2A2A40', true: '#FFB800' }}
              thumbColor={nightWatch.enabled ? '#FFFFFF' : '#555570'}
              ios_backgroundColor="#2A2A40"
            />
          </View>
        </View>

        {/* Return Time Picker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>I should be home by...</Text>

          {/* Large Time Display */}
          <View style={styles.timeDisplayContainer}>
            <TouchableOpacity
              style={styles.timeAdjustButton}
              activeOpacity={0.7}
              onPress={() => handleAdjustTime('subtract')}
            >
              <Text style={styles.timeAdjustText}>-30</Text>
            </TouchableOpacity>

            <Text style={styles.timeDisplay}>{formatTime12h(selectedTime)}</Text>

            <TouchableOpacity
              style={styles.timeAdjustButton}
              activeOpacity={0.7}
              onPress={() => handleAdjustTime('add')}
            >
              <Text style={styles.timeAdjustText}>+30</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Presets */}
          <View style={styles.presetsRow}>
            {QUICK_PRESETS.map((preset) => {
              const presetTimestamp = getReturnTimestamp(preset.hour, preset.minute);
              const isSelected =
                new Date(selectedTime).getHours() === preset.hour &&
                new Date(selectedTime).getMinutes() === preset.minute;
              return (
                <TouchableOpacity
                  key={preset.label}
                  style={[styles.presetButton, isSelected && styles.presetButtonSelected]}
                  activeOpacity={0.7}
                  onPress={() => handlePreset(preset.hour, preset.minute)}
                >
                  <Text
                    style={[
                      styles.presetButtonText,
                      isSelected && styles.presetButtonTextSelected,
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
          {nightWatch.isActive ? (
            <>
              <Text style={styles.statusActive}>
                {'\uD83C\uDF19'} Night Watch ACTIVE
              </Text>
              <Text style={styles.statusCountdown}>{countdownText}</Text>

              {/* I'm Home Safe Button */}
              <TouchableOpacity
                style={styles.homeSafeButton}
                activeOpacity={0.8}
                onPress={handleDeactivate}
              >
                <Text style={styles.homeSafeButtonText}>I'm Home Safe</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.statusInactive}>
              Set a time and activate when you head out
            </Text>
          )}
        </View>

        {/* Activate Button (only when not active) */}
        {!nightWatch.isActive && (
          <TouchableOpacity
            style={styles.activateButton}
            activeOpacity={0.8}
            onPress={handleActivate}
          >
            <Text style={styles.activateButtonText}>Activate Night Watch</Text>
          </TouchableOpacity>
        )}

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

  // Time Display
  timeDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  timeDisplay: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFB800',
    marginHorizontal: 20,
    minWidth: 200,
    textAlign: 'center',
  },
  timeAdjustButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#2A2A40',
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeAdjustText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9999B0',
  },

  // Presets
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A40',
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
  },
  presetButtonSelected: {
    borderColor: '#FFB800',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
  },
  presetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555570',
  },
  presetButtonTextSelected: {
    color: '#FFB800',
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
  statusActive: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFB800',
    marginBottom: 8,
  },
  statusCountdown: {
    fontSize: 15,
    color: '#9999B0',
    marginBottom: 20,
  },
  statusInactive: {
    fontSize: 15,
    color: '#555570',
    textAlign: 'center',
  },

  // Home Safe Button
  homeSafeButton: {
    backgroundColor: '#00FF88',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  homeSafeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0A0A0F',
  },

  // Activate Button
  activateButton: {
    backgroundColor: '#FFB800',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  activateButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0A0A0F',
  },

  // Bottom
  bottomSpacer: {
    height: 100,
  },
});

export default NightWatchScreen;
