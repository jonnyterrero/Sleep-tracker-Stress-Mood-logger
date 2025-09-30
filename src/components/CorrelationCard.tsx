import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SleepCorrelation, HealthInsight } from '../services/correlationsService';
import { Theme } from '../constants/theme';

interface CorrelationCardProps {
  correlation?: SleepCorrelation;
  insight?: HealthInsight;
  onPress?: () => void;
}

export default function CorrelationCard({ correlation, insight, onPress }: CorrelationCardProps) {
  const data = correlation || insight;
  if (!data) return null;

  const getCorrelationIcon = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'trending-up';
      case 'moderate':
        return 'trending-up-outline';
      case 'weak':
        return 'remove-outline';
      default:
        return 'help-outline';
    }
  };

  const getCorrelationColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return Theme.colors.primary;
      case 'moderate':
        return Theme.colors.secondary;
      case 'weak':
        return Theme.colors.textTertiary;
      default:
        return Theme.colors.textSecondary;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'correlation':
        return 'analytics';
      case 'trend':
        return 'trending-up';
      case 'pattern':
        return 'pulse';
      case 'anomaly':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'correlation':
        return Theme.colors.primary;
      case 'trend':
        return Theme.colors.secondary;
      case 'pattern':
        return Theme.colors.accent;
      case 'anomaly':
        return Theme.colors.error;
      default:
        return Theme.colors.textSecondary;
    }
  };

  const renderCorrelation = () => {
    if (!correlation) return null;

    return (
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getCorrelationIcon(correlation.strength)}
              size={24}
              color={getCorrelationColor(correlation.strength)}
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {correlation.sleepMetric} ↔ {correlation.symptomMetric}
            </Text>
            <Text style={[styles.strength, { color: getCorrelationColor(correlation.strength) }]}>
              {correlation.strength.toUpperCase()} correlation
            </Text>
          </View>
          <View style={styles.correlationValue}>
            <Text style={[styles.correlationNumber, { color: getCorrelationColor(correlation.strength) }]}>
              {correlation.correlation.toFixed(2)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.description}>{correlation.description}</Text>
        
        {correlation.actionableInsight && (
          <View style={styles.insightContainer}>
            <Ionicons name="bulb" size={16} color={Theme.colors.accent} />
            <Text style={styles.insightText}>{correlation.actionableInsight}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderInsight = () => {
    if (!insight) return null;

    return (
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getInsightIcon(insight.type)}
              size={24}
              color={getInsightColor(insight.type)}
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{insight.title}</Text>
            <Text style={[styles.type, { color: getInsightColor(insight.type) }]}>
              {insight.type.toUpperCase()}
            </Text>
          </View>
          <View style={styles.confidenceContainer}>
            <Text style={[styles.confidence, { color: getInsightColor(insight.type) }]}>
              {Math.round(insight.confidence * 100)}%
            </Text>
          </View>
        </View>
        
        <Text style={styles.description}>{insight.description}</Text>
        
        {insight.recommendation && (
          <View style={styles.insightContainer}>
            <Ionicons name="bulb" size={16} color={Theme.colors.accent} />
            <Text style={styles.insightText}>{insight.recommendation}</Text>
          </View>
        )}
      </View>
    );
  };

  const CardContent = () => (
    <View style={styles.card}>
      {correlation ? renderCorrelation() : renderInsight()}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    margin: Theme.spacing.sm,
    ...Theme.shadows.md,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  strength: {
    ...Theme.typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  type: {
    ...Theme.typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  correlationValue: {
    alignItems: 'center',
  },
  correlationNumber: {
    ...Theme.typography.h5,
    fontWeight: '700',
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidence: {
    ...Theme.typography.h6,
    fontWeight: '700',
  },
  description: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
    lineHeight: 20,
  },
  insightContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Theme.colors.surfaceVariant,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  insightText: {
    ...Theme.typography.body2,
    color: Theme.colors.textPrimary,
    marginLeft: Theme.spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
});

