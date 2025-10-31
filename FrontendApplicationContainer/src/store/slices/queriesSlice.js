import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as protocolsApi from '../../api/protocols';
import * as queriesApi from '../../api/queries';

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

// PUBLIC_INTERFACE
/**
 * Cancel a running query
 * Posts to /queries/:jobId/cancel with proper authentication and tenant headers
 */
export const cancelQuery = createAsyncThunk(
  'queries/cancel',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await protocolsApi.cancelQuery(jobId);
      return { jobId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to cancel query' });
    }
  }
);

// Favorites thunks

// PUBLIC_INTERFACE
/**
 * Fetch list of favorite queries
 * Requires 'queries:favorites:read' permission
 */
export const fetchFavorites = createAsyncThunk(
  'queries/fetchFavorites',
  async (params, { rejectWithValue }) => {
    try {
      const response = await queriesApi.listFavorites(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch favorites' });
    }
  }
);

// PUBLIC_INTERFACE
/**
 * Create a new favorite query
 * Requires 'queries:favorites:write' permission
 */
export const createFavorite = createAsyncThunk(
  'queries/createFavorite',
  async (data, { rejectWithValue }) => {
    try {
      const response = await queriesApi.createFavorite(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create favorite' });
    }
  }
);

// PUBLIC_INTERFACE
/**
 * Get a specific favorite query
 * Requires 'queries:favorites:read' permission
 */
export const getFavorite = createAsyncThunk(
  'queries/getFavorite',
  async (favoriteId, { rejectWithValue }) => {
    try {
      const response = await queriesApi.getFavorite(favoriteId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to get favorite' });
    }
  }
);

// PUBLIC_INTERFACE
/**
 * Delete a favorite query
 * Requires 'queries:favorites:write' permission
 */
export const deleteFavorite = createAsyncThunk(
  'queries/deleteFavorite',
  async (favoriteId, { rejectWithValue }) => {
    try {
      await queriesApi.deleteFavorite(favoriteId);
      return { favoriteId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete favorite' });
    }
  }
);

// PUBLIC_INTERFACE
/**
 * Star a query from history
 * Requires 'queries:favorites:write' permission
 */
export const starQuery = createAsyncThunk(
  'queries/starQuery',
  async ({ jobId, data }, { rejectWithValue }) => {
    try {
      const response = await queriesApi.starQuery(jobId, data);
      return { jobId, favorite: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to star query' });
    }
  }
);

// PUBLIC_INTERFACE
/**
 * Unstar a query
 * Requires 'queries:favorites:write' permission
 */
export const unstarQuery = createAsyncThunk(
  'queries/unstarQuery',
  async (jobId, { rejectWithValue }) => {
    try {
      await queriesApi.unstarQuery(jobId);
      return { jobId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to unstar query' });
    }
  }
);

// Initial state
const initialState = {
  history: [],
  activeQueries: {},
  cancellingQueries: {},
  results: {},
  favorites: [],
  favoritesByJobId: {}, // Map jobId to favoriteId for quick lookup
  loadingFavorites: false,
  favoritesError: null,
  pagination: {
    page: 1,
    pageSize: 50,
    totalPages: 0,
    totalItems: 0,
  },
  favoritesPagination: {
    page: 1,
    pageSize: 50,
    totalPages: 0,
    totalItems: 0,
  },
  loading: false,
  error: null,
  realtimeConnected: false,
};

// Slice
const queriesSlice = createSlice({
  name: 'queries',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearFavoritesError: (state) => {
      state.favoritesError = null;
    },
    addActiveQuery: (state, action) => {
      const { jobId, queryData } = action.payload;
      state.activeQueries[jobId] = {
        ...queryData,
        status: 'pending',
        progress: 0,
        startTime: new Date().toISOString(),
      };
    },
    updateQueryStatus: (state, action) => {
      const { jobId, status, progress } = action.payload;
      if (state.activeQueries[jobId]) {
        state.activeQueries[jobId].status = status;
        if (progress !== undefined) {
          state.activeQueries[jobId].progress = progress;
        }
      }
    },
    removeActiveQuery: (state, action) => {
      delete state.activeQueries[action.payload];
    },
    // PUBLIC_INTERFACE
    /**
     * Handle realtime job update event
     * Merges progress and status information for active queries
     */
    handleRealtimeJobUpdate: (state, action) => {
      const { jobId, status, progress, message, data } = action.payload;
      
      if (state.activeQueries[jobId]) {
        state.activeQueries[jobId].status = status || state.activeQueries[jobId].status;
        
        if (progress !== undefined) {
          state.activeQueries[jobId].progress = progress;
        }
        
        if (message) {
          state.activeQueries[jobId].message = message;
        }
        
        if (data) {
          state.activeQueries[jobId].data = {
            ...state.activeQueries[jobId].data,
            ...data,
          };
        }
        
        state.activeQueries[jobId].lastUpdate = new Date().toISOString();
      } else {
        // Create entry for unknown job
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
    /**
     * Handle realtime job complete event
     * Moves query from active to results and updates history
     */
    handleRealtimeJobComplete: (state, action) => {
      const { jobId, status, results, message, data } = action.payload;
      
      if (state.activeQueries[jobId]) {
        state.activeQueries[jobId].status = 'completed';
        state.activeQueries[jobId].progress = 100;
        state.activeQueries[jobId].completedAt = new Date().toISOString();
        
        if (message) {
          state.activeQueries[jobId].message = message;
        }
      }
      
      // Store results
      state.results[jobId] = {
        jobId,
        status: status || 'completed',
        results: results || data || {},
        completedAt: new Date().toISOString(),
      };
      
      // Update history with completed query
      const historyIndex = state.history.findIndex(q => q.jobId === jobId);
      if (historyIndex >= 0) {
        state.history[historyIndex] = {
          ...state.history[historyIndex],
          status: 'completed',
          completedAt: new Date().toISOString(),
        };
      } else {
        // Add to history if not present
        state.history.unshift({
          jobId,
          status: 'completed',
          completedAt: new Date().toISOString(),
          ...(state.activeQueries[jobId] || {}),
        });
      }
    },
    // PUBLIC_INTERFACE
    /**
     * Handle realtime job error event
     * Updates query status to error and stores error information
     */
    handleRealtimeJobError: (state, action) => {
      const { jobId, error, message, details } = action.payload;
      
      if (state.activeQueries[jobId]) {
        state.activeQueries[jobId].status = 'error';
        state.activeQueries[jobId].error = error || message || 'Query failed';
        state.activeQueries[jobId].errorDetails = details || null;
        state.activeQueries[jobId].errorAt = new Date().toISOString();
      } else {
        // Create error entry for unknown job
        state.activeQueries[jobId] = {
          jobId,
          status: 'error',
          error: error || message || 'Query failed',
          errorDetails: details || null,
          errorAt: new Date().toISOString(),
        };
      }
      
      // Update history
      const historyIndex = state.history.findIndex(q => q.jobId === jobId);
      if (historyIndex >= 0) {
        state.history[historyIndex] = {
          ...state.history[historyIndex],
          status: 'error',
          error: error || message || 'Query failed',
          errorAt: new Date().toISOString(),
        };
      }
    },
    // PUBLIC_INTERFACE
    /**
     * Set realtime connection status
     */
    setRealtimeConnected: (state, action) => {
      state.realtimeConnected = action.payload;
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
          if (action.payload.progress !== undefined) {
            state.activeQueries[jobId].progress = action.payload.progress;
          }
        }
      })
      // Fetch results
      .addCase(fetchQueryResults.fulfilled, (state, action) => {
        const jobId = action.meta.arg;
        state.results[jobId] = action.payload;
      })
      // Cancel query
      .addCase(cancelQuery.pending, (state, action) => {
        const jobId = action.meta.arg;
        state.cancellingQueries[jobId] = true;
      })
      .addCase(cancelQuery.fulfilled, (state, action) => {
        const { jobId } = action.payload;
        delete state.cancellingQueries[jobId];
        
        // Update active query status
        if (state.activeQueries[jobId]) {
          state.activeQueries[jobId].status = 'cancelled';
          state.activeQueries[jobId].cancelledAt = new Date().toISOString();
        }
        
        // Update history
        const historyIndex = state.history.findIndex(q => q.jobId === jobId);
        if (historyIndex >= 0) {
          state.history[historyIndex] = {
            ...state.history[historyIndex],
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
          };
        }
      })
      .addCase(cancelQuery.rejected, (state, action) => {
        const jobId = action.meta.arg;
        delete state.cancellingQueries[jobId];
        state.error = action.payload?.message || 'Failed to cancel query';
      })
      // Fetch favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.loadingFavorites = true;
        state.favoritesError = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loadingFavorites = false;
        state.favorites = action.payload.data || action.payload.favorites || [];
        state.favoritesPagination = action.payload.pagination || state.favoritesPagination;
        
        // Build favoritesByJobId map
        state.favoritesByJobId = {};
        state.favorites.forEach(fav => {
          if (fav.jobId) {
            state.favoritesByJobId[fav.jobId] = fav.id;
          }
        });
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loadingFavorites = false;
        state.favoritesError = action.payload?.message || 'Failed to fetch favorites';
      })
      // Create favorite
      .addCase(createFavorite.fulfilled, (state, action) => {
        const favorite = action.payload.data || action.payload;
        state.favorites.unshift(favorite);
        if (favorite.jobId) {
          state.favoritesByJobId[favorite.jobId] = favorite.id;
        }
      })
      .addCase(createFavorite.rejected, (state, action) => {
        state.favoritesError = action.payload?.message || 'Failed to create favorite';
      })
      // Delete favorite
      .addCase(deleteFavorite.fulfilled, (state, action) => {
        const { favoriteId } = action.payload;
        const index = state.favorites.findIndex(f => f.id === favoriteId);
        if (index >= 0) {
          const favorite = state.favorites[index];
          if (favorite.jobId) {
            delete state.favoritesByJobId[favorite.jobId];
          }
          state.favorites.splice(index, 1);
        }
      })
      .addCase(deleteFavorite.rejected, (state, action) => {
        state.favoritesError = action.payload?.message || 'Failed to delete favorite';
      })
      // Star query
      .addCase(starQuery.fulfilled, (state, action) => {
        const { jobId, favorite } = action.payload;
        const favoriteData = favorite.data || favorite;
        state.favorites.unshift(favoriteData);
        state.favoritesByJobId[jobId] = favoriteData.id;
        
        // Update history item to mark as starred
        const historyIndex = state.history.findIndex(q => q.jobId === jobId);
        if (historyIndex >= 0) {
          state.history[historyIndex].isStarred = true;
          state.history[historyIndex].favoriteId = favoriteData.id;
        }
      })
      .addCase(starQuery.rejected, (state, action) => {
        state.favoritesError = action.payload?.message || 'Failed to star query';
      })
      // Unstar query
      .addCase(unstarQuery.fulfilled, (state, action) => {
        const { jobId } = action.payload;
        const favoriteId = state.favoritesByJobId[jobId];
        
        if (favoriteId) {
          const index = state.favorites.findIndex(f => f.id === favoriteId);
          if (index >= 0) {
            state.favorites.splice(index, 1);
          }
          delete state.favoritesByJobId[jobId];
        }
        
        // Update history item to unmark as starred
        const historyIndex = state.history.findIndex(q => q.jobId === jobId);
        if (historyIndex >= 0) {
          state.history[historyIndex].isStarred = false;
          delete state.history[historyIndex].favoriteId;
        }
      })
      .addCase(unstarQuery.rejected, (state, action) => {
        state.favoritesError = action.payload?.message || 'Failed to unstar query';
      });
  },
});

// Selectors

// PUBLIC_INTERFACE
/**
 * Select all active queries
 */
export const selectActiveQueries = (state) => state.queries.activeQueries;

// PUBLIC_INTERFACE
/**
 * Select a specific active query by jobId
 */
export const selectActiveQueryById = (jobId) => (state) => 
  state.queries.activeQueries[jobId];

// PUBLIC_INTERFACE
/**
 * Select query results by jobId
 */
export const selectQueryResultsById = (jobId) => (state) => 
  state.queries.results[jobId];

// PUBLIC_INTERFACE
/**
 * Select realtime connection status
 */
export const selectRealtimeConnected = (state) => state.queries.realtimeConnected;

// PUBLIC_INTERFACE
/**
 * Check if a query is being cancelled
 */
export const selectIsQueryCancelling = (jobId) => (state) =>
  state.queries.cancellingQueries[jobId] || false;

// PUBLIC_INTERFACE
/**
 * Check if a query can be cancelled (is in flight)
 */
export const selectCanCancelQuery = (jobId) => (state) => {
  const query = state.queries.activeQueries[jobId];
  if (!query) return false;
  const inFlightStatuses = ['pending', 'processing', 'running'];
  return inFlightStatuses.includes(query.status);
};

// PUBLIC_INTERFACE
/**
 * Select all favorite queries
 */
export const selectFavorites = (state) => state.queries.favorites;

// PUBLIC_INTERFACE
/**
 * Check if a query is starred (is a favorite)
 */
export const selectIsQueryStarred = (jobId) => (state) => {
  return !!state.queries.favoritesByJobId[jobId];
};

// PUBLIC_INTERFACE
/**
 * Get favorite ID for a query
 */
export const selectFavoriteIdByJobId = (jobId) => (state) => {
  return state.queries.favoritesByJobId[jobId];
};

// PUBLIC_INTERFACE
/**
 * Select favorites loading state
 */
export const selectLoadingFavorites = (state) => state.queries.loadingFavorites;

// PUBLIC_INTERFACE
/**
 * Select favorites error
 */
export const selectFavoritesError = (state) => state.queries.favoritesError;

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
} = queriesSlice.actions;

export default queriesSlice.reducer;
