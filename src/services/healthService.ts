import { apiService } from './api';
import { HealthEntrySchema, SleepData, MoodData, SymptomData } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

class HealthService {
  private readonly STORAGE_KEY = 'health_entries';

  // Main logging function that matches your Python log_entry function
  async logEntry(
    date: string,
    sleepStart: string,
    sleepEnd: string,
    quality: number,
    moodScore: number,
    stressScore: number,
    journal: string = '',
    voiceNotePath?: string,
    giFlare: number = 0,
    skinFlare: number = 0,
    migraine: number = 0
  ): Promise<HealthEntrySchema> {
    // Calculate sleep duration (matches your Python logic)
    const durationHours = this.calculateSleepDuration(sleepStart, sleepEnd);

    const entry: HealthEntrySchema = {
      date,
      sleep: {
        start_time: sleepStart,
        end_time: sleepEnd,
        duration_hours: Math.round(durationHours * 100) / 100, // Round to 2 decimal places
        quality_score: quality,
      },
      mood: {
        mood_score: moodScore,
        stress_score: stressScore,
        journal_entry: journal,
        voice_note_path: voiceNotePath,
      },
      symptoms: {
        gi_flare: giFlare,
        skin_flare: skinFlare,
        migraine: migraine,
      },
    };

    // Save locally first
    await this.saveEntryLocally(entry);

    // Then sync to server
    try {
      await this.syncEntryToServer(entry);
    } catch (error) {
      console.warn('Failed to sync entry to server:', error);
      // Entry is still saved locally, will sync later
    }

    return entry;
  }

  // Calculate sleep duration (matches your Python logic)
  private calculateSleepDuration(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    
    // Handle overnight case (end time is next day)
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60; // Add 24 hours
    }
    
    const durationMinutes = endMinutes - startMinutes;
    return durationMinutes / 60; // Convert to hours
  }

  // Save entry to local storage
  private async saveEntryLocally(entry: HealthEntrySchema): Promise<void> {
    try {
      const existingEntries = await this.getLocalEntries();
      const entryIndex = existingEntries.findIndex(e => e.date === entry.date);
      
      if (entryIndex >= 0) {
        // Update existing entry
        existingEntries[entryIndex] = entry;
      } else {
        // Add new entry
        existingEntries.push(entry);
      }
      
      // Sort by date (newest first)
      existingEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingEntries));
    } catch (error) {
      console.error('Failed to save entry locally:', error);
      throw error;
    }
  }

  // Get all local entries
  async getLocalEntries(): Promise<HealthEntrySchema[]> {
    try {
      const entriesStr = await AsyncStorage.getItem(this.STORAGE_KEY);
      return entriesStr ? JSON.parse(entriesStr) : [];
    } catch (error) {
      console.error('Failed to get local entries:', error);
      return [];
    }
  }

  // Get entry for specific date
  async getEntryForDate(date: string): Promise<HealthEntrySchema | null> {
    const entries = await this.getLocalEntries();
    return entries.find(entry => entry.date === date) || null;
  }

  // Get entries for date range
  async getEntriesForDateRange(startDate: string, endDate: string): Promise<HealthEntrySchema[]> {
    const entries = await this.getLocalEntries();
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return entryDate >= start && entryDate <= end;
    });
  }

  // Sync entry to server
  private async syncEntryToServer(entry: HealthEntrySchema): Promise<void> {
    const response = await apiService.post('/health/entries', entry);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to sync entry to server');
    }
  }

  // Sync all local entries to server
  async syncAllEntries(): Promise<void> {
    const localEntries = await this.getLocalEntries();
    
    for (const entry of localEntries) {
      try {
        await this.syncEntryToServer(entry);
      } catch (error) {
        console.warn(`Failed to sync entry for ${entry.date}:`, error);
      }
    }
  }

  // Get entries from server
  async getHealthEntries(params: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}): Promise<HealthEntrySchema[]> {
    const queryParams = new URLSearchParams();
    
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await apiService.get<HealthEntrySchema[]>(`/health/entries?${queryParams}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch health entries');
  }

  // Add health entry (for Redux integration)
  async addHealthEntry(entry: Omit<HealthEntrySchema, 'date'> & { date: string }): Promise<HealthEntrySchema> {
    return this.logEntry(
      entry.date,
      entry.sleep.start_time,
      entry.sleep.end_time,
      entry.sleep.quality_score,
      entry.mood.mood_score,
      entry.mood.stress_score,
      entry.mood.journal_entry,
      entry.mood.voice_note_path,
      entry.symptoms.gi_flare,
      entry.symptoms.skin_flare,
      entry.symptoms.migraine
    );
  }

  // Update health entry
  async updateHealthEntry(entry: HealthEntrySchema): Promise<HealthEntrySchema> {
    await this.saveEntryLocally(entry);
    
    try {
      const response = await apiService.put(`/health/entries/${entry.date}`, entry);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update health entry');
      }
      
      return response.data || entry;
    } catch (error) {
      console.warn('Failed to update entry on server:', error);
      return entry; // Return local version
    }
  }

  // Delete health entry
  async deleteHealthEntry(date: string): Promise<void> {
    const entries = await this.getLocalEntries();
    const filteredEntries = entries.filter(entry => entry.date !== date);
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredEntries));
    
    try {
      await apiService.delete(`/health/entries/${date}`);
    } catch (error) {
      console.warn('Failed to delete entry on server:', error);
    }
  }

  // Sync health data (for Redux integration)
  async syncHealthData(): Promise<HealthEntrySchema[]> {
    await this.syncAllEntries();
    return this.getLocalEntries();
  }

  // Export data as JSON (for Python analysis)
  async exportDataAsJSON(): Promise<string> {
    const entries = await this.getLocalEntries();
    return JSON.stringify(entries, null, 2);
  }

  // Import data from JSON (from Python analysis results)
  async importDataFromJSON(jsonData: string): Promise<void> {
    try {
      const entries: HealthEntrySchema[] = JSON.parse(jsonData);
      
      for (const entry of entries) {
        await this.saveEntryLocally(entry);
      }
    } catch (error) {
      throw new Error('Invalid JSON data format');
    }
  }

  // Get correlation data (for ML analysis)
  async getCorrelationData(): Promise<{
    sleep: { duration_hours: number; quality_score: number }[];
    mood: { mood_score: number; stress_score: number }[];
    symptoms: { gi_flare: number; skin_flare: number; migraine: number }[];
  }> {
    const entries = await this.getLocalEntries();
    
    return {
      sleep: entries.map(e => ({
        duration_hours: e.sleep.duration_hours,
        quality_score: e.sleep.quality_score,
      })),
      mood: entries.map(e => ({
        mood_score: e.mood.mood_score,
        stress_score: e.mood.stress_score,
      })),
      symptoms: entries.map(e => ({
        gi_flare: e.symptoms.gi_flare,
        skin_flare: e.symptoms.skin_flare,
        migraine: e.symptoms.migraine,
      })),
    };
  }
}

export const healthService = new HealthService();

