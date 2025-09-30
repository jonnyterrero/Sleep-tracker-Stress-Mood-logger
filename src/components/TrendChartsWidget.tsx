import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/theme';
import { HealthEntry } from '../types';

const { width } = Dimensions.get('window');
const chartWidth = width - 40;

interface TrendChartsWidgetProps {
  healthData: HealthEntry[];
  timeRange: 'week' | 'month' | 'quarter';
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

export default function TrendChartsWidget({ healthData, timeRange }: TrendChartsWidgetProps) {
  const [selectedMetric, setSelectedMetric] = useState<'sleep' | 'mood' | 'stress' | 'symptoms'>('sleep');
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    generateChartData();
  }, [healthData, timeRange, selectedMetric]);

  const generateChartData = () => {
    if (!healthData || healthData.length === 0) {
      setChartData(null);
      return;
    }

    // Filter data based on time range
    const filteredData = filterDataByTimeRange(healthData, timeRange);
    
    // Sort by date
    const sortedData = filteredData.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const labels = generateLabels(sortedData, timeRange);
    const data = extractMetricData(sortedData, selectedMetric);

    setChartData({
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => getMetricColor(selectedMetric, opacity),
        strokeWidth: 3,
      }],
    });
  };

  const filterDataByTimeRange = (data: HealthEntry[], range: 'week' | 'month' | 'quarter'): HealthEntry[] => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (range) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
    }

    return data.filter(entry => new Date(entry.date) >= cutoffDate);
  };

  const generateLabels = (data: HealthEntry[], range: 'week' | 'month' | 'quarter'): string[] => {
    if (data.length === 0) return [];

    switch (range) {
      case 'week':
        return data.map(entry => {
          const date = new Date(entry.date);
          return date.toLocaleDateString('en-US', { weekday: 'short' });
        });
      case 'month':
        return data.map(entry => {
          const date = new Date(entry.date);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });
      case 'quarter':
        return data.map(entry => {
          const date = new Date(entry.date);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });
      default:
        return [];
    }
  };

  const extractMetricData = (data: HealthEntry[], metric: string): number[] => {
    return data.map(entry => {
      switch (metric) {
        case 'sleep':
          return entry.sleep?.duration_hours || 0;
        case 'mood':
          return entry.mood?.mood_score || 0;
        case 'stress':
          return entry.mood?.stress_score || 0;
        case 'symptoms':
          return (entry.symptoms?.gi_flare || 0) + (entry.symptoms?.skin_flare || 0) + (entry.symptoms?.migraine || 0);
        default:
          return 0;
      }
    });
  };

  const getMetricColor = (metric: string, opacity: number): string => {
    const colors = {
      sleep: `rgba(59, 130, 246, ${opacity})`, // Blue
      mood: `rgba(34, 197, 94, ${opacity})`, // Green
      stress: `rgba(239, 68, 68, ${opacity})`, // Red
      symptoms: `rgba(168, 85, 247, ${opacity})`, // Purple
    };
    return colors[metric as keyof typeof colors] || `rgba(107, 114, 128, ${opacity})`;
  };

  const getMetricInfo = (metric: string) => {
    const info = {
      sleep: {
        title: 'Sleep Duration',
        unit: 'hours',
        icon: 'moon',
        color: Theme.colors.primary,
        description: 'Average hours of sleep per night',
      },
      mood: {
        title: 'Mood Score',
        unit: '/10',
        icon: 'happy',
        color: Theme.colors.success,
        description: 'Daily mood rating (1-10)',
      },
      stress: {
        title: 'Stress Level',
        unit: '/10',
        icon: 'flash',
        color: Theme.colors.warning,
        description: 'Daily stress rating (1-10)',
      },
      symptoms: {
        title: 'Symptom Severity',
        unit: '/30',
        icon: 'medical',
        color: Theme.colors.error,
        description: 'Combined symptom severity',
      },
    };
    return info[metric as keyof typeof info];
  };

  const calculateTrend = (data: number[]): { direction: 'up' | 'down' | 'stable'; percentage: number } => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 };

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const percentage = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (Math.abs(percentage) < 5) {
      return { direction: 'stable', percentage: Math.abs(percentage) };
    }
    
    return {
      direction: percentage > 0 ? 'up' : 'down',
      percentage: Math.abs(percentage),
    };
  };

  const renderChart = () => {
    if (!chartData || chartData.datasets[0].data.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Ionicons name="bar-chart" size={48} color={Theme.colors.textTertiary} />
          <Text style={styles.noDataText}>No data available for this period</Text>
        </View>
      );
    }

    const metricInfo = getMetricInfo(selectedMetric);
    const trend = calculateTrend(chartData.datasets[0].data);

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <View style={styles.metricInfo}>
            <Ionicons name={metricInfo.icon as any} size={24} color={metricInfo.color} />
            <View style={styles.metricDetails}>
              <Text style={styles.metricTitle}>{metricInfo.title}</Text>
              <Text style={styles.metricDescription}>{metricInfo.description}</Text>
            </View>
          </View>
          
          <View style={styles.trendIndicator}>
            <Ionicons
              name={trend.direction === 'up' ? 'trending-up' : trend.direction === 'down' ? 'trending-down' : 'remove'}
              size={20}
              color={trend.direction === 'up' ? Theme.colors.success : trend.direction === 'down' ? Theme.colors.error : Theme.colors.textSecondary}
            />
            <Text style={[
              styles.trendText,
              { color: trend.direction === 'up' ? Theme.colors.success : trend.direction === 'down' ? Theme.colors.error : Theme.colors.textSecondary }
            ]}>
              {trend.percentage.toFixed(1)}%
            </Text>
          </View>
        </View>

        <LineChart
          data={chartData}
          width={chartWidth}
          height={220}
          chartConfig={{
            backgroundColor: Theme.colors.surface,
            backgroundGradientFrom: Theme.colors.surface,
            backgroundGradientTo: Theme.colors.surface,
            decimalPlaces: 1,
            color: (opacity = 1) => getMetricColor(selectedMetric, opacity),
            labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
            style: {
              borderRadius: Theme.borderRadius.md,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: getMetricColor(selectedMetric, 1),
            },
            propsForBackgroundLines: {
              strokeDasharray: '5,5',
              stroke: Theme.colors.border,
              strokeWidth: 1,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const metrics = [
    { key: 'sleep', label: 'Sleep', icon: 'moon' },
    { key: 'mood', label: 'Mood', icon: 'happy' },
    { key: 'stress', label: 'Stress', icon: 'flash' },
    { key: 'symptoms', label: 'Symptoms', icon: 'medical' },
  ] as const;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trend Analysis</Text>
        <View style={styles.timeRangeSelector}>
          {(['week', 'month', 'quarter'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => {/* Handle time range change */}}
            >
              <Text style={[
                styles.timeRangeButtonText,
                timeRange === range && styles.timeRangeButtonTextActive,
              ]}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.metricSelector}>
        {metrics.map((metric) => (
          <TouchableOpacity
            key={metric.key}
            style={[
              styles.metricButton,
              selectedMetric === metric.key && styles.metricButtonActive,
            ]}
            onPress={() => setSelectedMetric(metric.key as any)}
          >
            <Ionicons
              name={metric.icon as any}
              size={20}
              color={selectedMetric === metric.key ? Theme.colors.surface : Theme.colors.textSecondary}
            />
            <Text style={[
              styles.metricButtonText,
              selectedMetric === metric.key && styles.metricButtonTextActive,
            ]}>
              {metric.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderChart()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginVertical: Theme.spacing.md,
    ...Theme.shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  title: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    padding: 2,
  },
  timeRangeButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
  },
  timeRangeButtonActive: {
    backgroundColor: Theme.colors.primary,
  },
  timeRangeButtonText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  timeRangeButtonTextActive: {
    color: Theme.colors.surface,
  },
  metricSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.lg,
  },
  metricButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.sm,
    marginHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surfaceVariant,
  },
  metricButtonActive: {
    backgroundColor: Theme.colors.primary,
  },
  metricButtonText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    marginLeft: Theme.spacing.xs,
  },
  metricButtonTextActive: {
    color: Theme.colors.surface,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: Theme.spacing.md,
  },
  metricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricDetails: {
    marginLeft: Theme.spacing.sm,
  },
  metricTitle: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
  },
  metricDescription: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    ...Theme.typography.caption,
    fontWeight: '600',
    marginLeft: Theme.spacing.xs,
  },
  chart: {
    marginVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  noDataText: {
    ...Theme.typography.body1,
    color: Theme.colors.textTertiary,
    marginTop: Theme.spacing.md,
    textAlign: 'center',
  },
});

