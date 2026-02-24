// Dead.Alive — Home Screen (Premium Redesign)

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '../stores/useStore';
import { formatTimestamp, getScoreGrade } from '../utils/helpers';
import PinPad from '../components/PinPad';
import type { Alert as AlertData, AlertType } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Helpers ────────────────────────────────────────────────────────────────

const isToday = (timestamp: number): boolean => {
  const date = new Date(timestamp);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const getAlertEmoji = (type: AlertType): string => {
  switch (type) {
    case 'sos':
      return '\u{1F6A8}';
    case 'missed_checkin':
      return '\u23F0';
    case 'dead_mans_switch':
      return '\u{1F480}';
    case 'night_watch':
      return '\u{1F319}';
    case 'walk_me_home':
      return '\u{1F6B6}';
    case 'duress':
      return '\u26A0\uFE0F';
    case 'circle_alert':
      return '\u{1F465}';
    case 'timer_expired':
      return '\u23F1';
    default:
      return '\u{1F514}';
  }
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#00FF88';
  if (score >= 60) return '#88FF00';
  if (score >= 40) return '#FFB800';
  if (score >= 20) return '#FF8800';
  return '#FF3B5C';
};

const getTimeOfDay = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

/** Returns "Xh Ym" until next check-in (24h from last) */
const getCountdown = (lastCheckIn: number | null): string => {
  if (!lastCheckIn) return 'Check in now';
  const nextDue = lastCheckIn + 24 * 60 * 60 * 1000;
  const diff = nextDue - Date.now();
  if (diff <= 0) return 'Overdue!';
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${mins}m`;
};

// ─── Safety Tips Data ────────────────────────────────────────────────────────

const SAFETY_TIPS = [
  { emoji: '\u{1F511}', text: 'Share your live location with a trusted contact when going out alone.', color: '#00FF88' },
  { emoji: '\u{1F50B}', text: 'Keep your phone charged above 20% when leaving home.', color: '#FFB800' },
  { emoji: '\u{1F6B6}', text: 'Walk in well-lit areas and stay aware of your surroundings.', color: '#00B4FF' },
  { emoji: '\u{1F4CD}', text: "Set up your Dead Man's Switch before solo hikes or travel.", color: '#FF8800' },
  { emoji: '\u{1F3E0}', text: 'Let someone know your daily routine and expected check-in times.', color: '#BB88FF' },
  { emoji: '\u{1F198}', text: 'Practice activating your SOS alert so it becomes muscle memory.', color: '#FF3B5C' },
];

// ─── Quick Action Data ──────────────────────────────────────────────────────

interface QuickAction {
  emoji: string;
  label: string;
  bgColor: string;
  borderColor: string;
  onPress: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  // Store
  const user = useStore((s) => s.user);
  const streak = useStore((s) => s.streak);
  const lastCheckIn = useStore((s) => s.lastCheckIn);
  const performCheckIn = useStore((s) => s.performCheckIn);
  const safetyScore = useStore((s) => s.safetyScore);
  const alerts = useStore((s) => s.alerts);
  const settings = useStore((s) => s.settings);
  const isPremium = useStore((s) => s.isPremium);
  const pauseCheckIns = useStore((s) => s.pauseCheckIns);
  const duressPin = useStore((s) => s.duressPin);
  const triggerDuressAlert = useStore((s) => s.triggerDuressAlert);

  // Local state
  const [checkedInToday, setCheckedInToday] = useState<boolean>(false);
  const [justCheckedIn, setJustCheckedIn] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<string>('');
  const [showPinPad, setShowPinPad] = useState<boolean>(false);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const checkInOpacityAnim = useRef(new Animated.Value(0)).current;

  // Determine if user checked in today
  useEffect(() => {
    if (lastCheckIn && isToday(lastCheckIn)) {
      setCheckedInToday(true);
    } else {
      setCheckedInToday(false);
    }
  }, [lastCheckIn]);

  // Countdown timer — updates every minute
  useEffect(() => {
    setCountdown(getCountdown(lastCheckIn));
    const interval = setInterval(() => {
      setCountdown(getCountdown(lastCheckIn));
    }, 60000);
    return () => clearInterval(interval);
  }, [lastCheckIn]);

  // Pulse animation loop
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
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
  }, [pulseAnim, glowAnim]);

  // Handle check-in
  const handleCheckIn = useCallback(() => {
    // Haptic feedback
    if (settings.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    performCheckIn();
    setCheckedInToday(true);
    setJustCheckedIn(true);

    // Flash the success overlay
    Animated.sequence([
      Animated.timing(checkInOpacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.delay(1200),
      Animated.timing(checkInOpacityAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setJustCheckedIn(false);
    });
  }, [settings.haptics, performCheckIn, checkInOpacityAnim]);

  // Handle duress PIN long-press
  const handleDuressEntry = useCallback(() => {
    if (!duressPin.enabled || !isPremium) return;
    if (settings.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowPinPad(true);
  }, [duressPin.enabled, isPremium, settings.haptics]);

  // Handle duress PIN submission
  const handlePinSubmit = useCallback((pin: string) => {
    setShowPinPad(false);
    if (pin === duressPin.pin) {
      // Silent duress alert + fake check-in animation
      triggerDuressAlert();
      performCheckIn();
      setCheckedInToday(true);
      setJustCheckedIn(true);
      Animated.sequence([
        Animated.timing(checkInOpacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(1200),
        Animated.timing(checkInOpacityAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => setJustCheckedIn(false));
    }
  }, [duressPin.pin, triggerDuressAlert, performCheckIn, checkInOpacityAnim]);

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      emoji: '\u{1F6A8}',
      label: 'SOS',
      bgColor: 'rgba(255, 59, 92, 0.15)',
      borderColor: '#FF3B5C',
      onPress: () => navigation.navigate('SOS'),
    },
    {
      emoji: '\u{1F4CD}',
      label: 'Share\nLocation',
      bgColor: 'rgba(0, 180, 255, 0.1)',
      borderColor: '#2A2A40',
      onPress: () => {
        if (settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.navigate('ShareLocation');
      },
    },
    {
      emoji: '\u{1F4DE}',
      label: 'Fake\nCall',
      bgColor: 'rgba(187, 136, 255, 0.1)',
      borderColor: '#2A2A40',
      onPress: () => navigation.navigate('FakeCall'),
    },
    {
      emoji: '\u{1F465}',
      label: 'My\nCircle',
      bgColor: 'rgba(0, 255, 136, 0.08)',
      borderColor: '#2A2A40',
      onPress: () => navigation.navigate('Circles'),
    },
  ];

  // Recent alerts (last 3)
  const recentAlerts = alerts.slice(0, 3);

  // Safety score display
  const scoreGrade = getScoreGrade(safetyScore.total);
  const scoreColor = getScoreColor(safetyScore.total);

  // Greeting
  const userName = user?.name || 'Friend';
  const isOverdue = lastCheckIn ? (Date.now() - lastCheckIn > 24 * 60 * 60 * 1000) : false;
  const isPaused = !!(pauseCheckIns.paused && pauseCheckIns.resumeAt && Date.now() < pauseCheckIns.resumeAt);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ──────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getTimeOfDay()},</Text>
            <Text style={styles.greetingName}>{userName}</Text>
          </View>
          <TouchableOpacity
            style={styles.streakBadge}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CheckInStats')}
          >
            <Text style={styles.streakEmoji}>{'\u{1F525}'}</Text>
            <Text style={styles.streakNumber}>{streak}</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Safety Status Banner ────────────────────────────── */}
        <View style={[
          styles.statusBanner,
          isOverdue && !isPaused && styles.statusBannerDanger,
          isPaused && styles.statusBannerPaused,
        ]}>
          <View style={[
            styles.statusDot,
            isPaused ? styles.statusDotPaused : isOverdue ? styles.statusDotDanger : styles.statusDotOk,
          ]} />
          <Text style={[
            styles.statusLabel,
            isOverdue && !isPaused && styles.statusLabelDanger,
            isPaused && styles.statusLabelPaused,
          ]}>
            {isPaused
              ? 'Status: PAUSED'
              : isOverdue
                ? 'Status: OVERDUE'
                : checkedInToday
                  ? 'Status: ALIVE'
                  : 'Status: PENDING'}
          </Text>
          <Text style={styles.statusCountdown}>
            {isPaused && pauseCheckIns.resumeAt
              ? `Resumes ${new Date(pauseCheckIns.resumeAt).toLocaleDateString()}`
              : checkedInToday
                ? `Next in ${countdown}`
                : countdown}
          </Text>
        </View>

        {/* ─── Check-in Circle ─────────────────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCheckIn}
          onLongPress={handleDuressEntry}
          delayLongPress={800}
          style={styles.statusCard}
        >
          <View style={styles.circleContainer}>
            {/* Outer glow ring */}
            <Animated.View
              style={[
                styles.outerGlow,
                checkedInToday && styles.outerGlowCheckedIn,
                {
                  opacity: glowAnim,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />

            {/* Main circle */}
            <Animated.View
              style={[
                styles.mainCircle,
                checkedInToday && styles.mainCircleCheckedIn,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Text style={[styles.circleEmoji, checkedInToday && styles.circleEmojiCheckedIn]}>
                {checkedInToday ? '\u2713' : '\u{1F44B}'}
              </Text>
              <Text style={[styles.circleLabel, checkedInToday && styles.circleLabelCheckedIn]}>
                {checkedInToday ? 'CHECKED IN' : 'CHECK IN'}
              </Text>
            </Animated.View>

            {/* Success flash overlay */}
            <Animated.View
              style={[styles.successFlash, { opacity: checkInOpacityAnim }]}
              pointerEvents="none"
            />
          </View>

          {/* Last check-in time */}
          <Text style={styles.lastCheckInText}>
            {lastCheckIn
              ? `Last: ${formatTimestamp(lastCheckIn)}`
              : 'No check-ins yet'}
          </Text>
        </TouchableOpacity>

        {/* ─── Quick Stats Row ─────────────────────────────────── */}
        <TouchableOpacity
          style={styles.statsRow}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CheckInStats')}
        >
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: scoreColor }]}>{safetyScore.total}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{alerts.length}</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{scoreGrade.label}</Text>
            <Text style={styles.statLabel}>Grade</Text>
          </View>
        </TouchableOpacity>

        {/* ─── Quick Actions ───────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.quickActionCard,
                { backgroundColor: action.bgColor, borderColor: action.borderColor },
              ]}
              activeOpacity={0.7}
              onPress={action.onPress}
            >
              <Text style={styles.quickActionEmoji}>{action.emoji}</Text>
              <Text
                style={[
                  styles.quickActionLabel,
                  index === 0 && styles.quickActionLabelSOS,
                ]}
                numberOfLines={2}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Safety Tools ─────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Safety Tools</Text>
        <View style={styles.toolsGrid}>
          <TouchableOpacity
            style={styles.toolCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('DeadMansSwitch')}
          >
            <View style={[styles.toolIconBg, { backgroundColor: 'rgba(255,168,0,0.12)' }]}>
              <Text style={styles.toolEmoji}>{'\u{1F480}'}</Text>
            </View>
            <View style={styles.toolContent}>
              <Text style={styles.toolTitle}>Dead Man's Switch</Text>
              <Text style={styles.toolDesc}>Auto-alert if inactive</Text>
            </View>
            {!isPremium && <Text style={styles.proBadge}>PRO</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('NightWatch')}
          >
            <View style={[styles.toolIconBg, { backgroundColor: 'rgba(100,130,255,0.12)' }]}>
              <Text style={styles.toolEmoji}>{'\u{1F319}'}</Text>
            </View>
            <View style={styles.toolContent}>
              <Text style={styles.toolTitle}>Night Watch</Text>
              <Text style={styles.toolDesc}>Going out? Set a timer</Text>
            </View>
            {!isPremium && <Text style={styles.proBadge}>PRO</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('WalkMeHome')}
          >
            <View style={[styles.toolIconBg, { backgroundColor: 'rgba(0,180,255,0.12)' }]}>
              <Text style={styles.toolEmoji}>{'\u{1F6B6}'}</Text>
            </View>
            <View style={styles.toolContent}>
              <Text style={styles.toolTitle}>Walk Me Home</Text>
              <Text style={styles.toolDesc}>Trip timer with location</Text>
            </View>
            {!isPremium && <Text style={styles.proBadge}>PRO</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('TrustedContacts')}
          >
            <View style={[styles.toolIconBg, { backgroundColor: 'rgba(0,255,136,0.12)' }]}>
              <Text style={styles.toolEmoji}>{'\u{1F4F1}'}</Text>
            </View>
            <View style={styles.toolContent}>
              <Text style={styles.toolTitle}>Quick Dial</Text>
              <Text style={styles.toolDesc}>Call contacts instantly</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('MoodTracker')}
          >
            <View style={[styles.toolIconBg, { backgroundColor: 'rgba(255,215,0,0.12)' }]}>
              <Text style={styles.toolEmoji}>{'\u{1F60A}'}</Text>
            </View>
            <View style={styles.toolContent}>
              <Text style={styles.toolTitle}>Mood Tracker</Text>
              <Text style={styles.toolDesc}>Track your wellness</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('EmergencyInfo')}
          >
            <View style={[styles.toolIconBg, { backgroundColor: 'rgba(255,59,92,0.12)' }]}>
              <Text style={styles.toolEmoji}>{'\u{1F3E5}'}</Text>
            </View>
            <View style={styles.toolContent}>
              <Text style={styles.toolTitle}>Emergency Medical Card</Text>
              <Text style={styles.toolDesc}>Blood type, allergies, meds</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SafetyScore')}
          >
            <View style={[styles.toolIconBg, { backgroundColor: `${scoreColor}1A` }]}>
              <Text style={styles.toolEmoji}>{'\u{1F3AF}'}</Text>
            </View>
            <View style={styles.toolContent}>
              <Text style={styles.toolTitle}>Safety Score</Text>
              <Text style={styles.toolDesc}>{safetyScore.total}/100 — {scoreGrade.label}</Text>
            </View>
            <Text style={[styles.scoreInline, { color: scoreColor }]}>{safetyScore.total}</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Recent Activity ─────────────────────────────────── */}
        <View style={styles.recentActivitySection}>
          <View style={styles.recentActivityHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {recentAlerts.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('Activity')}>
                <Text style={styles.viewAllLink}>View All {'\u2192'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentAlerts.length > 0 ? (
            recentAlerts.map((alert: AlertData) => (
              <View key={alert.id} style={styles.activityItem}>
                <Text style={styles.activityEmoji}>
                  {getAlertEmoji(alert.type)}
                </Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityMessage} numberOfLines={1}>
                    {alert.message}
                  </Text>
                  <Text style={styles.activityTime}>
                    {formatTimestamp(alert.timestamp)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.activityStatusDot,
                    {
                      backgroundColor:
                        alert.status === 'resolved' ? '#00FF88' : '#FFB800',
                    },
                  ]}
                />
              </View>
            ))
          ) : (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityEmoji}>{'\u{1F49A}'}</Text>
              <Text style={styles.emptyActivityText}>
                No alerts yet. Stay safe!
              </Text>
            </View>
          )}
        </View>

        {/* ─── Safety Tips ─────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Safety Tips</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tipsScroll}
          contentContainerStyle={styles.tipsScrollContent}
        >
          {SAFETY_TIPS.map((tip, i) => (
            <View key={i} style={[styles.tipCard, { borderLeftColor: tip.color }]}>
              <Text style={styles.tipEmoji}>{tip.emoji}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Duress PIN Pad */}
      <PinPad
        visible={showPinPad}
        onClose={() => setShowPinPad(false)}
        onSubmit={handlePinSubmit}
        title="Enter PIN"
      />
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const CIRCLE_SIZE = 140;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingHorizontal: 20,
  },

  // ─── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9999B0',
  },
  greetingName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 168, 0, 0.12)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 168, 0, 0.25)',
  },
  streakEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  streakNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFA800',
  },

  // ─── Status Banner ───────────────────────────────────────
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statusBannerDanger: {
    backgroundColor: 'rgba(255, 59, 92, 0.08)',
    borderColor: 'rgba(255, 59, 92, 0.2)',
  },
  statusBannerPaused: {
    backgroundColor: 'rgba(255, 184, 0, 0.08)',
    borderColor: 'rgba(255, 184, 0, 0.2)',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusDotOk: {
    backgroundColor: '#00FF88',
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#00FF88', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6 }
      : { elevation: 4 }),
  },
  statusDotDanger: {
    backgroundColor: '#FF3B5C',
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#FF3B5C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6 }
      : { elevation: 4 }),
  },
  statusDotPaused: {
    backgroundColor: '#FFB800',
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#FFB800', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6 }
      : { elevation: 4 }),
  },
  statusLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#00FF88',
    letterSpacing: 0.5,
  },
  statusLabelDanger: {
    color: '#FF3B5C',
  },
  statusLabelPaused: {
    color: '#FFB800',
  },
  statusCountdown: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9999B0',
  },

  // ─── Check-in Circle ─────────────────────────────────────
  statusCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  circleContainer: {
    width: CIRCLE_SIZE + 40,
    height: CIRCLE_SIZE + 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  outerGlow: {
    position: 'absolute',
    width: CIRCLE_SIZE + 40,
    height: CIRCLE_SIZE + 40,
    borderRadius: (CIRCLE_SIZE + 40) / 2,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#00FF88',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#00FF88',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 25,
        }
      : { elevation: 10 }),
  },
  outerGlowCheckedIn: {
    borderColor: '#00FF88',
    ...(Platform.OS === 'ios'
      ? { shadowOpacity: 0.3, shadowRadius: 15 }
      : {}),
  },
  mainCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
    borderWidth: 3,
    borderColor: '#00FF88',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#00FF88',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
        }
      : { elevation: 8 }),
  },
  mainCircleCheckedIn: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  circleEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  circleEmojiCheckedIn: {
    fontSize: 36,
    color: '#0A0A0F',
  },
  circleLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00FF88',
    letterSpacing: 1.5,
  },
  circleLabelCheckedIn: {
    color: '#0A0A0F',
  },
  successFlash: {
    position: 'absolute',
    width: CIRCLE_SIZE + 60,
    height: CIRCLE_SIZE + 60,
    borderRadius: (CIRCLE_SIZE + 60) / 2,
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
  },
  lastCheckInText: {
    fontSize: 13,
    color: '#555570',
  },

  // ─── Quick Stats Row ─────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
    paddingVertical: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#555570',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#2A2A40',
  },

  // ─── Section Title ───────────────────────────────────────
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
  },

  // ─── Quick Actions Grid ──────────────────────────────────
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  quickActionCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  quickActionEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9999B0',
    textAlign: 'center',
    lineHeight: 13,
  },
  quickActionLabelSOS: {
    color: '#FF3B5C',
    fontWeight: '700',
  },

  // ─── Safety Tools List ───────────────────────────────────
  toolsGrid: {
    marginBottom: 24,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141420',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A40',
    padding: 14,
    marginBottom: 8,
  },
  toolIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  toolEmoji: {
    fontSize: 22,
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  toolDesc: {
    fontSize: 12,
    color: '#555570',
  },
  proBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
    letterSpacing: 0.5,
  },
  scoreInline: {
    fontSize: 20,
    fontWeight: '800',
  },

  // ─── Recent Activity ─────────────────────────────────────
  recentActivitySection: {
    marginBottom: 24,
  },
  recentActivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  viewAllLink: {
    fontSize: 13,
    color: '#00FF88',
    fontWeight: '500',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141420',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A40',
    padding: 14,
    marginBottom: 8,
  },
  activityEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#555570',
  },
  activityStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  emptyActivity: {
    backgroundColor: '#141420',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A40',
    padding: 28,
    alignItems: 'center',
  },
  emptyActivityEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyActivityText: {
    fontSize: 14,
    color: '#555570',
  },

  // ─── Safety Tips ─────────────────────────────────────────
  tipsScroll: {
    marginHorizontal: -20,
    marginBottom: 16,
  },
  tipsScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tipCard: {
    width: 200,
    backgroundColor: '#141420',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A40',
    borderLeftWidth: 3,
    padding: 16,
  },
  tipEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#9999B0',
    lineHeight: 18,
  },

  // ─── Bottom ──────────────────────────────────────────────
  bottomSpacer: {
    height: 100,
  },
});

export default HomeScreen;
