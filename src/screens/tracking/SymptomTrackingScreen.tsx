import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useDispatch, useSelector } from 'react-redux';

import { Theme } from '../../constants/theme';
import { MainStackParamList } from '../../types';
import { healthService } from '../../services/healthService';
import { HealthEntrySchema } from '../../types';
import { updateLocalEntry } from '../../store/slices/healthSlice';
import { RootState } from '../../store';

type SymptomTrackingNavigationProp = StackNavigationProp<MainStackParamList, 'SymptomTracking'>;

export default function SymptomTrackingScreen() {
  const navigation = useNavigation<SymptomTrackingNavigationProp>();
  const dispatch = useDispatch();
  const { entries } = useSelector((state: RootState) => state.health);

  const today = new Date().toISOString().split('T')[0];
  const [currentEntry, setCurrentEntry] = useState<HealthEntrySchema | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Symptom tracking state
  const [giFlare, setGiFlare] = useState(0);
  const [skinFlare, setSkinFlare] = useState(0);
  const [migraine, setMigraine] = useState(0);

  useEffect(() => {
    loadTodayEntry();
  }, []);

  const loadTodayEntry = async () => {
    try {
      const entry = await healthService.getEntryForDate(today);
      if (entry) {
        setCurrentEntry(entry);
        setGiFlare(entry.symptoms.gi_flare);
        setSkinFlare(entry.symptoms.skin_flare);
        setMigraine(entry.symptoms.migraine);
      }
    } catch (error) {
      console.error('Failed to load today\'s entry:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const symptomData = {
        gi_flare: giFlare,
        skin_flare: skinFlare,
        migraine: migraine,
      };

      let updatedEntry: HealthEntrySchema;

      if (currentEntry) {
        // Update existing entry
        updatedEntry = {
          ...currentEntry,
          symptoms: symptomData,
        };
        await healthService.updateHealthEntry(updatedEntry);
        dispatch(updateLocalEntry(updatedEntry as any));
      } else {
        // Create new entry with default values
        updatedEntry = await healthService.logEntry(
          today,
          '23:00', // Default sleep start
          '07:00', // Default sleep end
          5, // Default quality
          5, // Default mood
          5, // Default stress
          '', // Empty journal
          undefined, // No voice note
          giFlare,
          skinFlare,
          migraine
        );
        dispatch(updateLocalEntry(updatedEntry as any));
      }

      setCurrentEntry(updatedEntry);
      Alert.alert('Success', 'Symptom data saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save symptom data');
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSymptomDescription = (score: number) => {
    if (score === 0) return 'None';
    if (score <= 3) return 'Mild';
    if (score <= 6) return 'Moderate';
    if (score <= 8) return 'Severe';
    return 'Very Severe';
  };

  const getSymptomColor = (score: number) => {
    if (score === 0) return Theme.colors.excellent;
    if (score <= 3) return Theme.colors.good;
    if (score <= 6) return Theme.colors.fair;
    if (score <= 8) return Theme.colors.poor;
    return Theme.colors.critical;
  };

  const symptoms = [
    {
      id: 'gi_flare',
      title: 'GI Flare',
      subtitle: 'Digestive symptoms, bloating, pain',
      icon: 'restaurant-outline',
      color: Theme.colors.primary,
      value: giFlare,
      setValue: setGiFlare,
    },
    {
      id: 'skin_flare',
      title: 'Skin Flare',
      subtitle: 'Rashes, irritation, inflammation',
      icon: 'body-outline',
      color: Theme.colors.secondary,
      value: skinFlare,
      setValue: setSkinFlare,
    },
    {
      id: 'migraine',
      title: 'Migraine',
      subtitle: 'Headaches, sensitivity, nausea',
      icon: 'medical-outline',
      color: Theme.colors.accent,
      value: migraine,
      setValue: setMigraine,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Symptom Tracking</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <Ionicons name="information-circle-outline" size={24} color={Theme.colors.primary} />
        <Text style={styles.instructionsText}>
          Rate each symptom from 0 (none) to 10 (worst possible). This helps track patterns and triggers.
        </Text>
      </View>

      {/* Symptom Cards */}
      {symptoms.map((symptom) => (
        <View key={symptom.id} style={styles.symptomCard}>
          <View style={styles.symptomHeader}>
            <View style={[styles.symptomIcon, { backgroundColor: symptom.color }]}>
              <Ionicons name={symptom.icon as any} size={24} color={Theme.colors.textInverse} />
            </View>
            <View style={styles.symptomInfo}>
              <Text style={styles.symptomTitle}>{symptom.title}</Text>
              <Text style={styles.symptomSubtitle}>{symptom.subtitle}</Text>
            </View>
          </View>

          <View style={styles.symptomRating}>
            <View style={styles.ratingHeader}>
              <Text style={[styles.ratingValue, { color: getSymptomColor(symptom.value) }]}>
                {symptom.value}/10
              </Text>
              <Text style={[styles.ratingDescription, { color: getSymptomColor(symptom.value) }]}>
                {getSymptomDescription(symptom.value)}
              </Text>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={symptom.value}
              onValueChange={symptom.setValue}
              minimumTrackTintColor={symptom.color}
              maximumTrackTintColor={Theme.colors.border}
              thumbStyle={{ backgroundColor: symptom.color }}
            />

            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>None</Text>
              <Text style={styles.sliderLabelText}>Worst</Text>
            </View>
          </View>
        </View>
      ))}

      {/* Symptom Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Symptom Management Tips</Text>
        
        <View style={styles.tip}>
          <Ionicons name="restaurant-outline" size={20} color={Theme.colors.primary} />
          <Text style={styles.tipText}>
            Track food intake to identify GI flare triggers
          </Text>
        </View>
        
        <View style={styles.tip}>
          <Ionicons name="sunny-outline" size={20} color={Theme.colors.secondary} />
          <Text style={styles.tipText}>
            Note environmental factors that may affect skin
          </Text>
        </View>
        
        <View style={styles.tip}>
          <Ionicons name="time-outline" size={20} color={Theme.colors.accent} />
          <Text style={styles.tipText}>
            Record timing and duration of migraine episodes
          </Text>
        </View>
        
        <View style={styles.tip}>
          <Ionicons name="medical-outline" size={20} color={Theme.colors.primary} />
          <Text style={styles.tipText}>
            Share patterns with your healthcare provider
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
          {isLoading ? 'Saving...' : 'Save Symptom Data'}
        </Text>
      </TouchableOpacity>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Today's Summary</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatValue}>{giFlare + skinFlare + migraine}</Text>
            <Text style={styles.summaryStatLabel}>Total Symptoms</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatValue}>
              {Math.max(giFlare, skinFlare, migraine)}
            </Text>
            <Text style={styles.summaryStatLabel}>Highest Severity</Text>
          </View>
        </View>
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
  instructionsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.sm,
  },
  instructionsText: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginLeft: Theme.spacing.md,
    flex: 1,
  },
  symptomCard: {
    margin: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.md,
  },
  symptomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  symptomIcon: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  symptomInfo: {
    flex: 1,
  },
  symptomTitle: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
  },
  symptomSubtitle: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  symptomRating: {
    marginTop: Theme.spacing.md,
  },
  ratingHeader: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  ratingValue: {
    ...Theme.typography.h2,
    fontWeight: '700',
  },
  ratingDescription: {
    ...Theme.typography.body1,
    marginTop: Theme.spacing.xs,
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
  summaryCard: {
    margin: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.sm,
  },
  summaryTitle: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryStatValue: {
    ...Theme.typography.h3,
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  summaryStatLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
    textAlign: 'center',
  },
});

