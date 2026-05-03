import * as stylex from '@stylexjs/stylex';

export const color = stylex.defineVars({
  // Text
  textPrimary: '#111827',
  textSecondary: '#374151',
  textMuted: '#4b5563',
  textFaint: '#6b7280',
  textOnColor: '#ffffff',
  textAccent: '#2563eb',
  textAccentHover: '#1e40af',
  textDanger: '#dc2626',
  textDangerHover: '#991b1b',
  textSuccess: '#16a34a',
  textSuccessHover: '#166534',
  textWarning: '#d97706',

  // Background
  bgPrimary: '#ffffff',
  bgSecondary: '#f9fafb',
  bgMuted: '#f3f4f6',
  bgOverlay: 'rgba(0, 0, 0, 0.5)',

  // Border
  borderDefault: '#d1d5db',
  borderLight: '#e5e7eb',
  borderHover: '#9ca3af',

  // Button - Primary
  buttonPrimaryColor: '#ffffff',
  buttonPrimaryBg: '#2563eb',
  buttonPrimaryBgHover: '#1d4ed8',
  buttonPrimaryOutline: '#3b82f6',

  // Button - Secondary
  buttonSecondaryColor: '#374151',
  buttonSecondaryBg: '#ffffff',
  buttonSecondaryBgHover: '#f9fafb',
  buttonSecondaryBorder: '#d1d5db',
  buttonSecondaryOutline: '#3b82f6',

  // Button - Danger
  buttonDangerColor: '#ffffff',
  buttonDangerBg: '#dc2626',
  buttonDangerBgHover: '#b91c1c',
  buttonDangerOutline: '#ef4444',

  // Accent
  accentBg: '#eff6ff',
  accentBorder: '#3b82f6',
  accentBadgeBg: '#dbeafe',
  accentBadgeText: '#1e40af',

  // Success
  successBg: '#f0fdf4',
  successText: '#166534',

  // Danger
  dangerBg: '#fef2f2',

  // Progress
  progressTrack: '#e5e7eb',
  progressSuccess: '#22c55e',
  progressDanger: '#ef4444',
});
