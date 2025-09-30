import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/theme';
import { useAppDispatch } from '../store';
import { updateLocalEntry } from '../store/slices/healthSlice';
import { healthService } from '../services/healthService';

const { width } = Dimensions.get('window');

interface QuickEntryWidgetProps {
  onEntryComplete?: () => void;
}

interface QuickEntryData {
  type: 'mood' | 'stress' | 'sleep_quality';
  value: number;
  timestamp: Date;
}

export default function QuickEntryWidget({ onEntryComplete }: QuickEntryWidgetProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'mood' | 'stress' | 'sleep_quality' | null>(null);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [scaleAnim] = useState(new Animated.Value(1));
  const dispatch = useAppDispatch();

  const quickEntryTypes = [
    {
      type: 'mood' as const,
      icon: 'happy-outline',
      color: Theme.colors.success,
      label: 'Mood',
      emoji: '😊',
    },
    {
      type: 'stress' as const,
      icon: 'flash-outline',
      color: Theme.colors.warning,
      label: 'Stress',
      emoji: '⚡',
    },
    {
      type: 'sleep_quality' as const,
      icon: 'moon-outline',
      color: Theme.colors.primary,
      label: 'Sleep',
      emoji: '🌙',
    },
  ];

  const handleQuickEntry = async (type: 'mood' | 'stress' | 'sleep_quality', value: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Animate button press
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

      // Get or create today's entry
      let entry = await healthService.getHealthEntry(today);
      
      if (!entry) {
        // Create new entry with default values
        entry = await healthService.logEntry(
          today,
          '23:00', // Default sleep start
          '07:00', // Default sleep end
          5, // Default quality
          5, // Default mood
          5, // Default stress
          '', // No journal
          null, // No voice note
          0, // No GI flare
          0, // No skin flare
          0  // No migraine
        );
      }

      // Update the specific field
      const updatedEntry = {
        ...entry,
        mood: {
          ...entry.mood,
          ...(type === 'mood' && { mood_score: value }),
          ...(type === 'stress' && { stress_score: value }),
        },
        sleep: {
          ...entry.sleep,
          ...(type === 'sleep_quality' && { quality_score: value }),
        },
      };

      await healthService.updateHealthEntry(updatedEntry);
      dispatch(updateLocalEntry(updatedEntry as any));

      setShowModal(false);
      setSelectedType(null);
      setSelectedValue(null);
      onEntryComplete?.();

    } catch (error) {
      console.error('Quick entry error:', error);
    }
  };

  const renderValueSelector = () => {
    if (!selectedType) return null;

    const typeConfig = quickEntryTypes.find(t => t.type === selectedType);
    if (!typeConfig) return null;

    const values = Array.from({ length: 10 }, (_, i) => i + 1);
    const labels = {
      mood: ['😢', '😕', '😐', '🙂', '😊', '😄', '🤩', '🥰', '😍', '🤗'],
      stress: ['😌', '😊', '🙂', '😐', '😟', '😰', '😨', '😱', '🤯', '💥'],
      sleep_quality: ['😴', '😪', '😑', '😐', '🙂', '😊', '😌', '😴', '😴', '😴'],
    };

    return (
      <View style={styles.valueSelector}>
        <Text style={styles.valueSelectorTitle}>
          How's your {typeConfig.label.toLowerCase()}?
        </Text>
        
        <View style={styles.valueGrid}>
          {values.map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.valueButton,
                selectedValue === value && styles.valueButtonSelected,
                { borderColor: typeConfig.color }
              ]}
              onPress={() => setSelectedValue(value)}
            >
              <Text style={styles.valueEmoji}>
                {labels[selectedType][value - 1]}
              </Text>
              <Text style={[
                styles.valueNumber,
                selectedValue === value && { color: typeConfig.color }
              ]}>
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => {
              setSelectedType(null);
              setSelectedValue(null);
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.confirmButton,
              { backgroundColor: typeConfig.color },
              selectedValue === null && styles.disabledButton
            ]}
            onPress={() => selectedValue && handleQuickEntry(selectedType, selectedValue)}
            disabled={selectedValue === null}
          >
            <Text style={styles.confirmButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Quick Check-in</Text>
        <Text style={styles.subtitle}>How are you feeling right now?</Text>
        
        <View style={styles.buttonsContainer}>
          {quickEntryTypes.map((entryType) => (
            <Animated.View
              key={entryType.type}
              style={[
                styles.quickButton,
                { backgroundColor: entryType.color + '20', borderColor: entryType.color },
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <TouchableOpacity
                style={styles.quickButtonContent}
                onPress={() => {
                  setSelectedType(entryType.type);
                  setShowModal(true);
                }}
              >
                <Text style={styles.quickButtonEmoji}>{entryType.emoji}</Text>
                <Text style={[styles.quickButtonText, { color: entryType.color }]}>
                  {entryType.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
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
            
            {renderValueSelector()}
          </View>
        </View>
      </Modal>
    </>
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
  title: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.lg,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickButton: {
    flex: 1,
    marginHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    overflow: 'hidden',
  },
  quickButtonContent: {
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  quickButtonEmoji: {
    fontSize: 32,
    marginBottom: Theme.spacing.sm,
  },
  quickButtonText: {
    ...Theme.typography.body2,
    fontWeight: '600',
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
    width: width * 0.9,
    maxHeight: '80%',
    ...Theme.shadows.large,
  },
  closeButton: {
    position: 'absolute',
    top: Theme.spacing.md,
    right: Theme.spacing.md,
    zIndex: 1,
  },
  valueSelector: {
    paddingTop: Theme.spacing.lg,
  },
  valueSelectorTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  valueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.lg,
  },
  valueButton: {
    width: (width * 0.7) / 5 - Theme.spacing.sm,
    aspectRatio: 1,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    backgroundColor: Theme.colors.surfaceVariant,
  },
  valueButtonSelected: {
    backgroundColor: Theme.colors.primary + '20',
  },
  valueEmoji: {
    fontSize: 24,
    marginBottom: Theme.spacing.xs,
  },
  valueNumber: {
    ...Theme.typography.caption,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.sm,
  },
  cancelButton: {
    backgroundColor: Theme.colors.surfaceVariant,
  },
  confirmButton: {
    backgroundColor: Theme.colors.primary,
  },
  disabledButton: {
    backgroundColor: Theme.colors.textTertiary,
  },
  cancelButtonText: {
    ...Theme.typography.body1,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  confirmButtonText: {
    ...Theme.typography.body1,
    color: Theme.colors.surface,
    fontWeight: '600',
  },
});

