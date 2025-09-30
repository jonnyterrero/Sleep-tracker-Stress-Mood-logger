import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { HealthEntrySchema } from '../types';
import { Theme } from '../constants/theme';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 40;

interface HealthChartProps {
  data: HealthEntrySchema[];
  type: 'line' | 'bar';
  metric: 'sleep_duration' | 'sleep_quality' | 'mood' | 'stress' | 'gi_flare' | 'skin_flare' | 'migraine';
  title: string;
  color?: string;
  showCorrelation?: boolean;
  correlationData?: number[];
}

export default function HealthChart({
  data,
  type,
  metric,
  title,
  color = Theme.colors.primary,
  showCorrelation = false,
  correlationData,
}: HealthChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      </View>
    );
  }

  // Prepare chart data
  const chartData = prepareChartData(data, metric);
  const chartConfig = {
    backgroundColor: Theme.colors.surface,
    backgroundGradientFrom: Theme.colors.surface,
    backgroundGradientTo: Theme.colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => color + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: (opacity = 1) => Theme.colors.textSecondary + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: color,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: Theme.colors.border,
      strokeWidth: 1,
    },
  };

  const renderChart = () => {
    if (type === 'line') {
      return (
        <LineChart
          data={chartData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withDots={true}
          withShadow={false}
          withScrollableDot={true}
        />
      );
    } else {
      return (
        <BarChart
          data={chartData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          showValuesOnTopOfBars={false}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {renderChart()}
      {showCorrelation && correlationData && (
        <View style={styles.correlationContainer}>
          <Text style={styles.correlationText}>
            Correlation: {correlationData[0]?.toFixed(3) || 'N/A'}
          </Text>
        </View>
      )}
    </View>
  );
}

function prepareChartData(data: HealthEntrySchema[], metric: string) {
  const labels = data.map((entry, index) => {
    const date = new Date(entry.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const values = data.map(entry => {
    switch (metric) {
      case 'sleep_duration':
        return entry.sleep.duration_hours;
      case 'sleep_quality':
        return entry.sleep.quality_score;
      case 'mood':
        return entry.mood.mood_score;
      case 'stress':
        return entry.mood.stress_score;
      case 'gi_flare':
        return entry.symptoms.gi_flare;
      case 'skin_flare':
        return entry.symptoms.skin_flare;
      case 'migraine':
        return entry.symptoms.migraine;
      default:
        return 0;
    }
  });

  // Limit to last 14 days for better readability
  const recentData = data.slice(-14);
  const recentLabels = labels.slice(-14);
  const recentValues = values.slice(-14);

  return {
    labels: recentLabels,
    datasets: [
      {
        data: recentValues,
        color: (opacity = 1) => Theme.colors.primary + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
        strokeWidth: 2,
      },
    ],
  };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    margin: Theme.spacing.md,
    ...Theme.shadows.md,
  },
  title: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    ...Theme.typography.body1,
    color: Theme.colors.textTertiary,
  },
  correlationContainer: {
    marginTop: Theme.spacing.sm,
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.sm,
  },
  correlationText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
});

