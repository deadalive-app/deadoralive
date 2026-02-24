import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useStore } from '../stores/useStore';
import { formatTimestamp, formatDate, formatTime } from '../utils/helpers';
import type { AlertType } from '../types';

interface AlertHistoryScreenProps {
  navigation: any;
}

type FilterTab = 'all' | 'sos' | 'missed_checkin' | 'circle_alert' | 'timer_expired';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'sos', label: 'SOS' },
  { key: 'missed_checkin', label: 'Missed Check-in' },
  { key: 'circle_alert', label: 'Circle' },
  { key: 'timer_expired', label: 'Timer' },
];

const getAlertEmoji = (type: AlertType): string => {
  switch (type) {
    case 'sos':
      return '\uD83D\uDEA8';
    case 'missed_checkin':
    case 'dead_mans_switch':
      return '\u23F0';
    case 'circle_alert':
      return '\uD83D\uDC65';
    case 'night_watch':
    case 'timer_expired':
      return '\u23F1\uFE0F';
    default:
      return '\uD83D\uDEA8';
  }
};

const getStatusBadge = (
  status: string,
): { label: string; color: string; bgColor: string } => {
  switch (status) {
    case 'sent':
    case 'acknowledged':
      return { label: 'Sent', color: '#FFB800', bgColor: 'rgba(255, 184, 0, 0.15)' };
    case 'resolved':
      return { label: 'Resolved', color: '#00FF88', bgColor: 'rgba(0, 255, 136, 0.15)' };
    case 'expired':
      return { label: 'Expired', color: '#555570', bgColor: 'rgba(85, 85, 112, 0.15)' };
    default:
      return { label: status, color: '#9999B0', bgColor: 'rgba(153, 153, 176, 0.15)' };
  }
};

export default function AlertHistoryScreen({ navigation }: AlertHistoryScreenProps) {
  const { alerts, resolveAlert, clearAlertHistory } = useStore();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filteredAlerts =
    activeFilter === 'all'
      ? alerts
      : alerts.filter((a) => a.type === activeFilter);

  const handleResolve = (alertId: string) => {
    resolveAlert(alertId);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Alert History',
      'Are you sure you want to clear all alert history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearAlertHistory(),
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <Text style={styles.title}>Alert History</Text>
      <Text style={styles.subtitle}>All your safety alerts</Text>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              activeFilter === tab.key && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === tab.key && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Alert List */}
      {filteredAlerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>{'\uD83D\uDCCB'}</Text>
          <Text style={styles.emptyTitle}>No alerts yet</Text>
          <Text style={styles.emptySubtitle}>
            Your alert history will appear here
          </Text>
        </View>
      ) : (
        <View style={styles.alertList}>
          {filteredAlerts.map((alert) => {
            const badge = getStatusBadge(alert.status);
            return (
              <View key={alert.id} style={styles.alertCard}>
                <View style={styles.alertRow}>
                  <Text style={styles.alertEmoji}>
                    {getAlertEmoji(alert.type)}
                  </Text>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertMessage} numberOfLines={2}>
                      {alert.message}
                    </Text>
                    <Text style={styles.alertTimestamp}>
                      {formatDate(alert.timestamp)} {'\u2022'}{' '}
                      {formatTime(alert.timestamp)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: badge.bgColor },
                    ]}
                  >
                    <Text style={[styles.statusBadgeText, { color: badge.color }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>
                {alert.status === 'sent' && (
                  <TouchableOpacity
                    style={styles.resolveButton}
                    onPress={() => handleResolve(alert.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resolveButtonText}>Resolve</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Clear History Button */}
      {alerts.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearHistory}
          activeOpacity={0.7}
        >
          <Text style={styles.clearButtonText}>Clear History</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#9999B0',
    marginTop: 4,
    marginBottom: 20,
  },

  // Filter tabs
  filterContainer: {
    marginBottom: 20,
  },
  filterContent: {
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A40',
    backgroundColor: '#141420',
  },
  filterTabActive: {
    backgroundColor: 'rgba(0, 255, 136, 0.12)',
    borderColor: '#00FF88',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9999B0',
  },
  filterTabTextActive: {
    color: '#00FF88',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#555570',
    textAlign: 'center',
  },

  // Alert list
  alertList: {
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
    padding: 16,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertEmoji: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  alertContent: {
    flex: 1,
    marginRight: 12,
  },
  alertMessage: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 4,
  },
  alertTimestamp: {
    fontSize: 13,
    color: '#555570',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  resolveButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#00FF88',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  resolveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FF88',
  },

  // Clear button
  clearButton: {
    marginTop: 32,
    borderWidth: 1,
    borderColor: '#FF3B5C',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B5C',
  },
});
