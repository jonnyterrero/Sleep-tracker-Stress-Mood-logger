// Core Health Data Types
export interface User {
  id: string;
  email: string;
  name: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthEntry {
  id: string;
  userId: string;
  type: HealthEntryType;
  timestamp: Date;
  data: Record<string, any>;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum HealthEntryType {
  SLEEP = 'sleep',
  STRESS = 'stress',
  MOOD = 'mood',
  SYMPTOM = 'symptom',
  MEDICATION = 'medication',
  EXERCISE = 'exercise',
  NUTRITION = 'nutrition',
  VITAL = 'vital',
  PAIN = 'pain',
  ENERGY = 'energy',
  HUNGER = 'hunger',
  THIRST = 'thirst',
  BOWEL = 'bowel',
  SKIN = 'skin',
  MENTAL = 'mental'
}

// Health Entry Schema (matches your Python structure)
export interface HealthEntrySchema {
  date: string; // YYYY-MM-DD format
  sleep: SleepData;
  mood: MoodData;
  symptoms: SymptomData;
}

// Sleep Tracking (matches your schema)
export interface SleepData {
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  duration_hours: number; // calculated from start/end times
  quality_score: number; // 1-10 scale
}

// Mood & Stress Tracking (matches your schema)
export interface MoodData {
  mood_score: number; // 1-10 scale
  stress_score: number; // 1-10 scale
  journal_entry: string;
  voice_note_path?: string; // path to audio file
}

// Symptom Tracking (matches your schema)
export interface SymptomData {
  gi_flare: number; // 0-10 scale (0 = none, 10 = worst)
  skin_flare: number; // 0-10 scale
  migraine: number; // 0-10 scale
}

// Extended types for additional tracking
export interface ExtendedSleepData extends SleepData {
  deepSleep?: number; // in minutes
  lightSleep?: number; // in minutes
  remSleep?: number; // in minutes
  awakenings?: number;
  sleepEfficiency?: number; // percentage
  heartRateVariability?: number;
  restingHeartRate?: number;
}

export interface ExtendedMoodData extends MoodData {
  emotions?: Emotion[];
  energy?: number; // 1-10 scale
  anxiety?: number; // 1-10 scale
  depression?: number; // 1-10 scale
  irritability?: number; // 1-10 scale
  social?: number; // 1-10 scale
}

export interface ExtendedSymptomData extends SymptomData {
  additionalSymptoms?: {
    [key: string]: number; // symptom name -> severity (0-10)
  };
  triggers?: string[];
  reliefMethods?: string[];
  notes?: string;
}

export interface Emotion {
  name: string;
  intensity: 1 | 2 | 3 | 4 | 5;
}

// ML & AI Types
export interface HealthInsight {
  id: string;
  userId: string;
  type: InsightType;
  title: string;
  description: string;
  confidence: number; // 0-1
  data: Record<string, any>;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export enum InsightType {
  PATTERN = 'pattern',
  PREDICTION = 'prediction',
  RECOMMENDATION = 'recommendation',
  ALERT = 'alert',
  CORRELATION = 'correlation'
}

export interface MLModel {
  id: string;
  name: string;
  type: string;
  version: string;
  accuracy: number;
  lastTrained: Date;
  status: 'active' | 'training' | 'inactive';
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Tracking: undefined;
  Insights: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type MainStackParamList = {
  TrackingHome: undefined;
  SleepTracking: undefined;
  StressTracking: undefined;
  MoodTracking: undefined;
  SymptomTracking: undefined;
  InsightsHome: undefined;
  HealthInsights: undefined;
  Trends: undefined;
  Predictions: undefined;
  Correlations: undefined;
};

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  scheduledFor: Date;
  sent: boolean;
  read: boolean;
  createdAt: Date;
}

export enum NotificationType {
  REMINDER = 'reminder',
  INSIGHT = 'insight',
  ALERT = 'alert',
  ACHIEVEMENT = 'achievement',
  TIP = 'tip'
}

// Settings Types
export interface UserSettings {
  userId: string;
  notifications: {
    enabled: boolean;
    reminders: boolean;
    insights: boolean;
    achievements: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
    crashReporting: boolean;
  };
  units: {
    temperature: 'celsius' | 'fahrenheit';
    weight: 'kg' | 'lbs';
    height: 'cm' | 'ft';
    distance: 'km' | 'miles';
  };
  theme: 'light' | 'dark' | 'auto';
  language: string;
}
