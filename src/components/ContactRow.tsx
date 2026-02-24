// Dead.Alive — ContactRow Component
// Displays an emergency contact with name, masked phone, relationship, and delete

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import type { EmergencyContact } from '../types';
import { maskPhone } from '../utils/helpers';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../theme';

interface ContactRowProps {
  contact: EmergencyContact;
  onDelete?: (id: string) => void;
  style?: ViewStyle;
}

const ContactRow: React.FC<ContactRowProps> = ({ contact, onDelete, style }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Avatar / ICE indicator */}
      <View
        style={[
          styles.avatar,
          contact.isICE && styles.avatarICE,
        ]}
      >
        <Text style={styles.avatarText}>
          {contact.isICE ? 'ICE' : contact.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {contact.name}
          </Text>
          {contact.isICE && (
            <View style={styles.iceBadge}>
              <Text style={styles.iceBadgeText}>ICE</Text>
            </View>
          )}
        </View>
        <Text style={styles.phone}>{maskPhone(contact.phone)}</Text>
        <Text style={styles.relationship}>{contact.relationship}</Text>
      </View>

      {/* Delete button */}
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(contact.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      )}
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 4,
  },
  avatarICE: {
    backgroundColor: Colors.sos + '30',
  },
  avatarText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  iceBadge: {
    marginLeft: Spacing.sm,
    backgroundColor: Colors.sos + '25',
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm - 2,
    borderRadius: BorderRadius.full,
  },
  iceBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.sos,
  },
  phone: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  relationship: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dead + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  deleteText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.dead,
  },
});

export default ContactRow;
