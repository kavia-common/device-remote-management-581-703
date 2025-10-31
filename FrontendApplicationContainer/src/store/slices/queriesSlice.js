import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as protocolsApi from '../../api/protocols';

// Async thunks

// PUBLIC_INTERFACE
/**
 * Fetch query history async thunk
 */
export const fetchQueryHistory = createAsyncThunk(
  'queries/fetchHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await protocolsApi.getQueryHistory(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch history' });
    }
  }
);

// PUBLIC_INTERFACE
/**
 * Fetch query status async thunk
 */
export const fetchQueryStatus = createAsyncThunk(
  'queries/fetchStatus',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await protocolsApi.getQueryStatus(jobId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch status' });
    }
  }
);

// PUBLIC_INTERFACE
/**
 * Fetch query results async thunk
 */
export const fetchQueryResults = createAsyncThunk(
  'queries/fetchResults',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await protocolsApi.getQueryResults(jobId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch results' });
    }
  }
);

// Initial state
const initialState = {
  history: [],
  activeQueries: {},
  results: {},
  pagination: {
    page: 1,
    pageSize: 50,
    totalPages: 0,
    totalItems: 0,
  },
  loading: false,
  error: null,
};

// Slice
const queriesSlice = createSlice({
  name: 'queries',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addActiveQuery: (state, action) => {
      const { jobId, queryData } = action.payload;
      state.activeQueries[jobId] = {
        ...queryData,
        status: 'pending',
        startTime: new Date().toISOString(),
      };
    },
    updateQueryStatus: (state, action) => {
      const { jobId, status } = action.payload;
      if (state.activeQueries[jobId]) {
        state.activeQueries[jobId].status = status;
      }
    },
    removeActiveQuery: (state, action) => {
      delete state.activeQueries[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch history
      .addCase(fetchQueryHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQueryHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.data || action.payload.queries || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchQueryHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch history';
      })
      // Fetch status
      .addCase(fetchQueryStatus.fulfilled, (state, action) => {
        const jobId = action.meta.arg;
        if (state.activeQueries[jobId]) {
          state.activeQueries[jobId].status = action.payload.status;
        }
      })
      // Fetch results
      .addCase(fetchQueryResults.fulfilled, (state, action) => {
        const jobId = action.meta.arg;
        state.results[jobId] = action.payload;
      });
  },
});

export const { clearError, addActiveQuery, updateQueryStatus, removeActiveQuery } = queriesSlice.actions;
export default queriesSlice.reducer;
