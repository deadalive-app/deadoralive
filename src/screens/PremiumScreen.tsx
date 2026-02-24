// Dead.Alive — Premium Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useStore } from '../stores/useStore';

// ─── Types ──────────────────────────────────────────────────────────────────

interface PremiumScreenProps {
  navigation: any;
}

type PlanType = 'monthly' | 'yearly' | 'lifetime';

interface FeatureRow {
  name: string;
  free: string;
  premium: string;
}

// ─── Feature Comparison Data ────────────────────────────────────────────────

const FEATURES: FeatureRow[] = [
  { name: 'Daily Check-in', free: '\u2713', premium: '\u2713' },
  { name: 'Emergency Contacts', free: 'Up to 2', premium: 'Unlimited' },
  { name: 'Safety Circles', free: '1 circle', premium: 'Unlimited' },
  { name: 'SOS Alert', free: '\u2713', premium: '\u2713' },
  { name: 'Share Location', free: '\u2713', premium: '\u2713' },
  { name: 'Fake Call', free: 'Basic', premium: 'Custom callers' },
  { name: "Dead Man's Switch", free: '\uD83D\uDD12', premium: '\u2713' },
  { name: 'Night Watch', free: '\uD83D\uDD12', premium: '\u2713' },
  { name: 'Heartbeat Pulse', free: '\uD83D\uDD12', premium: '\u2713' },
  { name: 'Custom Alert Messages', free: '\uD83D\uDD12', premium: '\u2713' },
  { name: 'Stealth Mode', free: '\uD83D\uDD12', premium: '\u2713' },
  { name: 'Safety Score Details', free: 'Basic', premium: 'Full breakdown' },
];

// ─── Component ──────────────────────────────────────────────────────────────

