// Dead.Alive — PinPad Component
// Reusable PIN entry modal with numeric keypad and haptic feedback

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface PinPadProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  title?: string;
}

const PinPad: React.FC<PinPadProps> = ({
  visible,
  onClose,
  onSubmit,
  title = 'Enter PIN',
}) => {
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (pin.length === 4) {
      onSubmit(pin);
      setPin('');
    }
  }, [pin, onSubmit]);

  // Reset pin when modal becomes visible
  useEffect(() => {
    if (visible) {
      setPin('');
    }
  }, [visible]);

  const handlePress = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (value === 'backspace') {
      setPin((prev) => prev.slice(0, -1));
    } else if (pin.length < 4) {
      setPin((prev) => prev + value);
    }
  };

  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < 4; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.dot,
            i < pin.length ? styles.dotFilled : styles.dotEmpty,
          ]}
        />
      );
    }
    return dots;
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'backspace'],
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.dotsRow}>{renderDots()}</View>

          <View style={styles.grid}>
            {keys.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((key, keyIndex) => {
                  if (key === '') {
                    return (
                      <View key={keyIndex} style={styles.emptyCell} />
                    );
                  }

                  return (
                    <TouchableOpacity
                      key={keyIndex}
                      style={styles.keyButton}
                      onPress={() => handlePress(key)}
                      activeOpacity={0.6}
                    >
                      <Text
                        style={
                          key === 'backspace'
                            ? styles.backspaceText
                            : styles.keyText
                        }
                      >
                        {key === 'backspace' ? '⌫' : key}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.6}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#141420',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  dotFilled: {
    backgroundColor: '#00FF88',
  },
  dotEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2A2A40',
  },
  grid: {
    width: '100%',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  keyButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0A0A0F',
    borderWidth: 1,
    borderColor: '#2A2A40',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  emptyCell: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'transparent',
    marginHorizontal: 8,
  },
  keyText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  backspaceText: {
    color: '#FFFFFF',
    fontSize: 22,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  cancelText: {
    color: '#9999B0',
    fontSize: 16,
  },
});

export default PinPad;
