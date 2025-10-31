import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as protocolsApi from '../../api/protocols';
import * as queriesApi from '../../api/queries';

const normalizeError = (err) => err?.error ? err : { error: { code: 'CLIENT', message: 'Request failed', timestamp: new Date().toISOString() } };

// PUBLIC_INTERFACE
export const fetchQueryHistory = createAsyncThunk('queries/history', async (params = {}, { rejectWithValue }) => {
  try {
    const data = await protocolsApi.getQueryHistory(params);
    return data;
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});

// PUBLIC_INTERFACE
export const fetchQueryStatus = createAsyncThunk('queries/status', async (jobId, { rejectWithValue }) => {
  try {
    const data = await protocolsApi.getQueryStatus(jobId);
    return { jobId, ...data };
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});

// PUBLIC_INTERFACE
export const fetchQueryResults = createAsyncThunk('queries/results', async (jobId, { rejectWithValue }) => {
  try {
    const data = await protocolsApi.getQueryResults(jobId);
    return { jobId, ...data };
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});

// PUBLIC_INTERFACE
export const cancelQuery = createAsyncThunk('queries/cancel', async (jobId, { rejectWithValue }) => {
  try {
    const data = await protocolsApi.cancelQuery(jobId);
    return { jobId, ...data };
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});

// Favorites thunks
// PUBLIC_INTERFACE
export const fetchFavorites = createAsyncThunk('queries/favorites/list', async (params, { rejectWithValue }) => {
  try {
    const data = await queriesApi.listFavorites(params);
    return data;
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});
// PUBLIC_INTERFACE
export const createFavorite = createAsyncThunk('queries/favorites/create', async (payload, { rejectWithValue }) => {
  try {
    const data = await queriesApi.createFavorite(payload);
    return data;
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});
// PUBLIC_INTERFACE
export const getFavorite = createAsyncThunk('queries/favorites/get', async (favoriteId, { rejectWithValue }) => {
  try {
    const data = await queriesApi.getFavorite(favoriteId);
    return data;
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});
// PUBLIC_INTERFACE
export const deleteFavorite = createAsyncThunk('queries/favorites/delete', async (favoriteId, { rejectWithValue }) => {
  try {
    await queriesApi.deleteFavorite(favoriteId);
    return { favoriteId };
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});
// PUBLIC_INTERFACE
export const starQuery = createAsyncThunk('queries/favorites/star', async ({ jobId, data }, { rejectWithValue }) => {
  try {
    const res = await queriesApi.starQuery(jobId, data);
    return { jobId, favorite: res };
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});
// PUBLIC_INTERFACE
export const unstarQuery = createAsyncThunk('queries/favorites/unstar', async (jobId, { rejectWithValue }) => {
  try {
    await queriesApi.unstarQuery(jobId);
    return { jobId };
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});

const initialState = {
  history: [],
  activeQueries: {},
  cancellingQueries: {},
  results: {},
  favorites: [],
  favoritesByJobId: {},
  loadingFavorites: false,
  favoritesError: null,
  page: 1,
  pageSize: 50,
  totalPages: 0,
  totalItems: 0,
  hasNext: false,
  hasPrevious: false,
  loading: false,
  error: null,
  realtimeConnected: false,
};

const slice = createSlice({
  name: 'queries',
  initialState,
  reducers: {
    // PUBLIC_INTERFACE
    clearError(state) {
      state.error = null;
    },
    // PUBLIC_INTERFACE
    clearFavoritesError(state) {
      state.favoritesError = null;
    },
    // PUBLIC_INTERFACE
    addActiveQuery(state, action) {
      const { jobId, queryData } = action.payload;
      state.activeQueries[jobId] = {
        ...queryData,
        status: 'pending',
        progress: 0,
        startTime: new Date().toISOString(),
      };
    },
    // PUBLIC_INTERFACE
    updateQueryStatus(state, action) {
      const { jobId, status, progress } = action.payload;
      if (state.activeQueries[jobId]) {
        state.activeQueries[jobId].status = status;
        if (progress !== undefined) state.activeQueries[jobId].progress = progress;
      }
    },
    // PUBLIC_INTERFACE
    removeActiveQuery(state, action) {
      delete state.activeQueries[action.payload];
    },
    // PUBLIC_INTERFACE
    handleRealtimeJobUpdate(state, action) {
      const { jobId, status, progress, message, data } = action.payload;
      if (state.activeQueries[jobId]) {
        state.activeQueries[jobId].status = status || state.activeQueries[jobId].status;
        if (progress !== undefined) state.activeQueries[jobId].progress = progress;
        if (message) state.activeQueries[jobId].message = message;
        if (data) state.activeQueries[jobId].data = { ...(state.activeQueries[jobId].data || {}), ...data };
        state.activeQueries[jobId].lastUpdate = new Date().toISOString();
      } else {
        state.activeQueries[jobId] = {
          jobId,
          status: status || 'processing',
          progress: progress || 0,
          message: message || '',
          data: data || {},
          startTime: new Date().toISOString(),
          lastUpdate: new Date().toISOString(),
        };
      }
    },
    // PUBLIC_INTERFACE
    handleRealtimeJobComplete(state, action) {
      const { jobId, status, results, message, data } = action.payload;
      if (state.activeQueries[jobId]) {
        state.activeQueries[jobId].status = 'completed';
        state.activeQueries[jobId].progress = 100;
        state.activeQueries[jobId].completedAt = new Date().toISOString();
        if (message) state.activeQueries[jobId].message = message;
      }
      state.results[jobId] = {
        jobId,
        status: status || 'completed',
        results: results || data || {},
        completedAt: new Date().toISOString(),
      };
      const idx = state.history.findIndex((q) => q.jobId === jobId);
      if (idx >= 0) {
        state.history[idx] = { ...state.history[idx], status: 'completed', completedAt: new Date().toISOString() };
      } else {
        state.history.unshift({
          jobId,
          status: 'completed',
          completedAt: new Date().toISOString(),
          ...(state.activeQueries[jobId] || {}),
        });
      }
    },
    // PUBLIC_INTERFACE
    handleRealtimeJobError(state, action) {
      const { jobId, error, message, details } = action.payload;
      if (state.activeQueries[jobId]) {
        state.activeQueries[jobId].status = 'error';
        state.activeQueries[jobId].error = error || message || 'Query failed';
        state.activeQueries[jobId].errorDetails = details || null;
        state.activeQueries[jobId].errorAt = new Date().toISOString();
      } else {
        state.activeQueries[jobId] = {
          jobId,
          status: 'error',
          error: error || message || 'Query failed',
          errorDetails: details || null,
          errorAt: new Date().toISOString(),
        };
      }
      const idx = state.history.findIndex((q) => q.jobId === jobId);
      if (idx >= 0) {
        state.history[idx] = {
          ...state.history[idx],
          status: 'error',
          error: error || message || 'Query failed',
          errorAt: new Date().toISOString(),
        };
      }
    },
    // PUBLIC_INTERFACE
    setRealtimeConnected(state, action) {
      state.realtimeConnected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQueryHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQueryHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.items || action.payload.data || [];
        state.page = action.payload.page || state.page;
        state.pageSize = action.payload.pageSize || state.pageSize;
        state.totalPages = action.payload.totalPages ?? state.totalPages;
        state.totalItems = action.payload.totalItems ?? state.totalItems;
        state.hasNext = !!action.payload.hasNext;
        state.hasPrevious = !!action.payload.hasPrevious;
      })
      .addCase(fetchQueryHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.error;
      })
      .addCase(fetchQueryStatus.fulfilled, (state, action) => {
        const { jobId, status, progress } = action.payload;
        if (state.activeQueries[jobId]) {
          state.activeQueries[jobId].status = status ?? state.activeQueries[jobId].status;
          if (progress !== undefined) state.activeQueries[jobId].progress = progress;
        }
      })
      .addCase(fetchQueryResults.fulfilled, (state, action) => {
        const { jobId, ...rest } = action.payload;
        state.results[jobId] = rest;
      })
      .addCase(cancelQuery.pending, (state, action) => {
        const jobId = action.meta.arg;
        state.cancellingQueries[jobId] = true;
      })
      .addCase(cancelQuery.fulfilled, (state, action) => {
        const { jobId } = action.payload;
        delete state.cancellingQueries[jobId];
        if (state.activeQueries[jobId]) {
          state.activeQueries[jobId].status = 'cancelled';
          state.activeQueries[jobId].cancelledAt = new Date().toISOString();
        }
        const idx = state.history.findIndex((q) => q.jobId === jobId);
        if (idx >= 0) {
          state.history[idx] = { ...state.history[idx], status: 'cancelled', cancelledAt: new Date().toISOString() };
        }
      })
      .addCase(cancelQuery.rejected, (state, action) => {
        const jobId = action.meta.arg;
        delete state.cancellingQueries[jobId];
        state.error = action.payload?.error || action.error;
      })
      .addCase(fetchFavorites.pending, (state) => {
        state.loadingFavorites = true;
        state.favoritesError = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loadingFavorites = false;
        state.favorites = action.payload.items || action.payload.data || [];
        state.favoritesByJobId = {};
        state.favorites.forEach((fav) => {
          if (fav.jobId) state.favoritesByJobId[fav.jobId] = fav.id;
        });
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loadingFavorites = false;
        state.favoritesError = action.payload?.error || action.error;
      })
      .addCase(createFavorite.fulfilled, (state, action) => {
        const favorite = action.payload.data || action.payload;
        state.favorites.unshift(favorite);
        if (favorite.jobId) state.favoritesByJobId[favorite.jobId] = favorite.id;
      })
      .addCase(deleteFavorite.fulfilled, (state, action) => {
        const { favoriteId } = action.payload;
        const idx = state.favorites.findIndex((f) => f.id === favoriteId);
        if (idx >= 0) {
          const fav = state.favorites[idx];
          if (fav.jobId) delete state.favoritesByJobId[fav.jobId];
          state.favorites.splice(idx, 1);
        }
      })
      .addCase(starQuery.fulfilled, (state, action) => {
        const { jobId, favorite } = action.payload;
        const favoriteData = favorite.data || favorite;
        state.favorites.unshift(favoriteData);
        state.favoritesByJobId[jobId] = favoriteData.id;
        const idx = state.history.findIndex((q) => q.jobId === jobId);
        if (idx >= 0) {
          state.history[idx].isStarred = true;
          state.history[idx].favoriteId = favoriteData.id;
        }
      })
      .addCase(unstarQuery.fulfilled, (state, action) => {
        const { jobId } = action.payload;
        const favoriteId = state.favoritesByJobId[jobId];
        if (favoriteId) {
          const idx = state.favorites.findIndex((f) => f.id === favoriteId);
          if (idx >= 0) state.favorites.splice(idx, 1);
          delete state.favoritesByJobId[jobId];
        }
        const hIdx = state.history.findIndex((q) => q.jobId === jobId);
        if (hIdx >= 0) {
          state.history[hIdx].isStarred = false;
          delete state.history[hIdx].favoriteId;
        }
      });
  },
});

export const {
  clearError,
  clearFavoritesError,
  addActiveQuery,
  updateQueryStatus,
  removeActiveQuery,
  handleRealtimeJobUpdate,
  handleRealtimeJobComplete,
  handleRealtimeJobError,
  setRealtimeConnected,
} = slice.actions;

export default slice.reducer;
