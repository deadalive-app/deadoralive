// Dead.Alive - Type Definitions

export type UserStatus = 'alive' | 'dead' | 'unknown' | 'sos';

export interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  createdAt: number;
  isPremium: boolean;
  premiumExpiresAt?: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isICE: boolean; // In Case of Emergency
  addedAt: number;
}

export interface CheckIn {
  id: string;
  timestamp: number;
  type: 'manual' | 'auto' | 'heartbeat';
  location?: LocationData;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  address?: string;
}

export interface SafetyCircle {
  id: string;
  name: string;
  emoji: string;
  shareCode: string;
  createdBy: string;
  members: CircleMember[];
  createdAt: number;
}

export interface CircleMember {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  status: UserStatus;
  lastCheckIn?: number;
  joinedAt: number;
  role: 'admin' | 'member';
}

export interface Alert {
  id: string;
  type: AlertType;
  timestamp: number;
  message: string;
  location?: LocationData;
  recipients: string[];
  status: 'sent' | 'acknowledged' | 'resolved' | 'expired';
  resolvedAt?: number;
}

export type AlertType =
  | 'sos'
  | 'missed_checkin'
  | 'dead_mans_switch'
  | 'night_watch'
  | 'circle_alert'
  | 'timer_expired';

export interface FakeCallConfig {
  id: string;
  callerName: string;
  callerNumber: string;
  ringtone: string;
  delaySeconds: number;
  callDurationSeconds: number;
  scheduledAt?: number;
}

export interface DeadMansSwitch {
  enabled: boolean;
  intervalHours: number;
  lastActivity: number;
  alertMessage: string;
  isArmed: boolean;
}

export interface NightWatch {
  enabled: boolean;
  expectedReturnTime: number;
  alertMessage: string;
  isActive: boolean;
  startedAt?: number;
}

export interface SafetyScore {
  total: number; // 0-100
  streakScore: number;
  contactsScore: number;
  circleScore: number;
  checkinScore: number;
  featuresScore: number;
  lastCalculated: number;
}

export interface PremiumFeatures {
  deadMansSwitch: boolean;
  nightWatch: boolean;
  heartbeatPulse: boolean;
  customAlertMessages: boolean;
  unlimitedCircles: boolean;
  stealthMode: boolean;
  advancedSafetyScore: boolean;
}

export type OnboardingStep =
  | 'welcome'
  | 'name'
  | 'phone'
  | 'contacts'
  | 'permissions'
  | 'complete';

export interface AppSettings {
  notifications: boolean;
  location: boolean;
  haptics: boolean;
  darkMode: boolean;
  stealthMode: boolean;
  checkInReminderHour: number;
  missedCheckInThresholdDays: number;
  autoShareLocation: boolean;
}
