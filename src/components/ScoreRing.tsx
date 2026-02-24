// Dead.Alive — ScoreRing Component
// Circular progress ring showing safety score 0-100 with grade label
// Uses a View-based approximation with four quadrant arcs

import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../theme';
import { getScoreGrade } from '../utils/helpers';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  style?: ViewStyle;
}

const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 140,
  strokeWidth = 8,
  style,
}) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  const grade = getScoreGrade(clampedScore);

  // Calculate which quadrants to fill based on score percentage
  // Each quadrant represents 25% of the ring
  const percentage = clampedScore / 100;

  // We use 4 quadrant segments: top-right, bottom-right, bottom-left, top-left
  const getQuadrantOpacity = (quadrant: number): number => {
    const quadrantStart = quadrant * 0.25;
    const quadrantEnd = (quadrant + 1) * 0.25;

    if (percentage >= quadrantEnd) return 1;
    if (percentage <= quadrantStart) return 0;
    return (percentage - quadrantStart) / 0.25;
  };

  const innerSize = size - strokeWidth * 2;
  const halfSize = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Background ring */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: halfSize,
            borderWidth: strokeWidth,
            borderColor: Colors.surface,
          },
        ]}
      />

      {/* Colored segments using four overlapping border quadrants */}
      {/* Top-right quadrant (0-25%) */}
      <View
        style={[
          styles.quadrant,
          {
            width: halfSize,
            height: halfSize,
            top: 0,
            right: 0,
            borderTopWidth: strokeWidth,
            borderRightWidth: strokeWidth,
            borderTopRightRadius: halfSize,
            borderColor: grade.color,
            opacity: getQuadrantOpacity(0),
          },
        ]}
      />

      {/* Bottom-right quadrant (25-50%) */}
      <View
        style={[
          styles.quadrant,
          {
            width: halfSize,
            height: halfSize,
            bottom: 0,
            right: 0,
            borderBottomWidth: strokeWidth,
            borderRightWidth: strokeWidth,
            borderBottomRightRadius: halfSize,
            borderColor: grade.color,
            opacity: getQuadrantOpacity(1),
          },
        ]}
      />

      {/* Bottom-left quadrant (50-75%) */}
      <View
        style={[
          styles.quadrant,
          {
            width: halfSize,
            height: halfSize,
            bottom: 0,
            left: 0,
            borderBottomWidth: strokeWidth,
            borderLeftWidth: strokeWidth,
            borderBottomLeftRadius: halfSize,
            borderColor: grade.color,
            opacity: getQuadrantOpacity(2),
          },
        ]}
      />

      {/* Top-left quadrant (75-100%) */}
      <View
        style={[
          styles.quadrant,
          {
            width: halfSize,
            height: halfSize,
            top: 0,
            left: 0,
            borderTopWidth: strokeWidth,
            borderLeftWidth: strokeWidth,
            borderTopLeftRadius: halfSize,
            borderColor: grade.color,
            opacity: getQuadrantOpacity(3),
          },
        ]}
      />

      {/* Inner content */}
      <View
        style={[
          styles.innerCircle,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      >
        <Text
          style={[
            styles.scoreText,
            {
              color: grade.color,
              fontSize: size * 0.28,
            },
          ]}
        >
          {clampedScore}
        </Text>
        <Text
          style={[
            styles.gradeLabel,
            {
              color: grade.color,
              fontSize: size * 0.09,
            },
          ]}
        >
          {grade.label}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  quadrant: {
    position: 'absolute',
    borderColor: 'transparent',
  },
  innerCircle: {
    backgroundColor: Colors.darkBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontWeight: FontWeight.heavy,
  },
  gradeLabel: {
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
});

export default ScoreRing;
