// Dead.Alive — Phone Input with Country Code Picker
// Searchable country selector with flags and dial codes

import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  COUNTRIES,
  POPULAR_COUNTRY_CODES,
  getDefaultCountry,
  searchCountries,
  type Country,
} from '../utils/countries';

interface PhoneInputProps {
  value: string;
  onChangeText: (fullNumber: string) => void;
  placeholder?: string;
  defaultCountryCode?: string;
}

export default function PhoneInput({
  value,
  onChangeText,
  placeholder = 'Phone number',
  defaultCountryCode = 'US',
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find((c) => c.code === defaultCountryCode) || getDefaultCountry()
  );
  const [pickerVisible, setPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);

  // Strip the dial code from the stored value to show just the local number
  const localNumber = useMemo(() => {
    if (value.startsWith(selectedCountry.dial)) {
      return value.slice(selectedCountry.dial.length).trim();
    }
    // If value doesn't start with a dial code, show it as-is
    if (value.startsWith('+')) {
      // Has a different country code — find and extract
      const match = COUNTRIES.find((c) => value.startsWith(c.dial));
      if (match) {
        return value.slice(match.dial.length).trim();
      }
    }
    return value;
  }, [value, selectedCountry]);

  const handleNumberChange = (text: string) => {
    // Strip non-numeric characters except spaces and dashes for display
    const cleaned = text.replace(/[^0-9\s\-()]/g, '');
    onChangeText(`${selectedCountry.dial} ${cleaned}`);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setPickerVisible(false);
    setSearchQuery('');
    // Update the full number with new dial code
    onChangeText(`${country.dial} ${localNumber}`);
  };

  // Filtered & sorted countries
  const filteredCountries = useMemo(() => {
    const results = searchCountries(searchQuery);
    if (searchQuery) return results;

    // When not searching, show popular countries first
    const popular = POPULAR_COUNTRY_CODES
      .map((code) => COUNTRIES.find((c) => c.code === code)!)
      .filter(Boolean);
    const rest = results.filter((c) => !POPULAR_COUNTRY_CODES.includes(c.code));
    return [...popular, ...rest];
  }, [searchQuery]);

  const renderCountryItem = ({ item }: { item: Country }) => {
    const isSelected = item.code === selectedCountry.code;
    return (
      <TouchableOpacity
        style={[styles.countryRow, isSelected && styles.countryRowSelected]}
        onPress={() => handleCountrySelect(item)}
        activeOpacity={0.6}
      >
        <Text style={styles.countryFlag}>{item.flag}</Text>
        <View style={styles.countryInfo}>
          <Text style={[styles.countryName, isSelected && styles.countryNameSelected]}>
            {item.name}
          </Text>
          <Text style={styles.countryDial}>{item.dial}</Text>
        </View>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <View style={styles.container}>
      {/* Country code button + phone input */}
      <View style={styles.inputRow}>
        <TouchableOpacity
          style={styles.countryButton}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.countryButtonFlag}>{selectedCountry.flag}</Text>
          <Text style={styles.countryButtonDial}>{selectedCountry.dial}</Text>
          <Text style={styles.countryButtonChevron}>▼</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.phoneInput}
          value={localNumber}
          onChangeText={handleNumberChange}
          placeholder={placeholder}
          placeholderTextColor="#555570"
          keyboardType="phone-pad"
          returnKeyType="done"
        />
      </View>

      {/* Country Picker Modal */}
      <Modal
        visible={pickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setPickerVisible(false);
          setSearchQuery('');
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity
                onPress={() => {
                  setPickerVisible(false);
                  setSearchQuery('');
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search country or dial code..."
                placeholderTextColor="#555570"
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.clearSearch}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Popular label */}
            {!searchQuery && (
              <Text style={styles.sectionLabel}>POPULAR</Text>
            )}

            {/* Country List */}
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={renderCountryItem}
              ItemSeparatorComponent={renderSeparator}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              style={styles.countryList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No countries found</Text>
                </View>
              }
              // Show "ALL COUNTRIES" label after popular section
              stickyHeaderIndices={!searchQuery ? [0] : undefined}
              ListHeaderComponent={
                !searchQuery ? (
                  <View />
                ) : null
              }
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},

  // Input Row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141420',
    borderWidth: 1,
    borderColor: '#2A2A40',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 6,
    minWidth: 110,
  },
  countryButtonFlag: {
    fontSize: 20,
  },
  countryButtonDial: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  countryButtonChevron: {
    fontSize: 10,
    color: '#555570',
    marginLeft: 2,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#141420',
    borderWidth: 1,
    borderColor: '#2A2A40',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 17,
    color: '#FFFFFF',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0A0A0F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: 18,
    color: '#555570',
    padding: 4,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141420',
    borderWidth: 1,
    borderColor: '#2A2A40',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  clearSearch: {
    fontSize: 14,
    color: '#555570',
    padding: 4,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555570',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 4,
  },

  // Country List
  countryList: {
    paddingHorizontal: 20,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  countryRowSelected: {
    backgroundColor: 'rgba(0, 255, 136, 0.08)',
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
    textAlign: 'center',
  },
  countryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryName: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  countryNameSelected: {
    color: '#00FF88',
  },
  countryDial: {
    fontSize: 14,
    color: '#9999B0',
    marginLeft: 8,
    fontVariant: ['tabular-nums'],
  },
  checkmark: {
    fontSize: 16,
    color: '#00FF88',
    fontWeight: '700',
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#1C1C2E',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#555570',
  },
});
