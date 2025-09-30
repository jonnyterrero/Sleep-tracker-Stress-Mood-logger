import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { useDispatch, useSelector } from 'react-redux';

import { Theme } from '../../constants/theme';
import { MainStackParamList } from '../../types';
import { healthService } from '../../services/healthService';
import { HealthEntrySchema } from '../../types';
import { updateLocalEntry } from '../../store/slices/healthSlice';
import { RootState } from '../../store';

type SleepTrackingNavigationProp = StackNavigationProp<MainStackParamList, 'SleepTracking'>;

export default function SleepTrackingScreen() {
  const navigation = useNavigation<SleepTrackingNavigationProp>();
  const dispatch = useDispatch();
  const { entries } = useSelector((state: RootState) => state.health);

  const today = new Date().toISOString().split('T')[0];
  const [currentEntry, setCurrentEntry] = useState<HealthEntrySchema | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sleep tracking state
  const [sleepStart, setSleepStart] = useState('23:00');
  const [sleepEnd, setSleepEnd] = useState('07:00');
  const [qualityScore, setQualityScore] = useState(5);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [sleepNotes, setSleepNotes] = useState('');
  const [sleepFactors, setSleepFactors] = useState({
    caffeine: false,
    alcohol: false,
    exercise: false,
    stress: false,
    screenTime: false,
  });

  useEffect(() => {
    loadTodayEntry();
  }, []);

  const loadTodayEntry = async () => {
    try {
      const entry = await healthService.getEntryForDate(today);
      if (entry) {
        setCurrentEntry(entry);
        setSleepStart(entry.sleep.start_time);
        setSleepEnd(entry.sleep.end_time);
        setQualityScore(entry.sleep.quality_score);
        // Note: Additional sleep data would be loaded from extended sleep data
      }
    } catch (error) {
      console.error('Failed to load today\'s entry:', error);
    }
  };

  const calculateSleepDuration = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    let startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    
    // Handle overnight case (end time is next day)
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60; // Add 24 hours
    }
    
    const durationMinutes = endMinutes - startMinutes;
    return Math.round((durationMinutes / 60) * 100) / 100; // Round to 2 decimal places
  };

  const handleSave = async () => {
    if (!sleepStart || !sleepEnd) {
      Alert.alert('Error', 'Please enter both sleep start and end times');
      return;
    }

    setIsLoading(true);
    try {
      const durationHours = calculateSleepDuration(sleepStart, sleepEnd);
      
      const sleepData = {
        start_time: sleepStart,
        end_time: sleepEnd,
        duration_hours: durationHours,
        quality_score: qualityScore,
      };

      let updatedEntry: HealthEntrySchema;

      if (currentEntry) {
        // Update existing entry
        updatedEntry = {
          ...currentEntry,
          sleep: sleepData,
        };
        await healthService.updateHealthEntry(updatedEntry);
        dispatch(updateLocalEntry(updatedEntry as any));
      } else {
        // Create new entry with default values
        updatedEntry = await healthService.logEntry(
          today,
          sleepStart,
          sleepEnd,
          qualityScore,
          5, // Default mood
          5, // Default stress
          '', // Empty journal
          undefined, // No voice note
          0, // No GI flare
          0, // No skin flare
          0  // No migraine
        );
        dispatch(updateLocalEntry(updatedEntry as any));
      }

      setCurrentEntry(updatedEntry);
      Alert.alert('Success', 'Sleep data saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save sleep data');
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getQualityDescription = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    if (score >= 2) return 'Poor';
    return 'Very Poor';
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return Theme.colors.excellent;
    if (score >= 6) return Theme.colors.good;
    if (score >= 4) return Theme.colors.fair;
    if (score >= 2) return Theme.colors.poor;
    return Theme.colors.critical;
  };

  const durationHours = calculateSleepDuration(sleepStart, sleepEnd);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sleep Tracking</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Sleep Duration Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sleep Duration</Text>
        <Text style={styles.durationText}>
          {durationHours.toFixed(2)} hours
        </Text>
        
        <View style={styles.timeRow}>
          <TouchableOpacity 
            style={styles.timeButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.timeLabel}>Bedtime</Text>
            <Text style={styles.timeValue}>{formatTime(sleepStart)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.timeButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.timeLabel}>Wake Time</Text>
            <Text style={styles.timeValue}>{formatTime(sleepEnd)}</Text>
          </TouchableOpacity>
        </View>

        {/* Time Pickers */}
        {showStartPicker && (
          <DateTimePicker
            value={new Date(`2000-01-01T${sleepStart}:00`)}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, selectedTime) => {
              setShowStartPicker(false);
              if (selectedTime) {
                const hours = selectedTime.getHours().toString().padStart(2, '0');
                const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                setSleepStart(`${hours}:${minutes}`);
              }
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={new Date(`2000-01-01T${sleepEnd}:00`)}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, selectedTime) => {
              setShowEndPicker(false);
              if (selectedTime) {
                const hours = selectedTime.getHours().toString().padStart(2, '0');
                const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                setSleepEnd(`${hours}:${minutes}`);
              }
            }}
          />
        )}
      </View>

      {/* Sleep Quality Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sleep Quality</Text>
        
        <View style={styles.qualityContainer}>
          <Text style={[styles.qualityScore, { color: getQualityColor(qualityScore) }]}>
            {qualityScore}/10
          </Text>
          <Text style={styles.qualityDescription}>
            {getQualityDescription(qualityScore)}
          </Text>
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Rate your sleep quality</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={qualityScore}
            onValueChange={setQualityScore}
            minimumTrackTintColor={Theme.colors.primary}
            maximumTrackTintColor={Theme.colors.border}
            thumbStyle={{ backgroundColor: Theme.colors.primary }}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>Poor</Text>
            <Text style={styles.sliderLabelText}>Excellent</Text>
          </View>
        </View>
      </View>

      {/* Sleep Factors */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sleep Factors</Text>
        <Text style={styles.cardSubtitle}>
          What factors affected your sleep tonight?
        </Text>
        
        <View style={styles.factorsContainer}>
          {Object.entries(sleepFactors).map(([factor, checked]) => (
            <TouchableOpacity
              key={factor}
              style={[styles.factorButton, checked && styles.factorButtonActive]}
              onPress={() => setSleepFactors(prev => ({
                ...prev,
                [factor]: !prev[factor as keyof typeof prev]
              }))}
            >
              <Ionicons
                name={checked ? "checkmark-circle" : "ellipse-outline"}
                size={20}
                color={checked ? Theme.colors.primary : Theme.colors.textTertiary}
              />
              <Text style={[styles.factorText, checked && styles.factorTextActive]}>
                {factor.charAt(0).toUpperCase() + factor.slice(1).replace(/([A-Z])/g, ' $1')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sleep Notes */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sleep Notes</Text>
        <Text style={styles.cardSubtitle}>
          Any additional notes about your sleep?
        </Text>
        
        <TextInput
          style={styles.notesInput}
          value={sleepNotes}
          onChangeText={setSleepNotes}
          placeholder="How did you feel when you woke up? Any dreams or disturbances?"
          placeholderTextColor={Theme.colors.textTertiary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Sleep Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Sleep Tips</Text>
        <View style={styles.tip}>
          <Ionicons name="bulb-outline" size={20} color={Theme.colors.accent} />
          <Text style={styles.tipText}>
            Aim for 7-9 hours of sleep for optimal health
          </Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="bulb-outline" size={20} color={Theme.colors.accent} />
          <Text style={styles.tipText}>
            Keep a consistent sleep schedule, even on weekends
          </Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="bulb-outline" size={20} color={Theme.colors.accent} />
          <Text style={styles.tipText}>
            Avoid screens 1 hour before bedtime
          </Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="bulb-outline" size={20} color={Theme.colors.accent} />
          <Text style={styles.tipText}>
            Create a relaxing bedtime routine
          </Text>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity 
        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isLoading}
      >
        <Text style={styles.saveButtonText}>
          {isLoading ? 'Saving...' : 'Save Sleep Data'}
        </Text>
      </TouchableOpacity>

      {/* Navigation to other tracking */}
      <View style={styles.navigationSection}>
        <Text style={styles.navigationTitle}>Continue Tracking</Text>
        
        <TouchableOpacity 
          style={styles.navigationButton}
          onPress={() => navigation.navigate('MoodTracking')}
        >
          <Ionicons name="heart-outline" size={24} color={Theme.colors.secondary} />
          <Text style={styles.navigationButtonText}>Mood & Stress</Text>
          <Ionicons name="chevron-forward" size={20} color={Theme.colors.textTertiary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
  },
  backButton: {
    padding: Theme.spacing.sm,
  },
  headerTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  card: {
    margin: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.md,
  },
  cardTitle: {
    ...Theme.typography.h5,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  durationText: {
    ...Theme.typography.h2,
    color: Theme.colors.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeButton: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    marginHorizontal: Theme.spacing.xs,
  },
  timeLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  timeValue: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
  },
  qualityContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  qualityScore: {
    ...Theme.typography.h1,
    fontWeight: '700',
  },
  qualityDescription: {
    ...Theme.typography.body1,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  sliderContainer: {
    marginTop: Theme.spacing.md,
  },
  sliderLabel: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.sm,
  },
  sliderLabelText: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
  },
  tipsCard: {
    margin: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.sm,
  },
  tipsTitle: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  tipText: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginLeft: Theme.spacing.sm,
    flex: 1,
  },
  saveButton: {
    backgroundColor: Theme.colors.primary,
    margin: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: Theme.colors.textTertiary,
  },
  saveButtonText: {
    ...Theme.typography.button,
    color: Theme.colors.textInverse,
  },
  navigationSection: {
    padding: Theme.spacing.lg,
  },
  navigationTitle: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadows.sm,
  },
  navigationButtonText: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    marginLeft: Theme.spacing.md,
    flex: 1,
  },
  cardSubtitle: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
  },
  factorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  factorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    minWidth: '48%',
  },
  factorButtonActive: {
    backgroundColor: Theme.colors.primary + '20',
    borderColor: Theme.colors.primary,
  },
  factorText: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginLeft: Theme.spacing.sm,
  },
  factorTextActive: {
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  notesInput: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
});

