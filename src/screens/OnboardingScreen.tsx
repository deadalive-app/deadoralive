import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ListRenderItemInfo,
  ScrollView,
  Animated,
} from 'react-native';
import { useStore } from '../stores/useStore';
import PhoneInput from '../components/PhoneInput';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TOTAL_PAGES = 6;

const RELATIONSHIPS = [
  { label: 'Parent', emoji: '👨‍👩‍👧' },
  { label: 'Partner', emoji: '💕' },
  { label: 'Sibling', emoji: '👫' },
  { label: 'Friend', emoji: '🤝' },
  { label: 'Roommate', emoji: '🏠' },
  { label: 'Other', emoji: '👤' },
];

interface OnboardingScreenProps {
  navigation: any;
}

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const flatListRef = useRef<FlatList>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  // Store actions
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const addContact = useStore((s) => s.addContact);

  const goToPage = useCallback(
    (page: number) => {
      flatListRef.current?.scrollToIndex({ index: page, animated: true });
      setCurrentPage(page);
    },
    [],
  );

  const goNext = useCallback(() => {
    if (currentPage < TOTAL_PAGES - 1) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, goToPage]);

  const handleGetStarted = useCallback(() => {
    goNext();
  }, [goNext]);

  const handleAddContact = useCallback(() => {
    if (contactName.trim() && contactPhone.trim() && relationship) {
      addContact({
        name: contactName.trim(),
        phone: contactPhone.trim(),
        relationship,
        isICE: true,
      });
    }
    goNext();
  }, [contactName, contactPhone, relationship, addContact, goNext]);

  const handleSkipContact = useCallback(() => {
    goNext();
  }, [goNext]);

  const handleFinish = useCallback(() => {
    completeOnboarding(name.trim(), phone.trim());
    // Navigation happens automatically via conditional navigator in AppNavigator
  }, [name, phone, completeOnboarding]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setCurrentPage(index);
    },
    [],
  );

  // ─── Page 0: Welcome ──────────────────────────────────────

  const renderWelcome = () => (
    <View style={styles.page}>
      <View style={styles.centerContent}>
        <Text style={styles.heroEmoji}>{'💀'}</Text>
        <Text style={styles.appName}>Dead.Alive</Text>
        <Text style={styles.tagline}>
          Because someone should know you're okay.
        </Text>
        <View style={styles.featurePills}>
          {['Daily Check-in', 'SOS Alerts', 'Safety Circle', 'Fake Call'].map((f) => (
            <View key={f} style={styles.featurePill}>
              <Text style={styles.featurePillText}>{f}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Page 1: How It Works ─────────────────────────────────

  const renderHowItWorks = () => (
    <View style={styles.page}>
      <View style={styles.topSection}>
        <Text style={styles.pageTitle}>How it works</Text>
        <Text style={styles.subtitle}>Simple. Quiet. Life-saving.</Text>
      </View>
      <View style={styles.stepsContainer}>
        {[
          { emoji: '👆', title: 'Check in daily', desc: 'One tap. That\'s it. Takes 1 second.' },
          { emoji: '⏰', title: 'We watch quietly', desc: 'Miss 2 days? We notice something\'s wrong.' },
          { emoji: '🚨', title: 'Contacts alerted', desc: 'Your people get notified automatically.' },
        ].map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={styles.stepEmojiContainer}>
              <Text style={styles.stepEmoji}>{step.emoji}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.primaryButton} onPress={goNext}>
          <Text style={styles.primaryButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Page 2: Name Input ───────────────────────────────────

  const renderNameInput = () => (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topSection}>
        <Text style={styles.pageTitle}>What should we call you?</Text>
        <Text style={styles.subtitle}>This is how you'll appear to your safety circle</Text>
      </View>
      <View style={styles.formSection}>
        <Text style={styles.inputLabel}>YOUR NAME</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your name"
          placeholderTextColor="#555570"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          autoFocus={false}
        />
      </View>
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[styles.primaryButton, !name.trim() && styles.buttonDisabled]}
          onPress={goNext}
          disabled={!name.trim()}
        >
          <Text
            style={[
              styles.primaryButtonText,
              !name.trim() && styles.buttonTextDisabled,
            ]}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  // ─── Page 3: Phone Input with Country Code ────────────────

  const renderPhoneInput = () => (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topSection}>
        <Text style={styles.pageTitle}>Your phone number</Text>
        <Text style={styles.subtitle}>So your emergency contacts can reach you</Text>
      </View>
      <View style={styles.formSection}>
        <Text style={styles.inputLabel}>PHONE NUMBER</Text>
        <PhoneInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
        />
        <Text style={styles.inputHint}>
          🔒 Your number is only shared with your emergency contacts
        </Text>
      </View>
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[styles.primaryButton, !phone.trim() && styles.buttonDisabled]}
          onPress={goNext}
          disabled={!phone.trim()}
        >
          <Text
            style={[
              styles.primaryButtonText,
              !phone.trim() && styles.buttonTextDisabled,
            ]}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  // ─── Page 4: Add Emergency Contact ────────────────────────

  const renderAddContact = () => (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollPage}
        contentContainerStyle={styles.scrollPageContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topSection}>
          <Text style={styles.pageTitle}>Add an emergency contact</Text>
          <Text style={styles.subtitle}>
            This person will be notified if something seems wrong
          </Text>
        </View>

        <View style={styles.formSectionScroll}>
          {/* Contact Name */}
          <Text style={styles.inputLabel}>CONTACT NAME</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Mom, Dad, Partner"
            placeholderTextColor="#555570"
            value={contactName}
            onChangeText={setContactName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          {/* Contact Phone with Country Code */}
          <Text style={[styles.inputLabel, { marginTop: 20 }]}>CONTACT PHONE</Text>
          <PhoneInput
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder="Their phone number"
          />

          {/* Relationship Picker */}
          <Text style={[styles.inputLabel, { marginTop: 20 }]}>RELATIONSHIP</Text>
          <View style={styles.relationshipGrid}>
            {RELATIONSHIPS.map((rel) => (
              <TouchableOpacity
                key={rel.label}
                style={[
                  styles.relationshipChip,
                  relationship === rel.label && styles.relationshipChipSelected,
                ]}
                onPress={() => setRelationship(rel.label)}
                activeOpacity={0.7}
              >
                <Text style={styles.relationshipEmoji}>{rel.emoji}</Text>
                <Text
                  style={[
                    styles.relationshipLabel,
                    relationship === rel.label && styles.relationshipLabelSelected,
                  ]}
                >
                  {rel.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomAction}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !(contactName.trim() && contactPhone.trim() && relationship) &&
                styles.buttonDisabled,
            ]}
            onPress={handleAddContact}
            disabled={
              !(contactName.trim() && contactPhone.trim() && relationship)
            }
          >
            <Text
              style={[
                styles.primaryButtonText,
                !(contactName.trim() && contactPhone.trim() && relationship) &&
                  styles.buttonTextDisabled,
              ]}
            >
              Add Contact
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkipContact}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ─── Page 5: All Set ──────────────────────────────────────

  const renderAllSet = () => (
    <View style={styles.page}>
      <View style={styles.centerContent}>
        <View style={styles.successCircle}>
          <Text style={styles.successCheck}>✓</Text>
        </View>
        <Text style={styles.allSetTitle}>
          You're all set, {name.trim() || 'friend'}!
        </Text>
        <Text style={styles.allSetBody}>
          Your safety net is ready. Check in daily to let your people know
          you're alive.
        </Text>

        {/* Quick preview of what's next */}
        <View style={styles.nextStepsContainer}>
          {[
            { emoji: '💚', text: 'Tap to check in daily' },
            { emoji: '👥', text: 'Create your safety circle' },
            { emoji: '📍', text: 'Share your location anytime' },
          ].map((step, i) => (
            <View key={i} style={styles.nextStepRow}>
              <Text style={styles.nextStepEmoji}>{step.emoji}</Text>
              <Text style={styles.nextStepText}>{step.text}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
          <Text style={styles.primaryButtonText}>Enter Dead.Alive</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Page data for FlatList ────────────────────────────────

  const pages = [0, 1, 2, 3, 4, 5];

  const renderPage = useCallback(
    ({ item }: ListRenderItemInfo<number>) => {
      switch (item) {
        case 0:
          return renderWelcome();
        case 1:
          return renderHowItWorks();
        case 2:
          return renderNameInput();
        case 3:
          return renderPhoneInput();
        case 4:
          return renderAddContact();
        case 5:
          return renderAllSet();
        default:
          return null;
      }
    },
    [
      name,
      phone,
      contactName,
      contactPhone,
      relationship,
      currentPage,
    ],
  );

  const keyExtractor = useCallback((_: number, index: number) => `page-${index}`, []);

  // ─── Progress dots ─────────────────────────────────────────

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {pages.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentPage && styles.dotActive,
            index < currentPage && styles.dotCompleted,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={renderPage}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
      {renderDots()}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },

  // Page layout
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  scrollPage: {
    flex: 1,
  },
  scrollPageContent: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
    flexGrow: 1,
  },

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  topSection: {
    marginTop: 24,
  },

  formSection: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  formSectionScroll: {
    marginTop: 24,
    flex: 1,
  },

  bottomAction: {
    paddingBottom: 16,
  },

  // Welcome page
  heroEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },

  appName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 12,
  },

  tagline: {
    fontSize: 17,
    color: '#9999B0',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 24,
  },

  featurePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
  },
  featurePill: {
    backgroundColor: '#141420',
    borderWidth: 1,
    borderColor: '#2A2A40',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  featurePillText: {
    fontSize: 13,
    color: '#9999B0',
    fontWeight: '500',
  },

  // Titles & subtitles
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 16,
    color: '#9999B0',
    lineHeight: 22,
  },

  // Input labels
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555570',
    letterSpacing: 1,
    marginBottom: 10,
  },
  inputHint: {
    fontSize: 13,
    color: '#555570',
    marginTop: 12,
  },

  // How it works steps
  stepsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141420',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
  },

  stepEmojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 255, 136, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  stepEmoji: {
    fontSize: 24,
  },

  stepContent: {
    flex: 1,
  },

  stepTitle: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 2,
  },

  stepDesc: {
    fontSize: 14,
    color: '#9999B0',
    lineHeight: 20,
  },

  // Text input
  textInput: {
    backgroundColor: '#141420',
    borderWidth: 1,
    borderColor: '#2A2A40',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 17,
    color: '#FFFFFF',
  },

  // Relationship grid
  relationshipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  relationshipChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141420',
    borderWidth: 1,
    borderColor: '#2A2A40',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    minWidth: '30%',
  },
  relationshipChipSelected: {
    borderColor: '#00FF88',
    backgroundColor: 'rgba(0, 255, 136, 0.08)',
  },
  relationshipEmoji: {
    fontSize: 18,
  },
  relationshipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9999B0',
  },
  relationshipLabelSelected: {
    color: '#00FF88',
  },

  // Primary button
  primaryButton: {
    backgroundColor: '#00FF88',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0A0A0F',
  },

  buttonDisabled: {
    backgroundColor: '#2A2A40',
  },

  buttonTextDisabled: {
    color: '#555570',
  },

  // Skip button
  skipButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },

  skipButtonText: {
    fontSize: 15,
    color: '#9999B0',
    fontWeight: '500',
  },

  // All set page
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00FF88',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successCheck: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0A0A0F',
  },
  allSetTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  allSetBody: {
    fontSize: 16,
    color: '#9999B0',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 32,
  },

  // Next steps preview
  nextStepsContainer: {
    width: '100%',
    gap: 12,
  },
  nextStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141420',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
  },
  nextStepEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  nextStepText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // Progress dots
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
    gap: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2A2A40',
  },

  dotActive: {
    backgroundColor: '#00FF88',
    width: 24,
  },

  dotCompleted: {
    backgroundColor: 'rgba(0, 255, 136, 0.4)',
  },
});
