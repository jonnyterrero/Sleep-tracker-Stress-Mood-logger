import { HealthEntrySchema } from '../types';

export interface CorrelationResult {
  metric1: string;
  metric2: string;
  correlation: number; // -1 to 1
  strength: 'weak' | 'moderate' | 'strong';
  direction: 'positive' | 'negative';
  significance: number; // p-value
  sampleSize: number;
  description: string;
}

export interface SleepCorrelation {
  sleepMetric: string;
  symptomMetric: string;
  correlation: number;
  strength: string;
  description: string;
  actionableInsight: string;
}

export interface TrendAnalysis {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number; // percentage change over time
  period: string;
  significance: number;
}

export interface HealthInsight {
  type: 'correlation' | 'trend' | 'pattern' | 'anomaly';
  title: string;
  description: string;
  confidence: number; // 0-1
  actionable: boolean;
  recommendation?: string;
  data: any;
}

class CorrelationsService {
  /**
   * Calculate Pearson correlation coefficient between two arrays
   */
  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
    const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Calculate statistical significance (simplified t-test)
   */
  private calculateSignificance(correlation: number, sampleSize: number): number {
    if (sampleSize < 3) return 1;
    
    const t = Math.abs(correlation) * Math.sqrt((sampleSize - 2) / (1 - correlation * correlation));
    const df = sampleSize - 2;
    
    // Simplified p-value calculation (not exact but good approximation)
    if (t > 2.576) return 0.01; // 99% confidence
    if (t > 1.96) return 0.05;  // 95% confidence
    if (t > 1.645) return 0.10; // 90% confidence
    return 0.20; // 80% confidence
  }

  /**
   * Get correlation strength description
   */
  private getCorrelationStrength(correlation: number): { strength: string; description: string } {
    const absCorr = Math.abs(correlation);
    
    if (absCorr >= 0.7) {
      return { strength: 'strong', description: 'Very strong relationship' };
    } else if (absCorr >= 0.5) {
      return { strength: 'moderate', description: 'Moderate relationship' };
    } else if (absCorr >= 0.3) {
      return { strength: 'weak', description: 'Weak relationship' };
    } else {
      return { strength: 'weak', description: 'Very weak or no relationship' };
    }
  }

