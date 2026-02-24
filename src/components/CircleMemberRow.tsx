// Dead.Alive — CircleMemberRow Component
// Displays a circle member with avatar, name, status badge, and last check-in

import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import type { CircleMember } from '../types';
import { formatTimestamp } from '../utils/helpers';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../theme';
import Badge from './Badge';

interface CircleMemberRowProps {
  member: CircleMember;
  style?: ViewStyle;
}

const CircleMemberRow: React.FC<CircleMemberRowProps> = ({ member, style }) => {
  const initial = member.name.charAt(0).toUpperCase();
  const statusColor =
    member.status === 'alive'
      ? Colors.alive
      : member.status === 'sos'
      ? Colors.sos
      : member.status === 'dead'
      ? Colors.dead
      : Colors.unknown;

  return (
    <View style={[styles.container, style]}>
      {/* Avatar placeholder */}
      <View style={styles.avatarWrapper}>
        <View
          style={[
            styles.avatar,
            { borderColor: statusColor },
          ]}
        >
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        {/* Status indicator dot */}
        <View
          style={[
            styles.statusDot,
            { backgroundColor: statusColor },
          ]}
        />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {member.name}
        </Text>
        {member.lastCheckIn ? (
          <Text style={styles.lastCheckIn}>
            Last check-in: {formatTimestamp(member.lastCheckIn)}
          </Text>
        ) : (
          <Text style={styles.lastCheckIn}>No check-ins yet</Text>
        )}
      </View>

      {/* Status badge */}
      <Badge status={member.status} size="sm" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: Spacing.sm + 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.cardBg,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  lastCheckIn: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default CircleMemberRow;
