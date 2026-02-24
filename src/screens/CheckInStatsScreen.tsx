import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useStore } from '../stores/useStore';

interface CheckInStatsScreenProps {
  navigation: any;
}

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

/** Format a timestamp as "Thu, Feb 13 at 3:45 PM" */
const formatCheckInDate = (ts: number): string => {
  const d = new Date(ts);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${weekday}, ${month} ${day} at ${time}`;
};

/** Count check-ins whose timestamp falls within the last N days (from start of day). */
const countCheckInsSince = (
  checkIns: { timestamp: number }[],
  days: number,
): number => {
  const now = new Date();
  const cutoff = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - (days - 1),
  ).getTime();
  return checkIns.filter((c) => c.timestamp >= cutoff).length;
};

/**
 * Walk through the full check-in history and return the longest consecutive-
 * day streak ever achieved.  Uses the same day-boundary logic as the store's
 * `calculateStreak` so the numbers stay consistent.
 */
const calculateLongestStreak = (
  checkIns: { timestamp: number }[],
): number => {
  if (checkIns.length === 0) return 0;

  // Build a Set of unique day-offsets (days since epoch) that have check-ins.
  const daySet = new Set<number>();
  for (const c of checkIns) {
    const d = new Date(c.timestamp);
    d.setHours(0, 0, 0, 0);
    daySet.add(d.getTime());
  }

  // Sort unique days ascending.
  const sortedDays = Array.from(daySet).sort((a, b) => a - b);
  const ONE_DAY = 86400000;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    if (sortedDays[i] - sortedDays[i - 1] === ONE_DAY) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }

  return longest;
};

// ────────────────────────────────────────────────────────────────────
// Stat card configuration
// ────────────────────────────────────────────────────────────────────

interface StatCardConfig {
  key: string;
  icon: string;
  label: string;
  bgColor: string;
  accentColor: string;
  iconBg: string;
}

const STAT_CARDS: StatCardConfig[] = [
  {
    key: 'currentStreak',
    icon: '\uD83D\uDD25', // fire
    label: 'Current streak',
    bgColor: 'rgba(255,168,0,0.15)',
    accentColor: '#FFA800',
    iconBg: 'rgba(255,168,0,0.25)',
  },
  {
    key: 'weeklyCheckIns',
    icon: '\uD83D\uDCC5', // calendar
    label: 'Check-ins this week',
    bgColor: 'rgba(100,130,255,0.15)',
    accentColor: '#6482FF',
    iconBg: 'rgba(100,130,255,0.25)',
  },
  {
    key: 'monthlyCheckIns',
    icon: '\uD83D\uDCC6', // tear-off calendar
    label: 'Check-ins this month',
    bgColor: 'rgba(180,100,255,0.15)',
    accentColor: '#B464FF',
    iconBg: 'rgba(180,100,255,0.25)',
  },
  {
    key: 'longestStreak',
    icon: '\uD83C\uDFC6', // trophy
    label: 'Longest streak',
    bgColor: 'rgba(255,100,130,0.15)',
    accentColor: '#FF6482',
    iconBg: 'rgba(255,100,130,0.25)',
  },
];

// ────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────

export default function CheckInStatsScreen({ navigation }: CheckInStatsScreenProps) {
  const { streak, checkIns } = useStore();

  // Derived stats — recalculate only when checkIns changes.
  const weeklyCount = useMemo(() => countCheckInsSince(checkIns, 7), [checkIns]);
  const monthlyCount = useMemo(() => countCheckInsSince(checkIns, 30), [checkIns]);
  const longestStreak = useMemo(() => calculateLongestStreak(checkIns), [checkIns]);

  const statValues: Record<string, number> = {
    currentStreak: streak,
    weeklyCheckIns: weeklyCount,
    monthlyCheckIns: monthlyCount,
    longestStreak,
  };

  // Recent check-ins (last 10, already sorted newest-first in store).
  const recentCheckIns = checkIns.slice(0, 10);

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backArrow}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistics</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Stat Cards ─────────────────────────────────────── */}
        {STAT_CARDS.map((card) => (
          <View
            key={card.key}
            style={[
              styles.statCard,
              {
                backgroundColor: card.bgColor,
                borderLeftColor: card.accentColor,
              },
            ]}
          >
            <View style={styles.statCardInner}>
              <View style={[styles.iconCircle, { backgroundColor: card.iconBg }]}>
                <Text style={styles.iconEmoji}>{card.icon}</Text>
              </View>
              <View style={styles.statTextGroup}>
                <Text style={styles.statLabel}>{card.label}</Text>
                <Text style={styles.statNumber}>
                  {statValues[card.key]}
                  {(card.key === 'currentStreak' || card.key === 'longestStreak') && (
                    <Text style={styles.statUnit}>
                      {' '}
                      {statValues[card.key] === 1 ? 'day' : 'days'}
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* ── Recent Check-ins Section ────────────────────────── */}
        <Text style={styles.sectionTitle}>Recent Check-ins</Text>

        {recentCheckIns.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{'\uD83D\uDCCB'}</Text>
            <Text style={styles.emptyTitle}>No check-ins yet</Text>
            <Text style={styles.emptySubtitle}>
              Your check-in history will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.recentList}>
            {recentCheckIns.map((ci, index) => (
              <View
                key={ci.id}
                style={[
                  styles.recentRow,
                  index < recentCheckIns.length - 1 && styles.recentRowBorder,
                ]}
              >
                <View style={styles.clockCircle}>
                  <Text style={styles.clockEmoji}>{'\uD83D\uDD50'}</Text>
                </View>
                <Text style={styles.recentDate} numberOfLines={1}>
                  {formatCheckInDate(ci.timestamp)}
                </Text>
                <View style={styles.checkedInBadge}>
                  <Text style={styles.checkedInText}>Checked in</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
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
  headerSpacer: {
    width: 40,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 48,
  },

  // ── Stat Cards ───────────────────────────────────────
  statCard: {
    borderRadius: 16,
    borderLeftWidth: 4,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  statCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconEmoji: {
    fontSize: 22,
  },
  statTextGroup: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9999B0',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555570',
  },

  // ── Section Title ────────────────────────────────────
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 16,
  },

  // ── Recent Check-ins ─────────────────────────────────
  recentList: {
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
    overflow: 'hidden',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  recentRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A40',
  },
  clockCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,255,136,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clockEmoji: {
    fontSize: 16,
  },
  recentDate: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  checkedInBadge: {
    backgroundColor: 'rgba(0,255,136,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  checkedInText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00FF88',
  },

  // ── Empty State ──────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#555570',
    textAlign: 'center',
  },
});
