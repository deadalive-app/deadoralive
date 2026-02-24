// Dead.Alive — Safety Circle Hub Screen
// Main screen for viewing, creating, and joining Safety Circles

import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useStore } from '../stores/useStore';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../theme';
import type { SafetyCircle, UserStatus } from '../types';

const EMOJI_OPTIONS = [
  '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}',
  '\u{1F3E0}',
  '\u{1F4AA}',
  '\u{1FAC2}',
  '\u{1F46F}',
  '\u{1F91D}',
  '\u{1F495}',
  '\u{1F6E1}\uFE0F',
  '\u{1F465}',
  '\u{1F31F}',
  '\u{1F3C3}',
  '\u{1F3AF}',
];

interface CirclesScreenProps {
  navigation: any;
}

const CirclesScreen: React.FC<CirclesScreenProps> = ({ navigation }) => {
  const { circles, createCircle, joinCircle, isPremium } = useStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newCircleName, setNewCircleName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_OPTIONS[0]);
  const [joinCode, setJoinCode] = useState('');

  const handleCreateCircle = () => {
    if (!newCircleName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for your circle.');
      return;
    }

    if (!isPremium && circles.length >= 1) {
      Alert.alert(
        'Free Plan Limit',
        'Free plan allows 1 circle. Upgrade to Premium for unlimited circles!',
      );
      return;
    }

    createCircle(newCircleName.trim(), selectedEmoji);
    setNewCircleName('');
    setSelectedEmoji(EMOJI_OPTIONS[0]);
    setShowCreateModal(false);
  };

  const handleJoinCircle = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-character share code.');
      return;
    }

    const success = joinCircle(code);
    if (success) {
      setJoinCode('');
      setShowJoinModal(false);
      Alert.alert('Joined!', 'You have successfully joined the circle.');
    } else {
      Alert.alert('Could Not Join', 'Circle not found or you are already a member.');
    }
  };

  const handleCirclePress = (circle: SafetyCircle) => {
    navigation.navigate('CircleDetail', { circleId: circle.id });
  };

  const getStatusDots = (members: SafetyCircle['members']) => {
    const statusCounts: Record<string, number> = {
      alive: 0,
      dead: 0,
      unknown: 0,
      sos: 0,
    };
    members.forEach((m) => {
      statusCounts[m.status] = (statusCounts[m.status] || 0) + 1;
    });
    return statusCounts;
  };

  const renderStatusDots = (members: SafetyCircle['members']) => {
    const counts = getStatusDots(members);
    const dots: React.ReactNode[] = [];

    const addDots = (count: number, color: string, key: string) => {
      for (let i = 0; i < count; i++) {
        dots.push(
          <View
            key={`${key}-${i}`}
            style={[styles.statusDot, { backgroundColor: color }]}
          />,
        );
      }
    };

    addDots(counts.alive, Colors.alive, 'alive');
    addDots(counts.sos, Colors.sos, 'sos');
    addDots(counts.dead, Colors.dead, 'dead');
    addDots(counts.unknown, Colors.unknown, 'unknown');

    return dots;
  };

  const canCreate = isPremium || circles.length < 1;

  const renderCircleItem = ({ item }: { item: SafetyCircle }) => (
    <TouchableOpacity
      style={styles.circleCard}
      onPress={() => handleCirclePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.circleHeader}>
        <Text style={styles.circleEmoji}>{item.emoji}</Text>
        <View style={styles.circleInfo}>
          <Text style={styles.circleName}>{item.name}</Text>
          <Text style={styles.memberCount}>
            {item.members.length} {item.members.length === 1 ? 'member' : 'members'}
          </Text>
        </View>
      </View>
      <View style={styles.circleFooter}>
        <View style={styles.statusDotsRow}>
          {renderStatusDots(item.members)}
        </View>
        <Text style={styles.shareCodeSmall}>{item.shareCode}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{'\u{1F465}'}</Text>
      <Text style={styles.emptyTitle}>No circles yet</Text>
      <Text style={styles.emptySubtitle}>
        Create a circle and invite your family & friends
      </Text>
      <TouchableOpacity
        style={styles.emptyCreateButton}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.emptyCreateButtonText}>Create Circle</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPremiumBanner = () => {
    if (isPremium || circles.length < 1) return null;
    return (
      <View style={styles.premiumBanner}>
        <Text style={styles.premiumBannerText}>
          Free plan allows 1 circle. Upgrade for unlimited circles!
        </Text>
        <TouchableOpacity
          style={styles.premiumUpgradeButton}
          onPress={() => navigation.navigate('Premium')}
          activeOpacity={0.7}
        >
          <Text style={styles.premiumUpgradeText}>Upgrade</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Safety Circle</Text>
        <Text style={styles.subtitle}>Your people, your safety net</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.createButton, !canCreate && styles.buttonDisabled]}
          onPress={() => {
            if (!canCreate) {
              Alert.alert(
                'Free Plan Limit',
                'Free plan allows 1 circle. Upgrade to Premium for unlimited circles!',
              );
              return;
            }
            setShowCreateModal(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.createButtonText}>Create Circle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => setShowJoinModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.joinButtonText}>Join Circle</Text>
        </TouchableOpacity>
      </View>

      {/* Premium Banner */}
      {renderPremiumBanner()}

      {/* Circle List */}
      {circles.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={circles}
          keyExtractor={(item) => item.id}
          renderItem={renderCircleItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Create Circle Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Circle</Text>

            <TextInput
              style={styles.textInput}
              placeholder="Circle name"
              placeholderTextColor={Colors.textMuted}
              value={newCircleName}
              onChangeText={setNewCircleName}
              maxLength={30}
              autoFocus
            />

            <Text style={styles.emojiLabel}>Choose an emoji</Text>
            <View style={styles.emojiGrid}>
              {EMOJI_OPTIONS.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.emojiOption,
                    selectedEmoji === emoji && styles.emojiSelected,
                  ]}
                  onPress={() => setSelectedEmoji(emoji)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewCircleName('');
                  setSelectedEmoji(EMOJI_OPTIONS[0]);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCreateButton}
                onPress={handleCreateCircle}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join Circle Modal */}
      <Modal
        visible={showJoinModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Circle</Text>
            <Text style={styles.modalSubtitle}>
              Enter the 6-character share code
            </Text>

            <TextInput
              style={[styles.textInput, styles.codeInput]}
              placeholder="ABC123"
              placeholderTextColor={Colors.textMuted}
              value={joinCode}
              onChangeText={(text) => setJoinCode(text.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowJoinModal(false);
                  setJoinCode('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCreateButton}
                onPress={handleJoinCircle}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCreateText}>Join Circle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBg,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  createButton: {
    flex: 1,
    backgroundColor: Colors.alive,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textInverse,
  },
  joinButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  premiumBanner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.premiumGold,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumBannerText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.premiumGold,
    marginRight: Spacing.sm,
  },
  premiumUpgradeButton: {
    backgroundColor: Colors.premiumGold,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  premiumUpgradeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textInverse,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  circleCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  circleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  circleEmoji: {
    fontSize: 32,
    marginRight: Spacing.sm,
  },
  circleInfo: {
    flex: 1,
  },
  circleName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  memberCount: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  circleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  shareCodeSmall: {
    fontSize: FontSize.xs,
    fontVariant: ['tabular-nums'],
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyCreateButton: {
    backgroundColor: Colors.alive,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  emptyCreateButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textInverse,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  modalSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  textInput: {
    backgroundColor: Colors.darkBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  codeInput: {
    fontVariant: ['tabular-nums'],
    fontSize: FontSize.xl,
    letterSpacing: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  emojiLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.darkBg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiSelected: {
    borderColor: Colors.alive,
    borderWidth: 2,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  emojiText: {
    fontSize: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  modalCreateButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.alive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCreateText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textInverse,
  },
});

export default CirclesScreen;
