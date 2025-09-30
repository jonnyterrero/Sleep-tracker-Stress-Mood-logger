import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../constants/theme';
import { insightsService } from '../../services/insightsService';
import { HealthInsight } from '../../types';

export default function HealthInsightsScreen() {
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);

  useEffect(() => {
    loadAnalyticsSummary();
  }, []);

  const loadAnalyticsSummary = async () => {
    try {
      const summary = await insightsService.getAnalyticsSummary();
      setAnalyticsSummary(summary);
    } catch (error) {
      console.error('Failed to load analytics summary:', error);
    }
  };

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const newInsights = await insightsService.generateInsights();
      setInsights(newInsights);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate insights. Please try again.');
      console.error('Insights generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'correlation':
        return 'link-outline';
      case 'model_performance':
        return 'analytics-outline';
      case 'feature_importance':
        return 'trending-up-outline';
      default:
        return 'bulb-outline';
    }
  };

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return Theme.colors.error;
      case 'medium':
        return Theme.colors.accent;
      case 'low':
        return Theme.colors.primary;
      default:
        return Theme.colors.primary;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sleep & Stress Insights</Text>
        <Text style={styles.headerSubtitle}>
          AI-powered analysis of your sleep and stress patterns
        </Text>
      </View>

      {/* Analytics Summary */}
      {analyticsSummary && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Data Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{analyticsSummary.total_entries}</Text>
              <Text style={styles.summaryStatLabel}>Total Entries</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>
                {analyticsSummary.analysis_available ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.summaryStatLabel}>Analysis Ready</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>
                {analyticsSummary.prediction_available ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.summaryStatLabel}>Predictions Ready</Text>
            </View>
          </View>
        </View>
      )}

      {/* Generate Insights Button */}
      <TouchableOpacity 
        style={[styles.generateButton, isLoading && styles.generateButtonDisabled]}
        onPress={generateInsights}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Theme.colors.textInverse} />
        ) : (
          <Ionicons name="bulb-outline" size={20} color={Theme.colors.textInverse} />
        )}
        <Text style={styles.generateButtonText}>
          {isLoading ? 'Generating Insights...' : 'Generate AI Insights'}
        </Text>
      </TouchableOpacity>

      {/* Insights List */}
      {insights.length > 0 && (
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Generated Insights</Text>
          
          {insights.map((insight) => (
            <View key={insight.id} style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <View style={[styles.insightIcon, { backgroundColor: getInsightColor(insight.priority) }]}>
                  <Ionicons name={getInsightIcon(insight.type) as any} size={20} color={Theme.colors.textInverse} />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightDescription}>{insight.description}</Text>
                </View>
                <View style={styles.insightMeta}>
                  <Text style={[styles.insightPriority, { color: getInsightColor(insight.priority) }]}>
                    {insight.priority.toUpperCase()}
                  </Text>
                  <Text style={styles.insightConfidence}>
                    {(insight.confidence * 100).toFixed(0)}% confidence
                  </Text>
                </View>
              </View>
              
              {insight.actionable && (
                <View style={styles.actionableIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color={Theme.colors.success} />
                  <Text style={styles.actionableText}>Actionable</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* No Insights State */}
      {insights.length === 0 && !isLoading && (
        <View style={styles.emptyState}>
          <Ionicons name="bulb-outline" size={64} color={Theme.colors.textTertiary} />
          <Text style={styles.emptyStateTitle}>No Insights Yet</Text>
          <Text style={styles.emptyStateText}>
            {analyticsSummary?.total_entries < 3 
              ? 'Add at least 3 entries to generate insights'
              : 'Tap "Generate AI Insights" to analyze your data'
            }
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
  summaryCard: {
    margin: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.md,
  },
  summaryTitle: {
    ...Theme.typography.h5,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryStatValue: {
    ...Theme.typography.h4,
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  summaryStatLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
    textAlign: 'center',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary,
    margin: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
  },
  generateButtonDisabled: {
    backgroundColor: Theme.colors.textTertiary,
  },
  generateButtonText: {
    ...Theme.typography.button,
    color: Theme.colors.textInverse,
    marginLeft: Theme.spacing.sm,
  },
  insightsSection: {
    paddingHorizontal: Theme.spacing.lg,
  },
  sectionTitle: {
    ...Theme.typography.h5,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  insightCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.sm,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  insightDescription: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
  },
  insightMeta: {
    alignItems: 'flex-end',
  },
  insightPriority: {
    ...Theme.typography.caption,
    fontWeight: '600',
    marginBottom: Theme.spacing.xs,
  },
  insightConfidence: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
  },
  actionableIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  actionableText: {
    ...Theme.typography.caption,
    color: Theme.colors.success,
    marginLeft: Theme.spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
    marginTop: Theme.spacing.xl,
  },
  emptyStateTitle: {
    ...Theme.typography.h5,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  emptyStateText: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

