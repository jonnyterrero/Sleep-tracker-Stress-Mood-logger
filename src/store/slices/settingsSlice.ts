import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserSettings } from '../../types';

interface SettingsState {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: null,
  isLoading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<UserSettings>) => {
      state.settings = action.payload;
    },
    updateSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      if (state.settings) {
        state.settings = { ...state.settings, ...action.payload };
      }
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<UserSettings['notifications']>>) => {
      if (state.settings) {
        state.settings.notifications = { ...state.settings.notifications, ...action.payload };
      }
    },
    updatePrivacySettings: (state, action: PayloadAction<Partial<UserSettings['privacy']>>) => {
      if (state.settings) {
        state.settings.privacy = { ...state.settings.privacy, ...action.payload };
      }
    },
    updateUnitSettings: (state, action: PayloadAction<Partial<UserSettings['units']>>) => {
      if (state.settings) {
        state.settings.units = { ...state.settings.units, ...action.payload };
      }
    },
    setTheme: (state, action: PayloadAction<UserSettings['theme']>) => {
      if (state.settings) {
        state.settings.theme = action.payload;
      }
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      if (state.settings) {
        state.settings.language = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setSettings,
  updateSettings,
  updateNotificationSettings,
  updatePrivacySettings,
  updateUnitSettings,
  setTheme,
  setLanguage,
  clearError,
} = settingsSlice.actions;

export default settingsSlice.reducer;

