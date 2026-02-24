// Dead.Alive — App Navigation

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { useStore } from '../stores/useStore';

// Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import CirclesScreen from '../screens/CirclesScreen';
import CircleDetailScreen from '../screens/CircleDetailScreen';
import SOSScreen from '../screens/SOSScreen';
import FakeCallScreen from '../screens/FakeCallScreen';
import SafetyScoreScreen from '../screens/SafetyScoreScreen';
import ShareLocationScreen from '../screens/ShareLocationScreen';
import AlertHistoryScreen from '../screens/AlertHistoryScreen';
import DeadMansSwitchScreen from '../screens/DeadMansSwitchScreen';
import NightWatchScreen from '../screens/NightWatchScreen';
import WalkMeHomeScreen from '../screens/WalkMeHomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PremiumScreen from '../screens/PremiumScreen';
import TrustedContactsScreen from '../screens/TrustedContactsScreen';
import MoodTrackerScreen from '../screens/MoodTrackerScreen';
import EmergencyInfoScreen from '../screens/EmergencyInfoScreen';
import CheckInStatsScreen from '../screens/CheckInStatsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
    <Text style={styles.tabEmoji}>{emoji}</Text>
  </View>
);

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#00FF88',
        tabBarInactiveTintColor: '#555570',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💚" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Circles"
        component={CirclesScreen}
        options={{
          tabBarLabel: 'Circles',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👥" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="SOS"
        component={SOSScreen}
        options={{
          tabBarLabel: 'SOS',
          tabBarIcon: ({ focused }) => (
            <View style={styles.sosTabIcon}>
              <Text style={styles.sosTabEmoji}>🚨</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Activity"
        component={AlertHistoryScreen}
        options={{
          tabBarLabel: 'Activity',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const isOnboarded = useStore((s) => s.isOnboarded);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0A0F' },
          animation: 'slide_from_right',
        }}
      >
        {!isOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={HomeTabs} />
            <Stack.Screen name="CircleDetail" component={CircleDetailScreen} />
            <Stack.Screen
              name="FakeCall"
              component={FakeCallScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="SafetyScore" component={SafetyScoreScreen} />
            <Stack.Screen
              name="ShareLocation"
              component={ShareLocationScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="DeadMansSwitch" component={DeadMansSwitchScreen} />
            <Stack.Screen name="NightWatch" component={NightWatchScreen} />
            <Stack.Screen name="WalkMeHome" component={WalkMeHomeScreen} />
            <Stack.Screen
              name="Premium"
              component={PremiumScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="TrustedContacts" component={TrustedContactsScreen} />
            <Stack.Screen name="MoodTracker" component={MoodTrackerScreen} />
            <Stack.Screen name="EmergencyInfo" component={EmergencyInfoScreen} />
            <Stack.Screen name="CheckInStats" component={CheckInStatsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0A0A0F',
    borderTopColor: '#2A2A40',
    borderTopWidth: 1,
    height: 88,
    paddingTop: 8,
    paddingBottom: 28,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  tabIconActive: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  tabEmoji: {
    fontSize: 20,
  },
  sosTabIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 0, 64, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -8,
    borderWidth: 2,
    borderColor: '#FF0040',
  },
  sosTabEmoji: {
    fontSize: 24,
  },
});
