import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/theme';
import { gamificationService, UserStats, Badge, Achievement } from '../services/gamificationService';

interface ProgressBadgesWidgetProps {
  healthData: any[];
  onStatsUpdate?: (stats: UserStats) => void;
}

export default function ProgressBadgesWidget({ healthData, onStatsUpdate }: ProgressBadgesWidgetProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'badges' | 'achievements' | 'stats'>('stats');
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadStats();
  }, [healthData]);

  const loadStats = async () => {
    try {
      const stats = await gamificationService.updateStats(healthData);
      setUserStats(stats);
      onStatsUpdate?.(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleBadgePress = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowBadgeModal(true);
    
    // Animate badge press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAchievementPress = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      streak: 'flame',
      consistency: 'calendar',
      improvement: 'trending-up',
      milestone: 'trophy',
      special: 'star',
    };
    return icons[category as keyof typeof icons] || 'help';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      streak: Theme.colors.error,
      consistency: Theme.colors.primary,
      improvement: Theme.colors.success,
      milestone: Theme.colors.warning,
      special: Theme.colors.primary,
    };
    return colors[category as keyof typeof colors] || Theme.colors.textSecondary;
  };

  const renderStats = () => {
    if (!userStats) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.levelContainer}>
          <View style={styles.levelInfo}>
            <Text style={styles.levelText}>Level {userStats.level}</Text>
            <Text style={styles.experienceText}>
              {userStats.experience} / {userStats.nextLevelExp} XP
            </Text>
          </View>
          <View style={styles.levelProgress}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(userStats.experience % 100)}%`,
                    backgroundColor: Theme.colors.primary,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={24} color={Theme.colors.error} />
            <Text style={styles.statValue}>{userStats.streaks.currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={24} color={Theme.colors.warning} />
            <Text style={styles.statValue}>{userStats.streaks.longestStreak}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={24} color={Theme.colors.success} />
            <Text style={styles.statValue}>{userStats.totalLogs}</Text>
            <Text style={styles.statLabel}>Total Logs</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={24} color={Theme.colors.primary} />
            <Text style={styles.statValue}>{userStats.totalDays}</Text>
            <Text style={styles.statLabel}>Days Tracked</Text>
          </View>
        </View>

        <View style={styles.averagesContainer}>
          <Text style={styles.averagesTitle}>Your Averages</Text>
          <View style={styles.averagesGrid}>
            <View style={styles.averageItem}>
              <Ionicons name="happy" size={20} color={Theme.colors.success} />
              <Text style={styles.averageValue}>{userStats.averageMood.toFixed(1)}</Text>
              <Text style={styles.averageLabel}>Mood</Text>
            </View>
            
            <View style={styles.averageItem}>
              <Ionicons name="moon" size={20} color={Theme.colors.primary} />
              <Text style={styles.averageValue}>{userStats.averageSleep.toFixed(1)}</Text>
              <Text style={styles.averageLabel}>Sleep</Text>
            </View>
            
            <View style={styles.averageItem}>
              <Ionicons name="flash" size={20} color={Theme.colors.warning} />
              <Text style={styles.averageValue}>{userStats.averageStress.toFixed(1)}</Text>
              <Text style={styles.averageLabel}>Stress</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderBadges = () => {
    if (!userStats) return null;

    const categories = ['streak', 'consistency', 'improvement', 'milestone', 'special'];
    
    return (
      <ScrollView style={styles.badgesContainer} showsVerticalScrollIndicator={false}>
        {categories.map(category => {
          const categoryBadges = userStats.badges.filter(badge => badge.category === category);
          if (categoryBadges.length === 0) return null;

          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Ionicons
                  name={getCategoryIcon(category) as any}
                  size={20}
                  color={getCategoryColor(category)}
                />
                <Text style={styles.categoryTitle}>
                  {category.charAt(0).toUpperCase() + category.slice(1)} Badges
                </Text>
              </View>
              
              <View style={styles.badgesGrid}>
                {categoryBadges.map(badge => (
                  <Animated.View
                    key={badge.id}
                    style={[
                      styles.badgeItem,
                      { transform: [{ scale: scaleAnim }] }
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.badgeButton,
                        badge.isUnlocked && styles.badgeUnlocked,
                        { borderColor: badge.color }
                      ]}
                      onPress={() => handleBadgePress(badge)}
                    >
                      <Ionicons
                        name={badge.icon as any}
                        size={32}
                        color={badge.isUnlocked ? badge.color : Theme.colors.textTertiary}
                      />
                      
                      {badge.isUnlocked && (
                        <View style={styles.unlockedIndicator}>
                          <Ionicons name="checkmark" size={12} color={Theme.colors.surface} />
                        </View>
                      )}
                    </TouchableOpacity>
                    
                    <Text style={[
                      styles.badgeName,
                      !badge.isUnlocked && styles.badgeNameLocked
                    ]}>
                      {badge.name}
                    </Text>
                    
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${(badge.progress / badge.maxProgress) * 100}%`,
                              backgroundColor: badge.color,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {badge.progress}/{badge.maxProgress}
                      </Text>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderAchievements = () => {
    if (!userStats) return null;

    return (
      <ScrollView style={styles.achievementsContainer} showsVerticalScrollIndicator={false}>
        {userStats.achievements.map(achievement => (
          <TouchableOpacity
            key={achievement.id}
            style={[
              styles.achievementItem,
              achievement.isUnlocked && styles.achievementUnlocked
            ]}
            onPress={() => handleAchievementPress(achievement)}
          >
            <View style={styles.achievementIcon}>
              <Ionicons
                name={achievement.isUnlocked ? 'trophy' : 'trophy-outline'}
                size={24}
                color={achievement.isUnlocked ? Theme.colors.warning : Theme.colors.textTertiary}
              />
            </View>
            
            <View style={styles.achievementContent}>
              <Text style={[
                styles.achievementTitle,
                !achievement.isUnlocked && styles.achievementTitleLocked
              ]}>
                {achievement.title}
              </Text>
              <Text style={[
                styles.achievementDescription,
                !achievement.isUnlocked && styles.achievementDescriptionLocked
              ]}>
                {achievement.description}
              </Text>
              <Text style={styles.achievementPoints}>
                {achievement.points} XP
              </Text>
            </View>
            
            {achievement.isUnlocked && (
              <View style={styles.achievementUnlockedBadge}>
                <Ionicons name="checkmark" size={16} color={Theme.colors.surface} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderBadgeModal = () => {
    if (!selectedBadge) return null;

    return (
      <Modal
        visible={showBadgeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBadgeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.badgeModal}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowBadgeModal(false)}
            >
              <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.badgeModalContent}>
              <View style={[styles.badgeIconLarge, { backgroundColor: selectedBadge.color + '20' }]}>
                <Ionicons
                  name={selectedBadge.icon as any}
                  size={64}
                  color={selectedBadge.color}
                />
              </View>
              
              <Text style={styles.badgeModalTitle}>{selectedBadge.name}</Text>
              <Text style={styles.badgeModalDescription}>{selectedBadge.description}</Text>
              
              <View style={styles.badgeModalProgress}>
                <Text style={styles.progressLabel}>Progress</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(selectedBadge.progress / selectedBadge.maxProgress) * 100}%`,
                        backgroundColor: selectedBadge.color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {selectedBadge.progress} / {selectedBadge.maxProgress}
                </Text>
              </View>
              
              {selectedBadge.isUnlocked && selectedBadge.unlockedAt && (
                <Text style={styles.unlockedDate}>
                  Unlocked on {selectedBadge.unlockedAt.toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderAchievementModal = () => {
    if (!selectedAchievement) return null;

    return (
      <Modal
        visible={showAchievementModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAchievementModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.achievementModal}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAchievementModal(false)}
            >
              <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.achievementModalContent}>
              <View style={styles.achievementIconLarge}>
                <Ionicons
                  name={selectedAchievement.isUnlocked ? 'trophy' : 'trophy-outline'}
                  size={64}
                  color={selectedAchievement.isUnlocked ? Theme.colors.warning : Theme.colors.textTertiary}
                />
              </View>
              
              <Text style={styles.achievementModalTitle}>{selectedAchievement.title}</Text>
              <Text style={styles.achievementModalDescription}>{selectedAchievement.description}</Text>
              
              <View style={styles.achievementModalPoints}>
                <Text style={styles.pointsLabel}>Reward</Text>
                <Text style={styles.pointsValue}>{selectedAchievement.points} XP</Text>
              </View>
              
              {selectedAchievement.isUnlocked && selectedAchievement.unlockedAt && (
                <Text style={styles.unlockedDate}>
                  Unlocked on {selectedAchievement.unlockedAt.toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (!userStats) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress & Achievements</Text>
        <View style={styles.categorySelector}>
          {(['stats', 'badges', 'achievements'] as const).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive,
              ]}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {selectedCategory === 'stats' && renderStats()}
      {selectedCategory === 'badges' && renderBadges()}
      {selectedCategory === 'achievements' && renderAchievements()}

      {renderBadgeModal()}
      {renderAchievementModal()}
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
  categorySelector: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    padding: 2,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.sm,
  },
  categoryButtonActive: {
    backgroundColor: Theme.colors.primary,
  },
  categoryButtonText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: Theme.colors.surface,
  },
  loadingText: {
    ...Theme.typography.body1,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    padding: Theme.spacing.xl,
  },
  statsContainer: {
    gap: Theme.spacing.lg,
  },
  levelContainer: {
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  levelText: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
  },
  experienceText: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
  },
  levelProgress: {
    height: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  statValue: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    fontWeight: 'bold',
    marginTop: Theme.spacing.xs,
  },
  statLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  averagesContainer: {
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
  },
  averagesTitle: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: Theme.spacing.md,
  },
  averagesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  averageItem: {
    alignItems: 'center',
  },
  averageValue: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    fontWeight: 'bold',
    marginTop: Theme.spacing.xs,
  },
  averageLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
  },
  badgesContainer: {
    maxHeight: 400,
  },
  categorySection: {
    marginBottom: Theme.spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  categoryTitle: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    marginLeft: Theme.spacing.sm,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  badgeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceVariant,
    position: 'relative',
  },
  badgeUnlocked: {
    backgroundColor: Theme.colors.surface,
  },
  unlockedIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeName: {
    ...Theme.typography.caption,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
  },
  badgeNameLocked: {
    color: Theme.colors.textTertiary,
  },
  progressContainer: {
    width: '100%',
    marginTop: Theme.spacing.xs,
  },
  progressText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: Theme.spacing.xs,
  },
  achievementsContainer: {
    maxHeight: 400,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    position: 'relative',
  },
  achievementUnlocked: {
    backgroundColor: Theme.colors.success + '20',
    borderWidth: 1,
    borderColor: Theme.colors.success,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
  },
  achievementTitleLocked: {
    color: Theme.colors.textTertiary,
  },
  achievementDescription: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  achievementDescriptionLocked: {
    color: Theme.colors.textTertiary,
  },
  achievementPoints: {
    ...Theme.typography.caption,
    color: Theme.colors.primary,
    fontWeight: '600',
    marginTop: Theme.spacing.xs,
  },
  achievementUnlockedBadge: {
    position: 'absolute',
    top: Theme.spacing.sm,
    right: Theme.spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeModal: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    width: '90%',
    maxWidth: 400,
    ...Theme.shadows.large,
  },
  achievementModal: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    width: '90%',
    maxWidth: 400,
    ...Theme.shadows.large,
  },
  closeButton: {
    position: 'absolute',
    top: Theme.spacing.md,
    right: Theme.spacing.md,
    zIndex: 1,
  },
  badgeModalContent: {
    alignItems: 'center',
    paddingTop: Theme.spacing.lg,
  },
  badgeIconLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  badgeModalTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  badgeModalDescription: {
    ...Theme.typography.body1,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  badgeModalProgress: {
    width: '100%',
    marginBottom: Theme.spacing.md,
  },
  progressLabel: {
    ...Theme.typography.body2,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: Theme.spacing.sm,
  },
  achievementModalContent: {
    alignItems: 'center',
    paddingTop: Theme.spacing.lg,
  },
  achievementIconLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  achievementModalTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  achievementModalDescription: {
    ...Theme.typography.body1,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  achievementModalPoints: {
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  pointsLabel: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  pointsValue: {
    ...Theme.typography.h2,
    color: Theme.colors.primary,
    fontWeight: 'bold',
  },
  unlockedDate: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

