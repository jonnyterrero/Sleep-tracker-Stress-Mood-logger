import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReminderSettings {
  enabled: boolean;
  morningReminder: {
    enabled: boolean;
    time: string; // HH:MM format
    message: string;
  };
  eveningReminder: {
    enabled: boolean;
    time: string; // HH:MM format
    message: string;
  };
  weeklyReminder: {
    enabled: boolean;
    day: number; // 0-6 (Sunday-Saturday)
    time: string;
    message: string;
  };
  smartReminders: {
    enabled: boolean;
    adaptiveTiming: boolean;
    personalizedMessages: boolean;
  };
}

export interface NotificationData {
  type: 'morning' | 'evening' | 'weekly' | 'smart' | 'streak' | 'insight';
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;
  private reminderSettings: ReminderSettings = {
    enabled: true,
    morningReminder: {
      enabled: true,
      time: '08:00',
      message: 'Good morning! How did you sleep last night?',
    },
    eveningReminder: {
      enabled: true,
      time: '21:00',
      message: 'Time for your evening check-in! How are you feeling?',
    },
    weeklyReminder: {
      enabled: true,
      day: 0, // Sunday
      time: '10:00',
      message: 'Weekly health check-in! Review your progress and set goals.',
    },
    smartReminders: {
      enabled: true,
      adaptiveTiming: true,
      personalizedMessages: true,
    },
  };

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Load saved settings
      await this.loadSettings();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Notification service initialization error:', error);
      return false;
    }
  }

  async scheduleReminders(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Cancel existing notifications
    await this.cancelAllReminders();

    if (!this.reminderSettings.enabled) return;

    // Schedule morning reminder
    if (this.reminderSettings.morningReminder.enabled) {
      await this.scheduleDailyReminder(
        'morning',
        this.reminderSettings.morningReminder.time,
        this.reminderSettings.morningReminder.message
      );
    }

    // Schedule evening reminder
    if (this.reminderSettings.eveningReminder.enabled) {
      await this.scheduleDailyReminder(
        'evening',
        this.reminderSettings.eveningReminder.time,
        this.reminderSettings.eveningReminder.message
      );
    }

    // Schedule weekly reminder
    if (this.reminderSettings.weeklyReminder.enabled) {
      await this.scheduleWeeklyReminder(
        this.reminderSettings.weeklyReminder.day,
        this.reminderSettings.weeklyReminder.time,
        this.reminderSettings.weeklyReminder.message
      );
    }
  }

  private async scheduleDailyReminder(
    type: 'morning' | 'evening',
    time: string,
    message: string
  ): Promise<void> {
    const [hours, minutes] = time.split(':').map(Number);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: type === 'morning' ? '🌅 Morning Check-in' : '🌙 Evening Check-in',
        body: message,
        data: { type },
        sound: 'default',
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
  }

  private async scheduleWeeklyReminder(
    day: number,
    time: string,
    message: string
  ): Promise<void> {
    const [hours, minutes] = time.split(':').map(Number);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Weekly Health Review',
        body: message,
        data: { type: 'weekly' },
        sound: 'default',
      },
      trigger: {
        weekday: day + 1, // Expo uses 1-7 (Monday-Sunday)
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
  }

  async sendSmartReminder(
    type: 'streak' | 'insight' | 'motivation',
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    if (!this.reminderSettings.smartReminders.enabled) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type, ...data },
        sound: 'default',
      },
      trigger: null, // Send immediately
    });
  }

  async sendStreakReminder(days: number): Promise<void> {
    const messages = [
      `🔥 Amazing! You've logged ${days} days in a row! Keep it up!`,
      `📈 ${days} day streak! You're building a great habit!`,
      `⭐ ${days} days of consistent tracking! You're doing great!`,
      `🎯 ${days} day streak! Your health insights are getting better!`,
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    
    await this.sendSmartReminder(
      'streak',
      '🔥 Streak Alert!',
      message,
      { streakDays: days }
    );
  }

  async sendInsightReminder(insight: string): Promise<void> {
    await this.sendSmartReminder(
      'insight',
      '💡 Health Insight',
      insight,
      { insight }
    );
  }

  async sendMotivationalReminder(): Promise<void> {
    const messages = [
      'Your health journey is unique to you. Every entry matters! 💪',
      'Small steps lead to big changes. Keep tracking! 🌱',
      'You\'re investing in your future self. Keep going! ⭐',
      'Consistency is key. You\'re doing great! 🎯',
      'Your data is helping you understand yourself better! 📊',
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    
    await this.sendSmartReminder(
      'motivation',
      '💪 You\'ve Got This!',
      message
    );
  }

  async cancelAllReminders(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async updateSettings(settings: Partial<ReminderSettings>): Promise<void> {
    this.reminderSettings = { ...this.reminderSettings, ...settings };
    await this.saveSettings();
    await this.scheduleReminders();
  }

  getSettings(): ReminderSettings {
    return { ...this.reminderSettings };
  }

  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'notificationSettings',
        JSON.stringify(this.reminderSettings)
      );
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('notificationSettings');
      if (saved) {
        this.reminderSettings = { ...this.reminderSettings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  async checkAndSendAdaptiveReminders(): Promise<void> {
    if (!this.reminderSettings.smartReminders.adaptiveTiming) return;

    try {
      // Check if user hasn't logged today
      const today = new Date().toISOString().split('T')[0];
      const lastLogDate = await AsyncStorage.getItem('lastLogDate');
      
      if (lastLogDate !== today) {
        const currentHour = new Date().getHours();
        
        // Send adaptive reminder based on time of day
        if (currentHour >= 9 && currentHour < 12) {
          await this.sendSmartReminder(
            'morning',
            '🌅 Morning Check-in',
            'Good morning! Don\'t forget to log how you slept last night.',
            { adaptive: true }
          );
        } else if (currentHour >= 18 && currentHour < 22) {
          await this.sendSmartReminder(
            'evening',
            '🌙 Evening Check-in',
            'How was your day? Time for your evening health check-in.',
            { adaptive: true }
          );
        }
      }
    } catch (error) {
      console.error('Error checking adaptive reminders:', error);
    }
  }

  async markLogCompleted(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem('lastLogDate', today);
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }
}

export const notificationService = NotificationService.getInstance();

