// Dead.Alive — PremiumBanner Component
// Upgrade banner with gold border, lock icon, and premium benefits

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../theme';

interface PremiumBannerProps {
  onUpgrade: () => void;
  style?: ViewStyle;
}

const BENEFITS = [
  'Dead Man\'s Switch',
  'Night Watch Mode',
  'Heartbeat Pulse',
  'Unlimited Circles',
  'Stealth Mode',
];

const PremiumBanner: React.FC<PremiumBannerProps> = ({ onUpgrade, style }) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onUpgrade}
      activeOpacity={0.8}
    >
      {/* Gold border effect via wrapper */}
      <View style={styles.innerContainer}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <Text style={styles.lockIcon}>🔒</Text>
          <View style={styles.headerText}>
            <Text style={styles.title}>Upgrade to Premium</Text>
            <Text style={styles.subtitle}>Unlock advanced safety features</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </View>

        {/* Benefits list */}
        <View style={styles.benefitsRow}>
          {BENEFITS.map((benefit) => (
            <View key={benefit} style={styles.benefitItem}>
              <Text style={styles.benefitDot}>✦</Text>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.premiumGold,
    backgroundColor: Colors.cardBg,
    overflow: 'hidden',
  },
  innerContainer: {
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 28,
    marginRight: Spacing.sm + 4,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.premiumGold,
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: FontSize.xl,
    color: Colors.premiumGold,
    fontWeight: FontWeight.bold,
  },
  benefitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.sm + 4,
    gap: Spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.premiumGold + '15',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  benefitDot: {
    fontSize: FontSize.xs,
    color: Colors.premiumGold,
    marginRight: Spacing.xs,
  },
  benefitText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.premiumGold,
  },
});

export default PremiumBanner;
