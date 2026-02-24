// Dead.Alive — Emergency Info Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../stores/useStore';

// ─── Types ──────────────────────────────────────────────────────────────────

interface EmergencyInfoScreenProps {
  navigation: any;
}

interface EmergencyMedicalData {
  fullName: string;
  bloodType: string;
  allergies: string;
  medicalConditions: string;
  currentMedications: string;
  emergencyNotes: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'dead-alive-emergency-info';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const EMPTY_DATA: EmergencyMedicalData = {
  fullName: '',
  bloodType: '',
  allergies: '',
  medicalConditions: '',
  currentMedications: '',
  emergencyNotes: '',
};

// ─── Component ──────────────────────────────────────────────────────────────

const EmergencyInfoScreen: React.FC<EmergencyInfoScreenProps> = ({ navigation }) => {
  const user = useStore((s) => s.user);

  const [data, setData] = useState<EmergencyMedicalData>(EMPTY_DATA);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<EmergencyMedicalData>(EMPTY_DATA);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ─── Load persisted data ───────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: EmergencyMedicalData = JSON.parse(raw);
          setData(parsed);
          setDraft(parsed);
        } else {
          // Auto-fill name from store if available
          const initialName = user?.name || '';
          const initial = { ...EMPTY_DATA, fullName: initialName };
          setData(initial);
          setDraft(initial);
          // If no saved data, start in edit mode
          setEditMode(true);
        }
      } catch {
        const initialName = user?.name || '';
        const initial = { ...EMPTY_DATA, fullName: initialName };
        setData(initial);
        setDraft(initial);
        setEditMode(true);
      }
      setHasLoaded(true);
    };
    load();
  }, [user?.name]);

  // ─── Handlers ─────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!draft.fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }

    setIsSaving(true);
    try {
      const trimmed: EmergencyMedicalData = {
        fullName: draft.fullName.trim(),
        bloodType: draft.bloodType,
        allergies: draft.allergies.trim(),
        medicalConditions: draft.medicalConditions.trim(),
        currentMedications: draft.currentMedications.trim(),
        emergencyNotes: draft.emergencyNotes.trim(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      setData(trimmed);
      setDraft(trimmed);
      setEditMode(false);
      Alert.alert('Saved', 'Your emergency medical info has been saved locally.');
    } catch {
      Alert.alert('Error', 'Failed to save your information. Please try again.');
    }
    setIsSaving(false);
  }, [draft]);

  const handleEdit = useCallback(() => {
    setDraft({ ...data });
    setEditMode(true);
  }, [data]);

  const handleCancel = useCallback(() => {
    setDraft({ ...data });
    setEditMode(false);
  }, [data]);

  const updateDraft = useCallback((field: keyof EmergencyMedicalData, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ─── Check if data has been filled ────────────────────────────────────

  const hasData =
    data.fullName.trim().length > 0 ||
    data.bloodType.length > 0 ||
    data.allergies.trim().length > 0 ||
    data.medicalConditions.trim().length > 0 ||
    data.currentMedications.trim().length > 0 ||
    data.emergencyNotes.trim().length > 0;

  // ─── Render ───────────────────────────────────────────────────────────

  if (!hasLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backArrow}>{'\u2190'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency Info</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ─── Header ──────────────────────────────────────────── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backArrow}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Info</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Urgent Info Banner ──────────────────────────────── */}
        <View style={styles.urgentBanner}>
          <Text style={styles.urgentBannerText}>
            {'\uD83C\uDFE5'} This info could save your life in an emergency
          </Text>
        </View>

        {/* ─── Privacy Indicator ───────────────────────────────── */}
        <View style={styles.privacyRow}>
          <Text style={styles.privacyText}>
            {'\uD83D\uDD12'} Stored locally on your device only
          </Text>
        </View>

        {/* ─── Edit / View Toggle ──────────────────────────────── */}
        {hasData && !editMode && (
          <TouchableOpacity
            style={styles.editToggleButton}
            onPress={handleEdit}
            activeOpacity={0.7}
          >
            <Text style={styles.editToggleText}>Edit Info</Text>
          </TouchableOpacity>
        )}

        {/* ─── Full Name ───────────────────────────────────────── */}
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          {editMode ? (
            <TextInput
              style={styles.textInput}
              placeholder="Your full legal name"
              placeholderTextColor="#555570"
              value={draft.fullName}
              onChangeText={(v) => updateDraft('fullName', v)}
              autoCapitalize="words"
              returnKeyType="next"
            />
          ) : (
            <Text style={[styles.fieldValue, !data.fullName && styles.fieldEmpty]}>
              {data.fullName || 'Not set'}
            </Text>
          )}
        </View>

        {/* ─── Blood Type ──────────────────────────────────────── */}
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Blood Type</Text>
          {editMode ? (
            <View style={styles.chipRow}>
              {BLOOD_TYPES.map((type) => {
                const isSelected = draft.bloodType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => updateDraft('bloodType', isSelected ? '' : type)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={[styles.fieldValue, !data.bloodType && styles.fieldEmpty]}>
              {data.bloodType || 'Not set'}
            </Text>
          )}
        </View>

        {/* ─── Allergies ───────────────────────────────────────── */}
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Allergies</Text>
          <Text style={styles.fieldHint}>Comma-separated (e.g. Penicillin, Peanuts)</Text>
          {editMode ? (
            <TextInput
              style={styles.textInput}
              placeholder="List your allergies"
              placeholderTextColor="#555570"
              value={draft.allergies}
              onChangeText={(v) => updateDraft('allergies', v)}
              autoCapitalize="sentences"
              returnKeyType="next"
            />
          ) : (
            <Text style={[styles.fieldValue, !data.allergies && styles.fieldEmpty]}>
              {data.allergies || 'None listed'}
            </Text>
          )}
        </View>

        {/* ─── Medical Conditions ──────────────────────────────── */}
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Medical Conditions</Text>
          <Text style={styles.fieldHint}>Comma-separated (e.g. Asthma, Diabetes)</Text>
          {editMode ? (
            <TextInput
              style={styles.textInput}
              placeholder="List your medical conditions"
              placeholderTextColor="#555570"
              value={draft.medicalConditions}
              onChangeText={(v) => updateDraft('medicalConditions', v)}
              autoCapitalize="sentences"
              returnKeyType="next"
            />
          ) : (
            <Text style={[styles.fieldValue, !data.medicalConditions && styles.fieldEmpty]}>
              {data.medicalConditions || 'None listed'}
            </Text>
          )}
        </View>

        {/* ─── Current Medications ─────────────────────────────── */}
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Current Medications</Text>
          <Text style={styles.fieldHint}>Comma-separated (e.g. Metformin 500mg, Aspirin)</Text>
          {editMode ? (
            <TextInput
              style={styles.textInput}
              placeholder="List your current medications"
              placeholderTextColor="#555570"
              value={draft.currentMedications}
              onChangeText={(v) => updateDraft('currentMedications', v)}
              autoCapitalize="sentences"
              returnKeyType="next"
            />
          ) : (
            <Text style={[styles.fieldValue, !data.currentMedications && styles.fieldEmpty]}>
              {data.currentMedications || 'None listed'}
            </Text>
          )}
        </View>

        {/* ─── Emergency Notes ─────────────────────────────────── */}
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Emergency Notes</Text>
          <Text style={styles.fieldHint}>
            Any additional info for first responders
          </Text>
          {editMode ? (
            <TextInput
              style={[styles.textInput, styles.textInputMultiline]}
              placeholder="e.g. DNR order, insulin pump location, emergency procedures..."
              placeholderTextColor="#555570"
              value={draft.emergencyNotes}
              onChangeText={(v) => updateDraft('emergencyNotes', v)}
              autoCapitalize="sentences"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
          ) : (
            <Text style={[styles.fieldValue, !data.emergencyNotes && styles.fieldEmpty]}>
              {data.emergencyNotes || 'None'}
            </Text>
          )}
          {editMode && (
            <Text style={styles.charCount}>{draft.emergencyNotes.length}/500</Text>
          )}
        </View>

        {/* ─── Action Buttons ──────────────────────────────────── */}
        {editMode && (
          <View style={styles.actionRow}>
            {hasData && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.saveButton,
                isSaving && styles.saveButtonDisabled,
                !hasData && styles.saveButtonFull,
              ]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Bottom Spacer ───────────────────────────────────── */}
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

  // ─── Header ──────────────────────────────────────────────
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

  // ─── Scroll ──────────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // ─── Loading ─────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 15,
    color: '#555570',
  },

  // ─── Urgent Banner ───────────────────────────────────────
  urgentBanner: {
    backgroundColor: 'rgba(255, 59, 92, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 92, 0.25)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  urgentBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B5C',
    textAlign: 'center',
    lineHeight: 20,
  },

  // ─── Privacy Row ─────────────────────────────────────────
  privacyRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  privacyText: {
    fontSize: 12,
    color: '#555570',
  },

  // ─── Edit Toggle ─────────────────────────────────────────
  editToggleButton: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#00FF88',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  editToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00FF88',
  },

  // ─── Field Card ──────────────────────────────────────────
  fieldCard: {
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
    padding: 16,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9999B0',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldHint: {
    fontSize: 12,
    color: '#555570',
    marginBottom: 10,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 24,
    marginTop: 6,
  },
  fieldEmpty: {
    color: '#555570',
    fontStyle: 'italic',
  },

  // ─── Text Inputs ─────────────────────────────────────────
  textInput: {
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A40',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 6,
  },
  textInputMultiline: {
    minHeight: 100,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#555570',
    textAlign: 'right',
    marginTop: 6,
  },

  // ─── Blood Type Chips ────────────────────────────────────
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#2A2A40',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0A0A0F',
  },
  chipSelected: {
    borderColor: '#00FF88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555570',
  },
  chipTextSelected: {
    color: '#00FF88',
  },

  // ─── Action Buttons ──────────────────────────────────────
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2A2A40',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9999B0',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#00FF88',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonFull: {
    flex: 1,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0F',
  },

  // ─── Bottom ──────────────────────────────────────────────
  bottomSpacer: {
    height: 100,
  },
});

export default EmergencyInfoScreen;
