// Dead.Alive — Walk Me Home Screen (Premium)

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

const QUICK_PRESETS = [5, 10, 15, 20, 30, 60] as const;

const formatCountdown = (startedAt: number, durationMinutes: number): string => {
  const endTime = startedAt + durationMinutes * 60000;
  const now = Date.now();
  const diff = endTime - now;
  if (diff <= 0) return 'Overdue!';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

// ─── Component ──────────────────────────────────────────────────────────────

interface WalkMeHomeScreenProps {
  navigation: any;
}

const WalkMeHomeScreen: React.FC<WalkMeHomeScreenProps> = ({ navigation }) => {
  const { walkMeHome, updateWalkMeHome, triggerWalkMeHomeAlert, isPremium } = useStore();

  const [alertMessage, setAlertMessage] = useState(walkMeHome.alertMessage);
  const [selectedDuration, setSelectedDuration] = useState<number>(
    walkMeHome.durationMinutes || 15
  );
  const [destination, setDestination] = useState(walkMeHome.destination || '');
  const [countdownText, setCountdownText] = useState('');

  // Sync local alert message with store
  useEffect(() => {
    setAlertMessage(walkMeHome.alertMessage);
  }, [walkMeHome.alertMessage]);

  // Sync selected duration with store
  useEffect(() => {
    if (walkMeHome.durationMinutes > 0) {
      setSelectedDuration(walkMeHome.durationMinutes);
    }
  }, [walkMeHome.durationMinutes]);

  // Sync destination with store
  useEffect(() => {
    setDestination(walkMeHome.destination || '');
  }, [walkMeHome.destination]);

  // Update countdown every minute when active
  useEffect(() => {
    if (!walkMeHome.isActive || !walkMeHome.startedAt) return;

    const updateCountdown = () => {
      const text = formatCountdown(walkMeHome.startedAt!, walkMeHome.durationMinutes);
      setCountdownText(text);

      // Check if timer has expired
      const endTime = walkMeHome.startedAt! + walkMeHome.durationMinutes * 60000;
      if (Date.now() >= endTime) {
        triggerWalkMeHomeAlert();
        Alert.alert(
          'Walk Me Home Alert',
          'Timer expired! Your emergency contacts have been alerted.',
          [{ text: 'OK' }]
        );
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [walkMeHome.isActive, walkMeHome.startedAt, walkMeHome.durationMinutes, triggerWalkMeHomeAlert]);

  // Save alert message on blur
  const handleAlertMessageBlur = useCallback(() => {
    if (alertMessage.trim() !== walkMeHome.alertMessage) {
      updateWalkMeHome({ alertMessage: alertMessage.trim() });
    }
  }, [alertMessage, walkMeHome.alertMessage, updateWalkMeHome]);

  // Save destination on blur
  const handleDestinationBlur = useCallback(() => {
    if (destination.trim() !== (walkMeHome.destination || '')) {
      updateWalkMeHome({ destination: destination.trim() || undefined });
    }
  }, [destination, walkMeHome.destination, updateWalkMeHome]);

  // Toggle enabled
  const handleToggleEnabled = useCallback(
    (value: boolean) => {
      updateWalkMeHome({ enabled: value });
    },
    [updateWalkMeHome]
  );

  // Adjust duration +/- 5 minutes
  const handleAdjustDuration = useCallback(
    (direction: 'add' | 'subtract') => {
      const adjustment = direction === 'add' ? 5 : -5;
      const newDuration = Math.max(5, Math.min(120, selectedDuration + adjustment));
      setSelectedDuration(newDuration);
      updateWalkMeHome({ durationMinutes: newDuration });
    },
    [selectedDuration, updateWalkMeHome]
  );

  // Quick preset selection
  const handlePreset = useCallback(
    (minutes: number) => {
      setSelectedDuration(minutes);
      updateWalkMeHome({ durationMinutes: minutes });
    },
    [updateWalkMeHome]
  );

  // Activate Walk Me Home
  const handleActivate = useCallback(() => {
    updateWalkMeHome({
      isActive: true,
      durationMinutes: selectedDuration,
      startedAt: Date.now(),
      destination: destination.trim() || undefined,
    });
  }, [selectedDuration, destination, updateWalkMeHome]);

  // Deactivate — I've Arrived
  const handleDeactivate = useCallback(() => {
    updateWalkMeHome({
      isActive: false,
      startedAt: null,
    });
    Alert.alert('You\'ve Arrived!', 'Walk Me Home has been deactivated. Glad you\'re safe!', [
      { text: 'OK' },
    ]);
  }, [updateWalkMeHome]);

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
            <Text style={styles.headerTitle}>Walk Me Home</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Header */}
          <Text style={styles.title}>{'\uD83D\uDEB6'} Walk Me Home</Text>
          <Text style={styles.subtitle}>Set a timer. Arrive safely.</Text>

          {/* Premium Banner */}
          <View style={styles.premiumBanner}>
            <Text style={styles.premiumBannerIcon}>{'\uD83D\uDD12'}</Text>
            <Text style={styles.premiumBannerTitle}>Premium Feature</Text>
            <Text style={styles.premiumBannerDescription}>
              Set a trip timer. If you don't arrive before it expires, your contacts get alerted.
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
          <Text style={styles.headerTitle}>Walk Me Home</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Header */}
        <Text style={styles.title}>{'\uD83D\uDEB6'} Walk Me Home</Text>
        <Text style={styles.subtitle}>Set a timer. Arrive safely.</Text>

        {/* Enable Card */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelContainer}>
              <Text style={styles.cardTitle}>Walk Me Home</Text>
              <Text style={styles.cardDescription}>
                Set a trip duration. If you don't tap "I've Arrived" before the timer expires, your
                contacts will be alerted.
              </Text>
            </View>
            <Switch
              value={walkMeHome.enabled}
              onValueChange={handleToggleEnabled}
              trackColor={{ false: '#2A2A40', true: '#00FF88' }}
              thumbColor={walkMeHome.enabled ? '#FFFFFF' : '#555570'}
              ios_backgroundColor="#2A2A40"
            />
          </View>
        </View>

        {/* Duration Picker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>I should arrive in...</Text>

          {/* Large Duration Display */}
          <View style={styles.timeDisplayContainer}>
            <TouchableOpacity
              style={styles.timeAdjustButton}
              activeOpacity={0.7}
              onPress={() => handleAdjustDuration('subtract')}
            >
              <Text style={styles.timeAdjustText}>-5</Text>
            </TouchableOpacity>

            <Text style={styles.timeDisplay}>{selectedDuration} min</Text>

            <TouchableOpacity
              style={styles.timeAdjustButton}
              activeOpacity={0.7}
              onPress={() => handleAdjustDuration('add')}
            >
              <Text style={styles.timeAdjustText}>+5</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Presets */}
          <View style={styles.presetsRow}>
            {QUICK_PRESETS.map((minutes) => {
              const isSelected = selectedDuration === minutes;
              return (
                <TouchableOpacity
                  key={minutes}
                  style={[styles.presetButton, isSelected && styles.presetButtonSelected]}
                  activeOpacity={0.7}
                  onPress={() => handlePreset(minutes)}
                >
                  <Text
                    style={[
                      styles.presetButtonText,
                      isSelected && styles.presetButtonTextSelected,
                    ]}
                  >
                    {minutes}m
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Destination Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Destination</Text>
          <TextInput
            style={styles.destinationInput}
            value={destination}
            onChangeText={setDestination}
            onBlur={handleDestinationBlur}
            placeholder="Where are you going? (optional)"
            placeholderTextColor="#555570"
          />
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
          {walkMeHome.isActive ? (
            <>
              <Text style={styles.statusActive}>
                {'\uD83D\uDEB6'} Walk Me Home ACTIVE
              </Text>
              <Text style={styles.statusCountdown}>{countdownText}</Text>

              {/* I've Arrived Button */}
              <TouchableOpacity
                style={styles.arrivedButton}
                activeOpacity={0.8}
                onPress={handleDeactivate}
              >
                <Text style={styles.arrivedButtonText}>I've Arrived</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.statusInactive}>
              Set a duration and start when you leave
            </Text>
          )}
        </View>

        {/* Activate Button (only when not active) */}
        {!walkMeHome.isActive && (
          <TouchableOpacity
            style={styles.activateButton}
            activeOpacity={0.8}
            onPress={handleActivate}
          >
            <Text style={styles.activateButtonText}>Start Walk</Text>
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

  // Duration Display
  timeDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  timeDisplay: {
    fontSize: 42,
    fontWeight: '800',
    color: '#00B4FF',
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
    borderColor: '#00B4FF',
    backgroundColor: 'rgba(0, 180, 255, 0.1)',
  },
  presetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555570',
  },
  presetButtonTextSelected: {
    color: '#00B4FF',
  },

  // Destination Input
  destinationInput: {
    backgroundColor: '#141420',
    borderWidth: 1,
    borderColor: '#2A2A40',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 15,
    marginTop: 4,
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
    color: '#00B4FF',
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

  // Arrived Button
  arrivedButton: {
    backgroundColor: '#00FF88',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  arrivedButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0A0A0F',
  },

  // Activate Button
  activateButton: {
    backgroundColor: '#00B4FF',
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

export default WalkMeHomeScreen;
