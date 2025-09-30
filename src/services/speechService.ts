import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

class SpeechService {
  private isRecording = false;
  private recording: Audio.Recording | null = null;
  private recognitionTimeout: NodeJS.Timeout | null = null;

  /**
   * Start speech recognition
   */
  async startRecognition(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void,
    options: SpeechRecognitionOptions = {}
  ): Promise<boolean> {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        onError?.('Microphone permission not granted');
        return false;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      await recording.startAsync();
      this.recording = recording;
      this.isRecording = true;

      // Simulate speech recognition (in a real app, you'd use a service like Google Speech-to-Text)
      this.simulateSpeechRecognition(onResult, onError, options);

      return true;
    } catch (error) {
      console.error('Speech recognition error:', error);
      onError?.(error instanceof Error ? error.message : 'Speech recognition failed');
      return false;
    }
  }

  /**
   * Stop speech recognition
   */
  async stopRecognition(): Promise<string | null> {
    try {
      if (!this.recording || !this.isRecording) {
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      this.isRecording = false;

      // Clear timeout
      if (this.recognitionTimeout) {
        clearTimeout(this.recognitionTimeout);
        this.recognitionTimeout = null;
      }

      // In a real app, you would send the audio file to a speech recognition service
      // For now, we'll return a placeholder
      return 'Voice note recorded successfully';
    } catch (error) {
      console.error('Stop recognition error:', error);
      return null;
    }
  }

  /**
   * Check if currently recording
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Text-to-speech
   */
  async speak(text: string, options: { language?: string; rate?: number } = {}): Promise<void> {
    try {
      await Speech.speak(text, {
        language: options.language || 'en-US',
        rate: options.rate || 0.5,
        pitch: 1.0,
        volume: 1.0,
      });
    } catch (error) {
      console.error('Text-to-speech error:', error);
    }
  }

  /**
   * Stop text-to-speech
   */
  async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop();
    } catch (error) {
      console.error('Stop speaking error:', error);
    }
  }

  /**
   * Simulate speech recognition (replace with real service)
   */
  private simulateSpeechRecognition(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void,
    options: SpeechRecognitionOptions = {}
  ): void {
    // Simulate interim results
    const interimTexts = [
      'I had a really tough day today...',
      'My sleep was terrible last night...',
      'I feel really stressed about work...',
      'My mood has been up and down...',
      'I think I need to take better care of myself...',
    ];

    let currentText = '';
    let wordIndex = 0;
    const words = interimTexts[Math.floor(Math.random() * interimTexts.length)].split(' ');

    const addWord = () => {
      if (wordIndex < words.length && this.isRecording) {
        currentText += (currentText ? ' ' : '') + words[wordIndex];
        wordIndex++;

        onResult({
          text: currentText,
          confidence: Math.min(0.9, 0.5 + (wordIndex / words.length) * 0.4),
          isFinal: false,
        });

        // Schedule next word
        this.recognitionTimeout = setTimeout(addWord, 500 + Math.random() * 1000);
      } else if (this.isRecording) {
        // Final result
        onResult({
          text: currentText,
          confidence: 0.95,
          isFinal: true,
        });
      }
    };

    // Start the simulation
    addWord();
  }

  /**
   * Get available languages for speech recognition
   */
  getAvailableLanguages(): { code: string; name: string }[] {
    return [
      { code: 'en-US', name: 'English (US)' },
      { code: 'en-GB', name: 'English (UK)' },
      { code: 'es-ES', name: 'Spanish' },
      { code: 'fr-FR', name: 'French' },
      { code: 'de-DE', name: 'German' },
      { code: 'it-IT', name: 'Italian' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)' },
      { code: 'ja-JP', name: 'Japanese' },
      { code: 'ko-KR', name: 'Korean' },
      { code: 'zh-CN', name: 'Chinese (Simplified)' },
    ];
  }

  /**
   * Check if speech recognition is supported on this platform
   */
  isSupported(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web';
  }
}

export const speechService = new SpeechService();

