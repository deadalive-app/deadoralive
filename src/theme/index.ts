// Dead.Alive — Theme System

export const Colors = {
  // Primary palette — dark, moody, safety-focused
  black: '#000000',
  darkBg: '#0A0A0F',
  cardBg: '#141420',
  cardBgLight: '#1C1C2E',
  surface: '#22223A',

  // Accent colors
  alive: '#00FF88', // Vibrant green — alive status
  dead: '#FF3B5C', // Red — dead/danger status
  warning: '#FFB800', // Amber — warnings
  unknown: '#666680', // Gray — unknown status
  sos: '#FF0040', // Emergency red

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#9999B0',
  textMuted: '#555570',
  textInverse: '#0A0A0F',

  // UI
  border: '#2A2A40',
  borderLight: '#3A3A55',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',

  // Premium
  premiumGold: '#FFD700',
  premiumGradientStart: '#FFD700',
  premiumGradientEnd: '#FF8C00',

  // Gradients (as arrays for LinearGradient)
  gradientAlive: ['#00FF88', '#00CC6A'] as const,
  gradientDead: ['#FF3B5C', '#CC0033'] as const,
  gradientSOS: ['#FF0040', '#CC0033'] as const,
  gradientPremium: ['#FFD700', '#FF8C00'] as const,
  gradientDark: ['#0A0A0F', '#141420'] as const,
  gradientCard: ['#1C1C2E', '#141420'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  xxxl: 36,
  display: 48,
  hero: 64,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
  black: '900' as const,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  }),
};
