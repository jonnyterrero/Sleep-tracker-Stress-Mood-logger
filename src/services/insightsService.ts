import { HealthEntry } from '../types';

export interface Insight {
  id: string;
  type: 'sleep' | 'mood' | 'stress' | 'symptoms' | 'correlation';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  recommendations?: string[];
  category: 'tip' | 'warning' | 'achievement' | 'correlation';
}

export interface PersonalizedTip {
  id: string;
  category: 'sleep' | 'mood' | 'stress' | 'lifestyle';
  title: string;
  description: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeRequired: string;
}

class InsightsService {
  private static instance: InsightsService;

  static getInstance(): InsightsService {
    if (!InsightsService.instance) {
      InsightsService.instance = new InsightsService();
    }
    return InsightsService.instance;
  }

  async generateInsights(healthData: HealthEntry[]): Promise<Insight[]> {
    const insights: Insight[] = [];

    if (healthData.length < 7) {
      return insights;
    }

    const sortedData = healthData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    insights.push(...this.analyzeSleepPatterns(sortedData));
    insights.push(...this.analyzeMoodTrends(sortedData));
    insights.push(...this.analyzeStressPatterns(sortedData));

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });
  }

  private analyzeSleepPatterns(data: HealthEntry[]): Insight[] {
    const insights: Insight[] = [];
    const sleepData = data.filter(entry => entry.sleep?.duration_hours && entry.sleep?.quality_score);

    if (sleepData.length < 7) return insights;

    const durations = sleepData.map(entry => entry.sleep!.duration_hours);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;

    if (avgDuration < 6.5) {
      insights.push({
        id: 'sleep_duration_low',
        type: 'sleep',
        title: 'Sleep Duration Alert',
        description: `Your average sleep duration is ${avgDuration.toFixed(1)} hours, which is below the recommended 7-9 hours.`,
        actionable: true,
        priority: 'high',
        confidence: 0.9,
        recommendations: [
          'Try going to bed 30 minutes earlier',
          'Create a consistent bedtime routine',
          'Avoid screens 1 hour before bed',
          'Keep your bedroom cool and dark'
        ],
        category: 'warning'
      });
    }

    return insights;
  }

  private analyzeMoodTrends(data: HealthEntry[]): Insight[] {
    const insights: Insight[] = [];
    const moodData = data.filter(entry => entry.mood?.mood_score);

    if (moodData.length < 7) return insights;

    const moods = moodData.map(entry => entry.mood!.mood_score);
    const avgMood = moods.reduce((sum, m) => sum + m, 0) / moods.length;
    const recentMood = moods.slice(-7).reduce((sum, m) => sum + m, 0) / 7;

    if (recentMood < avgMood - 1.5) {
      insights.push({
        id: 'mood_declining',
        type: 'mood',
        title: 'Mood Trend Alert',
        description: `Your mood has declined from ${avgMood.toFixed(1)} to ${recentMood.toFixed(1)} over the past week.`,
        actionable: true,
        priority: 'high',
        confidence: 0.8,
        recommendations: [
          'Consider talking to a mental health professional',
          'Try daily gratitude journaling',
          'Increase physical activity',
          'Connect with friends and family'
        ],
        category: 'warning'
      });
    }

    return insights;
  }

  private analyzeStressPatterns(data: HealthEntry[]): Insight[] {
    const insights: Insight[] = [];
    const stressData = data.filter(entry => entry.mood?.stress_score);

    if (stressData.length < 7) return insights;

    const stressLevels = stressData.map(entry => entry.mood!.stress_score);
    const avgStress = stressLevels.reduce((sum, s) => sum + s, 0) / stressLevels.length;

    if (avgStress > 7) {
      insights.push({
        id: 'high_stress',
        type: 'stress',
        title: 'High Stress Levels',
        description: `Your average stress level is ${avgStress.toFixed(1)}/10, which is quite high.`,
        actionable: true,
        priority: 'high',
        confidence: 0.9,
        recommendations: [
          'Practice deep breathing exercises',
          'Try progressive muscle relaxation',
          'Consider stress management therapy',
          'Identify and address stress sources'
        ],
        category: 'warning'
      });
    }

    return insights;
  }

  generatePersonalizedTips(healthData: HealthEntry[]): PersonalizedTip[] {
    const tips: PersonalizedTip[] = [];

    tips.push({
      id: 'sleep_hygiene',
      category: 'sleep',
      title: 'Optimize Your Sleep Environment',
      description: 'Create the perfect sleep environment for better rest',
      action: 'Keep bedroom cool (65-68°F), dark, and quiet',
      priority: 'medium',
      estimatedImpact: 'Can improve sleep quality by 15-20%',
      difficulty: 'easy',
      timeRequired: '5 minutes setup'
    });

    tips.push({
      id: 'gratitude_practice',
      category: 'mood',
      title: 'Daily Gratitude Practice',
      description: 'Boost your mood with a simple gratitude exercise',
      action: 'Write down 3 things you\'re grateful for each day',
      priority: 'medium',
      estimatedImpact: 'Can improve mood scores by 1-2 points',
      difficulty: 'easy',
      timeRequired: '2-3 minutes daily'
    });

    tips.push({
      id: 'breathing_exercise',
      category: 'stress',
      title: '4-7-8 Breathing Technique',
      description: 'Quick stress relief through controlled breathing',
      action: 'Inhale for 4, hold for 7, exhale for 8 seconds',
      priority: 'high',
      estimatedImpact: 'Can reduce stress levels by 2-3 points',
      difficulty: 'easy',
      timeRequired: '1-2 minutes'
    });

    return tips;
  }
}

export const insightsService = InsightsService.getInstance();