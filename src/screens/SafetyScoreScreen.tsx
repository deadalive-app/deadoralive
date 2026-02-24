import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useStore } from '../stores/useStore';
import { getScoreGrade } from '../utils/helpers';

interface SafetyScoreScreenProps {
  navigation: any;
}

export default function SafetyScoreScreen({ navigation }: SafetyScoreScreenProps) {
  const {
    safetyScore,
    streak,
    emergencyContacts,
    circles,
    checkIns,
    isPremium,
    recalculateSafetyScore,
  } = useStore();

  useEffect(() => {
    recalculateSafetyScore();
  }, []);

  const grade = getScoreGrade(safetyScore.total);

  const getCircleBorderColor = (score: number): string => {
    if (score > 70) return '#00FF88';
    if (score >= 40) return '#FFB800';
    return '#FF3B5C';
  };

  const borderColor = getCircleBorderColor(safetyScore.total);

  const breakdownItems = [
    {
      emoji: '\uD83D\uDD25',
      label: 'Streak',
      value: `${streak} days`,
      earned: safetyScore.streakScore,
      max: 30,
    },
    {
      emoji: '\uD83D\uDC65',
      label: 'Contacts',
      value: `${emergencyContacts.length} emergency contacts`,
      earned: safetyScore.contactsScore,
      max: 20,
    },
    {
      emoji: '\uD83D\uDEE1\uFE0F',
      label: 'Circles',
      value: `${circles.length} safety circles`,
      earned: safetyScore.circleScore,
      max: 15,
    },
    {
      emoji: '\u2705',
      label: 'Check-ins',
      value: `${checkIns.length} total check-ins`,
      earned: safetyScore.checkinScore,
      max: 20,
    },
    {
      emoji: '\u2699\uFE0F',
      label: 'Features',
      value: 'permissions & premium',
      earned: safetyScore.featuresScore,
      max: 15,
    },
  ];

  const tips: string[] = [];
  if (emergencyContacts.length < 3) {
    tips.push('Add more emergency contacts');
  }
  if (circles.length < 1) {
    tips.push('Create a safety circle');
  }
  if (streak < 7) {
    tips.push('Build your check-in streak');
  }
  if (!isPremium) {
    tips.push('Upgrade to Premium for +5 points');
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Score</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Subtitle */}
        <Text style={styles.subtitle}>Your personal safety rating</Text>

      {/* Main Score Display */}
      <View style={styles.scoreSection}>
        <View style={[styles.scoreCircle, { borderColor }]}>
          <Text style={styles.scoreNumber}>{safetyScore.total}</Text>
        </View>
        <Text style={[styles.gradeLabel, { color: grade.color }]}>
          {grade.label}
        </Text>
      </View>

      {/* Score Breakdown Cards */}
      <View style={styles.breakdownSection}>
        {breakdownItems.map((item) => {
          const progress = item.max > 0 ? item.earned / item.max : 0;
          return (
            <View key={item.label} style={styles.breakdownCard}>
              <View style={styles.breakdownHeader}>
                <View style={styles.breakdownLeft}>
                  <Text style={styles.breakdownEmoji}>{item.emoji}</Text>
                  <View>
                    <Text style={styles.breakdownLabel}>{item.label}</Text>
                    <Text style={styles.breakdownValue}>{item.value}</Text>
                  </View>
                </View>
                <Text style={styles.breakdownPoints}>
                  {item.earned}/{item.max}
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(progress * 100, 100)}%`,
                      backgroundColor: borderColor,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Tips Section */}
      {tips.length > 0 && (
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Improve Your Score</Text>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <Text style={styles.tipBullet}>{'\u2022'}</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#141420',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A40',
  },
  backArrow: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#9999B0',
    marginTop: 4,
    marginBottom: 32,
  },

  // Score circle
  scoreSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141420',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gradeLabel: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },

  // Breakdown
  breakdownSection: {
    gap: 12,
    marginBottom: 32,
  },
  breakdownCard: {
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
    padding: 16,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  breakdownEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  breakdownLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  breakdownValue: {
    fontSize: 13,
    color: '#9999B0',
    marginTop: 2,
  },
  breakdownPoints: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#2A2A40',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },

  // Tips
  tipsSection: {
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
    padding: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipBullet: {
    fontSize: 16,
    color: '#FFB800',
    marginRight: 10,
    lineHeight: 22,
  },
  tipText: {
    fontSize: 15,
    color: '#9999B0',
    lineHeight: 22,
    flex: 1,
  },
});
