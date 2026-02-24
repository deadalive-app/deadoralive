// Dead.Alive — Trusted Contacts Quick-Dial Screen
// Quickly call or message emergency contacts

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Linking,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '../stores/useStore';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../theme';
import type { EmergencyContact } from '../types';

interface TrustedContactsScreenProps {
  navigation: any;
}

export default function TrustedContactsScreen({ navigation }: TrustedContactsScreenProps) {
  const { emergencyContacts } = useStore();

  const handleCall = (phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${phone}`);
  };

  const handleMessage = (phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`sms:${phone}`);
  };

  const renderContact = ({ item }: { item: EmergencyContact }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactTopRow}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Name, relationship, phone */}
        <View style={styles.contactDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.contactName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.relationship ? (
              <View style={styles.relationshipBadge}>
                <Text style={styles.relationshipText}>{item.relationship}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.contactPhone}>{item.phone}</Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleCall(item.phone)}
          activeOpacity={0.7}
        >
          <Text style={styles.callButtonEmoji}>{'\uD83D\uDCDE'}</Text>
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => handleMessage(item.phone)}
          activeOpacity={0.7}
        >
          <Text style={styles.messageButtonEmoji}>{'\uD83D\uDCAC'}</Text>
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{'\uD83D\uDCF1'}</Text>
      <Text style={styles.emptyTitle}>No trusted contacts yet</Text>
      <Text style={styles.emptySubtitle}>
        Add emergency contacts in Settings so you can quickly reach them when it matters most.
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Settings')}
        activeOpacity={0.7}
      >
        <Text style={styles.emptyButtonText}>Go to Settings</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trusted Contacts</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Contact list or empty state */}
      {emergencyContacts.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={emergencyContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContact}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB — Add Contact */}
      {emergencyContacts.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBg,
  },

  // ---- Header ----
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonText: {
    fontSize: 20,
    color: Colors.textPrimary,
  },

  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },

  headerSpacer: {
    width: 40,
  },

  // ---- List ----
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 100,
  },

  // ---- Contact Card ----
  contactCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },

  contactTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.alive,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },

  avatarText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },

  contactDetails: {
    flex: 1,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },

  contactName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    flexShrink: 1,
  },

  relationshipBadge: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },

  relationshipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },

  contactPhone: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },

  // ---- Action Buttons ----
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.25)',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 4,
    gap: Spacing.sm,
  },

  callButtonEmoji: {
    fontSize: 18,
  },

  callButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.alive,
  },

  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(60, 130, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(60, 130, 255, 0.25)',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 4,
    gap: Spacing.sm,
  },

  messageButtonEmoji: {
    fontSize: 18,
  },

  messageButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#3C82FF',
  },

  // ---- Empty State ----
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },

  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },

  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },

  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },

  emptyButton: {
    backgroundColor: Colors.alive,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },

  emptyButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textInverse,
  },

  // ---- FAB ----
  fab: {
    position: 'absolute',
    bottom: 32,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.alive,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
    shadowColor: Colors.alive,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  fabText: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
    marginTop: -2,
  },
});
