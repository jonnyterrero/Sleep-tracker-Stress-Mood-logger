import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/theme';
import { speechService, SpeechRecognitionResult } from '../services/speechService';

interface VoiceJournalingWidgetProps {
  onTranscriptionComplete: (text: string) => void;
  initialText?: string;
  placeholder?: string;
}

export default function VoiceJournalingWidget({
  onTranscriptionComplete,
  initialText = '',
  placeholder = 'Tap to start voice journaling...',
}: VoiceJournalingWidgetProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState(initialText);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopAnimations = () => {
    pulseAnim.stopAnimation();
    waveAnim.stopAnimation();
    pulseAnim.setValue(1);
    waveAnim.setValue(0);
  };

  const startRecording = async () => {
    try {
      setIsProcessing(true);
      
      const success = await speechService.startRecognition(
        (result: SpeechRecognitionResult) => {
          setTranscribedText(result.text);
          
          if (result.isFinal) {
            onTranscriptionComplete(result.text);
          }
        },
        (error: string) => {
          Alert.alert('Speech Recognition Error', error);
          stopRecording();
        },
        {
          language: 'en-US',
          continuous: true,
          interimResults: true,
        }
      );

      if (success) {
        setIsRecording(true);
        setIsProcessing(false);
        startPulseAnimation();
        startDurationTimer();
      } else {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Start recording error:', error);
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to start voice recording');
    }
  };

  const stopRecording = async () => {
    try {
      const result = await speechService.stopRecognition();
      setIsRecording(false);
      stopAnimations();
      stopDurationTimer();
      
      if (result) {
        // Transcription is already handled in the onResult callback
        console.log('Recording stopped:', result);
      }
    } catch (error) {
      console.error('Stop recording error:', error);
    }
  };

  const startDurationTimer = () => {
    setRecordingDuration(0);
    durationInterval.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopDurationTimer = () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const clearText = () => {
    setTranscribedText('');
    onTranscriptionComplete('');
  };

  const playText = async () => {
    if (transcribedText) {
      await speechService.speak(transcribedText);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Journaling</Text>
        <View style={styles.headerActions}>
          {transcribedText ? (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={playText}>
                <Ionicons name="play" size={20} color={Theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={clearText}>
                <Ionicons name="trash" size={20} color={Theme.colors.error} />
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </View>

      <View style={styles.content}>
        {transcribedText ? (
          <View style={styles.transcriptionContainer}>
            <Text style={styles.transcriptionText}>{transcribedText}</Text>
          </View>
        ) : (
          <Text style={styles.placeholder}>{placeholder}</Text>
        )}

        <View style={styles.recordingContainer}>
          <Animated.View
            style={[
              styles.recordingButton,
              isRecording && styles.recordingButtonActive,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.recordingButtonInner,
                isRecording && styles.recordingButtonInnerActive,
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
            >
              <Ionicons
                name={isRecording ? 'stop' : 'mic'}
                size={32}
                color={isRecording ? Theme.colors.error : Theme.colors.primary}
              />
            </TouchableOpacity>
          </Animated.View>

          {isRecording && (
            <View style={styles.recordingInfo}>
              <View style={styles.recordingIndicator}>
                <Animated.View
                  style={[
                    styles.recordingWave,
                    {
                      opacity: waveAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.3, 1, 0.3],
                      }),
                    },
                  ]}
                />
                <Text style={styles.recordingText}>Recording...</Text>
              </View>
              <Text style={styles.durationText}>
                {formatDuration(recordingDuration)}
              </Text>
            </View>
          )}

          {isProcessing && (
            <View style={styles.processingContainer}>
              <Text style={styles.processingText}>Preparing...</Text>
            </View>
          )}
        </View>
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  title: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: Theme.spacing.sm,
    marginLeft: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.surfaceVariant,
  },
  content: {
    alignItems: 'center',
  },
  transcriptionContainer: {
    width: '100%',
    backgroundColor: Theme.colors.surfaceVariant,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    minHeight: 100,
  },
  transcriptionText: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    lineHeight: 24,
  },
  placeholder: {
    ...Theme.typography.body1,
    color: Theme.colors.textTertiary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
    fontStyle: 'italic',
  },
  recordingContainer: {
    alignItems: 'center',
  },
  recordingButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  recordingButtonActive: {
    backgroundColor: Theme.colors.error + '20',
  },
  recordingButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButtonInnerActive: {
    backgroundColor: Theme.colors.error,
  },
  recordingInfo: {
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  recordingWave: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Theme.colors.error,
    marginRight: Theme.spacing.sm,
  },
  recordingText: {
    ...Theme.typography.body2,
    color: Theme.colors.error,
    fontWeight: '600',
  },
  durationText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  processingText: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});

