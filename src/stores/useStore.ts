// Dead.Alive — Global State Store (Zustand)

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  User,
  EmergencyContact,
  CheckIn,
  SafetyCircle,
  CircleMember,
  Alert,
  FakeCallConfig,
  DeadMansSwitch,
  NightWatch,
  SafetyScore,
  AppSettings,
  UserStatus,
} from '../types';
import {
  generateId,
  generateShareCode,
  calculateSafetyScore,
  calculateStreak,
} from '../utils/helpers';

interface AppState {
  // Auth & User
  isOnboarded: boolean;
  user: User | null;

  // Check-in
  checkIns: CheckIn[];
  lastCheckIn: number | null;
  streak: number;

  // Contacts
  emergencyContacts: EmergencyContact[];

  // Safety Circles
  circles: SafetyCircle[];

  // Alerts
  alerts: Alert[];

  // Features
  fakeCallConfig: FakeCallConfig;
  deadMansSwitch: DeadMansSwitch;
  nightWatch: NightWatch;
  safetyScore: SafetyScore;

  // Settings
  settings: AppSettings;
  isPremium: boolean;

  // Actions — Auth
  completeOnboarding: (name: string, phone: string) => void;
  updateUser: (updates: Partial<User>) => void;

  // Actions — Check-in
  performCheckIn: () => void;

  // Actions — Contacts
  addContact: (contact: Omit<EmergencyContact, 'id' | 'addedAt'>) => void;
  removeContact: (id: string) => void;
  updateContact: (id: string, updates: Partial<EmergencyContact>) => void;

  // Actions — Circles
  createCircle: (name: string, emoji: string) => SafetyCircle;
  joinCircle: (shareCode: string) => boolean;
  leaveCircle: (circleId: string) => void;
  addMemberToCircle: (circleId: string, member: Omit<CircleMember, 'joinedAt' | 'role'>) => void;
  removeMemberFromCircle: (circleId: string, memberId: string) => void;
  updateMemberStatus: (circleId: string, memberId: string, status: UserStatus) => void;

  // Actions — Alerts
  triggerSOS: (message?: string) => Alert;
  triggerMissedCheckInAlert: () => Alert;
  resolveAlert: (alertId: string) => void;
  clearAlertHistory: () => void;

  // Actions — Features
  updateFakeCallConfig: (config: Partial<FakeCallConfig>) => void;
  updateDeadMansSwitch: (config: Partial<DeadMansSwitch>) => void;
  updateNightWatch: (config: Partial<NightWatch>) => void;
  recalculateSafetyScore: () => void;

  // Actions — Settings
  updateSettings: (settings: Partial<AppSettings>) => void;
  setPremium: (isPremium: boolean) => void;

  // Actions — Reset
  resetApp: () => void;
}

const defaultFakeCallConfig: FakeCallConfig = {
  id: 'default',
  callerName: 'Mom',
  callerNumber: '+1 (555) 123-4567',
  ringtone: 'default',
  delaySeconds: 10,
  callDurationSeconds: 30,
};

const defaultDeadMansSwitch: DeadMansSwitch = {
  enabled: false,
  intervalHours: 24,
  lastActivity: Date.now(),
  alertMessage: "I haven't responded in a while. Please check on me.",
  isArmed: false,
};

const defaultNightWatch: NightWatch = {
  enabled: false,
  expectedReturnTime: 0,
  alertMessage: "I haven't checked in after going out. Please check on me.",
  isActive: false,
};

const defaultSafetyScore: SafetyScore = {
  total: 0,
  streakScore: 0,
  contactsScore: 0,
  circleScore: 0,
  checkinScore: 0,
  featuresScore: 0,
  lastCalculated: 0,
};

