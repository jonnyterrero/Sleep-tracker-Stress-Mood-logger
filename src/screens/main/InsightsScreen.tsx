import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { Theme } from '../../constants/theme';
import { MainStackParamList } from '../../types';

type InsightsNavigationProp = StackNavigationProp<MainStackParamList, 'InsightsHome'>;

export default function InsightsScreen() {
  const navigation = useNavigation<InsightsNavigationProp>();

  const insightCategories = [
    {
      id: 'health',
      title: 'Health Insights',
      subtitle: 'AI-powered health analysis and recommendations',
      icon: 'bulb-outline',
      color: Theme.colors.primary,
      onPress: () => navigation.navigate('HealthInsights'),
    },
    {
      id: 'trends',
      title: 'Trends & Patterns',
      subtitle: 'Visualize your health data over time',
      icon: 'trending-up-outline',
      color: Theme.colors.secondary,
      onPress: () => navigation.navigate('Trends'),
    },
    {
      id: 'predictions',
      title: 'Predictions',
      subtitle: 'ML-based health predictions and alerts',
      icon: 'analytics-outline',
      color: Theme.colors.accent,
      onPress: () => navigation.navigate('Predictions'),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sleep & Stress Insights</Text>
        <Text style={styles.headerSubtitle}>
          Discover patterns and get personalized recommendations
        </Text>
      </View>

      <View style={styles.categoriesSection}>
        {insightCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={category.onPress}
          >
            <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
              <Ionicons name={category.icon as any} size={32} color={Theme.colors.textInverse} />
            </View>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Theme.colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.comingSoonCard}>
        <Ionicons name="construct-outline" size={48} color={Theme.colors.textTertiary} />
        <Text style={styles.comingSoonTitle}>More Features Coming Soon</Text>
        <Text style={styles.comingSoonText}>
          We're working on advanced ML models and LLM integration for even better insights.
        </Text>
      </View>
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
  categoriesSection: {
    paddingHorizontal: Theme.spacing.lg,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.md,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.lg,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    ...Theme.typography.h5,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  categorySubtitle: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
  },
  comingSoonCard: {
    margin: Theme.spacing.lg,
    padding: Theme.spacing.xl,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  comingSoonTitle: {
    ...Theme.typography.h5,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  comingSoonText: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

