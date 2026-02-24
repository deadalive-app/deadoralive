// Dead.Alive — EmptyState Component
// Empty state with large emoji, title, subtitle, and optional action button

import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../theme';
import Button from './Button';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  emoji,
  title,
  subtitle,
  actionTitle,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
      {actionTitle && onAction ? (
        <View style={styles.actionWrapper}>
          <Button
            title={actionTitle}
            onPress={onAction}
            variant="primary"
            size="md"
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionWrapper: {
    marginTop: Spacing.lg,
  },
});

export default EmptyState;
