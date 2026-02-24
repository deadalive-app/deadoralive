import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';

// ─── Types ───────────────────────────────────────────────────────────

interface MoodEntry {
  id: string;
  mood: 'awful' | 'bad' | 'okay' | 'good' | 'great';
  note: string;
  timestamp: number;
}

type MoodKey = MoodEntry['mood'];

interface MoodOption {
  key: MoodKey;
  emoji: string;
  label: string;
  color: string;
}

interface MoodTrackerScreenProps {
  navigation: any;
}

// ─── Constants ───────────────────────────────────────────────────────

const STORAGE_KEY = '@dead_alive_mood_entries';

const MOOD_OPTIONS: MoodOption[] = [
  { key: 'awful', emoji: '\uD83D\uDE22', label: 'Awful', color: '#FF3B5C' },
  { key: 'bad', emoji: '\uD83D\uDE1F', label: 'Bad', color: '#FF8800' },
  { key: 'okay', emoji: '\uD83D\uDE10', label: 'Okay', color: '#FFB800' },
  { key: 'good', emoji: '\uD83D\uDE0A', label: 'Good', color: '#88FF00' },
  { key: 'great', emoji: '\uD83E\uDD29', label: 'Great', color: '#00FF88' },
];

const MOOD_COLOR_MAP: Record<MoodKey, string> = {
  awful: '#FF3B5C',
  bad: '#FF8800',
  okay: '#FFB800',
  good: '#88FF00',
  great: '#00FF88',
};

const MAX_NOTE_LENGTH = 200;

// ─── Helpers ─────────────────────────────────────────────────────────

const getMoodEmoji = (mood: MoodKey): string => {
  const option = MOOD_OPTIONS.find((m) => m.key === mood);
  return option ? option.emoji : '\uD83D\uDE10';
};

const formatEntryDate = (ts: number): string => {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return (
      'Today \u2022 ' +
      date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    );
  }
  if (diffDays === 1) {
    return (
      'Yesterday \u2022 ' +
      date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    );
  }

  return (
    date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }) +
    ' \u2022 ' +
    date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  );
};

// ─── Component ───────────────────────────────────────────────────────

