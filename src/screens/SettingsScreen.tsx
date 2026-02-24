// Dead.Alive — Settings Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useStore } from '../stores/useStore';
import PhoneInput from '../components/PhoneInput';
import PinPad from '../components/PinPad';

// ─── Types ──────────────────────────────────────────────────────────────────

interface SettingsScreenProps {
  navigation: any;
}

const RELATIONSHIP_OPTIONS = [
  'Parent',
  'Partner',
  'Sibling',
  'Friend',
  'Roommate',
  'Other',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const maskPhone = (phone: string): string => {
  if (phone.length <= 4) return phone;
  const last4 = phone.slice(-4);
  const masked = phone.slice(0, -4).replace(/[0-9]/g, '\u2022');
  return masked + last4;
};

const formatHour = (hour: number): string => {
  const isPM = hour >= 12;
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${isPM ? 'PM' : 'AM'}`;
};

// ─── Component ──────────────────────────────────────────────────────────────

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  // Store
  const user = useStore((s) => s.user);
  const isPremium = useStore((s) => s.isPremium);
  const emergencyContacts = useStore((s) => s.emergencyContacts);
  const settings = useStore((s) => s.settings);
  const addContact = useStore((s) => s.addContact);
  const removeContact = useStore((s) => s.removeContact);
  const updateSettings = useStore((s) => s.updateSettings);
  const pauseCheckIns = useStore((s) => s.pauseCheckIns);
  const updatePauseCheckIns = useStore((s) => s.updatePauseCheckIns);
  const duressPin = useStore((s) => s.duressPin);
  const updateDuressPin = useStore((s) => s.updateDuressPin);
  const resetApp = useStore((s) => s.resetApp);

  // Add Contact Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelationship, setNewContactRelationship] = useState('Friend');
  const [pauseReason, setPauseReason] = useState(pauseCheckIns.reason || '');
  const [showSetPin, setShowSetPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [pendingPin, setPendingPin] = useState('');

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      Alert.alert('Missing Info', 'Please enter both name and phone number.');
      return;
    }

    addContact({
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relationship: newContactRelationship,
      isICE: false,
    });

    // Reset and close
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRelationship('Friend');
    setModalVisible(false);
  };

  const handleRemoveContact = (id: string, name: string) => {
    Alert.alert(
      'Remove Contact',
      `Are you sure you want to remove ${name} from your emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeContact(id),
        },
      ]
    );
  };

  const handleCycleReminderHour = () => {
    const nextHour = (settings.checkInReminderHour + 1) % 24;
    updateSettings({ checkInReminderHour: nextHour });
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'This will delete all your data including contacts, check-ins, circles, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => resetApp(),
        },
      ]
    );
  };

  // ─── User Info ──────────────────────────────────────────────────────────

  const userName = user?.name || 'User';
  const userPhone = user?.phone || '';
  const userInitial = userName.charAt(0).toUpperCase();

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ──────────────────────────────────────────── */}
        <Text style={styles.screenTitle}>Settings</Text>

        {/* ─── Profile Section Card ────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitial}</Text>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{userName}</Text>
                {isPremium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>✨ Premium</Text>
                  </View>
                )}
              </View>
              <Text style={styles.userPhone}>{userPhone}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => Alert.alert('Edit Profile', 'Profile editing coming soon!')}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Emergency Contacts Section ──────────────────────── */}
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <View style={styles.card}>
          {emergencyContacts.length > 0 ? (
            emergencyContacts.map((contact) => (
              <View key={contact.id} style={styles.contactRow}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>
                    {maskPhone(contact.phone)}
                  </Text>
                  <Text style={styles.contactRelationship}>
                    {contact.relationship}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() =>
                    handleRemoveContact(contact.id, contact.name)
                  }
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No emergency contacts added yet.</Text>
          )}

          <TouchableOpacity
            style={styles.addContactButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addContactButtonText}>+ Add Contact</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Check-in Settings Card ──────────────────────────── */}
        <Text style={styles.sectionTitle}>Check-in Settings</Text>
        <View style={styles.card}>
          {/* Daily Reminder Time */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleCycleReminderHour}
            activeOpacity={0.6}
          >
            <Text style={styles.settingLabel}>Daily Reminder Time</Text>
            <Text style={styles.settingValue}>
              {formatHour(settings.checkInReminderHour)} ›
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Missed Check-in Threshold */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Missed Check-in Threshold</Text>
            <View style={styles.optionButtons}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  settings.missedCheckInThresholdDays === 2 &&
                    styles.optionButtonActive,
                ]}
                onPress={() =>
                  updateSettings({ missedCheckInThresholdDays: 2 })
                }
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    settings.missedCheckInThresholdDays === 2 &&
                      styles.optionButtonTextActive,
                  ]}
                >
                  2 days
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  settings.missedCheckInThresholdDays === 3 &&
                    styles.optionButtonActive,
                ]}
                onPress={() =>
                  updateSettings({ missedCheckInThresholdDays: 3 })
                }
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    settings.missedCheckInThresholdDays === 3 &&
                      styles.optionButtonTextActive,
                  ]}
                >
                  3 days
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Auto-share location */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>
              Auto-share location with alerts
            </Text>
            <Switch
              value={settings.autoShareLocation}
              onValueChange={(value) =>
                updateSettings({ autoShareLocation: value })
              }
              trackColor={{ false: '#2A2A40', true: '#00FF88' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ─── Pause Check-ins Card ──────────────────────────────── */}
        <Text style={styles.sectionTitle}>Pause Check-ins</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.settingLabel}>Pause Check-ins</Text>
              <Text style={styles.contactRelationship}>
                Temporarily stop reminders & missed alerts
              </Text>
            </View>
            <Switch
              value={pauseCheckIns.paused}
              onValueChange={(value) => {
                if (value) {
                  updatePauseCheckIns({
                    paused: true,
                    pausedAt: Date.now(),
                    resumeAt: Date.now() + 1 * 24 * 60 * 60 * 1000, // default 1 day
                  });
                } else {
                  updatePauseCheckIns({
                    paused: false,
                    pausedAt: null,
                    resumeAt: null,
                    reason: undefined,
                  });
                  setPauseReason('');
                }
              }}
              trackColor={{ false: '#2A2A40', true: '#FFB800' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {pauseCheckIns.paused && (
            <>
              <View style={styles.divider} />
              <Text style={[styles.contactRelationship, { marginTop: 12, marginBottom: 8 }]}>
                Pause Duration
              </Text>
              <View style={[styles.optionButtons, { flexWrap: 'wrap' }]}>
                {[
                  { label: '1 Day', days: 1 },
                  { label: '3 Days', days: 3 },
                  { label: '1 Week', days: 7 },
                  { label: '2 Weeks', days: 14 },
                ].map((opt) => {
                  const isSelected = !!(
                    pauseCheckIns.resumeAt &&
                    pauseCheckIns.pausedAt &&
                    Math.round((pauseCheckIns.resumeAt - pauseCheckIns.pausedAt) / (24 * 60 * 60 * 1000)) === opt.days
                  );
                  return (
                    <TouchableOpacity
                      key={opt.days}
                      style={[
                        styles.optionButton,
                        isSelected && { borderColor: '#FFB800', backgroundColor: 'rgba(255, 184, 0, 0.1)' },
                      ]}
                      onPress={() =>
                        updatePauseCheckIns({
                          resumeAt: (pauseCheckIns.pausedAt || Date.now()) + opt.days * 24 * 60 * 60 * 1000,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          isSelected && { color: '#FFB800' },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.divider} />
              <TextInput
                style={[styles.textInput, { marginTop: 12 }]}
                placeholder="Reason (optional)"
                placeholderTextColor="#555570"
                value={pauseReason}
                onChangeText={setPauseReason}
                onBlur={() => updatePauseCheckIns({ reason: pauseReason || undefined })}
              />

              {pauseCheckIns.resumeAt && (
                <Text style={[styles.contactRelationship, { marginTop: 12, color: '#FFB800' }]}>
                  Resumes: {new Date(pauseCheckIns.resumeAt).toLocaleDateString()}{' '}
                  {pauseCheckIns.reason ? `(${pauseCheckIns.reason})` : ''}
                </Text>
              )}
            </>
          )}
        </View>

        {/* ─── Permissions Card ────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Permissions</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={settings.notifications}
              onValueChange={(value) =>
                updateSettings({ notifications: value })
              }
              trackColor={{ false: '#2A2A40', true: '#00FF88' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Location Access</Text>
            <Switch
              value={settings.location}
              onValueChange={(value) =>
                updateSettings({ location: value })
              }
              trackColor={{ false: '#2A2A40', true: '#00FF88' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Haptic Feedback</Text>
            <Switch
              value={settings.haptics}
              onValueChange={(value) =>
                updateSettings({ haptics: value })
              }
              trackColor={{ false: '#2A2A40', true: '#00FF88' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.settingLabel}>Shake to SOS</Text>
              <Text style={styles.contactRelationship}>
                Shake phone vigorously to trigger SOS
              </Text>
            </View>
            <Switch
              value={settings.shakeToSOS}
              onValueChange={(value) =>
                updateSettings({ shakeToSOS: value })
              }
              trackColor={{ false: '#2A2A40', true: '#FF0040' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.settingLabel}>Quick Check-in Notification</Text>
              <Text style={styles.contactRelationship}>
                Persistent notification with one-tap check-in
              </Text>
            </View>
            <Switch
              value={settings.persistentNotification}
              onValueChange={(value) =>
                updateSettings({ persistentNotification: value })
              }
              trackColor={{ false: '#2A2A40', true: '#00FF88' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ─── Duress PIN Section ────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Duress PIN {!isPremium && '🔒'}</Text>
        <View style={styles.card}>
          {!isPremium ? (
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Text style={styles.contactRelationship}>
                Premium feature — secret PIN that silently alerts contacts
              </Text>
              <TouchableOpacity
                style={[styles.addContactButton, { marginTop: 12, borderColor: '#FFD700' }]}
                onPress={() => navigation.navigate('Premium')}
              >
                <Text style={[styles.addContactButtonText, { color: '#FFD700' }]}>
                  Upgrade to Premium
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.settingRow}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.settingLabel}>Enable Duress PIN</Text>
                  <Text style={styles.contactRelationship}>
                    Long-press check-in circle to enter PIN
                  </Text>
                </View>
                <Switch
                  value={duressPin.enabled}
                  onValueChange={(value) => {
                    if (value && !duressPin.pin) {
                      setShowSetPin(true);
                    } else {
                      updateDuressPin({ enabled: value });
                    }
                  }}
                  trackColor={{ false: '#2A2A40', true: '#FF0040' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {duressPin.enabled && duressPin.pin && (
                <>
                  <View style={styles.divider} />
                  <View style={[styles.settingRow, { paddingVertical: 8 }]}>
                    <Text style={styles.settingLabel}>
                      Current PIN: {'••••'}
                    </Text>
                    <TouchableOpacity
                      style={styles.editProfileButton}
                      onPress={() => setShowSetPin(true)}
                    >
                      <Text style={styles.editProfileButtonText}>Change</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.contactRelationship, { marginTop: 4 }]}>
                    Looks like a normal check-in but silently alerts your contacts
                  </Text>
                </>
              )}
            </>
          )}
        </View>

        {/* ─── Premium Section ─────────────────────────────────── */}
        {isPremium ? (
          <View style={[styles.card, styles.premiumActiveCard]}>
            <Text style={styles.premiumActiveTitle}>✨ Premium Active</Text>
            <Text style={styles.premiumActiveExpiry}>
              {user?.premiumExpiresAt
                ? `Expires: ${new Date(user.premiumExpiresAt).toLocaleDateString()}`
                : 'Lifetime access'}
            </Text>
          </View>
        ) : (
          <View style={[styles.card, styles.premiumUpgradeCard]}>
            <Text style={styles.premiumUpgradeTitle}>
              ✨ Upgrade to Premium
            </Text>
            <View style={styles.premiumFeaturesList}>
              <Text style={styles.premiumFeatureItem}>
                {'\u2022'} Dead Man's Switch & Night Watch
              </Text>
              <Text style={styles.premiumFeatureItem}>
                {'\u2022'} Unlimited emergency contacts & circles
              </Text>
              <Text style={styles.premiumFeatureItem}>
                {'\u2022'} Custom fake callers & alert messages
              </Text>
              <Text style={styles.premiumFeatureItem}>
                {'\u2022'} Walk Me Home & Duress PIN
              </Text>
              <Text style={styles.premiumFeatureItem}>
                {'\u2022'} Heartbeat Pulse & Stealth Mode
              </Text>
              <Text style={styles.premiumFeatureItem}>
                {'\u2022'} Full Safety Score breakdown
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewPlansButton}
              onPress={() => navigation.navigate('Premium')}
            >
              <Text style={styles.viewPlansButtonText}>View Plans</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Danger Zone Card ────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <View style={[styles.card, styles.dangerCard]}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetApp}
          >
            <Text style={styles.resetButtonText}>Reset App</Text>
          </TouchableOpacity>
          <Text style={styles.dangerWarning}>
            This will delete all your data
          </Text>
        </View>

        {/* ─── App Info ────────────────────────────────────────── */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Dead.Alive v1.0.0</Text>
          <Text style={styles.appTagline}>
            Made with {'\uD83D\uDC9A'} for solo dwellers
          </Text>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ─── Duress PIN Set Modal ────────────────────────────────── */}
      <PinPad
        visible={showSetPin}
        onClose={() => setShowSetPin(false)}
        onSubmit={(pin) => {
          setShowSetPin(false);
          setPendingPin(pin);
          setShowConfirmPin(true);
        }}
        title="Set New PIN"
      />

      {/* ─── Duress PIN Confirm Modal ────────────────────────────── */}
      <PinPad
        visible={showConfirmPin}
        onClose={() => {
          setShowConfirmPin(false);
          setPendingPin('');
        }}
        onSubmit={(pin) => {
          setShowConfirmPin(false);
          if (pin === pendingPin) {
            updateDuressPin({ pin, enabled: true });
            Alert.alert('Duress PIN Set', 'Your duress PIN has been saved. Long-press the check-in circle to use it.');
          } else {
            Alert.alert('PINs Don\'t Match', 'Please try again.');
          }
          setPendingPin('');
        }}
        title="Confirm PIN"
      />

      {/* ─── Add Contact Modal ──────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Emergency Contact</Text>

            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contact name"
              placeholderTextColor="#555570"
              value={newContactName}
              onChangeText={setNewContactName}
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <PhoneInput
              value={newContactPhone}
              onChangeText={setNewContactPhone}
              placeholder="Phone number"
            />

            <Text style={styles.inputLabel}>Relationship</Text>
            <View style={styles.relationshipPicker}>
              {RELATIONSHIP_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.relationshipOption,
                    newContactRelationship === option &&
                      styles.relationshipOptionActive,
                  ]}
                  onPress={() => setNewContactRelationship(option)}
                >
                  <Text
                    style={[
                      styles.relationshipOptionText,
                      newContactRelationship === option &&
                        styles.relationshipOptionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setNewContactName('');
                  setNewContactPhone('');
                  setNewContactRelationship('Friend');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={handleAddContact}
              >
                <Text style={styles.modalAddButtonText}>Add Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },

  // Header
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
  },

  // Section title
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9999B0',
    marginBottom: 12,
    marginTop: 8,
  },

  // Card
  card: {
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
    padding: 16,
    marginBottom: 20,
  },

  // ─── Profile ────────────────────────────────────────────
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00FF88',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  userPhone: {
    fontSize: 14,
    color: '#9999B0',
  },
  premiumBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFD700',
  },
  editProfileButton: {
    borderWidth: 1,
    borderColor: '#2A2A40',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  editProfileButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9999B0',
  },

  // ─── Emergency Contacts ─────────────────────────────────
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A40',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 13,
    color: '#9999B0',
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 12,
    color: '#555570',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 92, 0.12)',
  },
  removeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF3B5C',
  },
  emptyText: {
    fontSize: 14,
    color: '#555570',
    textAlign: 'center',
    paddingVertical: 12,
  },
  addContactButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#00FF88',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addContactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FF88',
  },

  // ─── Settings Rows ──────────────────────────────────────
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  settingValue: {
    fontSize: 15,
    color: '#00FF88',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A40',
  },

  // ─── Option Buttons ─────────────────────────────────────
  optionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#2A2A40',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  optionButtonActive: {
    borderColor: '#00FF88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  optionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555570',
  },
  optionButtonTextActive: {
    color: '#00FF88',
  },

  // ─── Premium Section ────────────────────────────────────
  premiumActiveCard: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.06)',
  },
  premiumActiveTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 4,
  },
  premiumActiveExpiry: {
    fontSize: 13,
    color: '#9999B0',
  },
  premiumUpgradeCard: {
    borderColor: '#FFD700',
    borderWidth: 1,
  },
  premiumUpgradeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 12,
  },
  premiumFeaturesList: {
    marginBottom: 16,
  },
  premiumFeatureItem: {
    fontSize: 13,
    color: '#9999B0',
    lineHeight: 22,
  },
  viewPlansButton: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewPlansButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0A0F',
  },

  // ─── Danger Zone ────────────────────────────────────────
  dangerCard: {
    borderColor: '#FF3B5C',
    borderWidth: 1,
  },
  resetButton: {
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B5C',
  },
  dangerWarning: {
    fontSize: 12,
    color: '#555570',
    textAlign: 'center',
  },

  // ─── App Info ───────────────────────────────────────────
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appVersion: {
    fontSize: 13,
    color: '#555570',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 12,
    color: '#555570',
  },

  // Bottom
  bottomSpacer: {
    height: 100,
  },

  // ─── Modal ──────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#141420',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9999B0',
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A40',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#FFFFFF',
  },
  relationshipPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  relationshipOption: {
    borderWidth: 1,
    borderColor: '#2A2A40',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  relationshipOptionActive: {
    borderColor: '#00FF88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  relationshipOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555570',
  },
  relationshipOptionTextActive: {
    color: '#00FF88',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2A2A40',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9999B0',
  },
  modalAddButton: {
    flex: 1,
    backgroundColor: '#00FF88',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalAddButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0A0F',
  },
});

export default SettingsScreen;