  /**
   * Analyze sleep correlations with symptoms
   */
  analyzeSleepCorrelations(entries: HealthEntrySchema[]): SleepCorrelation[] {
    if (entries.length < 3) return [];

    const correlations: SleepCorrelation[] = [];
    
    // Extract data arrays
    const sleepDuration = entries.map(e => e.sleep.duration_hours);
    const sleepQuality = entries.map(e => e.sleep.quality_score);
    const giFlare = entries.map(e => e.symptoms.gi_flare);
    const skinFlare = entries.map(e => e.symptoms.skin_flare);
    const migraine = entries.map(e => e.symptoms.migraine);
    const mood = entries.map(e => e.mood.mood_score);
    const stress = entries.map(e => e.mood.stress_score);

    // Sleep Duration Correlations
    const durationGiCorr = this.calculateCorrelation(sleepDuration, giFlare);
    if (Math.abs(durationGiCorr) > 0.2) {
      correlations.push({
        sleepMetric: 'Sleep Duration',
        symptomMetric: 'GI Flare',
        correlation: durationGiCorr,
        strength: this.getCorrelationStrength(durationGiCorr).strength,
        description: `Sleep duration ${durationGiCorr < 0 ? 'negatively' : 'positively'} correlates with GI flare severity`,
        actionableInsight: durationGiCorr < 0 
          ? 'Shorter sleep may increase GI symptoms. Aim for 7-9 hours of sleep.'
          : 'Longer sleep may help reduce GI symptoms.'
      });
    }

    const durationSkinCorr = this.calculateCorrelation(sleepDuration, skinFlare);
    if (Math.abs(durationSkinCorr) > 0.2) {
      correlations.push({
        sleepMetric: 'Sleep Duration',
        symptomMetric: 'Skin Flare',
        correlation: durationSkinCorr,
        strength: this.getCorrelationStrength(durationSkinCorr).strength,
        description: `Sleep duration ${durationSkinCorr < 0 ? 'negatively' : 'positively'} correlates with skin flare severity`,
        actionableInsight: durationSkinCorr < 0 
          ? 'Insufficient sleep may trigger skin flares. Maintain consistent sleep schedule.'
          : 'Adequate sleep may help prevent skin flares.'
      });
    }

    const durationMigraineCorr = this.calculateCorrelation(sleepDuration, migraine);
    if (Math.abs(durationMigraineCorr) > 0.2) {
      correlations.push({
        sleepMetric: 'Sleep Duration',
        symptomMetric: 'Migraine',
        correlation: durationMigraineCorr,
        strength: this.getCorrelationStrength(durationMigraineCorr).strength,
        description: `Sleep duration ${durationMigraineCorr < 0 ? 'negatively' : 'positively'} correlates with migraine severity`,
        actionableInsight: durationMigraineCorr < 0 
          ? 'Poor sleep may trigger migraines. Focus on sleep hygiene.'
          : 'Good sleep may help prevent migraines.'
      });
    }

    // Sleep Quality Correlations
    const qualityGiCorr = this.calculateCorrelation(sleepQuality, giFlare);
    if (Math.abs(qualityGiCorr) > 0.2) {
      correlations.push({
        sleepMetric: 'Sleep Quality',
        symptomMetric: 'GI Flare',
        correlation: qualityGiCorr,
        strength: this.getCorrelationStrength(qualityGiCorr).strength,
        description: `Sleep quality ${qualityGiCorr < 0 ? 'negatively' : 'positively'} correlates with GI flare severity`,
        actionableInsight: qualityGiCorr < 0 
          ? 'Poor sleep quality may worsen GI symptoms. Improve sleep environment.'
          : 'Better sleep quality may reduce GI symptoms.'
      });
    }

    const qualitySkinCorr = this.calculateCorrelation(sleepQuality, skinFlare);
    if (Math.abs(qualitySkinCorr) > 0.2) {
      correlations.push({
        sleepMetric: 'Sleep Quality',
        symptomMetric: 'Skin Flare',
        correlation: qualitySkinCorr,
        strength: this.getCorrelationStrength(qualitySkinCorr).strength,
        description: `Sleep quality ${qualitySkinCorr < 0 ? 'negatively' : 'positively'} correlates with skin flare severity`,
        actionableInsight: qualitySkinCorr < 0 
          ? 'Poor sleep quality may trigger skin flares. Consider sleep aids or environment changes.'
          : 'Good sleep quality may help prevent skin flares.'
      });
    }

    const qualityMigraineCorr = this.calculateCorrelation(sleepQuality, migraine);
    if (Math.abs(qualityMigraineCorr) > 0.2) {
      correlations.push({
        sleepMetric: 'Sleep Quality',
        symptomMetric: 'Migraine',
        correlation: qualityMigraineCorr,
        strength: this.getCorrelationStrength(qualityMigraineCorr).strength,
        description: `Sleep quality ${qualityMigraineCorr < 0 ? 'negatively' : 'positively'} correlates with migraine severity`,
        actionableInsight: qualityMigraineCorr < 0 
          ? 'Poor sleep quality may trigger migraines. Focus on deep sleep.'
          : 'Good sleep quality may help prevent migraines.'
      });
    }

    // Mood and Stress Correlations
    const moodGiCorr = this.calculateCorrelation(mood, giFlare);
    if (Math.abs(moodGiCorr) > 0.2) {
      correlations.push({
        sleepMetric: 'Mood',
        symptomMetric: 'GI Flare',
        correlation: moodGiCorr,
        strength: this.getCorrelationStrength(moodGiCorr).strength,
        description: `Mood ${moodGiCorr < 0 ? 'negatively' : 'positively'} correlates with GI flare severity`,
        actionableInsight: moodGiCorr < 0 
          ? 'Low mood may worsen GI symptoms. Consider stress management techniques.'
          : 'Positive mood may help reduce GI symptoms.'
      });
    }

    const stressGiCorr = this.calculateCorrelation(stress, giFlare);
    if (Math.abs(stressGiCorr) > 0.2) {
      correlations.push({
        sleepMetric: 'Stress',
        symptomMetric: 'GI Flare',
        correlation: stressGiCorr,
        strength: this.getCorrelationStrength(stressGiCorr).strength,
        description: `Stress ${stressGiCorr < 0 ? 'negatively' : 'positively'} correlates with GI flare severity`,
        actionableInsight: stressGiCorr > 0 
          ? 'High stress may increase GI symptoms. Practice relaxation techniques.'
          : 'Low stress may help reduce GI symptoms.'
      });
    }

    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }

