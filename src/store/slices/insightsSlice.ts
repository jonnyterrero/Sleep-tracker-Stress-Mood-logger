import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { HealthInsight, InsightType } from '../../types';
import { insightsService } from '../../services/insightsService';

interface InsightsState {
  insights: HealthInsight[];
  isLoading: boolean;
  error: string | null;
  lastGenerated: Date | null;
  unreadCount: number;
}

const initialState: InsightsState = {
  insights: [],
  isLoading: false,
  error: null,
  lastGenerated: null,
  unreadCount: 0,
};

// Async thunks
export const fetchInsights = createAsyncThunk(
  'insights/fetchInsights',
  async (params: { type?: InsightType; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await insightsService.getInsights(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch insights');
    }
  }
);

export const generateInsights = createAsyncThunk(
  'insights/generateInsights',
  async (_, { rejectWithValue }) => {
    try {
      const response = await insightsService.generateInsights();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate insights');
    }
  }
);

export const markInsightAsRead = createAsyncThunk(
  'insights/markAsRead',
  async (insightId: string, { rejectWithValue }) => {
    try {
      await insightsService.markInsightAsRead(insightId);
      return insightId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark insight as read');
    }
  }
);

export const dismissInsight = createAsyncThunk(
  'insights/dismissInsight',
  async (insightId: string, { rejectWithValue }) => {
    try {
      await insightsService.dismissInsight(insightId);
      return insightId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to dismiss insight');
    }
  }
);

const insightsSlice = createSlice({
  name: 'insights',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addInsight: (state, action: PayloadAction<HealthInsight>) => {
      state.insights.unshift(action.payload);
      state.unreadCount += 1;
    },
    updateInsight: (state, action: PayloadAction<HealthInsight>) => {
      const index = state.insights.findIndex(insight => insight.id === action.payload.id);
      if (index !== -1) {
        state.insights[index] = action.payload;
      }
    },
    removeInsight: (state, action: PayloadAction<string>) => {
      const insight = state.insights.find(i => i.id === action.payload);
      if (insight && !insight.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.insights = state.insights.filter(insight => insight.id !== action.payload);
    },
    markLocalInsightAsRead: (state, action: PayloadAction<string>) => {
      const insight = state.insights.find(i => i.id === action.payload);
      if (insight && !insight.read) {
        insight.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Insights
      .addCase(fetchInsights.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInsights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.insights = action.payload;
      })
      .addCase(fetchInsights.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Generate Insights
      .addCase(generateInsights.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateInsights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.insights = [...action.payload, ...state.insights];
        state.lastGenerated = new Date();
        state.unreadCount += action.payload.filter(i => !i.read).length;
      })
      .addCase(generateInsights.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Mark as Read
      .addCase(markInsightAsRead.fulfilled, (state, action) => {
        const insight = state.insights.find(i => i.id === action.payload);
        if (insight && !insight.read) {
          insight.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Dismiss Insight
      .addCase(dismissInsight.fulfilled, (state, action) => {
        const insight = state.insights.find(i => i.id === action.payload);
        if (insight && !insight.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.insights = state.insights.filter(insight => insight.id !== action.payload);
      });
  },
});

export const {
  clearError,
  addInsight,
  updateInsight,
  removeInsight,
  markLocalInsightAsRead,
  clearUnreadCount,
} = insightsSlice.actions;

export default insightsSlice.reducer;