export default function MoodTrackerScreen({ navigation }: MoodTrackerScreenProps) {
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [note, setNote] = useState('');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load entries from AsyncStorage on mount
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: MoodEntry[] = JSON.parse(stored);
        // Sort by timestamp descending (most recent first)
        parsed.sort((a, b) => b.timestamp - a.timestamp);
        setEntries(parsed);
      }
    } catch (error) {
      console.warn('Failed to load mood entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveEntries = async (updatedEntries: MoodEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    } catch (error) {
      console.warn('Failed to save mood entries:', error);
    }
  };

  const handleLogMood = useCallback(async () => {
    if (!selectedMood) {
      Alert.alert('Select a Mood', 'Please choose how you\'re feeling before logging.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newEntry: MoodEntry = {
      id: Crypto.randomUUID(),
      mood: selectedMood,
      note: note.trim(),
      timestamp: Date.now(),
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    await saveEntries(updatedEntries);

    // Reset form
    setSelectedMood(null);
    setNote('');
    Keyboard.dismiss();

    Alert.alert('Mood Logged', 'Your mood entry has been saved.');
  }, [selectedMood, note, entries]);

  // Get the last 7 entries for the mini chart
  const last7Entries = entries.slice(0, 7);

  // For the chart, reverse so oldest is on the left
  const chartEntries = [...last7Entries].reverse();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backArrow}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mood Tracker</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Mood Selector Section */}
        <Text style={styles.sectionLabel}>How are you feeling?</Text>
        <View style={styles.moodRow}>
          {MOOD_OPTIONS.map((option) => {
            const isSelected = selectedMood === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={styles.moodOption}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedMood(option.key);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.moodCircle,
                    isSelected && styles.moodCircleSelected,
                  ]}
                >
                  <Text style={styles.moodEmoji}>{option.emoji}</Text>
                </View>
                <Text
                  style={[
                    styles.moodLabel,
                    isSelected && styles.moodLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Journal Note Input */}
        <View style={styles.noteContainer}>
          <TextInput
            style={styles.noteInput}
            placeholder="How are you feeling today? (optional)"
            placeholderTextColor="#555570"
            value={note}
            onChangeText={(text) => setNote(text.slice(0, MAX_NOTE_LENGTH))}
            multiline
            maxLength={MAX_NOTE_LENGTH}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {note.length}/{MAX_NOTE_LENGTH}
          </Text>
        </View>

        {/* Log Mood Button */}
        <TouchableOpacity
          style={[
            styles.logButton,
            !selectedMood && styles.logButtonDisabled,
          ]}
          onPress={handleLogMood}
          activeOpacity={0.8}
          disabled={!selectedMood}
        >
          <Text style={styles.logButtonText}>Log Mood</Text>
        </TouchableOpacity>

        {/* Recent Entries Section */}
        {entries.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent Entries</Text>

            {/* Mini Mood Chart */}
            {chartEntries.length > 0 && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartLabel}>Last 7 Days</Text>
                <View style={styles.chartRow}>
                  {chartEntries.map((entry) => (
                    <View key={entry.id} style={styles.chartDotWrapper}>
                      <View
                        style={[
                          styles.chartDot,
                          { backgroundColor: MOOD_COLOR_MAP[entry.mood] },
                        ]}
                      />
                    </View>
                  ))}
                  {/* Fill empty slots if fewer than 7 entries */}
                  {Array.from({ length: Math.max(0, 7 - chartEntries.length) }).map(
                    (_, i) => (
                      <View key={`empty-${i}`} style={styles.chartDotWrapper}>
                        <View style={[styles.chartDot, styles.chartDotEmpty]} />
                      </View>
                    ),
                  )}
                </View>
                <View style={styles.chartLabelRow}>
                  <Text style={styles.chartDayLabel}>Oldest</Text>
                  <Text style={styles.chartDayLabel}>Latest</Text>
                </View>
              </View>
            )}

            {/* Entry List */}
            <View style={styles.entryList}>
              {last7Entries.map((entry) => (
                <View key={entry.id} style={styles.entryCard}>
                  <Text style={styles.entryEmoji}>{getMoodEmoji(entry.mood)}</Text>
                  <View style={styles.entryContent}>
                    <Text style={styles.entryDate}>
                      {formatEntryDate(entry.timestamp)}
                    </Text>
                    {entry.note.length > 0 && (
                      <Text style={styles.entryNote} numberOfLines={1}>
                        {entry.note}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.entryMoodBadge,
                      { backgroundColor: MOOD_COLOR_MAP[entry.mood] + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.entryMoodText,
                        { color: MOOD_COLOR_MAP[entry.mood] },
                      ]}
                    >
                      {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && entries.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{'\uD83D\uDCD3'}</Text>
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptySubtitle}>
              Log your first mood to start tracking your wellness
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },

  // Header
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
  headerSpacer: {
    width: 40,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },

  // Mood Selector
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9999B0',
    marginTop: 8,
    marginBottom: 16,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  moodOption: {
    alignItems: 'center',
    flex: 1,
  },
  moodCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#141420',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2A2A40',
  },
  moodCircleSelected: {
    borderColor: '#00FF88',
    backgroundColor: 'rgba(0, 255, 136, 0.08)',
  },
  moodEmoji: {
    fontSize: 26,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555570',
    marginTop: 6,
  },
  moodLabelSelected: {
    color: '#00FF88',
    fontWeight: '600',
  },

  // Note Input
  noteContainer: {
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
    padding: 16,
    marginBottom: 20,
  },
  noteInput: {
    fontSize: 15,
    color: '#FFFFFF',
    minHeight: 80,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    color: '#555570',
    textAlign: 'right',
    marginTop: 8,
  },

  // Log Button
  logButton: {
    backgroundColor: '#00FF88',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  logButtonDisabled: {
    opacity: 0.4,
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0F',
  },

  // Recent Section
  recentSection: {
    marginTop: 8,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },

  // Mini Mood Chart
  chartContainer: {
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
    padding: 20,
    marginBottom: 16,
  },
  chartLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9999B0',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  chartDotWrapper: {
    alignItems: 'center',
  },
  chartDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  chartDotEmpty: {
    backgroundColor: '#2A2A40',
  },
  chartLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  chartDayLabel: {
    fontSize: 11,
    color: '#555570',
    fontWeight: '500',
  },

  // Entry List
  entryList: {
    gap: 10,
  },
  entryCard: {
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryEmoji: {
    fontSize: 28,
    marginRight: 14,
  },
  entryContent: {
    flex: 1,
    marginRight: 10,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  entryNote: {
    fontSize: 13,
    color: '#9999B0',
    lineHeight: 18,
  },
  entryMoodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  entryMoodText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#555570',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 24,
  },
});
