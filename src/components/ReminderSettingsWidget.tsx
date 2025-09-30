import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/theme';
import { notificationService, ReminderSettings } from '../services/notificationService';

interface ReminderSettingsWidgetProps {
  onSettingsChange?: (settings: ReminderSettings) => void;
}

export default function ReminderSettingsWidget({ onSettingsChange }: ReminderSettingsWidgetProps) {
  const [settings, setSettings] = useState<ReminderSettings>(notificationService.getSettings());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingTime, setEditingTime] = useState<{
    type: 'morning' | 'evening' | 'weekly';
    time: string;
  } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const currentSettings = notificationService.getSettings();
    setSettings(currentSettings);
    onSettingsChange?.(currentSettings);
  };

  const updateSettings = async (newSettings: Partial<ReminderSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await notificationService.updateSettings(newSettings);
    onSettingsChange?.(updatedSettings);
  };

  const toggleReminders = async (enabled: boolean) => {
    await updateSettings({ enabled });
  };

  const toggleMorningReminder = async (enabled: boolean) => {
    await updateSettings({
      morningReminder: { ...settings.morningReminder, enabled },
    });
  };

  const toggleEveningReminder = async (enabled: boolean) => {
    await updateSettings({
      eveningReminder: { ...settings.eveningReminder, enabled },
    });
  };

  const toggleWeeklyReminder = async (enabled: boolean) => {
    await updateSettings({
      weeklyReminder: { ...settings.weeklyReminder, enabled },
    });
  };

  const toggleSmartReminders = async (enabled: boolean) => {
    await updateSettings({
      smartReminders: { ...settings.smartReminders, enabled },
    });
  };

  const openTimePicker = (type: 'morning' | 'evening' | 'weekly') => {
    const timeMap = {
      morning: settings.morningReminder.time,
      evening: settings.eveningReminder.time,
      weekly: settings.weeklyReminder.time,
    };
    
    setEditingTime({ type, time: timeMap[type] });
    setShowTimePicker(true);
  };

  const saveTime = async (newTime: string) => {
    if (!editingTime) return;

    const timeUpdate = { [editingTime.type]: { ...settings[editingTime.type], time: newTime } };
    await updateSettings(timeUpdate);
    setShowTimePicker(false);
    setEditingTime(null);
  };

  const getDayName = (day: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  const renderTimePicker = () => {
    if (!editingTime) return null;

    const [hours, minutes] = editingTime.time.split(':').map(Number);
    const [newHours, setNewHours] = useState(hours.toString().padStart(2, '0'));
    const [newMinutes, setNewMinutes] = useState(minutes.toString().padStart(2, '0'));

    const handleSave = () => {
      const timeString = `${newHours.padStart(2, '0')}:${newMinutes.padStart(2, '0')}`;
      saveTime(timeString);
    };

    return (
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerModal}>
            <View style={styles.timePickerHeader}>
              <Text style={styles.timePickerTitle}>
                Set {editingTime.type} reminder time
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowTimePicker(false)}
              >
                <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.timeInputContainer}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>Hours</Text>
                <TextInput
                  style={styles.timeInput}
                  value={newHours}
                  onChangeText={setNewHours}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="00"
                />
              </View>
              
              <Text style={styles.timeSeparator}>:</Text>
              
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>Minutes</Text>
                <TextInput
                  style={styles.timeInput}
                  value={newMinutes}
                  onChangeText={setNewMinutes}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="00"
                />
              </View>
            </View>

            <View style={styles.timePickerActions}>
              <TouchableOpacity
                style={[styles.timePickerButton, styles.cancelButton]}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.timePickerButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="notifications" size={24} color={Theme.colors.primary} />
        <Text style={styles.title}>Smart Reminders</Text>
        <Switch
          value={settings.enabled}
          onValueChange={toggleReminders}
          trackColor={{ false: Theme.colors.surfaceVariant, true: Theme.colors.primary + '40' }}
          thumbColor={settings.enabled ? Theme.colors.primary : Theme.colors.textTertiary}
        />
      </View>

      {settings.enabled && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Morning Reminder */}
          <View style={styles.reminderSection}>
            <View style={styles.reminderHeader}>
              <View style={styles.reminderTitleContainer}>
                <Ionicons name="sunny" size={20} color={Theme.colors.warning} />
                <Text style={styles.reminderTitle}>Morning Check-in</Text>
              </View>
              <Switch
                value={settings.morningReminder.enabled}
                onValueChange={toggleMorningReminder}
                trackColor={{ false: Theme.colors.surfaceVariant, true: Theme.colors.primary + '40' }}
                thumbColor={settings.morningReminder.enabled ? Theme.colors.primary : Theme.colors.textTertiary}
              />
            </View>
            
            {settings.morningReminder.enabled && (
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => openTimePicker('morning')}
              >
                <Text style={styles.timeButtonText}>
                  {settings.morningReminder.time}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Evening Reminder */}
          <View style={styles.reminderSection}>
            <View style={styles.reminderHeader}>
              <View style={styles.reminderTitleContainer}>
                <Ionicons name="moon" size={20} color={Theme.colors.primary} />
                <Text style={styles.reminderTitle}>Evening Check-in</Text>
              </View>
              <Switch
                value={settings.eveningReminder.enabled}
                onValueChange={toggleEveningReminder}
                trackColor={{ false: Theme.colors.surfaceVariant, true: Theme.colors.primary + '40' }}
                thumbColor={settings.eveningReminder.enabled ? Theme.colors.primary : Theme.colors.textTertiary}
              />
            </View>
            
            {settings.eveningReminder.enabled && (
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => openTimePicker('evening')}
              >
                <Text style={styles.timeButtonText}>
                  {settings.eveningReminder.time}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Weekly Reminder */}
          <View style={styles.reminderSection}>
            <View style={styles.reminderHeader}>
              <View style={styles.reminderTitleContainer}>
                <Ionicons name="calendar" size={20} color={Theme.colors.success} />
                <Text style={styles.reminderTitle}>Weekly Review</Text>
              </View>
              <Switch
                value={settings.weeklyReminder.enabled}
                onValueChange={toggleWeeklyReminder}
                trackColor={{ false: Theme.colors.surfaceVariant, true: Theme.colors.primary + '40' }}
                thumbColor={settings.weeklyReminder.enabled ? Theme.colors.primary : Theme.colors.textTertiary}
              />
            </View>
            
            {settings.weeklyReminder.enabled && (
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => openTimePicker('weekly')}
              >
                <Text style={styles.timeButtonText}>
                  {getDayName(settings.weeklyReminder.day)} at {settings.weeklyReminder.time}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Smart Reminders */}
          <View style={styles.reminderSection}>
            <View style={styles.reminderHeader}>
              <View style={styles.reminderTitleContainer}>
                <Ionicons name="bulb" size={20} color={Theme.colors.warning} />
                <Text style={styles.reminderTitle}>Smart Reminders</Text>
              </View>
              <Switch
                value={settings.smartReminders.enabled}
                onValueChange={toggleSmartReminders}
                trackColor={{ false: Theme.colors.surfaceVariant, true: Theme.colors.primary + '40' }}
                thumbColor={settings.smartReminders.enabled ? Theme.colors.primary : Theme.colors.textTertiary}
              />
            </View>
            
            {settings.smartReminders.enabled && (
              <View style={styles.smartReminderDetails}>
                <Text style={styles.smartReminderText}>
                  • Adaptive timing based on your habits
                </Text>
                <Text style={styles.smartReminderText}>
                  • Personalized messages and insights
                </Text>
                <Text style={styles.smartReminderText}>
                  • Streak and achievement notifications
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {renderTimePicker()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginVertical: Theme.spacing.md,
    ...Theme.shadows.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  title: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    flex: 1,
    marginLeft: Theme.spacing.sm,
  },
  content: {
    maxHeight: 400,
  },
  reminderSection: {
    marginBottom: Theme.spacing.lg,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  reminderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderTitle: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    marginLeft: Theme.spacing.sm,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
  },
  timeButtonText: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
  },
  smartReminderDetails: {
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
  },
  smartReminderText: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerModal: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    width: '90%',
    maxWidth: 400,
    ...Theme.shadows.large,
  },
  timePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.lg,
  },
  timePickerTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    padding: Theme.spacing.sm,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
  },
  timeInputGroup: {
    alignItems: 'center',
  },
  timeInputLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },
  timeInput: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    minWidth: 80,
  },
  timeSeparator: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginHorizontal: Theme.spacing.md,
  },
  timePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timePickerButton: {
    flex: 1,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.sm,
  },
  cancelButton: {
    backgroundColor: Theme.colors.surfaceVariant,
  },
  saveButton: {
    backgroundColor: Theme.colors.primary,
  },
  cancelButtonText: {
    ...Theme.typography.body1,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  saveButtonText: {
    ...Theme.typography.body1,
    color: Theme.colors.surface,
    fontWeight: '600',
  },
});

