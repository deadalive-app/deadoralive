// Dead.Alive — Badge Component
// Status badge showing alive/dead/sos/unknown with colored dot and text

import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import type { UserStatus } from '../types';
import { getStatusColor, getStatusLabel } from '../utils/helpers';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../theme';

type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  status: UserStatus;
  size?: BadgeSize;
  style?: ViewStyle;
}

const Badge: React.FC<BadgeProps> = ({ status, size = 'md', style }) => {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);
  const sizeConfig = getSizeConfig(size);

  return (
    <View
      style={[
        styles.container,
        {
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          backgroundColor: color + '18', // 10% opacity tint
          borderRadius: BorderRadius.full,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            width: sizeConfig.dotSize,
            height: sizeConfig.dotSize,
            borderRadius: sizeConfig.dotSize / 2,
            backgroundColor: color,
          },
        ]}
      />
      <Text
        style={[
          styles.label,
          {
            fontSize: sizeConfig.fontSize,
            color: color,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const getSizeConfig = (size: BadgeSize) => {
  switch (size) {
    case 'sm':
      return {
        dotSize: 6,
        fontSize: FontSize.xs,
        paddingVertical: 3,
        paddingHorizontal: Spacing.sm,
      };
    case 'md':
      return {
        dotSize: 8,
        fontSize: FontSize.sm,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm + 4,
      };
    case 'lg':
      return {
        dotSize: 10,
        fontSize: FontSize.md,
        paddingVertical: Spacing.sm - 2,
        paddingHorizontal: Spacing.md,
      };
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    marginRight: Spacing.xs + 2,
  },
  label: {
    fontWeight: FontWeight.semibold,
  },
});

export default Badge;
