import AsyncStorage from '@react-native-async-storage/async-storage';
import { HealthEntry } from '../types';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'streak' | 'consistency' | 'improvement' | 'milestone' | 'special';
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string;
  streakType: 'daily' | 'weekly';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  unlockedAt?: Date;
  isUnlocked: boolean;
}

export interface UserStats {
  totalLogs: number;
  totalDays: number;
  averageMood: number;
  averageSleep: number;
  averageStress: number;
  improvementTrend: 'up' | 'down' | 'stable';
  badges: Badge[];
  achievements: Achievement[];
  streaks: StreakData;
  level: number;
  experience: number;
  nextLevelExp: number;
}

class GamificationService {
  private static instance: GamificationService;
  private badges: Badge[] = [];
  private achievements: Achievement[] = [];
  private userStats: UserStats | null = null;

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  constructor() {
    this.initializeBadges();
    this.initializeAchievements();
  }

  private initializeBadges(): void {
    this.badges = [
      // Streak badges
      {
        id: 'streak_3',
        name: 'Getting Started',
        description: 'Log 3 days in a row',
        icon: 'flame',
        color: '#FF6B6B',
        category: 'streak',
        progress: 0,
        maxProgress: 3,
        isUnlocked: false,
      },
      {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Log 7 days in a row',
        icon: 'trophy',
        color: '#4ECDC4',
        category: 'streak',
        progress: 0,
        maxProgress: 7,
        isUnlocked: false,
      },
      {
        id: 'streak_30',
        name: 'Monthly Master',
        description: 'Log 30 days in a row',
        icon: 'medal',
        color: '#45B7D1',
        category: 'streak',
        progress: 0,
        maxProgress: 30,
        isUnlocked: false,
      },
      {
        id: 'streak_100',
        name: 'Century Champion',
        description: 'Log 100 days in a row',
        icon: 'star',
        color: '#96CEB4',
        category: 'streak',
        progress: 0,
        maxProgress: 100,
        isUnlocked: false,
      },

      // Consistency badges
      {
        id: 'consistency_week',
        name: 'Weekly Warrior',
        description: 'Log every day for a week',
        icon: 'calendar',
        color: '#FECA57',
        category: 'consistency',
        progress: 0,
        maxProgress: 7,
        isUnlocked: false,
      },
      {
        id: 'consistency_month',
        name: 'Monthly Master',
        description: 'Log every day for a month',
        icon: 'calendar-outline',
        color: '#FF9FF3',
        category: 'consistency',
        progress: 0,
        maxProgress: 30,
        isUnlocked: false,
      },

      // Improvement badges
      {
        id: 'mood_improvement',
        name: 'Mood Booster',
        description: 'Improve mood score by 2+ points over 7 days',
        icon: 'happy',
        color: '#54A0FF',
        category: 'improvement',
        progress: 0,
        maxProgress: 1,
        isUnlocked: false,
      },
      {
        id: 'sleep_improvement',
        name: 'Sleep Optimizer',
        description: 'Improve sleep quality by 2+ points over 7 days',
        icon: 'moon',
        color: '#5F27CD',
        category: 'improvement',
        progress: 0,
        maxProgress: 1,
        isUnlocked: false,
      },
      {
        id: 'stress_reduction',
        name: 'Stress Buster',
        description: 'Reduce stress by 2+ points over 7 days',
        icon: 'leaf',
        color: '#00D2D3',
        category: 'improvement',
        progress: 0,
        maxProgress: 1,
        isUnlocked: false,
      },

      // Milestone badges
      {
        id: 'milestone_50',
        name: 'Half Century',
        description: 'Complete 50 health logs',
        icon: 'checkmark-circle',
        color: '#FF6348',
        category: 'milestone',
        progress: 0,
        maxProgress: 50,
        isUnlocked: false,
      },
      {
        id: 'milestone_100',
        name: 'Century Club',
        description: 'Complete 100 health logs',
        icon: 'ribbon',
        color: '#2ED573',
        category: 'milestone',
        progress: 0,
        maxProgress: 100,
        isUnlocked: false,
      },
      {
        id: 'milestone_365',
        name: 'Year Warrior',
        description: 'Complete 365 health logs',
        icon: 'trophy-outline',
        color: '#FFA502',
        category: 'milestone',
        progress: 0,
        maxProgress: 365,
        isUnlocked: false,
      },

      // Special badges
      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Log before 8 AM for 7 days',
        icon: 'sunny',
        color: '#FFD700',
        category: 'special',
        progress: 0,
        maxProgress: 7,
        isUnlocked: false,
      },
      {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Log after 10 PM for 7 days',
        icon: 'moon',
        color: '#8B5CF6',
        category: 'special',
        progress: 0,
        maxProgress: 7,
        isUnlocked: false,
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Rate sleep quality 10/10 for 5 days',
        icon: 'star',
        color: '#F59E0B',
        category: 'special',
        progress: 0,
        maxProgress: 5,
        isUnlocked: false,
      },
    ];
  }

  private initializeAchievements(): void {
    this.achievements = [
      {
        id: 'first_log',
        title: 'First Steps',
        description: 'Complete your first health log',
        points: 10,
        isUnlocked: false,
      },
      {
        id: 'week_complete',
        title: 'Week Complete',
        description: 'Log every day for a full week',
        points: 50,
        isUnlocked: false,
      },
      {
        id: 'month_complete',
        title: 'Month Complete',
        description: 'Log every day for a full month',
        points: 200,
        isUnlocked: false,
      },
      {
        id: 'mood_master',
        title: 'Mood Master',
        description: 'Maintain average mood above 8 for a week',
        points: 100,
        isUnlocked: false,
      },
      {
        id: 'sleep_master',
        title: 'Sleep Master',
        description: 'Maintain average sleep quality above 8 for a week',
        points: 100,
        isUnlocked: false,
      },
      {
        id: 'stress_master',
        title: 'Stress Master',
        description: 'Keep stress levels below 3 for a week',
        points: 100,
        isUnlocked: false,
      },
      {
        id: 'data_analyst',
        title: 'Data Analyst',
        description: 'View your insights 10 times',
        points: 50,
        isUnlocked: false,
      },
      {
        id: 'voice_logger',
        title: 'Voice Logger',
        description: 'Use voice journaling 10 times',
        points: 75,
        isUnlocked: false,
      },
    ];
  }

  async updateStats(healthData: HealthEntry[]): Promise<UserStats> {
    const stats = await this.calculateStats(healthData);
    await this.checkBadges(healthData, stats);
    await this.checkAchievements(healthData, stats);
    
    this.userStats = stats;
    await this.saveStats(stats);
    
    return stats;
  }

  private async calculateStats(healthData: HealthEntry[]): Promise<UserStats> {
    const totalLogs = healthData.length;
    const totalDays = new Set(healthData.map(entry => entry.date)).size;
    
    // Calculate averages
    const moodScores = healthData.map(entry => entry.mood?.mood_score || 0).filter(score => score > 0);
    const sleepScores = healthData.map(entry => entry.sleep?.quality_score || 0).filter(score => score > 0);
    const stressScores = healthData.map(entry => entry.mood?.stress_score || 0).filter(score => score > 0);
    
    const averageMood = moodScores.length > 0 ? moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length : 0;
    const averageSleep = sleepScores.length > 0 ? sleepScores.reduce((sum, score) => sum + score, 0) / sleepScores.length : 0;
    const averageStress = stressScores.length > 0 ? stressScores.reduce((sum, score) => sum + score, 0) / stressScores.length : 0;
    
    // Calculate improvement trend
    const improvementTrend = this.calculateImprovementTrend(healthData);
    
    // Calculate streaks
    const streaks = await this.calculateStreaks(healthData);
    
    // Calculate level and experience
    const experience = totalLogs * 10; // 10 XP per log
    const level = Math.floor(experience / 100) + 1; // 100 XP per level
    const nextLevelExp = level * 100;
    
    return {
      totalLogs,
      totalDays,
      averageMood,
      averageSleep,
      averageStress,
      improvementTrend,
      badges: this.badges,
      achievements: this.achievements,
      streaks,
      level,
      experience,
      nextLevelExp,
    };
  }

  private calculateImprovementTrend(healthData: HealthEntry[]): 'up' | 'down' | 'stable' {
    if (healthData.length < 14) return 'stable';
    
    const sortedData = healthData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
    const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));
    
    const firstAvg = this.calculateAverageScore(firstHalf);
    const secondAvg = this.calculateAverageScore(secondHalf);
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  }

  private calculateAverageScore(data: HealthEntry[]): number {
    const scores = data.map(entry => {
      const mood = entry.mood?.mood_score || 0;
      const sleep = entry.sleep?.quality_score || 0;
      const stress = entry.mood?.stress_score || 0;
      return (mood + sleep + (10 - stress)) / 3; // Invert stress for positive scoring
    }).filter(score => score > 0);
    
    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  }

  private async calculateStreaks(healthData: HealthEntry[]): Promise<StreakData> {
    const sortedData = healthData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (sortedData.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastLogDate: '',
        streakType: 'daily',
      };
    }
    
    const lastLogDate = sortedData[0].date;
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    for (let i = 0; i < 365; i++) { // Check up to a year back
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasLog = sortedData.some(entry => entry.date === dateStr);
      
      if (hasLog) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const allDates = new Set(sortedData.map(entry => entry.date));
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const nextDate = i < sortedDates.length - 1 ? new Date(sortedDates[i + 1]) : null;
      
      if (nextDate) {
        const daysDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak + 1);
          tempStreak = 0;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak + 1);
      }
    }
    
    return {
      currentStreak,
      longestStreak,
      lastLogDate,
      streakType: 'daily',
    };
  }

  private async checkBadges(healthData: HealthEntry[], stats: UserStats): Promise<void> {
    const newBadges: Badge[] = [];
    
    for (const badge of this.badges) {
      if (badge.isUnlocked) continue;
      
      let progress = 0;
      let shouldUnlock = false;
      
      switch (badge.id) {
        case 'streak_3':
        case 'streak_7':
        case 'streak_30':
        case 'streak_100':
          progress = Math.min(stats.streaks.currentStreak, badge.maxProgress);
          shouldUnlock = stats.streaks.currentStreak >= badge.maxProgress;
          break;
          
        case 'consistency_week':
          progress = Math.min(stats.streaks.currentStreak, 7);
          shouldUnlock = stats.streaks.currentStreak >= 7;
          break;
          
        case 'consistency_month':
          progress = Math.min(stats.streaks.currentStreak, 30);
          shouldUnlock = stats.streaks.currentStreak >= 30;
          break;
          
        case 'milestone_50':
        case 'milestone_100':
        case 'milestone_365':
          progress = Math.min(stats.totalLogs, badge.maxProgress);
          shouldUnlock = stats.totalLogs >= badge.maxProgress;
          break;
          
        case 'mood_improvement':
        case 'sleep_improvement':
        case 'stress_reduction':
          // Check for improvement over last 7 days
          const improvement = this.checkImprovement(healthData, badge.id);
          progress = improvement ? 1 : 0;
          shouldUnlock = improvement;
          break;
      }
      
      badge.progress = progress;
      
      if (shouldUnlock && !badge.isUnlocked) {
        badge.isUnlocked = true;
        badge.unlockedAt = new Date();
        newBadges.push(badge);
      }
    }
    
    if (newBadges.length > 0) {
      await this.saveBadges(this.badges);
      // Trigger badge unlock notification
      this.notifyBadgeUnlock(newBadges);
    }
  }

  private checkImprovement(healthData: HealthEntry[], badgeId: string): boolean {
    if (healthData.length < 14) return false;
    
    const sortedData = healthData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const last7Days = sortedData.slice(-7);
    const previous7Days = sortedData.slice(-14, -7);
    
    if (last7Days.length < 7 || previous7Days.length < 7) return false;
    
    const getAverageScore = (data: HealthEntry[], type: string): number => {
      const scores = data.map(entry => {
        switch (type) {
          case 'mood_improvement':
            return entry.mood?.mood_score || 0;
          case 'sleep_improvement':
            return entry.sleep?.quality_score || 0;
          case 'stress_reduction':
            return entry.mood?.stress_score || 0;
          default:
            return 0;
        }
      }).filter(score => score > 0);
      
      return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    };
    
    const lastAvg = getAverageScore(last7Days, badgeId);
    const prevAvg = getAverageScore(previous7Days, badgeId);
    
    if (badgeId === 'stress_reduction') {
      return lastAvg < prevAvg - 2; // Stress reduction
    } else {
      return lastAvg > prevAvg + 2; // Mood/sleep improvement
    }
  }

  private async checkAchievements(healthData: HealthEntry[], stats: UserStats): Promise<void> {
    const newAchievements: Achievement[] = [];
    
    for (const achievement of this.achievements) {
      if (achievement.isUnlocked) continue;
      
      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first_log':
          shouldUnlock = stats.totalLogs >= 1;
          break;
        case 'week_complete':
          shouldUnlock = stats.streaks.currentStreak >= 7;
          break;
        case 'month_complete':
          shouldUnlock = stats.streaks.currentStreak >= 30;
          break;
        case 'mood_master':
          shouldUnlock = stats.averageMood >= 8;
          break;
        case 'sleep_master':
          shouldUnlock = stats.averageSleep >= 8;
          break;
        case 'stress_master':
          shouldUnlock = stats.averageStress <= 3;
          break;
      }
      
      if (shouldUnlock && !achievement.isUnlocked) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date();
        newAchievements.push(achievement);
      }
    }
    
    if (newAchievements.length > 0) {
      await this.saveAchievements(this.achievements);
      // Trigger achievement unlock notification
      this.notifyAchievementUnlock(newAchievements);
    }
  }

  private notifyBadgeUnlock(badges: Badge[]): void {
    // This would typically trigger a notification or UI update
    console.log('New badges unlocked:', badges.map(b => b.name));
  }

  private notifyAchievementUnlock(achievements: Achievement[]): void {
    // This would typically trigger a notification or UI update
    console.log('New achievements unlocked:', achievements.map(a => a.title));
  }

  async getStats(): Promise<UserStats | null> {
    if (this.userStats) return this.userStats;
    
    try {
      const saved = await AsyncStorage.getItem('userStats');
      if (saved) {
        this.userStats = JSON.parse(saved);
        return this.userStats;
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
    
    return null;
  }

  private async saveStats(stats: UserStats): Promise<void> {
    try {
      await AsyncStorage.setItem('userStats', JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving user stats:', error);
    }
  }

  private async saveBadges(badges: Badge[]): Promise<void> {
    try {
      await AsyncStorage.setItem('badges', JSON.stringify(badges));
    } catch (error) {
      console.error('Error saving badges:', error);
    }
  }

  private async saveAchievements(achievements: Achievement[]): Promise<void> {
    try {
      await AsyncStorage.setItem('achievements', JSON.stringify(achievements));
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }

  async loadBadges(): Promise<Badge[]> {
    try {
      const saved = await AsyncStorage.getItem('badges');
      if (saved) {
        this.badges = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading badges:', error);
    }
    
    return this.badges;
  }

  async loadAchievements(): Promise<Achievement[]> {
    try {
      const saved = await AsyncStorage.getItem('achievements');
      if (saved) {
        this.achievements = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
    
    return this.achievements;
  }
}

export const gamificationService = GamificationService.getInstance();

