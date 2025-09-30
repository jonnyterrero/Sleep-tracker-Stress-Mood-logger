import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Theme } from '../../constants/theme';
import { MainStackParamList } from '../../types';
import { healthService } from '../../services/healthService';
import { correlationsService, SleepCorrelation, HealthInsight } from '../../services/correlationsService';
import { HealthEntrySchema } from '../../types';
import CorrelationCard from '../../components/CorrelationCard';
import HealthChart from '../../components/HealthChart';

type CorrelationsNavigationProp = StackNavigationProp<MainStackParamList, 'HealthInsights'>;

export default function CorrelationsScreen() {
  const navigation = useNavigation<CorrelationsNavigationProp>();
  const [entries, setEntries] = useState<HealthEntrySchema[]>([]);
  const [correlations, setCorrelations] = useState<SleepCorrelation[]>([]);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadData();
  }, [selectedTimeframe]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await healthService.getAllEntries();
      
      // Filter data based on selected timeframe
      const filteredData = filterDataByTimeframe(data, selectedTimeframe);
      setEntries(filteredData);

      // Generate correlations and insights
      const correlationReport = correlationsService.getCorrelationReport(filteredData);
      setCorrelations(correlationReport.correlations);
      setInsights(correlationReport.insights);
    } catch (error) {
      console.error('Failed to load correlation data:', error);
      Alert.alert('Error', 'Failed to load correlation data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterDataByTimeframe = (data: HealthEntrySchema[], timeframe: string): HealthEntrySchema[] => {
    const now = new Date();
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return data.filter(entry => new Date(entry.date) >= cutoffDate);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      default: return 'Last 30 days';
    }
  };

  const renderTimeframeSelector = () => (
    <View style={styles.timeframeContainer}>
      <Text style={styles.timeframeLabel}>Time Period:</Text>
      <View style={styles.timeframeButtons}>
        {(['7d', '30d', '90d'] as const).map((timeframe) => (
          <TouchableOpacity
            key={timeframe}
            style={[
              styles.timeframeButton,
              selectedTimeframe === timeframe && styles.timeframeButtonActive,
            ]}
            onPress={() => setSelectedTimeframe(timeframe)}
          >
            <Text
              style={[
                styles.timeframeButtonText,
                selectedTimeframe === timeframe && styles.timeframeButtonTextActive,
              ]}
            >
              {timeframe.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSummary = () => {
    if (entries.length === 0) return null;

    const avgSleepDuration = entries.reduce((sum, e) => sum + e.sleep.duration_hours, 0) / entries.length;
    const avgSleepQuality = entries.reduce((sum, e) => sum + e.sleep.quality_score, 0) / entries.length;
    const avgMood = entries.reduce((sum, e) => sum + e.mood.mood_score, 0) / entries.length;
    const avgStress = entries.reduce((sum, e) => sum + e.mood.stress_score, 0) / entries.length;

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Health Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{avgSleepDuration.toFixed(1)}h</Text>
            <Text style={styles.summaryLabel}>Avg Sleep</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{avgSleepQuality.toFixed(1)}/10</Text>
            <Text style={styles.summaryLabel}>Sleep Quality</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{avgMood.toFixed(1)}/10</Text>
            <Text style={styles.summaryLabel}>Mood</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{avgStress.toFixed(1)}/10</Text>
            <Text style={styles.summaryLabel}>Stress</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCharts = () => (
    <View style={styles.chartsContainer}>
      <Text style={styles.sectionTitle}>Trends</Text>
      <HealthChart
        data={entries}
        type="line"
        metric="sleep_duration"
        title="Sleep Duration"
        color={Theme.colors.primary}
      />
      <HealthChart
        data={entries}
        type="line"
        metric="sleep_quality"
        title="Sleep Quality"
        color={Theme.colors.secondary}
      />
      <HealthChart
        data={entries}
        type="line"
        metric="mood"
        title="Mood"
        color={Theme.colors.accent}
      />
      <HealthChart
        data={entries}
        type="line"
        metric="stress"
        title="Stress"
        color={Theme.colors.error}
      />
    </View>
  );

  const renderCorrelations = () => {
    if (correlations.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={48} color={Theme.colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Correlations Found</Text>
          <Text style={styles.emptyText}>
            Track your health data for at least a week to see correlations between sleep and symptoms.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.correlationsContainer}>
        <Text style={styles.sectionTitle}>Sleep & Symptom Correlations</Text>
        {correlations.map((correlation, index) => (
          <CorrelationCard
            key={`${correlation.sleepMetric}-${correlation.symptomMetric}-${index}`}
            correlation={correlation}
          />
        ))}
      </View>
    );
  };

  const renderInsights = () => {
    if (insights.length === 0) return null;

    return (
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>Health Insights</Text>
        {insights.map((insight, index) => (
          <CorrelationCard
            key={`${insight.type}-${insight.title}-${index}`}
            insight={insight}
          />
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Analyzing your health data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Correlations & Insights</Text>
        <View style={styles.placeholder} />
      </View>

      {renderTimeframeSelector()}
      {renderSummary()}
      {renderCharts()}
      {renderCorrelations()}
      {renderInsights()}

      {/* Data Requirements */}
      {entries.length < 7 && (
        <View style={styles.requirementsContainer}>
          <Ionicons name="information-circle" size={24} color={Theme.colors.accent} />
          <Text style={styles.requirementsText}>
            Track your health data for at least 7 days to unlock personalized insights and correlations.
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  loadingText: {
    ...Theme.typography.body1,
    color: Theme.colors.textSecondary,
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
  timeframeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.sm,
  },
  timeframeLabel: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
  },
  timeframeButtons: {
    flexDirection: 'row',
  },
  timeframeButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    marginLeft: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surfaceVariant,
  },
  timeframeButtonActive: {
    backgroundColor: Theme.colors.primary,
  },
  timeframeButtonText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  timeframeButtonTextActive: {
    color: Theme.colors.textInverse,
  },
  summaryContainer: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.md,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.md,
  },
  summaryTitle: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    ...Theme.typography.h4,
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  summaryLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  sectionTitle: {
    ...Theme.typography.h5,
    color: Theme.colors.textPrimary,
    margin: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  chartsContainer: {
    marginBottom: Theme.spacing.lg,
  },
  correlationsContainer: {
    marginBottom: Theme.spacing.lg,
  },
  insightsContainer: {
    marginBottom: Theme.spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.sm,
  },
  emptyTitle: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  emptyText: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  requirementsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceVariant,
    padding: Theme.spacing.md,
    margin: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  requirementsText: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginLeft: Theme.spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
});