const defaultSettings: AppSettings = {
  notifications: true,
  location: true,
  haptics: true,
  darkMode: true,
  stealthMode: false,
  checkInReminderHour: 20, // 8 PM
  missedCheckInThresholdDays: 2,
  autoShareLocation: false,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isOnboarded: false,
      user: null,
      checkIns: [],
      lastCheckIn: null,
      streak: 0,
      emergencyContacts: [],
      circles: [],
      alerts: [],
      fakeCallConfig: defaultFakeCallConfig,
      deadMansSwitch: defaultDeadMansSwitch,
      nightWatch: defaultNightWatch,
      safetyScore: defaultSafetyScore,
      settings: defaultSettings,
      isPremium: false,

      // Auth
      completeOnboarding: (name, phone) => {
        const user: User = {
          id: generateId(),
          name,
          phone,
          createdAt: Date.now(),
          isPremium: false,
        };
        set({ isOnboarded: true, user });
      },

      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      // Check-in
      performCheckIn: () => {
        const checkIn: CheckIn = {
          id: generateId(),
          timestamp: Date.now(),
          type: 'manual',
        };
        const newCheckIns = [checkIn, ...get().checkIns];
        const streak = calculateStreak(newCheckIns);
        set({
          checkIns: newCheckIns,
          lastCheckIn: checkIn.timestamp,
          streak,
        });
        // Recalculate safety score
        get().recalculateSafetyScore();
      },

      // Contacts
      addContact: (contact) => {
        const newContact: EmergencyContact = {
          ...contact,
          id: generateId(),
          addedAt: Date.now(),
        };
        set({ emergencyContacts: [...get().emergencyContacts, newContact] });
        get().recalculateSafetyScore();
      },

      removeContact: (id) => {
        set({
          emergencyContacts: get().emergencyContacts.filter((c) => c.id !== id),
        });
        get().recalculateSafetyScore();
      },

      updateContact: (id, updates) => {
        set({
          emergencyContacts: get().emergencyContacts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        });
      },

      // Circles
      createCircle: (name, emoji) => {
        const circle: SafetyCircle = {
          id: generateId(),
          name,
          emoji,
          shareCode: generateShareCode(),
          createdBy: get().user?.id || '',
          members: [
            {
              id: get().user?.id || '',
              name: get().user?.name || '',
              phone: get().user?.phone || '',
              status: 'alive',
              lastCheckIn: get().lastCheckIn || undefined,
              joinedAt: Date.now(),
              role: 'admin',
            },
          ],
          createdAt: Date.now(),
        };
        set({ circles: [...get().circles, circle] });
        get().recalculateSafetyScore();
        return circle;
      },

      joinCircle: (shareCode) => {
        const { circles, user } = get();
        const circle = circles.find(
          (c) => c.shareCode.toUpperCase() === shareCode.toUpperCase()
        );
        if (!circle || !user) return false;

        const alreadyMember = circle.members.some((m) => m.id === user.id);
        if (alreadyMember) return false;

        const newMember: CircleMember = {
          id: user.id,
          name: user.name,
          phone: user.phone,
          status: 'alive',
          lastCheckIn: get().lastCheckIn || undefined,
          joinedAt: Date.now(),
          role: 'member',
        };

        set({
          circles: circles.map((c) =>
            c.id === circle.id
              ? { ...c, members: [...c.members, newMember] }
              : c
          ),
        });
        get().recalculateSafetyScore();
        return true;
      },

      leaveCircle: (circleId) => {
        const { circles, user } = get();
        set({
          circles: circles
            .map((c) =>
              c.id === circleId
                ? { ...c, members: c.members.filter((m) => m.id !== user?.id) }
                : c
            )
            .filter((c) => c.members.length > 0),
        });
        get().recalculateSafetyScore();
      },

      addMemberToCircle: (circleId, member) => {
        set({
          circles: get().circles.map((c) =>
            c.id === circleId
              ? {
                  ...c,
                  members: [
                    ...c.members,
                    { ...member, joinedAt: Date.now(), role: 'member' as const },
                  ],
                }
              : c
          ),
        });
      },

      removeMemberFromCircle: (circleId, memberId) => {
        set({
          circles: get().circles.map((c) =>
            c.id === circleId
              ? { ...c, members: c.members.filter((m) => m.id !== memberId) }
              : c
          ),
        });
      },

      updateMemberStatus: (circleId, memberId, status) => {
        set({
          circles: get().circles.map((c) =>
            c.id === circleId
              ? {
                  ...c,
                  members: c.members.map((m) =>
                    m.id === memberId ? { ...m, status } : m
                  ),
                }
              : c
          ),
        });
      },

      // Alerts
      triggerSOS: (message) => {
        const alert: Alert = {
          id: generateId(),
          type: 'sos',
          timestamp: Date.now(),
          message: message || '🚨 SOS ALERT! I need help immediately!',
          recipients: get().emergencyContacts.map((c) => c.phone),
          status: 'sent',
        };
        set({ alerts: [alert, ...get().alerts] });
        return alert;
      },

      triggerMissedCheckInAlert: () => {
        const alert: Alert = {
          id: generateId(),
          type: 'missed_checkin',
          timestamp: Date.now(),
          message: `${get().user?.name || 'User'} hasn't checked in for ${get().settings.missedCheckInThresholdDays} days. Please check on them.`,
          recipients: get().emergencyContacts.map((c) => c.phone),
          status: 'sent',
        };
        set({ alerts: [alert, ...get().alerts] });
        return alert;
      },

      resolveAlert: (alertId) => {
        set({
          alerts: get().alerts.map((a) =>
            a.id === alertId
              ? { ...a, status: 'resolved' as const, resolvedAt: Date.now() }
              : a
          ),
        });
      },

      clearAlertHistory: () => set({ alerts: [] }),

      // Features
      updateFakeCallConfig: (config) => {
        set({ fakeCallConfig: { ...get().fakeCallConfig, ...config } });
      },

      updateDeadMansSwitch: (config) => {
        set({ deadMansSwitch: { ...get().deadMansSwitch, ...config } });
      },

      updateNightWatch: (config) => {
        set({ nightWatch: { ...get().nightWatch, ...config } });
      },

      recalculateSafetyScore: () => {
        const state = get();
        const score = calculateSafetyScore({
          streak: state.streak,
          contactCount: state.emergencyContacts.length,
          circleCount: state.circles.length,
          totalCheckIns: state.checkIns.length,
          hasLocation: state.settings.location,
          hasNotifications: state.settings.notifications,
          isPremium: state.isPremium,
        });
        set({ safetyScore: score });
      },

      // Settings
      updateSettings: (newSettings) => {
        set({ settings: { ...get().settings, ...newSettings } });
      },

      setPremium: (isPremium) => {
        set({ isPremium });
        if (get().user) {
          set({ user: { ...get().user!, isPremium } });
        }
      },

      // Reset
      resetApp: () => {
        set({
          isOnboarded: false,
          user: null,
          checkIns: [],
          lastCheckIn: null,
          streak: 0,
          emergencyContacts: [],
          circles: [],
          alerts: [],
          fakeCallConfig: defaultFakeCallConfig,
          deadMansSwitch: defaultDeadMansSwitch,
          nightWatch: defaultNightWatch,
          safetyScore: defaultSafetyScore,
          settings: defaultSettings,
          isPremium: false,
        });
      },
    }),
    {
      name: 'dead-alive-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
