export const Colors = {
  // Primary Colors
  primary: '#6366F1', // Indigo
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  // Secondary Colors
  secondary: '#10B981', // Emerald
  secondaryLight: '#34D399',
  secondaryDark: '#059669',
  
  // Accent Colors
  accent: '#F59E0B', // Amber
  accentLight: '#FBBF24',
  accentDark: '#D97706',
  
  // Health Status Colors
  excellent: '#10B981', // Green
  good: '#34D399', // Light Green
  fair: '#F59E0B', // Yellow
  poor: '#F97316', // Orange
  critical: '#EF4444', // Red
  
  // Mood Colors
  happy: '#FBBF24', // Yellow
  content: '#10B981', // Green
  neutral: '#6B7280', // Gray
  sad: '#3B82F6', // Blue
  anxious: '#F59E0B', // Orange
  angry: '#EF4444', // Red
  
  // Sleep Quality Colors
  deepSleep: '#1E40AF', // Blue
  lightSleep: '#3B82F6', // Light Blue
  remSleep: '#8B5CF6', // Purple
  awake: '#F59E0B', // Yellow
  
  // Stress Level Colors
  lowStress: '#10B981', // Green
  moderateStress: '#F59E0B', // Yellow
  highStress: '#F97316', // Orange
  extremeStress: '#EF4444', // Red
  
  // UI Colors
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceVariant: '#F3F4F6',
  border: '#E5E7EB',
  divider: '#D1D5DB',
  
  // Text Colors
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Dark Theme Colors
  dark: {
    background: '#111827',
    surface: '#1F2937',
    surfaceVariant: '#374151',
    border: '#4B5563',
    divider: '#6B7280',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
  },
  
  // Chart Colors
  chart: {
    primary: '#6366F1',
    secondary: '#10B981',
    tertiary: '#F59E0B',
    quaternary: '#EF4444',
    quinary: '#8B5CF6',
    senary: '#06B6D4',
    septenary: '#84CC16',
    octonary: '#F97316',
  }
};

export const getHealthStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'excellent':
      return Colors.excellent;
    case 'good':
      return Colors.good;
    case 'fair':
      return Colors.fair;
    case 'poor':
      return Colors.poor;
    case 'critical':
      return Colors.critical;
    default:
      return Colors.neutral;
  }
};

export const getMoodColor = (mood: number): string => {
  if (mood >= 8) return Colors.happy;
  if (mood >= 6) return Colors.content;
  if (mood >= 4) return Colors.neutral;
  if (mood >= 2) return Colors.sad;
  return Colors.anxious;
};

export const getStressColor = (level: number): string => {
  if (level <= 3) return Colors.lowStress;
  if (level <= 5) return Colors.moderateStress;
  if (level <= 7) return Colors.highStress;
  return Colors.extremeStress;
};

