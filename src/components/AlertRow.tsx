// Dead.Alive — AlertRow Component
// Displays an alert with type icon, message, timestamp, and status

import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import type { Alert, AlertType } from '../types';
import { formatTimestamp } from '../utils/helpers';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../theme';

interface AlertRowProps {
  alert: Alert;
  style?: ViewStyle;
}

const getAlertTypeConfig = (
  type: AlertType
): { emoji: string; color: string; label: string } => {
  switch (type) {
    case 'sos':
      return { emoji: '🚨', color: Colors.sos, label: 'SOS Alert' };
    case 'missed_checkin':
      return { emoji: '⏰', color: Colors.warning, label: 'Missed Check-In' };
    case 'dead_mans_switch':
      return { emoji: '💀', color: Colors.dead, label: "Dead Man's Switch" };
    case 'night_watch':
      return { emoji: '🌙', color: Colors.warning, label: 'Night Watch' };
    case 'walk_me_home':
      return { emoji: '🚶', color: Colors.warning, label: 'Walk Me Home' };
    case 'duress':
      return { emoji: '⚠️', color: Colors.sos, label: 'Duress Alert' };
    case 'circle_alert':
      return { emoji: '🔔', color: Colors.alive, label: 'Circle Alert' };
    case 'timer_expired':
      return { emoji: '⌛', color: Colors.dead, label: 'Timer Expired' };
    default:
      return { emoji: '🔔', color: Colors.warning, label: 'Alert' };
  }
};

const getStatusBadgeConfig = (
  status: Alert['status']
): { label: string; color: string } => {
  switch (status) {
    case 'sent':
      return { label: 'Sent', color: Colors.warning };
    case 'acknowledged':
      return { label: 'Acknowledged', color: Colors.alive };
    case 'resolved':
      return { label: 'Resolved', color: Colors.textMuted };
    case 'expired':
      return { label: 'Expired', color: Colors.textMuted };
  }
};

const AlertRow: React.FC<AlertRowProps> = ({ alert, style }) => {
  const typeConfig = getAlertTypeConfig(alert.type);
  const statusConfig = getStatusBadgeConfig(alert.status);

  return (
    <View
      style={[
        styles.container,
        { borderLeftColor: typeConfig.color },
        style,
      ]}
    >
      {/* Top row: icon + type label + timestamp */}
      <View style={styles.topRow}>
        <Text style={styles.emoji}>{typeConfig.emoji}</Text>
        <Text style={[styles.typeLabel, { color: typeConfig.color }]}>
          {typeConfig.label}
        </Text>
        <Text style={styles.timestamp}>
          {formatTimestamp(alert.timestamp)}
        </Text>
      </View>

      {/* Message */}
      <Text style={styles.message} numberOfLines={2}>
        {alert.message}
      </Text>

      {/* Bottom row: status badge + recipients count */}
      <View style={styles.bottomRow}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.color + '20' },
          ]}
        >
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
        <Text style={styles.recipientsText}>
          {alert.recipients.length} recipient{alert.recipients.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    padding: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emoji: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  typeLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    flex: 1,
  },
  timestamp: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  message: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  recipientsText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});

export default AlertRow;
