import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDevices as apiGetDevices, getDevice as apiGetDevice, cancelJob as apiCancelJob, getDeviceStats as apiGetStats } from '../../api/devices';

const normalizeError = (err) => err?.error ? err : { error: { code: 'CLIENT', message: 'Request failed', timestamp: new Date().toISOString() } };

// PUBLIC_INTERFACE
export const fetchDevices = createAsyncThunk('devices/search', async (params = {}, { rejectWithValue }) => {
  try {
    const data = await apiGetDevices(params);
    return data;
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});

// PUBLIC_INTERFACE
export const fetchDevice = createAsyncThunk('devices/get', async (id, { rejectWithValue }) => {
  try {
    const data = await apiGetDevice(id);
    return data;
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});

// PUBLIC_INTERFACE
export const cancelDeviceJob = createAsyncThunk('devices/cancelJob', async (jobId, { rejectWithValue }) => {
  try {
    const data = await apiCancelJob(jobId);
    return { jobId, data };
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});

// PUBLIC_INTERFACE
export const fetchDeviceStats = createAsyncThunk('devices/stats', async (_, { rejectWithValue }) => {
  try {
    const data = await apiGetStats();
    return data;
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});

const slice = createSlice({
  name: 'devices',
  initialState: {
    items: [],
    page: 1,
    pageSize: 50,
    totalPages: 0,
    totalItems: 0,
    hasNext: false,
    hasPrevious: false,
    status: 'idle',
    error: null,
    current: null,
    stats: null,
    cancelStatus: 'idle',
    cancelError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDevices.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items || action.payload.data || [];
        state.page = action.payload.page || state.page;
        state.pageSize = action.payload.pageSize || state.pageSize;
        state.totalPages = action.payload.totalPages ?? state.totalPages;
        state.totalItems = action.payload.totalItems ?? state.totalItems;
        state.hasNext = !!action.payload.hasNext;
        state.hasPrevious = !!action.payload.hasPrevious;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.error || action.error;
      })
      .addCase(fetchDevice.fulfilled, (state, action) => {
        state.current = action.payload.device || action.payload;
      })
      .addCase(cancelDeviceJob.pending, (state) => {
        state.cancelStatus = 'loading';
        state.cancelError = null;
      })
      .addCase(cancelDeviceJob.fulfilled, (state) => {
        state.cancelStatus = 'succeeded';
      })
      .addCase(cancelDeviceJob.rejected, (state, action) => {
        state.cancelStatus = 'failed';
        state.cancelError = action.payload?.error || action.error;
      })
      .addCase(fetchDeviceStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export default slice.reducer;
