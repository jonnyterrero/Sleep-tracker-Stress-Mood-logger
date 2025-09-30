import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/theme';
import { insightsService, Insight, PersonalizedTip } from '../services/insightsService';
import { copingStrategiesService, CopingStrategy, MoodBooster } from '../services/copingStrategiesService';
import { HealthEntry } from '../types';

interface PersonalizedInsightsWidgetProps {
  healthData: HealthEntry[];
  currentMood?: number;
  currentStress?: number;
}

export default function PersonalizedInsightsWidget({ 
  healthData, 
  currentMood = 5, 
  currentStress = 5 
}: PersonalizedInsightsWidgetProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [tips, setTips] = useState<PersonalizedTip[]>([]);
  const [copingStrategies, setCopingStrategies] = useState<CopingStrategy[]>([]);
  const [moodBoosters, setMoodBoosters] = useState<MoodBooster[]>([]);
  const [selectedTab, setSelectedTab] = useState<'insights' | 'tips' | 'coping' | 'boosters'>('insights');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    loadInsights();
    loadTips();
    loadCopingStrategies();
    loadMoodBoosters();
  }, [healthData, currentMood, currentStress]);

  const loadInsights = async () => {
    try {
      const generatedInsights = await insightsService.generateInsights(healthData);
      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const loadTips = async () => {
    try {
      const generatedTips = insightsService.generatePersonalizedTips(healthData);
      setTips(generatedTips);
    } catch (error) {
      console.error('Error loading tips:', error);
    }
  };

  const loadCopingStrategies = async () => {
    try {
      const strategies = copingStrategiesService.getRecommendedStrategies(
        currentMood, 
        currentStress, 
        5 // Default energy level
      );
      setCopingStrategies(strategies);
    } catch (error) {
      console.error('Error loading coping strategies:', error);
    }
  };

  const loadMoodBoosters = async () => {
    try {
      const boosters = copingStrategiesService.getRecommendedMoodBoosters(
        currentMood, 
        5 // Default energy level
      );
      setMoodBoosters(boosters);
    } catch (error) {
      console.error('Error loading mood boosters:', error);
    }
  };

  const handleItemPress = (item: any) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return Theme.colors.error;
      case 'medium': return Theme.colors.warning;
      case 'low': return Theme.colors.success;
      default: return Theme.colors.textSecondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      tip: 'bulb',
      warning: 'warning',
      achievement: 'trophy',
      correlation: 'analytics',
      sleep: 'moon',
      mood: 'happy',
      stress: 'flash',
      symptoms: 'medical',
      lifestyle: 'leaf',
    };
    return icons[category as keyof typeof icons] || 'help';
  };

  const renderInsights = () => {
    if (insights.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="analytics" size={48} color={Theme.colors.textTertiary} />
          <Text style={styles.emptyStateText}>No insights available yet</Text>
          <Text style={styles.emptyStateSubtext}>Keep logging your health data to get personalized insights</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {insights.map((insight) => (
          <TouchableOpacity
            key={insight.id}
            style={[styles.insightCard, { borderLeftColor: getPriorityColor(insight.priority) }]}
            onPress={() => handleItemPress(insight)}
          >
            <View style={styles.insightHeader}>
              <View style={styles.insightTitleContainer}>
                <Ionicons
                  name={getCategoryIcon(insight.category) as any}
                  size={20}
                  color={getPriorityColor(insight.priority)}
                />
                <Text style={styles.insightTitle}>{insight.title}</Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(insight.priority) + '20' }]}>
                <Text style={[styles.priorityText, { color: getPriorityColor(insight.priority) }]}>
                  {insight.priority.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={styles.insightDescription}>{insight.description}</Text>
            
            <View style={styles.insightFooter}>
              <Text style={styles.confidenceText}>
                {(insight.confidence * 100).toFixed(0)}% confidence
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Theme.colors.textTertiary} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderTips = () => {
    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {tips.map((tip) => (
          <TouchableOpacity
            key={tip.id}
            style={[styles.tipCard, { borderLeftColor: getPriorityColor(tip.priority) }]}
            onPress={() => handleItemPress(tip)}
          >
            <View style={styles.tipHeader}>
              <View style={styles.tipTitleContainer}>
                <Ionicons
                  name={getCategoryIcon(tip.category) as any}
                  size={20}
                  color={getPriorityColor(tip.priority)}
                />
                <Text style={styles.tipTitle}>{tip.title}</Text>
              </View>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{tip.difficulty}</Text>
              </View>
            </View>
            
            <Text style={styles.tipDescription}>{tip.description}</Text>
            <Text style={styles.tipAction}>{tip.action}</Text>
            
            <View style={styles.tipFooter}>
              <View style={styles.tipMeta}>
                <Ionicons name="time" size={14} color={Theme.colors.textSecondary} />
                <Text style={styles.tipMetaText}>{tip.timeRequired}</Text>
              </View>
              <View style={styles.tipMeta}>
                <Ionicons name="trending-up" size={14} color={Theme.colors.textSecondary} />
                <Text style={styles.tipMetaText}>{tip.estimatedImpact}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderCopingStrategies = () => {
    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {copingStrategies.map((strategy) => (
          <TouchableOpacity
            key={strategy.id}
            style={styles.strategyCard}
            onPress={() => handleItemPress(strategy)}
          >
            <View style={styles.strategyHeader}>
              <Text style={styles.strategyName}>{strategy.name}</Text>
              <View style={styles.strategyMeta}>
                <Text style={styles.strategyDuration}>{strategy.duration} min</Text>
                <View style={[styles.effectivenessBadge, { backgroundColor: Theme.colors.success + '20' }]}>
                  <Text style={[styles.effectivenessText, { color: Theme.colors.success }]}>
                    {strategy.effectiveness}/5
                  </Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.strategyDescription}>{strategy.description}</Text>
            
            <View style={styles.strategyFooter}>
              <View style={styles.strategyCategory}>
                <Ionicons name={getCategoryIcon(strategy.category) as any} size={16} color={Theme.colors.primary} />
                <Text style={styles.strategyCategoryText}>{strategy.category}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Theme.colors.textTertiary} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderMoodBoosters = () => {
    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {moodBoosters.map((booster) => (
          <TouchableOpacity
            key={booster.id}
            style={styles.boosterCard}
            onPress={() => handleItemPress(booster)}
          >
            <View style={styles.boosterHeader}>
              <Text style={styles.boosterName}>{booster.name}</Text>
              <View style={styles.boosterMeta}>
                <Text style={styles.boosterDuration}>{booster.duration} min</Text>
                <View style={[styles.moodImpactBadge, { backgroundColor: Theme.colors.primary + '20' }]}>
                  <Text style={[styles.moodImpactText, { color: Theme.colors.primary }]}>
                    {booster.moodImpact}/5
                  </Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.boosterDescription}>{booster.description}</Text>
            
            <View style={styles.boosterFooter}>
              <View style={styles.boosterCategory}>
                <Ionicons name={getCategoryIcon(booster.category) as any} size={16} color={Theme.colors.primary} />
                <Text style={styles.boosterCategoryText}>{booster.category}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Theme.colors.textTertiary} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderModal = () => {
    if (!selectedItem) return null;

    return (
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.modalTitle}>{selectedItem.title || selectedItem.name}</Text>
              <Text style={styles.modalDescription}>{selectedItem.description}</Text>
              
              {selectedItem.instructions && (
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionsTitle}>Instructions:</Text>
                  {selectedItem.instructions.map((instruction: string, index: number) => (
                    <Text key={index} style={styles.instructionText}>
                      {index + 1}. {instruction}
                    </Text>
                  ))}
                </View>
              )}
              
              {selectedItem.recommendations && (
                <View style={styles.recommendationsContainer}>
                  <Text style={styles.recommendationsTitle}>Recommendations:</Text>
                  {selectedItem.recommendations.map((recommendation: string, index: number) => (
                    <Text key={index} style={styles.recommendationText}>
                      • {recommendation}
                    </Text>
                  ))}
                </View>
              )}
              
              {selectedItem.benefits && (
                <View style={styles.benefitsContainer}>
                  <Text style={styles.benefitsTitle}>Benefits:</Text>
                  {selectedItem.benefits.map((benefit: string, index: number) => (
                    <Text key={index} style={styles.benefitText}>
                      • {benefit}
                    </Text>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Personalized Insights</Text>
        <View style={styles.tabSelector}>
          {(['insights', 'tips', 'coping', 'boosters'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                selectedTab === tab && styles.tabButtonActive,
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[
                styles.tabButtonText,
                selectedTab === tab && styles.tabButtonTextActive,
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {selectedTab === 'insights' && renderInsights()}
      {selectedTab === 'tips' && renderTips()}
      {selectedTab === 'coping' && renderCopingStrategies()}
      {selectedTab === 'boosters' && renderMoodBoosters()}

      {renderModal()}
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
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    padding: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: Theme.colors.primary,
  },
  tabButtonText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: Theme.colors.surface,
  },
  content: {
    maxHeight: 400,
  },
  emptyState: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyStateText: {
    ...Theme.typography.body1,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.md,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    ...Theme.typography.body2,
    color: Theme.colors.textTertiary,
    marginTop: Theme.spacing.sm,
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderLeftWidth: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  insightTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  insightTitle: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    marginLeft: Theme.spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  priorityText: {
    ...Theme.typography.caption,
    fontWeight: '600',
  },
  insightDescription: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },
  insightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceText: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
  },
  tipCard: {
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderLeftWidth: 4,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  tipTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tipTitle: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    marginLeft: Theme.spacing.sm,
  },
  difficultyBadge: {
    backgroundColor: Theme.colors.primary + '20',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  difficultyText: {
    ...Theme.typography.caption,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  tipDescription: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },
  tipAction: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: Theme.spacing.sm,
  },
  tipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tipMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipMetaText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginLeft: Theme.spacing.xs,
  },
  strategyCard: {
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  strategyName: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  strategyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strategyDuration: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginRight: Theme.spacing.sm,
  },
  effectivenessBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  effectivenessText: {
    ...Theme.typography.caption,
    fontWeight: '600',
  },
  strategyDescription: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },
  strategyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strategyCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strategyCategoryText: {
    ...Theme.typography.caption,
    color: Theme.colors.primary,
    marginLeft: Theme.spacing.xs,
    textTransform: 'capitalize',
  },
  boosterCard: {
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  boosterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  boosterName: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  boosterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boosterDuration: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginRight: Theme.spacing.sm,
  },
  moodImpactBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  moodImpactText: {
    ...Theme.typography.caption,
    fontWeight: '600',
  },
  boosterDescription: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },
  boosterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boosterCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boosterCategoryText: {
    ...Theme.typography.caption,
    color: Theme.colors.primary,
    marginLeft: Theme.spacing.xs,
    textTransform: 'capitalize',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    width: '90%',
    maxHeight: '80%',
    ...Theme.shadows.large,
  },
  closeButton: {
    position: 'absolute',
    top: Theme.spacing.md,
    right: Theme.spacing.md,
    zIndex: 1,
  },
  modalScrollView: {
    paddingTop: Theme.spacing.lg,
  },
  modalTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  modalDescription: {
    ...Theme.typography.body1,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.lg,
  },
  instructionsContainer: {
    marginBottom: Theme.spacing.lg,
  },
  instructionsTitle: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: Theme.spacing.sm,
  },
  instructionText: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  recommendationsContainer: {
    marginBottom: Theme.spacing.lg,
  },
  recommendationsTitle: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: Theme.spacing.sm,
  },
  recommendationText: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  benefitsContainer: {
    marginBottom: Theme.spacing.lg,
  },
  benefitsTitle: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: Theme.spacing.sm,
  },
  benefitText: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
});

