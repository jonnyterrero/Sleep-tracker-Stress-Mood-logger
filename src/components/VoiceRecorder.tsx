import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { voiceService, VoiceRecording } from '../services/voiceService';
import { Theme } from '../constants/theme';

interface VoiceRecorderProps {
  onRecordingComplete?: (recording: VoiceRecording) => void;
  onRecordingDelete?: () => void;
  existingRecording?: VoiceRecording | null;
  disabled?: boolean;
}

export default function VoiceRecorder({
  onRecordingComplete,
  onRecordingDelete,
  existingRecording,
  disabled = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentRecording, setCurrentRecording] = useState<VoiceRecording | null>(existingRecording || null);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    return () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, [recordingTimer]);

  useEffect(() => {
    if (isRecording && !isPaused) {
      // Start pulse animation
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(pulse);
      };
      pulse();

      // Start recording timer
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
    } else {
      // Stop pulse animation
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
    }
  }, [isRecording, isPaused]);

  const handleStartRecording = async () => {
    try {
      const success = await voiceService.startRecording();
      if (success) {
        setIsRecording(true);
        setIsPaused(false);
        setRecordingDuration(0);
        setCurrentRecording(null);
      } else {
        Alert.alert('Error', 'Failed to start recording. Please check your permissions.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
      console.error('Recording error:', error);
    }
  };

  const handlePauseRecording = async () => {
    try {
      if (isPaused) {
        const success = await voiceService.resumeRecording();
        if (success) {
          setIsPaused(false);
        }
      } else {
        const success = await voiceService.pauseRecording();
        if (success) {
          setIsPaused(true);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pause/resume recording');
      console.error('Pause/Resume error:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const recording = await voiceService.stopRecording();
      if (recording) {
        setCurrentRecording(recording);
        setIsRecording(false);
        setIsPaused(false);
        setRecordingDuration(0);
        onRecordingComplete?.(recording);
      } else {
        Alert.alert('Error', 'Failed to save recording');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
      console.error('Stop recording error:', error);
    }
  };

  const handleCancelRecording = async () => {
    try {
      await voiceService.cancelRecording();
      setIsRecording(false);
      setIsPaused(false);
      setRecordingDuration(0);
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel recording');
      console.error('Cancel recording error:', error);
    }
  };

  const handlePlayRecording = async () => {
    if (!currentRecording) return;
    
    try {
      await voiceService.playRecording(currentRecording.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to play recording');
      console.error('Play recording error:', error);
    }
  };

  const handleDeleteRecording = async () => {
    if (!currentRecording) return;

    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this voice note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await voiceService.deleteRecording(currentRecording.uri);
              setCurrentRecording(null);
              onRecordingDelete?.();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete recording');
              console.error('Delete recording error:', error);
            }
          },
        },
      ]
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (disabled) {
    return (
      <View style={styles.container}>
        <View style={[styles.recorderCard, styles.disabledCard]}>
          <Ionicons name="mic-off" size={24} color={Theme.colors.textTertiary} />
          <Text style={[styles.recorderText, styles.disabledText]}>
            Voice recording unavailable
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Voice Note</Text>
      
      {currentRecording ? (
        // Show existing recording
        <View style={styles.recordingCard}>
          <View style={styles.recordingInfo}>
            <Ionicons name="mic" size={20} color={Theme.colors.primary} />
            <Text style={styles.recordingText}>
              Voice note ({formatDuration(currentRecording.duration)})
            </Text>
          </View>
          <View style={styles.recordingActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePlayRecording}
            >
              <Ionicons name="play" size={20} color={Theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDeleteRecording}
            >
              <Ionicons name="trash" size={20} color={Theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      ) : isRecording ? (
        // Show recording in progress
        <View style={styles.recordingCard}>
          <Animated.View style={[styles.recordingIndicator, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name="mic" size={24} color={Theme.colors.error} />
          </Animated.View>
          <View style={styles.recordingInfo}>
            <Text style={styles.recordingText}>
              {isPaused ? 'Recording paused' : 'Recording...'} ({formatDuration(recordingDuration)})
            </Text>
          </View>
          <View style={styles.recordingActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePauseRecording}
            >
              <Ionicons 
                name={isPaused ? "play" : "pause"} 
                size={20} 
                color={Theme.colors.primary} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleStopRecording}
            >
              <Ionicons name="stop" size={20} color={Theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCancelRecording}
            >
              <Ionicons name="close" size={20} color={Theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Show start recording button
        <TouchableOpacity
          style={styles.startRecordingButton}
          onPress={handleStartRecording}
        >
          <Ionicons name="mic" size={24} color={Theme.colors.textInverse} />
          <Text style={styles.startRecordingText}>Start Voice Note</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.md,
  },
  sectionTitle: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  recorderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  disabledCard: {
    opacity: 0.5,
  },
  recorderText: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    marginLeft: Theme.spacing.sm,
  },
  disabledText: {
    color: Theme.colors.textTertiary,
  },
  recordingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    ...Theme.shadows.sm,
  },
  recordingIndicator: {
    marginRight: Theme.spacing.sm,
  },
  recordingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingText: {
    ...Theme.typography.body2,
    color: Theme.colors.textPrimary,
    marginLeft: Theme.spacing.sm,
  },
  recordingActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: Theme.spacing.sm,
    marginLeft: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.surfaceVariant,
  },
  startRecordingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadows.sm,
  },
  startRecordingText: {
    ...Theme.typography.button,
    color: Theme.colors.textInverse,
    marginLeft: Theme.spacing.sm,
  },
});

