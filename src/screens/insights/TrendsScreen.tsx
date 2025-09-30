import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../constants/theme';

export default function TrendsScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sleep & Stress Trends</Text>
        <Text style={styles.headerSubtitle}>
          Visualize your sleep and stress data over time
        </Text>
      </View>

      <View style={styles.comingSoonCard}>
        <Ionicons name="bar-chart-outline" size={64} color={Theme.colors.secondary} />
        <Text style={styles.comingSoonTitle}>Charts & Visualizations Coming Soon</Text>
        <Text style={styles.comingSoonText}>
          Interactive charts and graphs to help you understand your sleep and stress trends, correlations, and patterns over time.
        </Text>
      </View>

      <View style={styles.featuresCard}>
        <Text style={styles.featuresTitle}>Planned Visualizations</Text>
        
        <View style={styles.feature}>
          <Ionicons name="trending-up-outline" size={24} color={Theme.colors.primary} />
          <Text style={styles.featureText}>Sleep Quality Trends</Text>
        </View>
        
        <View style={styles.feature}>
          <Ionicons name="heart-outline" size={24} color={Theme.colors.secondary} />
          <Text style={styles.featureText}>Mood & Stress Patterns</Text>
        </View>
        
        <View style={styles.feature}>
          <Ionicons name="medical-outline" size={24} color={Theme.colors.accent} />
          <Text style={styles.featureText}>Symptom Frequency Charts</Text>
        </View>
        
        <View style={styles.feature}>
          <Ionicons name="link-outline" size={24} color={Theme.colors.primary} />
          <Text style={styles.featureText}>Correlation Heatmaps</Text>
        </View>
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
  comingSoonCard: {
    margin: Theme.spacing.lg,
    padding: Theme.spacing.xl,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  comingSoonTitle: {
    ...Theme.typography.h4,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  comingSoonText: {
    ...Theme.typography.body1,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresCard: {
    margin: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.sm,
  },
  featuresTitle: {
    ...Theme.typography.h5,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  featureText: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    marginLeft: Theme.spacing.md,
  },
});

