import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { HealthEntry, HealthEntryType, SleepData, StressData, MoodData, SymptomData } from '../../types';
import { healthService } from '../../services/healthService';

interface HealthState {
  entries: HealthEntry[];
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
  currentEntry: Partial<HealthEntry> | null;
}

const initialState: HealthState = {
  entries: [],
  isLoading: false,
  error: null,
  lastSync: null,
  currentEntry: null,
};

// Async thunks
export const fetchHealthEntries = createAsyncThunk(
  'health/fetchEntries',
  async (params: { type?: HealthEntryType; startDate?: Date; endDate?: Date }, { rejectWithValue }) => {
    try {
      const response = await healthService.getHealthEntries(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch health entries');
    }
  }
);

export const addHealthEntry = createAsyncThunk(
  'health/addEntry',
  async (entry: Omit<HealthEntry, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await healthService.addHealthEntry(entry);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add health entry');
    }
  }
);

export const updateHealthEntry = createAsyncThunk(
  'health/updateEntry',
  async (entry: HealthEntry, { rejectWithValue }) => {
    try {
      const response = await healthService.updateHealthEntry(entry);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update health entry');
    }
  }
);

export const deleteHealthEntry = createAsyncThunk(
  'health/deleteEntry',
  async (entryId: string, { rejectWithValue }) => {
    try {
      await healthService.deleteHealthEntry(entryId);
      return entryId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete health entry');
    }
  }
);

export const syncHealthData = createAsyncThunk(
  'health/syncData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await healthService.syncHealthData();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sync health data');
    }
  }
);

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentEntry: (state, action: PayloadAction<Partial<HealthEntry> | null>) => {
      state.currentEntry = action.payload;
    },
    updateCurrentEntry: (state, action: PayloadAction<Partial<HealthEntry>>) => {
      if (state.currentEntry) {
        state.currentEntry = { ...state.currentEntry, ...action.payload };
      }
    },
    clearCurrentEntry: (state) => {
      state.currentEntry = null;
    },
    addLocalEntry: (state, action: PayloadAction<HealthEntry>) => {
      state.entries.unshift(action.payload);
    },
    updateLocalEntry: (state, action: PayloadAction<HealthEntry>) => {
      const index = state.entries.findIndex(entry => entry.id === action.payload.id);
      if (index !== -1) {
        state.entries[index] = action.payload;
      }
    },
    removeLocalEntry: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter(entry => entry.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Entries
      .addCase(fetchHealthEntries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHealthEntries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries = action.payload;
        state.lastSync = new Date();
      })
      .addCase(fetchHealthEntries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add Entry
      .addCase(addHealthEntry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addHealthEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries.unshift(action.payload);
        state.currentEntry = null;
      })
      .addCase(addHealthEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Entry
      .addCase(updateHealthEntry.fulfilled, (state, action) => {
        const index = state.entries.findIndex(entry => entry.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
        state.currentEntry = null;
      })
      // Delete Entry
      .addCase(deleteHealthEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter(entry => entry.id !== action.payload);
      })
      // Sync Data
      .addCase(syncHealthData.fulfilled, (state, action) => {
        state.entries = action.payload;
        state.lastSync = new Date();
      });
  },
});

export const {
  clearError,
  setCurrentEntry,
  updateCurrentEntry,
  clearCurrentEntry,
  addLocalEntry,
  updateLocalEntry,
  removeLocalEntry,
} = healthSlice.actions;

export default healthSlice.reducer;

