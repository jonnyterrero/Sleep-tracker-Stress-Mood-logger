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
import { useDispatch, useSelector } from 'react-redux';

import { Theme } from '../../constants/theme';
import { MainStackParamList } from '../../types';
import { healthService } from '../../services/healthService';
import { HealthEntrySchema } from '../../types';
import { addLocalEntry } from '../../store/slices/healthSlice';
import { RootState } from '../../store';

type TrackingScreenNavigationProp = StackNavigationProp<MainStackParamList, 'TrackingHome'>;

export default function TrackingScreen() {
  const navigation = useNavigation<TrackingScreenNavigationProp>();
  const dispatch = useDispatch();
  const { entries } = useSelector((state: RootState) => state.health);

  const [todayEntry, setTodayEntry] = useState<HealthEntrySchema | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  useEffect(() => {
    loadTodayEntry();
  }, []);

  const loadTodayEntry = async () => {
    try {
      const entry = await healthService.getEntryForDate(today);
      setTodayEntry(entry);
    } catch (error) {
      console.error('Failed to load today\'s entry:', error);
    }
  };

  const handleQuickLog = async () => {
    if (todayEntry) {
      Alert.alert(
        'Entry Exists',
        'You already have an entry for today. Would you like to update it?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Update', onPress: () => navigation.navigate('SleepTracking') },
        ]
      );
      return;
    }

    setIsLoading(true);
    try {
      // Create a default entry for today
      const defaultEntry = await healthService.logEntry(
        today,
        '23:00', // Default sleep start
        '07:00', // Default sleep end
        5, // Default quality
        5, // Default mood
        5, // Default stress
        '', // Empty journal
        undefined, // No voice note
        0, // No GI flare
        0, // No skin flare
        0  // No migraine
      );

      setTodayEntry(defaultEntry);
      dispatch(addLocalEntry(defaultEntry as any));
      
      navigation.navigate('SleepTracking');
    } catch (error) {
      Alert.alert('Error', 'Failed to create today\'s entry');
      console.error('Quick log error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCompletionStatus = () => {
    if (!todayEntry) return { completed: 0, total: 3 };
    
    let completed = 0;
    if (todayEntry.sleep.quality_score > 0) completed++;
    if (todayEntry.mood.mood_score > 0) completed++;
    if (todayEntry.symptoms.gi_flare > 0 || todayEntry.symptoms.skin_flare > 0 || todayEntry.symptoms.migraine > 0) {
      completed++;
    }
    
    return { completed, total: 3 };
  };

  const completionStatus = getCompletionStatus();

  const trackingOptions = [
    {
      id: 'sleep',
      title: 'Sleep',
      subtitle: 'Track your sleep quality and duration',
      icon: 'moon-outline',
      color: Theme.colors.primary,
      onPress: () => navigation.navigate('SleepTracking'),
      completed: todayEntry?.sleep.quality_score ? true : false,
    },
    {
      id: 'mood',
      title: 'Mood & Stress',
      subtitle: 'Log your emotional state and stress levels',
      icon: 'heart-outline',
      color: Theme.colors.secondary,
      onPress: () => navigation.navigate('MoodTracking'),
      completed: todayEntry?.mood.mood_score ? true : false,
    },
    {
      id: 'symptoms',
      title: 'Symptoms',
      subtitle: 'Track GI flares, skin issues, and migraines',
      icon: 'medical-outline',
      color: Theme.colors.accent,
      onPress: () => navigation.navigate('SymptomTracking'),
      completed: todayEntry?.symptoms.gi_flare > 0 || todayEntry?.symptoms.skin_flare > 0 || todayEntry?.symptoms.migraine > 0,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sleep & Stress Tracking</Text>
        <Text style={styles.headerSubtitle}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          <Text style={styles.progressText}>
            {completionStatus.completed}/{completionStatus.total} completed
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(completionStatus.completed / completionStatus.total) * 100}%` }
            ]} 
          />
        </View>

        {completionStatus.completed === 0 && (
          <TouchableOpacity 
            style={styles.quickLogButton} 
            onPress={handleQuickLog}
            disabled={isLoading}
          >
            <Ionicons name="add-circle" size={20} color={Theme.colors.textInverse} />
            <Text style={styles.quickLogText}>Start Today's Log</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tracking Options */}
      <View style={styles.trackingSection}>
        <Text style={styles.sectionTitle}>Track Your Health</Text>
        
        {trackingOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.trackingCard, option.completed && styles.completedCard]}
            onPress={option.onPress}
          >
            <View style={styles.trackingCardContent}>
              <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                <Ionicons 
                  name={option.icon as any} 
                  size={24} 
                  color={Theme.colors.textInverse} 
                />
              </View>
              
              <View style={styles.trackingCardText}>
                <Text style={styles.trackingCardTitle}>{option.title}</Text>
                <Text style={styles.trackingCardSubtitle}>{option.subtitle}</Text>
              </View>
              
              <View style={styles.trackingCardRight}>
                {option.completed ? (
                  <Ionicons name="checkmark-circle" size={24} color={Theme.colors.success} />
                ) : (
                  <Ionicons name="chevron-forward" size={24} color={Theme.colors.textTertiary} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          
          {entries.slice(0, 3).map((entry) => (
            <View key={entry.date} style={styles.recentCard}>
              <Text style={styles.recentDate}>
                {new Date(entry.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
              
              <View style={styles.recentMetrics}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Sleep</Text>
                  <Text style={styles.metricValue}>{entry.sleep.quality_score}/10</Text>
                </View>
                
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Mood</Text>
                  <Text style={styles.metricValue}>{entry.mood.mood_score}/10</Text>
                </View>
                
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Stress</Text>
                  <Text style={styles.metricValue}>{entry.mood.stress_score}/10</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
  },
  headerTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
  },
  headerSubtitle: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  progressCard: {
    margin: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  progressTitle: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
  },
  progressText: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: Theme.spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.sm,
  },
  quickLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
  },
  quickLogText: {
    ...Theme.typography.button,
    marginLeft: Theme.spacing.sm,
  },
  trackingSection: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    ...Theme.typography.h5,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  trackingCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.sm,
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.success,
  },
  trackingCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  trackingCardText: {
    flex: 1,
  },
  trackingCardTitle: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
  },
  trackingCardSubtitle: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  trackingCardRight: {
    marginLeft: Theme.spacing.md,
  },
  recentSection: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  recentCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.sm,
  },
  recentDate: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  recentMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  metricValue: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
  },
});

