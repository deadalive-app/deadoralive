// Dead.Alive — StatusPulse Component
// Animated pulsing circle that glows based on user status

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import type { UserStatus } from '../types';
import { getStatusColor } from '../utils/helpers';

interface StatusPulseProps {
  status: UserStatus;
  size?: number;
  style?: ViewStyle;
}

const StatusPulse: React.FC<StatusPulseProps> = ({
  status,
  size = 120,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  const color = getStatusColor(status);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim, opacityAnim]);

  const halfSize = size / 2;
  const innerSize = size * 0.6;
  const innerHalf = innerSize / 2;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size },
        style,
      ]}
    >
      {/* Outer pulse ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: size,
            height: size,
            borderRadius: halfSize,
            borderColor: color,
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim,
          },
        ]}
      />

      {/* Middle glow */}
      <View
        style={[
          styles.glowCircle,
          {
            width: size * 0.85,
            height: size * 0.85,
            borderRadius: (size * 0.85) / 2,
            backgroundColor: color,
            opacity: 0.15,
          },
        ]}
      />

      {/* Inner solid circle */}
      <View
        style={[
          styles.innerCircle,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerHalf,
            backgroundColor: color,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 20,
            elevation: 10,
          },
        ]}
      />

      {/* Center dot */}
      <View
        style={[
          styles.centerDot,
          {
            width: size * 0.15,
            height: size * 0.15,
            borderRadius: (size * 0.15) / 2,
            backgroundColor: '#FFFFFF',
            opacity: 0.9,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  glowCircle: {
    position: 'absolute',
  },
  innerCircle: {
    position: 'absolute',
  },
  centerDot: {
    position: 'absolute',
  },
});

export default StatusPulse;
