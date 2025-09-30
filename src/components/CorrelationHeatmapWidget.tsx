import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/theme';
import { HealthEntry } from '../types';

const { width } = Dimensions.get('window');
const cellSize = (width - 80) / 7; // 7 days per week

interface CorrelationHeatmapWidgetProps {
  healthData: HealthEntry[];
  metric: 'gi_flare' | 'skin_flare' | 'migraine' | 'stress' | 'mood' | 'sleep_quality';
}

interface HeatmapData {
  [key: string]: {
    value: number;
    date: string;
    dayOfWeek: number;
    weekNumber: number;
  };
}

export default function CorrelationHeatmapWidget({ healthData, metric }: CorrelationHeatmapWidgetProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData>({});
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    generateHeatmapData();
  }, [healthData, metric]);

  const generateHeatmapData = () => {
    if (!healthData || healthData.length === 0) {
      setHeatmapData({});
      return;
    }

    const data: HeatmapData = {};
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 90); // Last 90 days

    // Initialize all days with 0 values
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const weekNumber = Math.floor((d.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      data[dateStr] = {
        value: 0,
        date: dateStr,
        dayOfWeek,
        weekNumber,
      };
    }

    // Fill in actual data
    healthData.forEach(entry => {
      const dateStr = entry.date;
      if (data[dateStr]) {
        let value = 0;
        
        switch (metric) {
          case 'gi_flare':
            value = entry.symptoms?.gi_flare || 0;
            break;
          case 'skin_flare':
            value = entry.symptoms?.skin_flare || 0;
            break;
          case 'migraine':
            value = entry.symptoms?.migraine || 0;
            break;
          case 'stress':
            value = entry.mood?.stress_score || 0;
            break;
          case 'mood':
            value = entry.mood?.mood_score || 0;
            break;
          case 'sleep_quality':
            value = entry.sleep?.quality_score || 0;
            break;
        }
        
        data[dateStr].value = value;
      }
    });

    setHeatmapData(data);
  };

  const getMetricInfo = () => {
    const info = {
      gi_flare: { title: 'GI Flare-ups', color: Theme.colors.error, icon: 'medical' },
      skin_flare: { title: 'Skin Flare-ups', color: Theme.colors.warning, icon: 'body' },
      migraine: { title: 'Migraines', color: Theme.colors.primary, icon: 'headset' },
      stress: { title: 'Stress Level', color: Theme.colors.warning, icon: 'flash' },
      mood: { title: 'Mood Score', color: Theme.colors.success, icon: 'happy' },
      sleep_quality: { title: 'Sleep Quality', color: Theme.colors.primary, icon: 'moon' },
    };
    return info[metric];
  };

  const getIntensityColor = (value: number, maxValue: number = 10): string => {
    if (value === 0) return Theme.colors.surfaceVariant;
    
    const intensity = value / maxValue;
    const metricInfo = getMetricInfo();
    
    // Create gradient from light to dark
    const baseColor = metricInfo.color;
    const opacity = 0.2 + (intensity * 0.8);
    
    return baseColor + Math.floor(opacity * 255).toString(16).padStart(2, '0');
  };

  const getWeekData = (weekNum: number) => {
    const weekData = Object.values(heatmapData).filter(item => item.weekNumber === weekNum);
    const weekGrid = Array(7).fill(null);
    
    weekData.forEach(item => {
      weekGrid[item.dayOfWeek] = item;
    });
    
    return weekGrid;
  };

  const getWeekRange = (weekNum: number): string => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 90);
    
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + (weekNum * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
  };

  const getDayName = (dayIndex: number): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  };

  const getTotalWeeks = (): number => {
    const weeks = new Set(Object.values(heatmapData).map(item => item.weekNumber));
    return Math.max(...weeks) + 1;
  };

  const getAverageForDay = (dayOfWeek: number): number => {
    const dayData = Object.values(heatmapData).filter(item => item.dayOfWeek === dayOfWeek && item.value > 0);
    if (dayData.length === 0) return 0;
    
    const sum = dayData.reduce((acc, item) => acc + item.value, 0);
    return sum / dayData.length;
  };

  const renderHeatmap = () => {
    const totalWeeks = getTotalWeeks();
    const weekData = getWeekData(selectedWeek);
    const metricInfo = getMetricInfo();

    return (
      <View style={styles.heatmapContainer}>
        <View style={styles.heatmapHeader}>
          <View style={styles.metricInfo}>
            <Ionicons name={metricInfo.icon as any} size={24} color={metricInfo.color} />
            <Text style={styles.metricTitle}>{metricInfo.title}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.legendButton}
            onPress={() => setShowLegend(!showLegend)}
          >
            <Ionicons name="information-circle" size={20} color={Theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {showLegend && (
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Intensity Scale</Text>
            <View style={styles.legendScale}>
              {[0, 2, 4, 6, 8, 10].map((value) => (
                <View key={value} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: getIntensityColor(value) }
                    ]}
                  />
                  <Text style={styles.legendText}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.weekSelector}>
          <TouchableOpacity
            style={styles.weekNavButton}
            onPress={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
            disabled={selectedWeek === 0}
          >
            <Ionicons name="chevron-back" size={20} color={selectedWeek === 0 ? Theme.colors.textTertiary : Theme.colors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.weekRange}>
            Week {selectedWeek + 1} ({getWeekRange(selectedWeek)})
          </Text>
          
          <TouchableOpacity
            style={styles.weekNavButton}
            onPress={() => setSelectedWeek(Math.min(totalWeeks - 1, selectedWeek + 1))}
            disabled={selectedWeek === totalWeeks - 1}
          >
            <Ionicons name="chevron-forward" size={20} color={selectedWeek === totalWeeks - 1 ? Theme.colors.textTertiary : Theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.heatmapGrid}>
          {/* Day labels */}
          <View style={styles.dayLabels}>
            {Array.from({ length: 7 }, (_, i) => (
              <View key={i} style={styles.dayLabel}>
                <Text style={styles.dayLabelText}>{getDayName(i)}</Text>
                <Text style={styles.dayAverage}>
                  {getAverageForDay(i).toFixed(1)}
                </Text>
              </View>
            ))}
          </View>

          {/* Heatmap cells */}
          <View style={styles.heatmapCells}>
            {weekData.map((dayData, dayIndex) => (
              <TouchableOpacity
                key={dayIndex}
                style={[
                  styles.heatmapCell,
                  {
                    backgroundColor: dayData ? getIntensityColor(dayData.value) : Theme.colors.surfaceVariant,
                    width: cellSize,
                    height: cellSize,
                  }
                ]}
                onPress={() => {
                  if (dayData) {
                    // Show day details
                    console.log('Day data:', dayData);
                  }
                }}
              >
                {dayData && (
                  <Text style={styles.cellValue}>
                    {dayData.value > 0 ? dayData.value.toFixed(1) : ''}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.insights}>
          <Text style={styles.insightsTitle}>Weekly Insights</Text>
          <View style={styles.insightItem}>
            <Ionicons name="calendar" size={16} color={Theme.colors.textSecondary} />
            <Text style={styles.insightText}>
              Best day: {getDayName(weekData.findIndex((day, i) => 
                day && day.value === Math.max(...weekData.filter(d => d).map(d => d!.value))
              ))}
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="trending-up" size={16} color={Theme.colors.textSecondary} />
            <Text style={styles.insightText}>
              Average: {(weekData.filter(d => d).reduce((sum, day) => sum + day!.value, 0) / weekData.filter(d => d).length).toFixed(1)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Correlation Heatmap</Text>
        <View style={styles.metricSelector}>
          {(['gi_flare', 'skin_flare', 'migraine', 'stress', 'mood', 'sleep_quality'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.metricButton,
                metric === m && styles.metricButtonActive,
              ]}
              onPress={() => {/* Handle metric change */}}
            >
              <Text style={[
                styles.metricButtonText,
                metric === m && styles.metricButtonTextActive,
              ]}>
                {m.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {renderHeatmap()}
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
    marginBottom: Theme.spacing.lg,
  },
  title: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  metricSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  metricButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.surfaceVariant,
  },
  metricButtonActive: {
    backgroundColor: Theme.colors.primary,
  },
  metricButtonText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  metricButtonTextActive: {
    color: Theme.colors.surface,
  },
  heatmapContainer: {
    alignItems: 'center',
  },
  heatmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: Theme.spacing.md,
  },
  metricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricTitle: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    marginLeft: Theme.spacing.sm,
  },
  legendButton: {
    padding: Theme.spacing.sm,
  },
  legend: {
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    width: '100%',
  },
  legendTitle: {
    ...Theme.typography.body2,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: Theme.spacing.sm,
  },
  legendScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    alignItems: 'center',
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.xs,
  },
  legendText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Theme.spacing.md,
  },
  weekNavButton: {
    padding: Theme.spacing.sm,
  },
  weekRange: {
    ...Theme.typography.body2,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
  },
  heatmapGrid: {
    alignItems: 'center',
  },
  dayLabels: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.sm,
  },
  dayLabel: {
    width: cellSize,
    alignItems: 'center',
  },
  dayLabelText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  dayAverage: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    fontSize: 10,
  },
  heatmapCells: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heatmapCell: {
    borderRadius: Theme.borderRadius.sm,
    margin: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cellValue: {
    ...Theme.typography.caption,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 10,
  },
  insights: {
    marginTop: Theme.spacing.lg,
    width: '100%',
  },
  insightsTitle: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: Theme.spacing.sm,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  insightText: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginLeft: Theme.spacing.sm,
  },
});

