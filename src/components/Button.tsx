// Dead.Alive — Button Component
// Versatile button with multiple variants, sizes, and states

import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '../theme';

type ButtonVariant = 'primary' | 'danger' | 'outline' | 'ghost' | 'premium';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  size?: ButtonSize;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  size = 'md',
  style,
}) => {
  const buttonStyles = getButtonStyle(variant);
  const textStyles = getTextStyle(variant);
  const sizeStyles = getSizeStyle(size);
  const textSizeStyles = getTextSizeStyle(size);

  return (
    <TouchableOpacity
      style={[
        styles.base,
        buttonStyles,
        sizeStyles,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Colors.textInverse : Colors.textPrimary}
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text
            style={[
              styles.text,
              textStyles,
              textSizeStyles,
              disabled && styles.disabledText,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const getButtonStyle = (variant: ButtonVariant): ViewStyle => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: Colors.alive,
      };
    case 'danger':
      return {
        backgroundColor: Colors.dead,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.textPrimary,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
      };
    case 'premium':
      return {
        backgroundColor: Colors.premiumGold,
      };
  }
};

const getTextStyle = (variant: ButtonVariant): TextStyle => {
  switch (variant) {
    case 'primary':
      return { color: Colors.textInverse };
    case 'danger':
      return { color: Colors.textPrimary };
    case 'outline':
      return { color: Colors.textPrimary };
    case 'ghost':
      return { color: Colors.textPrimary };
    case 'premium':
      return { color: Colors.textInverse };
  }
};

const getSizeStyle = (size: ButtonSize): ViewStyle => {
  switch (size) {
    case 'sm':
      return {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.sm,
      };
    case 'md':
      return {
        paddingVertical: Spacing.sm + 4,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
      };
    case 'lg':
      return {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.lg,
      };
  }
};

const getTextSizeStyle = (size: ButtonSize): TextStyle => {
  switch (size) {
    case 'sm':
      return { fontSize: FontSize.sm };
    case 'md':
      return { fontSize: FontSize.md };
    case 'lg':
      return { fontSize: FontSize.lg };
  }
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: Spacing.sm,
  },
  text: {
    fontWeight: FontWeight.semibold,
  },
  disabled: {
    opacity: 0.4,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default Button;