  /**
   * Analyze trends over time
   */
  analyzeTrends(entries: HealthEntrySchema[], metric: string, days: number = 30): TrendAnalysis | null {
    if (entries.length < 3) return null;

    const recentEntries = entries.slice(-days);
    const values = recentEntries.map(entry => {
      switch (metric) {
        case 'sleep_duration': return entry.sleep.duration_hours;
        case 'sleep_quality': return entry.sleep.quality_score;
        case 'mood': return entry.mood.mood_score;
        case 'stress': return entry.mood.stress_score;
        case 'gi_flare': return entry.symptoms.gi_flare;
        case 'skin_flare': return entry.symptoms.skin_flare;
        case 'migraine': return entry.symptoms.migraine;
        default: return 0;
      }
    });

    if (values.length < 2) return null;

    // Calculate linear regression slope
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * values[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const changeRate = (slope / (sumY / n)) * 100; // Percentage change

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(changeRate) < 5) {
      trend = 'stable';
    } else if (changeRate > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    return {
      metric,
      trend,
      changeRate: Math.abs(changeRate),
      period: `${days} days`,
      significance: this.calculateSignificance(Math.abs(slope), n)
    };
  }

  /**
   * Generate health insights from correlations and trends
   */
  generateInsights(entries: HealthEntrySchema[]): HealthInsight[] {
    const insights: HealthInsight[] = [];
    
    if (entries.length < 7) {
      insights.push({
        type: 'pattern',
        title: 'Need More Data',
        description: 'Track your health data for at least a week to see meaningful patterns and correlations.',
        confidence: 1.0,
        actionable: true,
        recommendation: 'Continue logging daily to unlock personalized insights.',
        data: { entriesCount: entries.length }
      });
      return insights;
    }

    // Analyze correlations
    const correlations = this.analyzeSleepCorrelations(entries);
    
    correlations.forEach(corr => {
      if (Math.abs(corr.correlation) > 0.3) {
        insights.push({
          type: 'correlation',
          title: `${corr.sleepMetric} & ${corr.symptomMetric}`,
          description: corr.description,
          confidence: Math.abs(corr.correlation),
          actionable: true,
          recommendation: corr.actionableInsight,
          data: corr
        });
      }
    });

    // Analyze trends
    const metrics = ['sleep_duration', 'sleep_quality', 'mood', 'stress', 'gi_flare', 'skin_flare', 'migraine'];
    metrics.forEach(metric => {
      const trend = this.analyzeTrends(entries, metric);
      if (trend && trend.changeRate > 10) {
        insights.push({
          type: 'trend',
          title: `${metric.replace('_', ' ').toUpperCase()} Trend`,
          description: `Your ${metric.replace('_', ' ')} is ${trend.trend} by ${trend.changeRate.toFixed(1)}% over the last ${trend.period}`,
          confidence: 1 - trend.significance,
          actionable: true,
          recommendation: this.getTrendRecommendation(metric, trend.trend),
          data: trend
        });
      }
    });

    // Check for patterns
    const sleepPatterns = this.analyzeSleepPatterns(entries);
    sleepPatterns.forEach(pattern => {
      insights.push({
        type: 'pattern',
        title: pattern.title,
        description: pattern.description,
        confidence: pattern.confidence,
        actionable: pattern.actionable,
        recommendation: pattern.recommendation,
        data: pattern.data
      });
    });

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze sleep patterns
   */
  private analyzeSleepPatterns(entries: HealthEntrySchema[]): HealthInsight[] {
    const insights: HealthInsight[] = [];
    
    if (entries.length < 7) return insights;

    const sleepDurations = entries.map(e => e.sleep.duration_hours);
    const sleepQualities = entries.map(e => e.sleep.quality_score);
    
    // Check for consistent sleep schedule
    const avgDuration = sleepDurations.reduce((a, b) => a + b, 0) / sleepDurations.length;
    const durationVariance = sleepDurations.reduce((acc, d) => acc + Math.pow(d - avgDuration, 2), 0) / sleepDurations.length;
    const durationStdDev = Math.sqrt(durationVariance);

    if (durationStdDev > 1.5) {
      insights.push({
        type: 'pattern',
        title: 'Irregular Sleep Schedule',
        description: `Your sleep duration varies significantly (${durationStdDev.toFixed(1)} hours standard deviation).`,
        confidence: 0.8,
        actionable: true,
        recommendation: 'Try to maintain a consistent bedtime and wake time, even on weekends.',
        data: { avgDuration, stdDev: durationStdDev }
      });
    }

    // Check for sleep debt
    const shortSleepDays = sleepDurations.filter(d => d < 6).length;
    const sleepDebtRatio = shortSleepDays / sleepDurations.length;

    if (sleepDebtRatio > 0.3) {
      insights.push({
        type: 'pattern',
        title: 'Frequent Sleep Deprivation',
        description: `You're getting less than 6 hours of sleep ${(sleepDebtRatio * 100).toFixed(0)}% of the time.`,
        confidence: 0.9,
        actionable: true,
        recommendation: 'Prioritize getting 7-9 hours of sleep nightly. Consider adjusting your schedule.',
        data: { sleepDebtRatio, shortSleepDays }
      });
    }

    // Check for quality vs duration correlation
    const qualityDurationCorr = this.calculateCorrelation(sleepDurations, sleepQualities);
    if (qualityDurationCorr < 0.3) {
      insights.push({
        type: 'pattern',
        title: 'Sleep Quality vs Duration Mismatch',
        description: 'Your sleep quality doesn\'t strongly correlate with sleep duration.',
        confidence: 0.7,
        actionable: true,
        recommendation: 'Focus on sleep quality factors like environment, routine, and stress management.',
        data: { correlation: qualityDurationCorr }
      });
    }

    return insights;
  }

  /**
   * Get trend-based recommendations
   */
  private getTrendRecommendation(metric: string, trend: string): string {
    const recommendations: { [key: string]: { [key: string]: string } } = {
      sleep_duration: {
        increasing: 'Great! You\'re getting more sleep. Continue this positive trend.',
        decreasing: 'Your sleep duration is declining. Consider earlier bedtimes or better sleep hygiene.',
        stable: 'Your sleep duration is consistent. Maintain this healthy pattern.'
      },
      sleep_quality: {
        increasing: 'Excellent! Your sleep quality is improving. Keep up the good habits.',
        decreasing: 'Your sleep quality is declining. Check your sleep environment and routine.',
        stable: 'Your sleep quality is stable. Consider ways to optimize further.'
      },
      mood: {
        increasing: 'Your mood is improving! Continue activities that boost your wellbeing.',
        decreasing: 'Your mood is declining. Consider stress management and self-care activities.',
        stable: 'Your mood is stable. Look for opportunities to enhance your daily happiness.'
      },
      stress: {
        increasing: 'Your stress levels are rising. Consider relaxation techniques and time management.',
        decreasing: 'Great job managing stress! Continue your stress-reduction strategies.',
        stable: 'Your stress levels are stable. Consider proactive stress management.'
      },
      gi_flare: {
        increasing: 'GI symptoms are worsening. Review your diet and stress management.',
        decreasing: 'Your GI symptoms are improving! Continue your current approach.',
        stable: 'GI symptoms are stable. Consider dietary or lifestyle optimizations.'
      },
      skin_flare: {
        increasing: 'Skin flares are increasing. Check triggers like stress, diet, or environment.',
        decreasing: 'Your skin is improving! Continue your current skincare routine.',
        stable: 'Skin condition is stable. Consider preventive measures.'
      },
      migraine: {
        increasing: 'Migraines are becoming more frequent. Track triggers and consider prevention.',
        decreasing: 'Migraines are decreasing! Continue your current management approach.',
        stable: 'Migraine frequency is stable. Focus on trigger identification and prevention.'
      }
    };

    return recommendations[metric]?.[trend] || 'Continue monitoring this metric for better insights.';
  }

  /**
   * Get comprehensive correlation report
   */
  getCorrelationReport(entries: HealthEntrySchema[]): {
    correlations: SleepCorrelation[];
    trends: TrendAnalysis[];
    insights: HealthInsight[];
    summary: string;
  } {
    const correlations = this.analyzeSleepCorrelations(entries);
    const insights = this.generateInsights(entries);
    
    const trends: TrendAnalysis[] = [];
    const metrics = ['sleep_duration', 'sleep_quality', 'mood', 'stress', 'gi_flare', 'skin_flare', 'migraine'];
    metrics.forEach(metric => {
      const trend = this.analyzeTrends(entries, metric);
      if (trend) trends.push(trend);
    });

    const strongCorrelations = correlations.filter(c => Math.abs(c.correlation) > 0.5);
    const significantTrends = trends.filter(t => t.changeRate > 10);

    let summary = `Based on ${entries.length} days of data: `;
    if (strongCorrelations.length > 0) {
      summary += `Found ${strongCorrelations.length} strong correlation${strongCorrelations.length > 1 ? 's' : ''} between sleep and symptoms. `;
    }
    if (significantTrends.length > 0) {
      summary += `Detected ${significantTrends.length} significant trend${significantTrends.length > 1 ? 's' : ''} in your health metrics. `;
    }
    if (strongCorrelations.length === 0 && significantTrends.length === 0) {
      summary += 'Continue tracking to identify patterns and correlations.';
    }

    return {
      correlations,
      trends,
      insights,
      summary
    };
  }
}

export const correlationsService = new CorrelationsService();

