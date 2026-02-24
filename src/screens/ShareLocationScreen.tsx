import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import { useStore } from '../stores/useStore';

interface ShareLocationScreenProps {
  navigation: any;
}

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export default function ShareLocationScreen({ navigation }: ShareLocationScreenProps) {
  const { settings, updateSettings } = useStore();

  const [location, setLocation] = useState<LocationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const fetchLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }
      setPermissionDenied(false);

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
        timestamp: loc.timestamp,
      });
    } catch (error) {
      setPermissionDenied(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const formatCoordinate = (value: number, decimals = 6): string => {
    return value.toFixed(decimals);
  };

  const formatLastUpdated = (ts: number): string => {
    const date = new Date(ts);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const handleShareMessages = () => {
    if (!location) return;
    Alert.alert(
      'Share Location',
      `Your location (${formatCoordinate(location.latitude)}, ${formatCoordinate(location.longitude)}) would be shared via Messages.`,
    );
  };

  const handleShareCircle = () => {
    if (!location) return;
    Alert.alert(
      'Share with Circle',
      'Your location would be shared with all your safety circles.',
    );
  };

  const handleCopyCoordinates = async () => {
    if (!location) return;
    const coords = `${formatCoordinate(location.latitude)}, ${formatCoordinate(location.longitude)}`;
    await Clipboard.setStringAsync(coords);
    Alert.alert('Copied', 'Coordinates copied to clipboard.');
  };

  const handleAutoShareToggle = (value: boolean) => {
    updateSettings({ autoShareLocation: value });
  };

  return (
    <View style={styles.outerContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Share Location</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.closeX}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >

      {/* Map Placeholder */}
      <View style={styles.mapCard}>
        {loading ? (
          <ActivityIndicator size="large" color="#00FF88" />
        ) : permissionDenied ? (
          <>
            <Text style={styles.mapEmoji}>{'\uD83D\uDCCD'}</Text>
            <Text style={styles.mapLabel}>Location not available</Text>
            <Text style={styles.mapSubLabel}>
              Permission denied. Enable location in Settings.
            </Text>
          </>
        ) : location ? (
          <>
            <Text style={styles.mapEmoji}>{'\uD83D\uDCCD'}</Text>
            <Text style={styles.mapLabel}>Your current location</Text>
            <Text style={styles.coordsText}>
              {formatCoordinate(location.latitude)}, {formatCoordinate(location.longitude)}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.mapEmoji}>{'\uD83D\uDCCD'}</Text>
            <Text style={styles.mapLabel}>Location not available</Text>
          </>
        )}
      </View>

      {/* Location Info Card */}
      {location && !loading && (
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Accuracy</Text>
            <Text style={styles.infoValue}>
              {location.accuracy ? `${Math.round(location.accuracy)}m` : 'Unknown'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last updated</Text>
            <Text style={styles.infoValue}>
              {formatLastUpdated(location.timestamp)}
            </Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchLocation}
            activeOpacity={0.7}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Share Options */}
      <View style={styles.shareSection}>
        <TouchableOpacity
          style={[styles.shareButton, styles.shareButtonPrimary]}
          onPress={handleShareMessages}
          disabled={!location || loading}
          activeOpacity={0.7}
        >
          <Text style={styles.shareButtonPrimaryText}>Share via Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shareButton, styles.shareButtonOutline]}
          onPress={handleShareCircle}
          disabled={!location || loading}
          activeOpacity={0.7}
        >
          <Text style={styles.shareButtonOutlineText}>Share with Circle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shareButton, styles.shareButtonOutline]}
          onPress={handleCopyCoordinates}
          disabled={!location || loading}
          activeOpacity={0.7}
        >
          <Text style={styles.shareButtonOutlineText}>Copy Coordinates</Text>
        </TouchableOpacity>
      </View>

      {/* Auto-share toggle */}
      <View style={styles.toggleCard}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextContainer}>
            <Text style={styles.toggleLabel}>
              Auto-share location with SOS alerts
            </Text>
            <Text style={styles.toggleDescription}>
              Automatically include your location when sending SOS alerts to
              emergency contacts.
            </Text>
          </View>
          <Switch
            value={settings.autoShareLocation}
            onValueChange={handleAutoShareToggle}
            trackColor={{ false: '#2A2A40', true: 'rgba(0, 255, 136, 0.3)' }}
            thumbColor={settings.autoShareLocation ? '#00FF88' : '#555570'}
          />
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#141420',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A40',
  },
  closeX: {
    fontSize: 16,
    color: '#9999B0',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Map placeholder
  mapCard: {
    height: 250,
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mapEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  mapLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  mapSubLabel: {
    fontSize: 14,
    color: '#9999B0',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  coordsText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#9999B0',
    marginTop: 4,
  },

  // Info card
  infoCard: {
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 15,
    color: '#9999B0',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A40',
    marginVertical: 4,
  },
  refreshButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2A2A40',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9999B0',
  },

  // Share buttons
  shareSection: {
    gap: 12,
    marginBottom: 24,
  },
  shareButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonPrimary: {
    backgroundColor: '#00FF88',
  },
  shareButtonPrimaryText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  shareButtonOutline: {
    borderWidth: 1,
    borderColor: '#2A2A40',
    backgroundColor: 'transparent',
  },
  shareButtonOutlineText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Toggle
  toggleCard: {
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A40',
    padding: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 13,
    color: '#555570',
    lineHeight: 18,
  },
});
