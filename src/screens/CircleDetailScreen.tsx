// Dead.Alive — Circle Detail Screen
// Displays members, statuses, and actions for a single Safety Circle

import React from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useStore } from '../stores/useStore';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../theme';
import { formatTimestamp, getStatusColor, getStatusLabel } from '../utils/helpers';
import type { CircleMember } from '../types';

interface CircleDetailScreenProps {
  route: any;
  navigation: any;
}

const AVATAR_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
];

const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const CircleDetailScreen: React.FC<CircleDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { circleId } = route.params;
  const { circles, leaveCircle, triggerSOS, user } = useStore();
  const circle = circles.find((c) => c.id === circleId);

  if (!circle) {
    return (
      <View style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Circle not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleCopyCode = () => {
    Alert.alert('Copied!', `Share code "${circle.shareCode}" copied to clipboard.`);
  };

  const handleInviteMembers = () => {
    Alert.alert(
      'Invite Members',
      `Share code: ${circle.shareCode}\n\nSend this code to friends and family so they can join your circle.`,
    );
  };

  const handleGroupAlert = () => {
    Alert.alert(
      'Send Group Alert',
      'This will send an alert to all members of this circle. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: () => {
            triggerSOS(`Group alert from ${circle.emoji} ${circle.name}`);
            Alert.alert('Alert Sent', 'All circle members have been notified.');
          },
        },
      ],
    );
  };

  const handleLeaveCircle = () => {
    Alert.alert(
      'Leave Circle',
      `Are you sure you want to leave "${circle.name}"? You will no longer see updates from this circle.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            leaveCircle(circleId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const renderMemberItem = ({ item }: { item: CircleMember }) => {
    const statusColor = getStatusColor(item.status);
    const statusLabel = getStatusLabel(item.status);
    const avatarColor = getAvatarColor(item.name);
    const initial = item.name.charAt(0).toUpperCase();
    const isAdmin = item.role === 'admin';

    return (
      <View style={styles.memberCard}>
        <View style={styles.memberRow}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarLetter}>{initial}</Text>
          </View>

          {/* Info */}
          <View style={styles.memberInfo}>
            <View style={styles.memberNameRow}>
              <Text style={styles.memberName}>{item.name}</Text>
              {isAdmin && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
              )}
            </View>
            <View style={styles.memberStatusRow}>
              <View
                style={[styles.statusDotLarge, { backgroundColor: statusColor }]}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
              {item.lastCheckIn && (
                <Text style={styles.lastCheckInText}>
                  {' \u00B7 '}
                  {formatTimestamp(item.lastCheckIn)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.headerBackText}>{'\u2190'}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>{circle.emoji}</Text>
          <Text style={styles.headerName}>{circle.name}</Text>
        </View>
        <View style={styles.headerBackButton} />
      </View>

      {/* Share Code */}
      <View style={styles.shareCodeContainer}>
        <Text style={styles.shareCodeLabel}>Share Code</Text>
        <View style={styles.shareCodeRow}>
          <Text style={styles.shareCodeValue}>{circle.shareCode}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={handleCopyCode}
            activeOpacity={0.7}
          >
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Invite Button */}
      <TouchableOpacity
        style={styles.inviteButton}
        onPress={handleInviteMembers}
        activeOpacity={0.7}
      >
        <Text style={styles.inviteButtonText}>Invite Members</Text>
      </TouchableOpacity>

      {/* Members List */}
      <Text style={styles.sectionTitle}>
        Members ({circle.members.length})
      </Text>
      <FlatList
        data={circle.members}
        keyExtractor={(item) => item.id}
        renderItem={renderMemberItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.footerActions}>
            {/* Group Alert */}
            <TouchableOpacity
              style={styles.groupAlertButton}
              onPress={handleGroupAlert}
              activeOpacity={0.7}
            >
              <Text style={styles.groupAlertButtonText}>Send Group Alert</Text>
            </TouchableOpacity>

            {/* Leave Circle */}
            <TouchableOpacity
              style={styles.leaveButton}
              onPress={handleLeaveCircle}
              activeOpacity={0.7}
            >
              <Text style={styles.leaveButtonText}>Leave Circle</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBg,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  backButton: {
    backgroundColor: Colors.cardBg,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.md,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackText: {
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 36,
    marginBottom: Spacing.xs,
  },
  headerName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  shareCodeContainer: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  shareCodeLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  shareCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  shareCodeValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    fontVariant: ['tabular-nums'],
    color: Colors.textPrimary,
    letterSpacing: 4,
  },
  copyButton: {
    backgroundColor: Colors.alive,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  copyButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textInverse,
  },
  inviteButton: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.alive,
    paddingVertical: Spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  inviteButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.alive,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  memberCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarLetter: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  memberName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  adminBadge: {
    backgroundColor: Colors.premiumGold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  adminBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textInverse,
  },
  memberStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDotLarge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  lastCheckInText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  footerActions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  groupAlertButton: {
    backgroundColor: Colors.warning,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupAlertButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textInverse,
  },
  leaveButton: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.dead,
    paddingVertical: Spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.dead,
  },
});

export default CircleDetailScreen;