const PremiumScreen: React.FC<PremiumScreenProps> = ({ navigation }) => {
  const { isPremium, setPremium } = useStore();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleSubscribe = () => {
    // Simulated purchase
    setPremium(true);
    Alert.alert(
      'Welcome to Premium!',
      'You now have access to all Dead.Alive premium features. Stay safe!',
      [
        {
          text: 'Awesome',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore Purchases',
      'No previous purchases found. If you believe this is an error, please contact support.',
      [{ text: 'OK' }]
    );
  };

  // ─── Plan label helpers ─────────────────────────────────────────────────

  const getPlanPrice = (plan: PlanType): string => {
    switch (plan) {
      case 'monthly':
        return '$2.99/month';
      case 'yearly':
        return '$19.99/year';
      case 'lifetime':
        return '$49.99 once';
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Premium</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.closeX}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero Section ────────────────────────────────────── */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>{'\u2728'}</Text>
          <Text style={styles.heroTitle}>Dead.Alive Premium</Text>
          <Text style={styles.heroSubtitle}>
            Unlock the full safety suite
          </Text>
        </View>

        {/* ─── Feature Comparison ──────────────────────────────── */}
        <View style={styles.comparisonCard}>
          {/* Table header */}
          <View style={styles.comparisonHeader}>
            <Text style={styles.comparisonHeaderFeature}>Feature</Text>
            <Text style={styles.comparisonHeaderTier}>Free</Text>
            <Text style={[styles.comparisonHeaderTier, styles.premiumTierHeader]}>
              Premium
            </Text>
          </View>

          {/* Feature rows */}
          {FEATURES.map((feature, index) => (
            <View
              key={feature.name}
              style={[
                styles.featureRow,
                index < FEATURES.length - 1 && styles.featureRowBorder,
              ]}
            >
              <Text style={styles.featureName}>{feature.name}</Text>
              <Text
                style={[
                  styles.featureTierValue,
                  feature.free === '\u2713' && styles.featureCheckmark,
                  feature.free === '\uD83D\uDD12' && styles.featureLocked,
                ]}
              >
                {feature.free}
              </Text>
              <Text
                style={[
                  styles.featureTierValue,
                  styles.premiumTierValue,
                  feature.premium === '\u2713' && styles.featureCheckmarkPremium,
                ]}
              >
                {feature.premium}
              </Text>
            </View>
          ))}
        </View>

        {/* ─── Pricing Cards ───────────────────────────────────── */}
        <Text style={styles.pricingSectionTitle}>Choose Your Plan</Text>

        {/* Monthly */}
        <TouchableOpacity
          style={[
            styles.pricingCard,
            selectedPlan === 'monthly' && styles.pricingCardSelected,
          ]}
          activeOpacity={0.7}
          onPress={() => setSelectedPlan('monthly')}
        >
          <View style={styles.pricingCardContent}>
            <View>
              <View style={styles.pricingNameRow}>
                <Text style={styles.pricingName}>Monthly</Text>
                <View style={styles.pricingTag}>
                  <Text style={styles.pricingTagText}>Most Flexible</Text>
                </View>
              </View>
              <Text style={styles.pricingPrice}>$2.99/month</Text>
            </View>
            <View
              style={[
                styles.radioOuter,
                selectedPlan === 'monthly' && styles.radioOuterSelected,
              ]}
            >
              {selectedPlan === 'monthly' && (
                <View style={styles.radioInner} />
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Yearly */}
        <TouchableOpacity
          style={[
            styles.pricingCard,
            styles.pricingCardBestValue,
            selectedPlan === 'yearly' && styles.pricingCardSelected,
          ]}
          activeOpacity={0.7}
          onPress={() => setSelectedPlan('yearly')}
        >
          <View style={styles.pricingCardContent}>
            <View>
              <View style={styles.pricingNameRow}>
                <Text style={styles.pricingName}>Yearly</Text>
                <View style={styles.pricingTag}>
                  <Text style={styles.pricingTagText}>Best Value</Text>
                </View>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>Save 44%</Text>
                </View>
              </View>
              <Text style={styles.pricingPrice}>$19.99/year</Text>
            </View>
            <View
              style={[
                styles.radioOuter,
                selectedPlan === 'yearly' && styles.radioOuterSelected,
              ]}
            >
              {selectedPlan === 'yearly' && (
                <View style={styles.radioInner} />
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Lifetime */}
        <TouchableOpacity
          style={[
            styles.pricingCard,
            selectedPlan === 'lifetime' && styles.pricingCardSelected,
          ]}
          activeOpacity={0.7}
          onPress={() => setSelectedPlan('lifetime')}
        >
          <View style={styles.pricingCardContent}>
            <View>
              <View style={styles.pricingNameRow}>
                <Text style={styles.pricingName}>Lifetime</Text>
                <View style={styles.pricingTag}>
                  <Text style={styles.pricingTagText}>
                    Pay Once, Safe Forever
                  </Text>
                </View>
              </View>
              <Text style={styles.pricingPrice}>$49.99 once</Text>
            </View>
            <View
              style={[
                styles.radioOuter,
                selectedPlan === 'lifetime' && styles.radioOuterSelected,
              ]}
            >
              {selectedPlan === 'lifetime' && (
                <View style={styles.radioInner} />
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* ─── Subscribe Button ────────────────────────────────── */}
        <TouchableOpacity
          style={styles.subscribeButton}
          activeOpacity={0.8}
          onPress={handleSubscribe}
        >
          <Text style={styles.subscribeButtonText}>
            Subscribe Now — {getPlanPrice(selectedPlan)}
          </Text>
        </TouchableOpacity>

        {/* ─── Fine Print ──────────────────────────────────────── */}
        <Text style={styles.finePrint}>
          Cancel anytime. Subscriptions auto-renew.
        </Text>

        <TouchableOpacity onPress={handleRestore}>
          <Text style={styles.restoreLink}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scrollView: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#141420',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A40',
  },
  closeX: {
    fontSize: 16,
    color: '#9999B0',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // ─── Hero ───────────────────────────────────────────────
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#9999B0',
    textAlign: 'center',
  },

  // ─── Feature Comparison ─────────────────────────────────
  comparisonCard: {
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
    padding: 16,
    marginBottom: 32,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A40',
    marginBottom: 4,
  },
  comparisonHeaderFeature: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#555570',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comparisonHeaderTier: {
    width: 80,
    fontSize: 12,
    fontWeight: '700',
    color: '#555570',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  premiumTierHeader: {
    color: '#FFD700',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(42, 42, 64, 0.5)',
  },
  featureName: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  featureTierValue: {
    width: 80,
    fontSize: 13,
    color: '#9999B0',
    textAlign: 'center',
    fontWeight: '500',
  },
  featureCheckmark: {
    color: '#00FF88',
    fontSize: 16,
  },
  featureLocked: {
    fontSize: 14,
  },
  premiumTierValue: {
    color: '#FFD700',
  },
  featureCheckmarkPremium: {
    color: '#00FF88',
    fontSize: 16,
  },

  // ─── Pricing Section ────────────────────────────────────
  pricingSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  pricingCard: {
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
    padding: 16,
    marginBottom: 12,
  },
  pricingCardBestValue: {
    borderColor: '#FFD700',
    borderWidth: 1.5,
  },
  pricingCardSelected: {
    borderColor: '#00FF88',
    borderWidth: 1.5,
    backgroundColor: 'rgba(0, 255, 136, 0.04)',
  },
  pricingCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  pricingName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pricingTag: {
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pricingTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFD700',
  },
  saveBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  saveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  pricingPrice: {
    fontSize: 15,
    color: '#9999B0',
    fontWeight: '500',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#2A2A40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#00FF88',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00FF88',
  },

  // ─── Subscribe Button ───────────────────────────────────
  subscribeButton: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  subscribeButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0A0A0F',
  },

  // ─── Fine Print ─────────────────────────────────────────
  finePrint: {
    fontSize: 12,
    color: '#555570',
    textAlign: 'center',
    marginBottom: 12,
  },
  restoreLink: {
    fontSize: 13,
    color: '#9999B0',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },

  // Bottom
  bottomSpacer: {
    height: 100,
  },
});

export default PremiumScreen;
