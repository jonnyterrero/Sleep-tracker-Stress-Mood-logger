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
import Slider from '@react-native-community/slider';
import { useDispatch, useSelector } from 'react-redux';

import { Theme } from '../../constants/theme';
import { MainStackParamList } from '../../types';
import { healthService } from '../../services/healthService';
import { HealthEntrySchema } from '../../types';
import { updateLocalEntry } from '../../store/slices/healthSlice';
import { RootState } from '../../store';
import VoiceRecorder from '../../components/VoiceRecorder';
import { VoiceRecording } from '../../services/voiceService';

type MoodTrackingNavigationProp = StackNavigationProp<MainStackParamList, 'MoodTracking'>;

export default function MoodTrackingScreen() {
  const navigation = useNavigation<MoodTrackingNavigationProp>();
  const dispatch = useDispatch();
  const { entries } = useSelector((state: RootState) => state.health);

  const today = new Date().toISOString().split('T')[0];
  const [currentEntry, setCurrentEntry] = useState<HealthEntrySchema | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mood tracking state
  const [moodScore, setMoodScore] = useState(5);
  const [stressScore, setStressScore] = useState(5);
  const [journalEntry, setJournalEntry] = useState('');
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecording | null>(null);

  useEffect(() => {
    loadTodayEntry();
  }, []);

  const loadTodayEntry = async () => {
    try {
      const entry = await healthService.getEntryForDate(today);
      if (entry) {
        setCurrentEntry(entry);
        setMoodScore(entry.mood.mood_score);
        setStressScore(entry.mood.stress_score);
        setJournalEntry(entry.mood.journal_entry);
        // Note: voice_note_path would need to be loaded from storage
        // For now, we'll handle this in the voice recorder component
      }
    } catch (error) {
      console.error('Failed to load today\'s entry:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const moodData = {
        mood_score: moodScore,
        stress_score: stressScore,
        journal_entry: journalEntry,
        voice_note_path: voiceRecording?.uri || currentEntry?.mood.voice_note_path,
      };

      let updatedEntry: HealthEntrySchema;

      if (currentEntry) {
        // Update existing entry
        updatedEntry = {
          ...currentEntry,
          mood: moodData,
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
          moodScore,
          stressScore,
          journalEntry,
          voiceRecording?.uri, // Voice note
          0, // No GI flare
          0, // No skin flare
          0  // No migraine
        );
        dispatch(updateLocalEntry(updatedEntry as any));
      }

      setCurrentEntry(updatedEntry);
      Alert.alert('Success', 'Mood data saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save mood data');
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodDescription = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    if (score >= 2) return 'Poor';
    return 'Very Poor';
  };

  const getMoodColor = (score: number) => {
    if (score >= 8) return Theme.colors.excellent;
    if (score >= 6) return Theme.colors.good;
    if (score >= 4) return Theme.colors.fair;
    if (score >= 2) return Theme.colors.poor;
    return Theme.colors.critical;
  };

  const getStressDescription = (score: number) => {
    if (score <= 3) return 'Low';
    if (score <= 5) return 'Moderate';
    if (score <= 7) return 'High';
    return 'Very High';
  };

  const getStressColor = (score: number) => {
    if (score <= 3) return Theme.colors.lowStress;
    if (score <= 5) return Theme.colors.moderateStress;
    if (score <= 7) return Theme.colors.highStress;
    return Theme.colors.extremeStress;
  };

  const moodEmojis = ['😢', '😔', '😐', '🙂', '😊', '😄', '🤩', '🥳', '🎉', '💖'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mood & Stress</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Mood Score Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>How are you feeling?</Text>
        
        <View style={styles.moodContainer}>
          <Text style={styles.moodEmoji}>{moodEmojis[moodScore - 1]}</Text>
          <Text style={[styles.moodScore, { color: getMoodColor(moodScore) }]}>
            {moodScore}/10
          </Text>
          <Text style={styles.moodDescription}>
            {getMoodDescription(moodScore)}
          </Text>
        </View>

        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={moodScore}
            onValueChange={setMoodScore}
            minimumTrackTintColor={Theme.colors.secondary}
            maximumTrackTintColor={Theme.colors.border}
            thumbStyle={{ backgroundColor: Theme.colors.secondary }}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>Very Low</Text>
            <Text style={styles.sliderLabelText}>Excellent</Text>
          </View>
        </View>
      </View>

      {/* Stress Score Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Stress Level</Text>
        
        <View style={styles.stressContainer}>
          <Text style={[styles.stressScore, { color: getStressColor(stressScore) }]}>
            {stressScore}/10
          </Text>
          <Text style={styles.stressDescription}>
            {getStressDescription(stressScore)}
          </Text>
        </View>

        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={stressScore}
            onValueChange={setStressScore}
            minimumTrackTintColor={Theme.colors.accent}
            maximumTrackTintColor={Theme.colors.border}
            thumbStyle={{ backgroundColor: Theme.colors.accent }}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>Low</Text>
            <Text style={styles.sliderLabelText}>Very High</Text>
          </View>
        </View>
      </View>

      {/* Voice Note Card */}
      <View style={styles.card}>
        <VoiceRecorder
          onRecordingComplete={setVoiceRecording}
          onRecordingDelete={() => setVoiceRecording(null)}
          existingRecording={voiceRecording}
        />
      </View>

      {/* Journal Entry Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Journal Entry</Text>
        <Text style={styles.cardSubtitle}>
          How are you feeling today? What's on your mind?
        </Text>
        
        <TextInput
          style={styles.journalInput}
          value={journalEntry}
          onChangeText={setJournalEntry}
          placeholder="Write about your day, thoughts, or feelings..."
          placeholderTextColor={Theme.colors.textTertiary}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      {/* Mood Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Mood Boosters</Text>
        <View style={styles.tip}>
          <Ionicons name="sunny-outline" size={20} color={Theme.colors.accent} />
          <Text style={styles.tipText}>
            Get some sunlight or natural light
          </Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="walk-outline" size={20} color={Theme.colors.accent} />
          <Text style={styles.tipText}>
            Take a short walk or do light exercise
          </Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="people-outline" size={20} color={Theme.colors.accent} />
          <Text style={styles.tipText}>
            Connect with friends or family
          </Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="leaf-outline" size={20} color={Theme.colors.accent} />
          <Text style={styles.tipText}>
            Practice deep breathing or meditation
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
          {isLoading ? 'Saving...' : 'Save Mood Data'}
        </Text>
      </TouchableOpacity>

      {/* Navigation to other tracking */}
      <View style={styles.navigationSection}>
        <Text style={styles.navigationTitle}>Continue Tracking</Text>
        
        <TouchableOpacity 
          style={styles.navigationButton}
          onPress={() => navigation.navigate('SymptomTracking')}
        >
          <Ionicons name="medical-outline" size={24} color={Theme.colors.accent} />
          <Text style={styles.navigationButtonText}>Symptoms</Text>
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
    marginBottom: Theme.spacing.sm,
  },
  cardSubtitle: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.lg,
  },
  moodContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  moodEmoji: {
    fontSize: 60,
    marginBottom: Theme.spacing.sm,
  },
  moodScore: {
    ...Theme.typography.h1,
    fontWeight: '700',
  },
  moodDescription: {
    ...Theme.typography.body1,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  stressContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  stressScore: {
    ...Theme.typography.h1,
    fontWeight: '700',
  },
  stressDescription: {
    ...Theme.typography.body1,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  sliderContainer: {
    marginTop: Theme.spacing.md,
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
  journalInput: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    minHeight: 120,
    borderWidth: 1,
    borderColor: Theme.colors.border,
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
});

