// Dead.Alive — Utility Helpers

import * as Crypto from 'expo-crypto';
import type { SafetyScore, UserStatus } from '../types';

export const generateId = (): string => Crypto.randomUUID();

export const generateShareCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export const formatTimestamp = (ts: number): string => {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (ts: number): string => {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDate = (ts: number): string => {
  return new Date(ts).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const getStatusColor = (status: UserStatus): string => {
  switch (status) {
    case 'alive': return '#00FF88';
    case 'dead': return '#FF3B5C';
    case 'sos': return '#FF0040';
    case 'unknown': return '#666680';
  }
};

export const getStatusLabel = (status: UserStatus): string => {
  switch (status) {
    case 'alive': return 'Alive';
    case 'dead': return 'No Response';
    case 'sos': return 'SOS';
    case 'unknown': return 'Unknown';
  }
};

export const getStatusEmoji = (status: UserStatus): string => {
  switch (status) {
    case 'alive': return '💚';
    case 'dead': return '💀';
    case 'sos': return '🚨';
    case 'unknown': return '❓';
  }
};

export const calculateStreak = (checkIns: { timestamp: number }[]): number => {
  if (checkIns.length === 0) return 0;

  const sorted = [...checkIns].sort((a, b) => b.timestamp - a.timestamp);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dayStart = checkDate.getTime();
    const dayEnd = dayStart + 86400000;
    const hasCheckIn = sorted.some(
      (c) => c.timestamp >= dayStart && c.timestamp < dayEnd
    );

    if (hasCheckIn) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0) {
      // Today might not have a check-in yet, check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    } else {
      break;
    }
  }

  return streak;
};

export const calculateSafetyScore = (params: {
  streak: number;
  contactCount: number;
  circleCount: number;
  totalCheckIns: number;
  hasLocation: boolean;
  hasNotifications: boolean;
  isPremium: boolean;
}): SafetyScore => {
  const {
    streak,
    contactCount,
    circleCount,
    totalCheckIns,
    hasLocation,
    hasNotifications,
    isPremium,
  } = params;

  // Streak score (0-30)
  const streakScore = Math.min(30, streak * 2);

  // Contacts score (0-20)
  const contactsScore = Math.min(20, contactCount * 5);

  // Circle score (0-15)
  const circleScore = Math.min(15, circleCount * 5);

  // Check-in consistency (0-20)
  const checkinScore = Math.min(20, Math.floor(totalCheckIns / 5) * 2);

  // Features enabled (0-15)
  let featuresScore = 0;
  if (hasLocation) featuresScore += 5;
  if (hasNotifications) featuresScore += 5;
  if (isPremium) featuresScore += 5;

  const total = Math.min(
    100,
    streakScore + contactsScore + circleScore + checkinScore + featuresScore
  );

  return {
    total,
    streakScore,
    contactsScore,
    circleScore,
    checkinScore,
    featuresScore,
    lastCalculated: Date.now(),
  };
};

export const getScoreGrade = (score: number): { label: string; color: string } => {
  if (score >= 90) return { label: 'Excellent', color: '#00FF88' };
  if (score >= 70) return { label: 'Good', color: '#88FF00' };
  if (score >= 50) return { label: 'Fair', color: '#FFB800' };
  if (score >= 30) return { label: 'Needs Work', color: '#FF8800' };
  return { label: 'At Risk', color: '#FF3B5C' };
};

export const daysSinceLastCheckIn = (lastCheckIn?: number): number => {
  if (!lastCheckIn) return 999;
  const diffMs = Date.now() - lastCheckIn;
  return Math.floor(diffMs / 86400000);
};

export const isUserDead = (lastCheckIn?: number, thresholdDays = 2): boolean => {
  return daysSinceLastCheckIn(lastCheckIn) >= thresholdDays;
};

export const maskPhone = (phone: string): string => {
  if (phone.length < 4) return phone;
  return '•••• ' + phone.slice(-4);
};
