import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { setFirstTime } from '../store/slices/authSlice';
import { Theme } from '../constants/theme';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Track Sleep & Stress',
    subtitle: 'Monitor sleep quality, mood, stress, and symptoms in one place',
    icon: 'fitness-outline',
    color: Theme.colors.primary,
  },
  {
    id: 2,
    title: 'Get Insights',
    subtitle: 'Discover patterns and correlations in your sleep and stress data',
    icon: 'analytics-outline',
    color: Theme.colors.secondary,
  },
  {
    id: 3,
    title: 'AI-Powered Analysis',
    subtitle: 'Receive personalized sleep and stress recommendations',
    icon: 'bulb-outline',
    color: Theme.colors.accent,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dispatch = useDispatch();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = () => {
    dispatch(setFirstTime(false));
  };

  const currentData = onboardingData[currentIndex];

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentIndex && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackground, { backgroundColor: currentData.color }]}>
            <Ionicons name={currentData.icon as any} size={80} color={Theme.colors.textInverse} />
          </View>
        </View>

        <Text style={styles.title}>{currentData.title}</Text>
        <Text style={styles.subtitle}>{currentData.subtitle}</Text>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          {currentIndex === 0 && (
            <>
              <View style={styles.feature}>
                <Ionicons name="moon-outline" size={24} color={Theme.colors.primary} />
                <Text style={styles.featureText}>Sleep Quality Tracking</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="heart-outline" size={24} color={Theme.colors.secondary} />
                <Text style={styles.featureText}>Mood & Stress Monitoring</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="medical-outline" size={24} color={Theme.colors.accent} />
                <Text style={styles.featureText}>Symptom Tracking</Text>
              </View>
            </>
          )}

          {currentIndex === 1 && (
            <>
              <View style={styles.feature}>
                <Ionicons name="trending-up-outline" size={24} color={Theme.colors.primary} />
                <Text style={styles.featureText}>Health Trend Analysis</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="link-outline" size={24} color={Theme.colors.secondary} />
                <Text style={styles.featureText}>Correlation Discovery</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="bar-chart-outline" size={24} color={Theme.colors.accent} />
                <Text style={styles.featureText}>Visual Data Reports</Text>
              </View>
            </>
          )}

          {currentIndex === 2 && (
            <>
              <View style={styles.feature}>
                <Ionicons name="brain-outline" size={24} color={Theme.colors.primary} />
                <Text style={styles.featureText}>ML Pattern Recognition</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="chatbubble-outline" size={24} color={Theme.colors.secondary} />
                <Text style={styles.featureText}>AI Health Assistant</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="notifications-outline" size={24} color={Theme.colors.accent} />
                <Text style={styles.featureText}>Smart Recommendations</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons 
            name={currentIndex === onboardingData.length - 1 ? 'checkmark' : 'arrow-forward'} 
            size={20} 
            color={Theme.colors.textInverse} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Theme.spacing.xxl,
    paddingBottom: Theme.spacing.lg,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.border,
    marginHorizontal: Theme.spacing.xs,
  },
  progressDotActive: {
    backgroundColor: Theme.colors.primary,
    width: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: Theme.spacing.xxl,
  },
  iconBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.lg,
  },
  title: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  subtitle: {
    ...Theme.typography.body1,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Theme.spacing.xxl,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 300,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  featureText: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    marginLeft: Theme.spacing.md,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  skipButton: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
  },
  skipButtonText: {
    ...Theme.typography.body1,
    color: Theme.colors.textSecondary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.lg,
  },
  nextButtonText: {
    ...Theme.typography.button,
    color: Theme.colors.textInverse,
    marginRight: Theme.spacing.sm,
  },
});

