// Dead.Alive — Header Component
// Screen header with title, optional subtitle, and left/right actions

import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <View style={styles.leftSlot}>
          {leftAction ?? null}
        </View>

        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightSlot}>
          {rightAction ?? null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkBg,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leftSlot: {
    width: 48,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  rightSlot: {
    width: 48,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default Header;
