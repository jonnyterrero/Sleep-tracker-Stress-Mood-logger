import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import { Theme } from '../../constants/theme';
import { MainStackParamList } from '../../types';
import { healthService } from '../../services/healthService';
import { HealthEntrySchema } from '../../types';
import { RootState } from '../../store';

type DashboardNavigationProp = StackNavigationProp<MainStackParamList, 'TrackingHome'>;

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { entries } = useSelector((state: RootState) => state.health);
  const [todayEntry, setTodayEntry] = useState<HealthEntrySchema | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadTodayEntry();
  }, [entries]);

  const loadTodayEntry = async () => {
    try {
      const entry = await healthService.getEntryForDate(today);
      setTodayEntry(entry);
    } catch (error) {
      console.error('Failed to load today\'s entry:', error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadTodayEntry();
    setIsRefreshing(false);
  };

  const getHealthScore = () => {
    if (!todayEntry) return 0;
    
    const sleepScore = todayEntry.sleep.quality_score;
    const moodScore = todayEntry.mood.mood_score;
    const stressScore = 10 - todayEntry.mood.stress_score; // Invert stress score
    const symptomScore = 10 - Math.max(
      todayEntry.symptoms.gi_flare,
      todayEntry.symptoms.skin_flare,
      todayEntry.symptoms.migraine
    );
    
    return Math.round((sleepScore + moodScore + stressScore + symptomScore) / 4);
  };

  const getHealthStatus = (score: number) => {
    if (score >= 8) return { status: 'Excellent', color: Theme.colors.excellent };
    if (score >= 6) return { status: 'Good', color: Theme.colors.good };
    if (score >= 4) return { status: 'Fair', color: Theme.colors.fair };
    if (score >= 2) return { status: 'Poor', color: Theme.colors.poor };
    return { status: 'Critical', color: Theme.colors.critical };
  };

  const healthScore = getHealthScore();
  const healthStatus = getHealthStatus(healthScore);

  const quickStats = [
    {
      title: 'Sleep Quality',
      value: todayEntry?.sleep.quality_score || 0,
      max: 10,
      icon: 'moon-outline',
      color: Theme.colors.primary,
    },
    {
      title: 'Mood',
      value: todayEntry?.mood.mood_score || 0,
      max: 10,
      icon: 'heart-outline',
      color: Theme.colors.secondary,
    },
    {
      title: 'Stress',
      value: todayEntry?.mood.stress_score || 0,
      max: 10,
      icon: 'flash-outline',
      color: Theme.colors.accent,
    },
  ];

  const recentEntries = entries.slice(0, 5);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sleep & Stress +</Text>
        <Text style={styles.headerSubtitle}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      {/* Health Score Card */}
      <View style={styles.healthScoreCard}>
        <Text style={styles.healthScoreTitle}>Today's Health Score</Text>
        <View style={styles.healthScoreContainer}>
          <Text style={[styles.healthScoreValue, { color: healthStatus.color }]}>
            {healthScore}/10
          </Text>
          <Text style={[styles.healthScoreStatus, { color: healthStatus.color }]}>
            {healthStatus.status}
          </Text>
        </View>
        
        {!todayEntry && (
          <TouchableOpacity 
            style={styles.startTrackingButton}
            onPress={() => navigation.navigate('TrackingHome')}
          >
            <Ionicons name="add-circle" size={20} color={Theme.colors.textInverse} />
            <Text style={styles.startTrackingText}>Start Today's Tracking</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Today's Metrics</Text>
        <View style={styles.statsGrid}>
          {quickStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                <Ionicons name={stat.icon as any} size={24} color={Theme.colors.textInverse} />
              </View>
              <Text style={styles.statValue}>{stat.value}/{stat.max}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('SleepTracking')}
          >
            <Ionicons name="moon-outline" size={32} color={Theme.colors.primary} />
            <Text style={styles.actionTitle}>Log Sleep</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('MoodTracking')}
          >
            <Ionicons name="heart-outline" size={32} color={Theme.colors.secondary} />
            <Text style={styles.actionTitle}>Log Mood</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('SymptomTracking')}
          >
            <Ionicons name="medical-outline" size={32} color={Theme.colors.accent} />
            <Text style={styles.actionTitle}>Log Symptoms</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('InsightsHome')}
          >
            <Ionicons name="analytics-outline" size={32} color={Theme.colors.primary} />
            <Text style={styles.actionTitle}>View Insights</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          
          {recentEntries.map((entry) => (
            <View key={entry.date} style={styles.recentCard}>
              <View style={styles.recentHeader}>
                <Text style={styles.recentDate}>
                  {new Date(entry.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: entry.date !== today ? 'numeric' : undefined
                  })}
                </Text>
                {entry.date === today && (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayBadgeText}>Today</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.recentMetrics}>
                <View style={styles.recentMetric}>
                  <Ionicons name="moon-outline" size={16} color={Theme.colors.primary} />
                  <Text style={styles.recentMetricText}>{entry.sleep.quality_score}/10</Text>
                </View>
                
                <View style={styles.recentMetric}>
                  <Ionicons name="heart-outline" size={16} color={Theme.colors.secondary} />
                  <Text style={styles.recentMetricText}>{entry.mood.mood_score}/10</Text>
                </View>
                
                <View style={styles.recentMetric}>
                  <Ionicons name="flash-outline" size={16} color={Theme.colors.accent} />
                  <Text style={styles.recentMetricText}>{entry.mood.stress_score}/10</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Insights Preview */}
      <View style={styles.insightsSection}>
        <View style={styles.insightsHeader}>
          <Text style={styles.sectionTitle}>Health Insights</Text>
          <TouchableOpacity onPress={() => navigation.navigate('InsightsHome')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.insightCard}>
          <Ionicons name="bulb-outline" size={24} color={Theme.colors.accent} />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Track Your Patterns</Text>
            <Text style={styles.insightDescription}>
              Keep logging daily to discover insights about your health patterns and correlations.
            </Text>
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
  healthScoreCard: {
    margin: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  healthScoreTitle: {
    ...Theme.typography.h6,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
  },
  healthScoreContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  healthScoreValue: {
    ...Theme.typography.h1,
    fontWeight: '700',
  },
  healthScoreStatus: {
    ...Theme.typography.h5,
    marginTop: Theme.spacing.xs,
  },
  startTrackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
  },
  startTrackingText: {
    ...Theme.typography.button,
    marginLeft: Theme.spacing.sm,
  },
  statsSection: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    ...Theme.typography.h5,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    marginHorizontal: Theme.spacing.xs,
    ...Theme.shadows.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
  },
  statValue: {
    ...Theme.typography.h4,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  statTitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  actionsSection: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.sm,
  },
  actionTitle: {
    ...Theme.typography.body2,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.sm,
    textAlign: 'center',
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
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  recentDate: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
  },
  todayBadge: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  todayBadgeText: {
    ...Theme.typography.caption,
    color: Theme.colors.textInverse,
  },
  recentMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  recentMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentMetricText: {
    ...Theme.typography.body2,
    color: Theme.colors.textPrimary,
    marginLeft: Theme.spacing.xs,
  },
  insightsSection: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  viewAllText: {
    ...Theme.typography.body2,
    color: Theme.colors.primary,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    ...Theme.shadows.sm,
  },
  insightContent: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  insightTitle: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  insightDescription: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
  },
});

