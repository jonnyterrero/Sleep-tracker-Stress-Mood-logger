import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HealthEntrySchema } from '../types';
import { Theme } from '../constants/theme';

interface SleepAnalyticsProps {
  entries: HealthEntrySchema[];
}

export default function SleepAnalytics({ entries }: SleepAnalyticsProps) {
  if (entries.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Sleep Analytics</Text>
        <View style={styles.emptyContainer}>
          <Ionicons name="moon-outline" size={48} color={Theme.colors.textTertiary} />
          <Text style={styles.emptyText}>No sleep data available</Text>
        </View>
      </View>
    );
  }

  const sleepData = entries.map(entry => ({
    date: entry.date,
    duration: entry.sleep.duration_hours,
    quality: entry.sleep.quality_score,
    startTime: entry.sleep.start_time,
    endTime: entry.sleep.end_time,
  }));

  // Calculate analytics
  const avgDuration = sleepData.reduce((sum, s) => sum + s.duration, 0) / sleepData.length;
  const avgQuality = sleepData.reduce((sum, s) => sum + s.quality, 0) / sleepData.length;
  const consistency = calculateConsistency(sleepData);
  const bedtimeDrift = calculateBedtimeDrift(sleepData);
  const sleepEfficiency = calculateSleepEfficiency(sleepData);

  const getDurationRating = (duration: number) => {
    if (duration >= 8) return { rating: 'Excellent', color: Theme.colors.excellent };
    if (duration >= 7) return { rating: 'Good', color: Theme.colors.good };
    if (duration >= 6) return { rating: 'Fair', color: Theme.colors.fair };
    if (duration >= 5) return { rating: 'Poor', color: Theme.colors.poor };
    return { rating: 'Very Poor', color: Theme.colors.critical };
  };

  const getQualityRating = (quality: number) => {
    if (quality >= 8) return { rating: 'Excellent', color: Theme.colors.excellent };
    if (quality >= 6) return { rating: 'Good', color: Theme.colors.good };
    if (quality >= 4) return { rating: 'Fair', color: Theme.colors.fair };
    if (quality >= 2) return { rating: 'Poor', color: Theme.colors.poor };
    return { rating: 'Very Poor', color: Theme.colors.critical };
  };

  const durationRating = getDurationRating(avgDuration);
  const qualityRating = getQualityRating(avgQuality);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Sleep Analytics</Text>
      
      {/* Key Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="time-outline" size={24} color={Theme.colors.primary} />
            <Text style={styles.metricTitle}>Avg Duration</Text>
          </View>
          <Text style={[styles.metricValue, { color: durationRating.color }]}>
            {avgDuration.toFixed(1)}h
          </Text>
          <Text style={[styles.metricRating, { color: durationRating.color }]}>
            {durationRating.rating}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="star-outline" size={24} color={Theme.colors.secondary} />
            <Text style={styles.metricTitle}>Avg Quality</Text>
          </View>
          <Text style={[styles.metricValue, { color: qualityRating.color }]}>
            {avgQuality.toFixed(1)}/10
          </Text>
          <Text style={[styles.metricRating, { color: qualityRating.color }]}>
            {qualityRating.rating}
          </Text>
        </View>
      </View>

      {/* Consistency Analysis */}
      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>Sleep Consistency</Text>
        <View style={styles.analysisRow}>
          <Text style={styles.analysisLabel}>Schedule Consistency:</Text>
          <Text style={[styles.analysisValue, { color: consistency.color }]}>
            {consistency.rating}
          </Text>
        </View>
        <Text style={styles.analysisDescription}>
          {consistency.description}
        </Text>
      </View>

      {/* Bedtime Drift */}
      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>Bedtime Patterns</Text>
        <View style={styles.analysisRow}>
          <Text style={styles.analysisLabel}>Bedtime Drift:</Text>
          <Text style={[styles.analysisValue, { color: bedtimeDrift.color }]}>
            {bedtimeDrift.rating}
          </Text>
        </View>
        <Text style={styles.analysisDescription}>
          {bedtimeDrift.description}
        </Text>
      </View>

      {/* Sleep Efficiency */}
      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>Sleep Efficiency</Text>
        <View style={styles.analysisRow}>
          <Text style={styles.analysisLabel}>Efficiency Score:</Text>
          <Text style={[styles.analysisValue, { color: sleepEfficiency.color }]}>
            {sleepEfficiency.rating}
          </Text>
        </View>
        <Text style={styles.analysisDescription}>
          {sleepEfficiency.description}
        </Text>
      </View>

      {/* Recent Sleep Trends */}
      <View style={styles.trendsCard}>
        <Text style={styles.trendsTitle}>Recent Trends</Text>
        {getRecentTrends(sleepData).map((trend, index) => (
          <View key={index} style={styles.trendItem}>
            <Ionicons 
              name={trend.icon} 
              size={20} 
              color={trend.color} 
            />
            <Text style={styles.trendText}>{trend.text}</Text>
          </View>
        ))}
      </View>

      {/* Sleep Recommendations */}
      <View style={styles.recommendationsCard}>
        <Text style={styles.recommendationsTitle}>Recommendations</Text>
        {getSleepRecommendations(avgDuration, avgQuality, consistency, bedtimeDrift).map((rec, index) => (
          <View key={index} style={styles.recommendationItem}>
            <Ionicons name="bulb" size={16} color={Theme.colors.accent} />
            <Text style={styles.recommendationText}>{rec}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// Helper functions
function calculateConsistency(sleepData: any[]) {
  if (sleepData.length < 3) {
    return {
      rating: 'Insufficient Data',
      color: Theme.colors.textTertiary,
      description: 'Need at least 3 days of data to analyze consistency.'
    };
  }

  const durations = sleepData.map(s => s.duration);
  const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev <= 0.5) {
    return {
      rating: 'Excellent',
      color: Theme.colors.excellent,
      description: 'Your sleep schedule is very consistent. Keep it up!'
    };
  } else if (stdDev <= 1.0) {
    return {
      rating: 'Good',
      color: Theme.colors.good,
      description: 'Your sleep schedule is fairly consistent with minor variations.'
    };
  } else if (stdDev <= 1.5) {
    return {
      rating: 'Fair',
      color: Theme.colors.fair,
      description: 'Your sleep schedule has moderate variations. Try to maintain more consistent bedtimes.'
    };
  } else {
    return {
      rating: 'Poor',
      color: Theme.colors.poor,
      description: 'Your sleep schedule is inconsistent. Focus on maintaining regular bedtimes and wake times.'
    };
  }
}

function calculateBedtimeDrift(sleepData: any[]) {
  if (sleepData.length < 3) {
    return {
      rating: 'Insufficient Data',
      color: Theme.colors.textTertiary,
      description: 'Need at least 3 days of data to analyze bedtime patterns.'
    };
  }

  const bedtimes = sleepData.map(s => {
    const [hours, minutes] = s.startTime.split(':').map(Number);
    return hours + minutes / 60;
  });

  const avgBedtime = bedtimes.reduce((sum, b) => sum + b, 0) / bedtimes.length;
  const variance = bedtimes.reduce((sum, b) => sum + Math.pow(b - avgBedtime, 2), 0) / bedtimes.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev <= 0.5) {
    return {
      rating: 'Excellent',
      color: Theme.colors.excellent,
      description: 'Your bedtime is very consistent. This helps regulate your circadian rhythm.'
    };
  } else if (stdDev <= 1.0) {
    return {
      rating: 'Good',
      color: Theme.colors.good,
      description: 'Your bedtime is fairly consistent with minor variations.'
    };
  } else if (stdDev <= 1.5) {
    return {
      rating: 'Fair',
      color: Theme.colors.fair,
      description: 'Your bedtime varies moderately. Try to go to bed at the same time each night.'
    };
  } else {
    return {
      rating: 'Poor',
      color: Theme.colors.poor,
      description: 'Your bedtime varies significantly. Establish a consistent bedtime routine.'
    };
  }
}

function calculateSleepEfficiency(sleepData: any[]) {
  if (sleepData.length === 0) {
    return {
      rating: 'No Data',
      color: Theme.colors.textTertiary,
      description: 'No sleep data available for analysis.'
    };
  }

  const avgDuration = sleepData.reduce((sum, s) => sum + s.duration, 0) / sleepData.length;
  const avgQuality = sleepData.reduce((sum, s) => sum + s.quality, 0) / sleepData.length;
  
  // Simple efficiency calculation based on duration and quality
  const efficiency = (avgDuration / 8) * (avgQuality / 10) * 100;

  if (efficiency >= 80) {
    return {
      rating: 'Excellent',
      color: Theme.colors.excellent,
      description: 'Your sleep efficiency is excellent. You\'re getting quality rest.'
    };
  } else if (efficiency >= 65) {
    return {
      rating: 'Good',
      color: Theme.colors.good,
      description: 'Your sleep efficiency is good with room for minor improvements.'
    };
  } else if (efficiency >= 50) {
    return {
      rating: 'Fair',
      color: Theme.colors.fair,
      description: 'Your sleep efficiency is fair. Focus on both duration and quality.'
    };
  } else {
    return {
      rating: 'Poor',
      color: Theme.colors.poor,
      description: 'Your sleep efficiency needs improvement. Prioritize sleep hygiene.'
    };
  }
}

function getRecentTrends(sleepData: any[]) {
  if (sleepData.length < 2) return [];

  const trends = [];
  const recent = sleepData.slice(-3);
  const previous = sleepData.slice(-6, -3);

  if (recent.length >= 2 && previous.length >= 2) {
    const recentAvgDuration = recent.reduce((sum, s) => sum + s.duration, 0) / recent.length;
    const previousAvgDuration = previous.reduce((sum, s) => sum + s.duration, 0) / previous.length;
    
    if (recentAvgDuration > previousAvgDuration + 0.5) {
      trends.push({
        icon: 'trending-up',
        color: Theme.colors.excellent,
        text: 'Sleep duration is improving'
      });
    } else if (recentAvgDuration < previousAvgDuration - 0.5) {
      trends.push({
        icon: 'trending-down',
        color: Theme.colors.poor,
        text: 'Sleep duration is declining'
      });
    }

    const recentAvgQuality = recent.reduce((sum, s) => sum + s.quality, 0) / recent.length;
    const previousAvgQuality = previous.reduce((sum, s) => sum + s.quality, 0) / previous.length;
    
    if (recentAvgQuality > previousAvgQuality + 0.5) {
      trends.push({
        icon: 'star',
        color: Theme.colors.excellent,
        text: 'Sleep quality is improving'
      });
    } else if (recentAvgQuality < previousAvgQuality - 0.5) {
      trends.push({
        icon: 'star-outline',
        color: Theme.colors.poor,
        text: 'Sleep quality is declining'
      });
    }
  }

  return trends;
}

function getSleepRecommendations(avgDuration: number, avgQuality: number, consistency: any, bedtimeDrift: any) {
  const recommendations = [];

  if (avgDuration < 7) {
    recommendations.push('Aim for 7-9 hours of sleep per night for optimal health');
  }

  if (avgQuality < 6) {
    recommendations.push('Improve sleep quality by creating a relaxing bedtime routine');
  }

  if (consistency.rating === 'Poor' || consistency.rating === 'Fair') {
    recommendations.push('Maintain a consistent sleep schedule, even on weekends');
  }

  if (bedtimeDrift.rating === 'Poor' || bedtimeDrift.rating === 'Fair') {
    recommendations.push('Go to bed at the same time each night to regulate your circadian rhythm');
  }

  if (recommendations.length === 0) {
    recommendations.push('Your sleep habits look great! Keep maintaining your current routine');
  }

  return recommendations;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  title: {
    ...Theme.typography.h4,
    color: Theme.colors.textPrimary,
    margin: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.sm,
  },
  emptyText: {
    ...Theme.typography.body1,
    color: Theme.colors.textTertiary,
    marginTop: Theme.spacing.md,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    marginHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  metricTitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginLeft: Theme.spacing.xs,
  },
  metricValue: {
    ...Theme.typography.h3,
    fontWeight: '700',
    marginBottom: Theme.spacing.xs,
  },
  metricRating: {
    ...Theme.typography.caption,
    fontWeight: '600',
  },
  analysisCard: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.md,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.md,
  },
  analysisTitle: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  analysisLabel: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
  },
  analysisValue: {
    ...Theme.typography.body1,
    fontWeight: '600',
  },
  analysisDescription: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
  },
  trendsCard: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.md,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.md,
  },
  trendsTitle: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  trendText: {
    ...Theme.typography.body2,
    color: Theme.colors.textPrimary,
    marginLeft: Theme.spacing.sm,
  },
  recommendationsCard: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.md,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.md,
  },
  recommendationsTitle: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  recommendationText: {
    ...Theme.typography.body2,
    color: Theme.colors.textPrimary,
    marginLeft: Theme.spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
});

