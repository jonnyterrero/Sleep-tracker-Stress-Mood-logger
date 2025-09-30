import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface VoiceRecording {
  uri: string;
  duration: number;
  size: number;
  timestamp: Date;
}

class VoiceService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private isPaused = false;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  }

  async startRecording(): Promise<boolean> {
    try {
      if (this.isRecording) {
        return false;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Audio recording permission not granted');
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      // Create recording instance
      this.recording = new Audio.Recording();
      
      const recordingOptions = {
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
      };

      await this.recording.prepareToRecordAsync(recordingOptions);
      await this.recording.startAsync();
      
      this.isRecording = true;
      this.isPaused = false;
      
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }

  async pauseRecording(): Promise<boolean> {
    try {
      if (!this.isRecording || this.isPaused || !this.recording) {
        return false;
      }

      await this.recording.pauseAsync();
      this.isPaused = true;
      return true;
    } catch (error) {
      console.error('Error pausing recording:', error);
      return false;
    }
  }

  async resumeRecording(): Promise<boolean> {
    try {
      if (!this.isRecording || !this.isPaused || !this.recording) {
        return false;
      }

      await this.recording.startAsync();
      this.isPaused = false;
      return true;
    } catch (error) {
      console.error('Error resuming recording:', error);
      return false;
    }
  }

  async stopRecording(): Promise<VoiceRecording | null> {
    try {
      if (!this.isRecording || !this.recording) {
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      
      const uri = this.recording.getURI();
      if (!uri) {
        throw new Error('Recording URI is null');
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const duration = await this.getRecordingDuration(uri);

      const voiceRecording: VoiceRecording = {
        uri,
        duration: duration || 0,
        size: fileInfo.exists ? fileInfo.size || 0 : 0,
        timestamp: new Date(),
      };

      // Reset recording state
      this.recording = null;
      this.isRecording = false;
      this.isPaused = false;

      return voiceRecording;
    } catch (error) {
      console.error('Error stopping recording:', error);
      return null;
    }
  }

  async cancelRecording(): Promise<boolean> {
    try {
      if (!this.isRecording || !this.recording) {
        return false;
      }

      await this.recording.stopAndUnloadAsync();
      
      // Delete the recording file
      const uri = this.recording.getURI();
      if (uri) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }

      // Reset recording state
      this.recording = null;
      this.isRecording = false;
      this.isPaused = false;

      return true;
    } catch (error) {
      console.error('Error canceling recording:', error);
      return false;
    }
  }

  async playRecording(uri: string): Promise<boolean> {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
      
      // Clean up when playback finishes
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });

      return true;
    } catch (error) {
      console.error('Error playing recording:', error);
      return false;
    }
  }

  async deleteRecording(uri: string): Promise<boolean> {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      return true;
    } catch (error) {
      console.error('Error deleting recording:', error);
      return false;
    }
  }

  private async getRecordingDuration(uri: string): Promise<number | null> {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      const status = await sound.getStatusAsync();
      
      if (status.isLoaded && status.durationMillis) {
        sound.unloadAsync();
        return status.durationMillis / 1000; // Convert to seconds
      }
      
      sound.unloadAsync();
      return null;
    } catch (error) {
      console.error('Error getting recording duration:', error);
      return null;
    }
  }

  getRecordingState() {
    return {
      isRecording: this.isRecording,
      isPaused: this.isPaused,
    };
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const voiceService = new VoiceService();

